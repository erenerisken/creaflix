import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WatchMovieDto {
  @IsInt()
  @ApiProperty({ description: 'The booked session of the movie to be watched' })
  sessionId: number;
}
