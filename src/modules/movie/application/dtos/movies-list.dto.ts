import { Movie } from '../../domain/entities/movie.entity';

export class MoviesListDto {
  movies: Movie[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
}
