import { WatchHistoryEntryDto } from './watch-history-entry.dto';

export class WatchHistoryListDto {
  history: WatchHistoryEntryDto[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
}
