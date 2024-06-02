import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from '../domain/entities/movie.entity';
import { FindManyOptions, LessThanOrEqual, Like, Repository } from 'typeorm';
import { MovieUpsertDto } from './dtos/movie-upsert.dto';
import { isDbStatusConflict } from '../../../common/utils/psql.util';
import { Session } from '../domain/entities/session.entity';
import { MoviesListDto } from './dtos/movies-list.dto';
import { MovieFilter } from './types/movie-filter.interface';
import { getSessionUniqueKey } from '../utils/session.util';
import { isEmpty } from 'lodash';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie) private movieRepository: Repository<Movie>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async create(movieUpsertDto: MovieUpsertDto): Promise<void> {
    const newMovie = new Movie();
    newMovie.name = movieUpsertDto.name;
    newMovie.minAge = movieUpsertDto.minAge;

    await this.movieRepository.manager.transaction(async (txn) => {
      let savedMovie: Movie;
      try {
        savedMovie = await txn.save(newMovie);
      } catch (err) {
        if (isDbStatusConflict(err.code)) {
          throw new ConflictException('Movie already exists');
        }
        throw err;
      }

      const sessionEntities = movieUpsertDto.sessions.map((sessionDto) => {
        const session = new Session();
        session.movieId = savedMovie.id;
        session.movie = savedMovie;
        session.date = sessionDto.date;
        session.timeSlot = sessionDto.timeSlot;
        session.roomNumber = sessionDto.roomNumber;

        return session;
      });

      try {
        await txn.save(sessionEntities);
      } catch (err) {
        if (isDbStatusConflict(err.code)) {
          throw new ConflictException(
            'Sessions could not be created due to conflict in rooms',
          );
        }
        throw err;
      }
    });
  }

  async update(movieId: number, movieUpsertDto: MovieUpsertDto): Promise<void> {
    await this.movieRepository.manager.transaction(async (txn) => {
      const existingMovie = await txn.findOne(Movie, {
        where: { id: movieId },
        relations: ['sessions'],
      });

      if (!existingMovie) {
        throw new NotFoundException('Movie not found');
      }

      existingMovie.name = movieUpsertDto.name;
      existingMovie.minAge = movieUpsertDto.minAge;

      let updatedMovie: Movie;
      try {
        updatedMovie = await txn.save(existingMovie);
      } catch (err) {
        if (isDbStatusConflict(err.code)) {
          throw new ConflictException('Movie update conflict');
        }
        throw err;
      }

      const existingUniqueKeys = updatedMovie.sessions.map((session) =>
        getSessionUniqueKey(session.date, session.timeSlot, session.roomNumber),
      );
      const newUniqueKeys = movieUpsertDto.sessions.map((session) =>
        getSessionUniqueKey(session.date, session.timeSlot, session.roomNumber),
      );

      const sessionsToDelete = updatedMovie.sessions.filter(
        (session) =>
          !newUniqueKeys.includes(
            getSessionUniqueKey(
              session.date,
              session.timeSlot,
              session.roomNumber,
            ),
          ),
      );

      if (!isEmpty(sessionsToDelete)) {
        await txn.remove(sessionsToDelete);
      }

      const sessionsToInsert = movieUpsertDto.sessions
        .filter(
          (sessionDto) =>
            !existingUniqueKeys.includes(
              getSessionUniqueKey(
                sessionDto.date,
                sessionDto.timeSlot,
                sessionDto.roomNumber,
              ),
            ),
        )
        .map((sessionDto) => {
          const session = new Session();
          session.movieId = updatedMovie.id;
          session.movie = updatedMovie;
          session.date = sessionDto.date;
          session.timeSlot = sessionDto.timeSlot;
          session.roomNumber = sessionDto.roomNumber;

          return session;
        });

      if (!isEmpty(sessionsToInsert)) {
        try {
          await txn.save(sessionsToInsert);
        } catch (err) {
          if (isDbStatusConflict(err.code)) {
            throw new ConflictException(
              'Sessions could not be created due to conflict in rooms',
            );
          }
          throw err;
        }
      }
    });
  }

  async list(filters: MovieFilter): Promise<MoviesListDto> {
    const { name, permittedForAge, sortCriteria, pagination, order } = filters;

    const options: FindManyOptions<Movie> = {
      relations: ['sessions'],
      where: {},
      order: {
        [sortCriteria]: order,
      },
    };

    if (name) {
      options.where['name'] = Like(`%${name}%`);
    }

    if (permittedForAge) {
      options.where['minAge'] = LessThanOrEqual(permittedForAge);
    }

    if (pagination) {
      options.skip = (pagination.pageNumber - 1) * pagination.pageSize;
      options.take = pagination.pageSize;
    }

    const [movies, totalCount] =
      await this.movieRepository.findAndCount(options);

    const result = new MoviesListDto();
    result.movies = movies;
    if (pagination) {
      result.totalCount = totalCount;
      result.pageNumber = pagination.pageNumber;
      result.pageSize = pagination.pageSize;
    }

    return result;
  }
}
