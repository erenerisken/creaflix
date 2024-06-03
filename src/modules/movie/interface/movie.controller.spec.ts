import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller';
import { MovieService } from '../application/movie.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RoleGuard } from '../../../common/guards/role.guard';
import { MoviesListDto } from '../application/dtos/movies-list.dto';
import { MovieUpsertDto } from '../application/dtos/movie-upsert.dto';
import { MovieSort } from '../application/enums/movie-sort.enum';
import { Order } from '../../../common/enums/order.enum';
import { Session } from '../domain/entities/session.entity';
import { MovieFilter } from '../application/types/movie-filter.interface';

describe('MovieController', () => {
  let controller: MovieController;
  let service: MovieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [
        {
          provide: MovieService,
          useValue: {
            create: jest.fn(),
            list: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<MovieController>(MovieController);
    service = module.get<MovieService>(MovieService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a movie successfully', async () => {
      const movieUpsertDto: MovieUpsertDto = {
        name: 'Inception',
        minAge: 13,
        sessions: [
          {
            date: '2024-12-31',
            timeSlot: 2,
            roomNumber: 1,
          },
        ],
      };

      jest.spyOn(service, 'create').mockResolvedValueOnce(undefined);

      expect(await controller.create(movieUpsertDto)).toEqual({
        result: 'success',
      });
      expect(service.create).toHaveBeenCalledWith(movieUpsertDto);
    });

    it('should handle conflicts in movie name or session rooms', async () => {
      const movieUpsertDto: MovieUpsertDto = {
        name: 'Inception',
        minAge: 13,
        sessions: [
          {
            date: '2024-12-31',
            timeSlot: 2,
            roomNumber: 1,
          },
        ],
      };

      jest
        .spyOn(service, 'create')
        .mockRejectedValueOnce(
          new Error('Conflict in movie name or session rooms'),
        );

      await expect(controller.create(movieUpsertDto)).rejects.toThrow(
        'Conflict in movie name or session rooms',
      );
    });
  });

  describe('list', () => {
    it('should return a list of movies', async () => {
      const moviesListDto: MoviesListDto = {
        movies: [
          {
            id: 1,
            name: 'Inception',
            minAge: 13,
            sessions: [
              {
                date: '2024-12-31',
                timeSlot: 2,
                roomNumber: 1,
              } as Session,
            ],
            historyEntries: [],
          },
        ],
        totalCount: 1,
        pageSize: 10,
        pageNumber: 1,
      };

      jest.spyOn(service, 'list').mockResolvedValueOnce(moviesListDto);

      const filters = {
        permittedForAge: 13,
        name: 'Inception',
        sortCriteria: MovieSort.NAME,
        order: Order.ASC,
        pagination: {
          pageSize: 10,
          pageNumber: 1,
        },
      } as MovieFilter;

      expect(
        await controller.list(
          10,
          1,
          13,
          'Inception',
          MovieSort.NAME,
          Order.ASC,
        ),
      ).toEqual(moviesListDto);
      expect(service.list).toHaveBeenCalledWith(filters);
    });
  });

  describe('update', () => {
    it('should update a movie successfully', async () => {
      const movieUpsertDto: MovieUpsertDto = {
        name: 'Inception',
        minAge: 13,
        sessions: [
          {
            date: '2024-12-31',
            timeSlot: 2,
            roomNumber: 1,
          },
        ],
      };

      jest.spyOn(service, 'update').mockResolvedValueOnce(undefined);

      expect(await controller.update(1, movieUpsertDto)).toEqual({
        result: 'success',
      });
      expect(service.update).toHaveBeenCalledWith(1, movieUpsertDto);
    });

    it('should handle movie not found', async () => {
      const movieUpsertDto: MovieUpsertDto = {
        name: 'Inception',
        minAge: 13,
        sessions: [
          {
            date: '2024-12-31T',
            timeSlot: 2,
            roomNumber: 1,
          },
        ],
      };

      jest
        .spyOn(service, 'update')
        .mockRejectedValueOnce(new Error('Movie not found'));

      await expect(controller.update(1, movieUpsertDto)).rejects.toThrow(
        'Movie not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete a movie successfully', async () => {
      jest.spyOn(service, 'delete').mockResolvedValueOnce(undefined);

      expect(await controller.delete(1)).toEqual({ result: 'success' });
      expect(service.delete).toHaveBeenCalledWith(1);
    });

    it('should handle movie not found', async () => {
      jest
        .spyOn(service, 'delete')
        .mockRejectedValueOnce(new Error('Movie not found'));

      await expect(controller.delete(1)).rejects.toThrow('Movie not found');
    });
  });
});
