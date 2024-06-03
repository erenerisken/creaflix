import { Test, TestingModule } from '@nestjs/testing';
import { WatchController } from './watch.controller';
import { WatchService } from '../application/watch.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { WatchMovieDto } from '../application/dtos/watch-movie.dto';
import { WatchHistoryEntryDto } from '../application/dtos/watch-history-entry.dto';
import { WatchHistoryListDto } from '../application/dtos/watch-history-list.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('WatchController', () => {
  let controller: WatchController;
  let service: WatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchController],
      providers: [
        {
          provide: WatchService,
          useValue: {
            watch: jest.fn(),
            listHistory: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<WatchController>(WatchController);
    service = module.get<WatchService>(WatchService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('watch', () => {
    it('should create a watch history entry successfully', async () => {
      const watchMovieDto: WatchMovieDto = { sessionId: 1 };
      const request = { user: { id: 1 } } as any;
      const watchHistoryEntryDto: WatchHistoryEntryDto = {
        movieId: 1,
        movieName: 'Inception',
        watchedAt: new Date(),
      };

      jest.spyOn(service, 'watch').mockResolvedValueOnce(watchHistoryEntryDto);

      const result = await controller.watch(watchMovieDto, request);

      expect(result).toEqual(watchHistoryEntryDto);
      expect(service.watch).toHaveBeenCalledWith(1, watchMovieDto);
    });

    it('should throw NotFoundException if ticket not found', async () => {
      const watchMovieDto: WatchMovieDto = { sessionId: 1 };
      const request = { user: { id: 1 } } as any;

      jest
        .spyOn(service, 'watch')
        .mockRejectedValueOnce(new NotFoundException('Ticket not found'));

      await expect(controller.watch(watchMovieDto, request)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.watch).toHaveBeenCalledWith(1, watchMovieDto);
    });

    it('should throw BadRequestException if session is not active', async () => {
      const watchMovieDto: WatchMovieDto = { sessionId: 1 };
      const request = { user: { id: 1 } } as any;

      jest
        .spyOn(service, 'watch')
        .mockRejectedValueOnce(
          new BadRequestException('Session is not active'),
        );

      await expect(controller.watch(watchMovieDto, request)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.watch).toHaveBeenCalledWith(1, watchMovieDto);
    });
  });

  describe('listHistory', () => {
    it('should return a list of watch history entries', async () => {
      const request = { user: { id: 1 } } as any;
      const watchHistoryListDto: WatchHistoryListDto = {
        history: [
          {
            movieId: 1,
            movieName: 'Inception',
            watchedAt: new Date(),
          },
        ],
        totalCount: 1,
        pageNumber: 1,
        pageSize: 10,
      };

      jest
        .spyOn(service, 'listHistory')
        .mockResolvedValueOnce(watchHistoryListDto);

      const result = await controller.listHistory(10, 1, request);

      expect(result).toEqual(watchHistoryListDto);
      expect(service.listHistory).toHaveBeenCalledWith(1, {
        pageNumber: 1,
        pageSize: 10,
      });
    });

    it('should return a list of watch history entries without pagination', async () => {
      const request = { user: { id: 1 } } as any;
      const watchHistoryListDto: WatchHistoryListDto = {
        history: [
          {
            movieId: 1,
            movieName: 'Inception',
            watchedAt: new Date(),
          },
        ],
      };

      jest
        .spyOn(service, 'listHistory')
        .mockResolvedValueOnce(watchHistoryListDto);

      const result = await controller.listHistory(-1, -1, request);

      expect(result).toEqual(watchHistoryListDto);
      expect(service.listHistory).toHaveBeenCalledWith(1, undefined);
    });
  });
});
