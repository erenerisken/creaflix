import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Session } from '../../movie/domain/entities/session.entity';
import { Ticket } from '../domain/entities/ticket.entity';
import { TicketService } from './ticket.service';
import { TicketCreateDto } from './dtos/ticket-create.dto';
import { Repository } from 'typeorm';
import { TimeService } from '../../time/application/time.service';
import * as psqlUtil from '../../../common/utils/psql.util';

jest.mock('../../../common/utils/psql.util');

describe('TicketService', () => {
  let service: TicketService;
  let sessionRepository: Repository<Session>;
  let ticketRepository: Repository<Ticket>;
  let timeService: TimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        {
          provide: getRepositoryToken(Session),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Ticket),
          useClass: Repository,
        },
        {
          provide: TimeService,
          useValue: {
            now: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
    sessionRepository = module.get<Repository<Session>>(
      getRepositoryToken(Session),
    );
    ticketRepository = module.get<Repository<Ticket>>(
      getRepositoryToken(Ticket),
    );
    timeService = module.get<TimeService>(TimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a ticket successfully', async () => {
      const userId = 1;
      const userAge = 20;
      const ticketCreateDto: TicketCreateDto = { sessionId: 1 };

      const session = new Session();
      session.id = 1;
      session.movie = { minAge: 18 } as any;
      session.isExpired = jest.fn().mockReturnValue(false);

      jest.spyOn(sessionRepository, 'findOne').mockResolvedValue(session);
      jest.spyOn(ticketRepository, 'save').mockResolvedValue(undefined);

      await service.create(userId, userAge, ticketCreateDto);

      expect(sessionRepository.findOne).toHaveBeenCalledWith({
        where: { id: ticketCreateDto.sessionId },
        relations: ['movie'],
      });
      expect(session.isExpired).toHaveBeenCalled();
      expect(ticketRepository.save).toHaveBeenCalledWith(expect.any(Ticket));
    });

    it('should throw NotFoundException if session not found', async () => {
      const userId = 1;
      const userAge = 20;
      const ticketCreateDto: TicketCreateDto = { sessionId: 1 };

      jest.spyOn(sessionRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.create(userId, userAge, ticketCreateDto),
      ).rejects.toThrow(NotFoundException);
      expect(sessionRepository.findOne).toHaveBeenCalledWith({
        where: { id: ticketCreateDto.sessionId },
        relations: ['movie'],
      });
    });

    it('should throw BadRequestException if session is expired', async () => {
      const userId = 1;
      const userAge = 20;
      const ticketCreateDto: TicketCreateDto = { sessionId: 1 };

      const session = new Session();
      session.id = 1;
      session.movie = { minAge: 18 } as any;
      session.isExpired = jest.fn().mockReturnValue(true);

      jest.spyOn(sessionRepository, 'findOne').mockResolvedValue(session);

      await expect(
        service.create(userId, userAge, ticketCreateDto),
      ).rejects.toThrow(BadRequestException);
      expect(sessionRepository.findOne).toHaveBeenCalledWith({
        where: { id: ticketCreateDto.sessionId },
        relations: ['movie'],
      });
      expect(session.isExpired).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user does not meet age restriction', async () => {
      const userId = 1;
      const userAge = 16;
      const ticketCreateDto: TicketCreateDto = { sessionId: 1 };

      const session = new Session();
      session.id = 1;
      session.movie = { minAge: 18 } as any;
      session.isExpired = jest.fn().mockReturnValue(false);

      jest.spyOn(sessionRepository, 'findOne').mockResolvedValue(session);

      await expect(
        service.create(userId, userAge, ticketCreateDto),
      ).rejects.toThrow(BadRequestException);
      expect(sessionRepository.findOne).toHaveBeenCalledWith({
        where: { id: ticketCreateDto.sessionId },
        relations: ['movie'],
      });
      expect(session.isExpired).toHaveBeenCalled();
    });

    it('should throw ConflictException if ticket already booked for session', async () => {
      const userId = 1;
      const userAge = 20;
      const ticketCreateDto: TicketCreateDto = { sessionId: 1 };

      const session = new Session();
      session.id = 1;
      session.movie = { minAge: 18 } as any;
      session.isExpired = jest.fn().mockReturnValue(false);

      jest.spyOn(sessionRepository, 'findOne').mockResolvedValue(session);
      jest.spyOn(ticketRepository, 'save').mockRejectedValue({ code: '23505' });
      (psqlUtil.isDbStatusConflict as jest.Mock).mockReturnValue(true);

      await expect(
        service.create(userId, userAge, ticketCreateDto),
      ).rejects.toThrow(ConflictException);
      expect(sessionRepository.findOne).toHaveBeenCalledWith({
        where: { id: ticketCreateDto.sessionId },
        relations: ['movie'],
      });
      expect(session.isExpired).toHaveBeenCalled();
      expect(ticketRepository.save).toHaveBeenCalledWith(expect.any(Ticket));
      expect(psqlUtil.isDbStatusConflict).toHaveBeenCalledWith('23505');
    });
  });
});
