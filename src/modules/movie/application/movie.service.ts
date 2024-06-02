import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from '../domain/entities/movie.entity';
import { Repository } from 'typeorm';
import { MovieCreateDto } from './dtos/movie-create.dto';
import { isDbStatusConflict } from '../../../common/utils/psql.util';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie) private movieRepository: Repository<Movie>,
  ) {}

  async create(movieCreateDto: MovieCreateDto): Promise<void> {
    const newMovie = new Movie();
    newMovie.name = movieCreateDto.name;
    newMovie.minAge = movieCreateDto.minAge;

    try {
      await this.movieRepository.save(newMovie);
    } catch (err) {
      if (isDbStatusConflict(err.code)) {
        throw new ConflictException('Movie already exists');
      }
      throw err;
    }
  }
}
