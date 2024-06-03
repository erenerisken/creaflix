import { Test, TestingModule } from '@nestjs/testing';
import { TicketController } from './ticket.controller';
import { TicketService } from '../application/ticket.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TicketCreateDto } from '../application/dtos/ticket-create.dto';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

describe('TicketController', () => {
  let controller: TicketController;
  let service: TicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [
        {
          provide: TicketService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TicketController>(TicketController);
    service = module.get<TicketService>(TicketService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a ticket successfully', async () => {
      const ticketCreateDto: TicketCreateDto = { sessionId: 1 };
      const request = { user: { id: 1, age: 20 } } as any;

      jest.spyOn(service, 'create').mockResolvedValueOnce(undefined);

      const result = await controller.create(ticketCreateDto, request);

      expect(result).toEqual({ result: 'success' });
      expect(service.create).toHaveBeenCalledWith(1, 20, ticketCreateDto);
    });

    it('should throw NotFoundException if session not found', async () => {
      const ticketCreateDto: TicketCreateDto = { sessionId: 1 };
      const request = { user: { id: 1, age: 20 } } as any;

      jest
        .spyOn(service, 'create')
        .mockRejectedValueOnce(new NotFoundException('Session not found'));

      await expect(controller.create(ticketCreateDto, request)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.create).toHaveBeenCalledWith(1, 20, ticketCreateDto);
    });

    it('should throw BadRequestException if session is expired', async () => {
      const ticketCreateDto: TicketCreateDto = { sessionId: 1 };
      const request = { user: { id: 1, age: 20 } } as any;

      jest
        .spyOn(service, 'create')
        .mockRejectedValueOnce(new BadRequestException('Session is expired'));

      await expect(controller.create(ticketCreateDto, request)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.create).toHaveBeenCalledWith(1, 20, ticketCreateDto);
    });

    it('should throw BadRequestException if age restriction is not satisfied', async () => {
      const ticketCreateDto: TicketCreateDto = { sessionId: 1 };
      const request = { user: { id: 1, age: 16 } } as any;

      jest
        .spyOn(service, 'create')
        .mockRejectedValueOnce(
          new BadRequestException('Minimum age restriction not satisfied'),
        );

      await expect(controller.create(ticketCreateDto, request)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.create).toHaveBeenCalledWith(1, 16, ticketCreateDto);
    });

    it('should throw ConflictException if ticket is already booked', async () => {
      const ticketCreateDto: TicketCreateDto = { sessionId: 1 };
      const request = { user: { id: 1, age: 20 } } as any;

      jest
        .spyOn(service, 'create')
        .mockRejectedValueOnce(
          new ConflictException('Ticket already booked for session'),
        );

      await expect(controller.create(ticketCreateDto, request)).rejects.toThrow(
        ConflictException,
      );
      expect(service.create).toHaveBeenCalledWith(1, 20, ticketCreateDto);
    });
  });
});
