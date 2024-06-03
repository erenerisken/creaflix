import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from '../domain/entities/movie.entity';
import { Session } from '../domain/entities/session.entity';
import { Repository } from 'typeorm';
import { MovieUpsertDto } from './dtos/movie-upsert.dto';
import { MovieFilter } from './types/movie-filter.interface';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { isDbStatusConflict } from '../../../common/utils/psql.util';
import { getSessionUniqueKey } from '../utils/session.util';
import { MoviesListDto } from './dtos/movies-list.dto';
import { MovieSort } from './enums/movie-sort.enum';
import { Order } from '../../../common/enums/order.enum';

jest.mock('../../../common/utils/psql.util');
jest.mock('../utils/session.util');

describe('MovieService', () => {
  let service: MovieService;
  let movieRepository: Repository<Movie>;

  beforeEach(async () => {
    const movieRepositoryMock = {
      manager: {
        transaction: jest.fn(),
      },
      findAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: getRepositoryToken(Movie),
          useValue: movieRepositoryMock,
        },
        {
          provide: getRepositoryToken(Session),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    movieRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
  });

  describe('create', () => {
    it('should create a new movie with sessions', async () => {
      const movieUpsertDto: MovieUpsertDto = {
        name: 'New Movie',
        minAge: 12,
        sessions: [
          { date: new Date().toISOString(), timeSlot: 2, roomNumber: 1 },
          { date: new Date().toISOString(), timeSlot: 3, roomNumber: 2 },
        ],
      };
      const newMovie = new Movie();
      newMovie.name = movieUpsertDto.name;
      newMovie.minAge = movieUpsertDto.minAge;

      const savedMovie = { ...newMovie, id: 1 } as Movie;

      jest
        .spyOn(movieRepository.manager, 'transaction')
        .mockImplementation(async (callback: any) => {
          await callback({
            save: jest
              .fn()
              .mockResolvedValueOnce(savedMovie)
              .mockResolvedValueOnce([]),
          });
        });

      await expect(service.create(movieUpsertDto)).resolves.not.toThrow();
    });

    it('should throw ConflictException if movie already exists', async () => {
      const movieUpsertDto: MovieUpsertDto = {
        name: 'Existing Movie',
        minAge: 12,
        sessions: [
          { date: new Date().toISOString(), timeSlot: 2, roomNumber: 1 },
          { date: new Date().toISOString(), timeSlot: 3, roomNumber: 2 },
        ],
      };

      jest
        .spyOn(movieRepository.manager, 'transaction')
        .mockImplementation(async (callback: any) => {
          await callback({
            save: jest.fn().mockRejectedValueOnce({ code: '23505' }),
          });
        });

      jest.mocked(isDbStatusConflict).mockReturnValue(true);

      await expect(service.create(movieUpsertDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('list', () => {
    it('should return a list of movies with total count', async () => {
      const filters: MovieFilter = {
        name: 'Movie',
        permittedForAge: 12,
        sortCriteria: MovieSort.NAME,
        pagination: { pageNumber: 1, pageSize: 10 },
        order: Order.ASC,
      };
      const movies = [
        { id: 1, name: 'Movie', minAge: 12, sessions: [] },
      ] as Movie[];
      const totalCount = 1;

      jest
        .spyOn(movieRepository, 'findAndCount')
        .mockResolvedValueOnce([movies, totalCount]);

      const result = await service.list(filters);

      expect(result).toEqual({
        movies,
        totalCount,
        pageNumber: 1,
        pageSize: 10,
      } as MoviesListDto);
    });
  });

  describe('update', () => {
    it('should update an existing movie and its sessions', async () => {
      const movieId = 1;
      const movieUpsertDto: MovieUpsertDto = {
        name: 'Updated Movie',
        minAge: 12,
        sessions: [
          { date: new Date().toISOString(), timeSlot: 2, roomNumber: 1 },
          { date: new Date().toISOString(), timeSlot: 3, roomNumber: 2 },
        ],
      };
      const existingMovie = {
        id: movieId,
        name: 'Existing Movie',
        minAge: 12,
        sessions: [
          { date: new Date().toISOString(), timeSlot: 2, roomNumber: 1 },
        ],
      } as Movie;

      jest
        .spyOn(movieRepository.manager, 'transaction')
        .mockImplementation(async (callback: any) => {
          await callback({
            findOne: jest.fn().mockResolvedValueOnce(existingMovie),
            save: jest
              .fn()
              .mockResolvedValueOnce(existingMovie)
              .mockResolvedValueOnce([]),
            remove: jest.fn().mockResolvedValueOnce([]),
          });
        });

      jest
        .mocked(getSessionUniqueKey)
        .mockImplementation(
          (date, timeSlot, roomNumber) => `${date}-${timeSlot}-${roomNumber}`,
        );

      await expect(
        service.update(movieId, movieUpsertDto),
      ).resolves.not.toThrow();
    });

    it('should throw NotFoundException if movie does not exist', async () => {
      const movieId = 1;
      const movieUpsertDto: MovieUpsertDto = {
        name: 'Non-existing Movie',
        minAge: 12,
        sessions: [
          { date: new Date().toISOString(), timeSlot: 2, roomNumber: 1 },
          { date: new Date().toISOString(), timeSlot: 3, roomNumber: 2 },
        ],
      };

      jest
        .spyOn(movieRepository.manager, 'transaction')
        .mockImplementation(async (callback: any) => {
          await callback({
            findOne: jest.fn().mockResolvedValueOnce(undefined),
          });
        });

      await expect(service.update(movieId, movieUpsertDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete an existing movie', async () => {
      const movieId = 1;
      const existingMovie = { id: movieId, name: 'Existing Movie' } as Movie;

      jest
        .spyOn(movieRepository.manager, 'transaction')
        .mockImplementation(async (callback: any) => {
          await callback({
            findOne: jest.fn().mockResolvedValueOnce(existingMovie),
            remove: jest.fn().mockResolvedValueOnce(existingMovie),
          });
        });

      await expect(service.delete(movieId)).resolves.not.toThrow();
    });

    it('should throw NotFoundException if movie does not exist', async () => {
      const movieId = 1;

      jest
        .spyOn(movieRepository.manager, 'transaction')
        .mockImplementation(async (callback: any) => {
          await callback({
            findOne: jest.fn().mockResolvedValueOnce(undefined),
          });
        });

      await expect(service.delete(movieId)).rejects.toThrow(NotFoundException);
    });
  });
});
