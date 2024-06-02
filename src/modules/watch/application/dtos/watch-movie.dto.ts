import { IsInt } from 'class-validator';

export class WatchMovieDto {
  @IsInt()
  sessionId: number;
}
