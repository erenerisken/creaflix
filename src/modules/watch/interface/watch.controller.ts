import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { WatchService } from '../application/watch.service';
import { WatchMovieDto } from '../application/dtos/watch-movie.dto';
import { Request } from 'express';
import { WatchHistoryEntryDto } from '../application/dtos/watch-history-entry.dto';

@UseGuards(JwtAuthGuard)
@Controller('watch')
export class WatchController {
  constructor(private watchService: WatchService) {}

  @Post()
  async watch(
    @Body() watchMovieDto: WatchMovieDto,
    @Req() request: Request,
  ): Promise<WatchHistoryEntryDto> {
    const { user } = request;

    return await this.watchService.watch(user.id, watchMovieDto);
  }
}
