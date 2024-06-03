import { ApiProperty } from '@nestjs/swagger';

export class WatchHistoryEntryDto {
  @ApiProperty({ description: 'The ID of the watched movie' })
  movieId: number;

  @ApiProperty({ description: 'The name of the watched movie' })
  movieName: string;

  @ApiProperty({
    description: 'The time when movie is last watched by the user',
  })
  watchedAt: Date;
}
