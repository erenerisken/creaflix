import { WatchHistoryEntryDto } from './watch-history-entry.dto';
import { ApiProperty } from '@nestjs/swagger';

export class WatchHistoryListDto {
  @ApiProperty({
    description: 'List of movies watched',
    type: [WatchHistoryEntryDto],
  })
  history: WatchHistoryEntryDto[];

  @ApiProperty({ description: 'Total count of entries' })
  totalCount?: number;

  @ApiProperty({ description: 'Page number' })
  pageNumber?: number;

  @ApiProperty({ description: 'Page size' })
  pageSize?: number;
}
