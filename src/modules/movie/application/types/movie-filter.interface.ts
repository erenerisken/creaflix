import { MovieSort } from '../enums/movie-sort.enum';
import { Pagination } from '../../../../common/types/pagination.type';

export interface MovieFilter {
  name?: string;
  permittedForAge?: number;
  sortCriteria?: MovieSort;
  pagination?: Pagination;
}
