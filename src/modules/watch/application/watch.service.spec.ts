import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WatchService } from './watch.service';
import { History } from '../domain/entities/history.entity';
import { Ticket } from '../../ticket/domain/entities/ticket.entity';
import { TimeService } from '../../time/application/time.service';
import { Repository } from 'typeorm';
import { WatchMovieDto } from './dtos/watch-movie.dto';
import { Pagination } from '../../../common/types/pagination.type';

describe('WatchService', () => {
  let service: WatchService;
  let historyRepository: Repository<History>;
  let ticketRepository: Repository<Ticket>;
  let timeService: TimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchService,
        {
          provide: getRepositoryToken(History),
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

    service = module.get<WatchService>(WatchService);
    historyRepository = module.get<Repository<History>>(
      getRepositoryToken(History),
    );
    ticketRepository = module.get<Repository<Ticket>>(
      getRepositoryToken(Ticket),
    );
    timeService = module.get<TimeService>(TimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('watch', () => {
    it('should create a watch history entry successfully', async () => {
      const userId = 1;
      const watchMovieDto: WatchMovieDto = { sessionId: 1 };
      const now = new Date();

      const ticket = new Ticket();
      ticket.userId = userId;
      ticket.sessionId = watchMovieDto.sessionId;
      ticket.session = {
        isActive: jest.fn().mockReturnValue(true),
        movieId: 1,
        movie: { name: 'Inception' },
      } as any;

      jest.spyOn(ticketRepository, 'findOne').mockResolvedValue(ticket);
      jest.spyOn(timeService, 'now').mockReturnValue(now);
      jest.spyOn(historyRepository, 'query').mockResolvedValue(undefined);

      const result = await service.watch(userId, watchMovieDto);

      expect(result).toEqual({
        movieId: 1,
        movieName: 'Inception',
        watchedAt: now,
      });
      expect(ticketRepository.findOne).toHaveBeenCalledWith({
        where: { userId, sessionId: watchMovieDto.sessionId },
        relations: ['session', 'session.movie'],
      });
      expect(ticket.session.isActive).toHaveBeenCalledWith(now);
      expect(historyRepository.query).toHaveBeenCalledWith(
        `
      INSERT INTO history (movie_id, user_id, watched_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (movie_id, user_id)
      DO UPDATE SET watched_at = EXCLUDED.watched_at
      `,
        [1, userId, now],
      );
    });

    it('should throw NotFoundException if ticket not found', async () => {
      const userId = 1;
      const watchMovieDto: WatchMovieDto = { sessionId: 1 };

      jest.spyOn(ticketRepository, 'findOne').mockResolvedValue(null);

      await expect(service.watch(userId, watchMovieDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(ticketRepository.findOne).toHaveBeenCalledWith({
        where: { userId, sessionId: watchMovieDto.sessionId },
        relations: ['session', 'session.movie'],
      });
    });

    it('should throw BadRequestException if session is not active', async () => {
      const userId = 1;
      const watchMovieDto: WatchMovieDto = { sessionId: 1 };
      const now = new Date();

      const ticket = new Ticket();
      ticket.userId = userId;
      ticket.sessionId = watchMovieDto.sessionId;
      ticket.session = { isActive: jest.fn().mockReturnValue(false) } as any;

      jest.spyOn(ticketRepository, 'findOne').mockResolvedValue(ticket);
      jest.spyOn(timeService, 'now').mockReturnValue(now);

      await expect(service.watch(userId, watchMovieDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(ticketRepository.findOne).toHaveBeenCalledWith({
        where: { userId, sessionId: watchMovieDto.sessionId },
        relations: ['session', 'session.movie'],
      });
      expect(ticket.session.isActive).toHaveBeenCalledWith(now);
    });
  });

  describe('listHistory', () => {
    it('should return a list of watch history entries', async () => {
      const userId = 1;
      const pagination: Pagination = { pageNumber: 1, pageSize: 10 };

      const historyEntries = [
        {
          movieId: 1,
          movie: { name: 'Inception' },
          watchedAt: new Date(),
        },
      ] as History[];

      jest
        .spyOn(historyRepository, 'findAndCount')
        .mockResolvedValue([historyEntries, 1]);

      const result = await service.listHistory(userId, pagination);

      expect(result).toEqual({
        history: [
          {
            movieId: 1,
            movieName: 'Inception',
            watchedAt: historyEntries[0].watchedAt,
          },
        ],
        totalCount: 1,
        pageNumber: 1,
        pageSize: 10,
      });
      expect(historyRepository.findAndCount).toHaveBeenCalledWith({
        relations: ['movie'],
        where: { userId },
        order: { watchedAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });

    it('should return a list of watch history entries without pagination', async () => {
      const userId = 1;

      const historyEntries = [
        {
          movieId: 1,
          movie: { name: 'Inception' },
          watchedAt: new Date(),
        },
      ] as History[];

      jest
        .spyOn(historyRepository, 'findAndCount')
        .mockResolvedValue([historyEntries, 1]);

      const result = await service.listHistory(userId);

      expect(result).toEqual({
        history: [
          {
            movieId: 1,
            movieName: 'Inception',
            watchedAt: historyEntries[0].watchedAt,
          },
        ],
      });
      expect(historyRepository.findAndCount).toHaveBeenCalledWith({
        relations: ['movie'],
        where: { userId },
        order: { watchedAt: 'desc' },
      });
    });
  });
});
