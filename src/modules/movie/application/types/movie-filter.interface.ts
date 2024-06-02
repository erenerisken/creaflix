import { MovieSort } from '../enums/movie-sort.enum';
import { Pagination } from '../../../../common/types/pagination.type';
import { Order } from '../../../../common/enums/order.enum';

export interface MovieFilter {
  name?: string;
  order: Order;
  pagination?: Pagination;
  permittedForAge?: number;
  sortCriteria: MovieSort;
}
