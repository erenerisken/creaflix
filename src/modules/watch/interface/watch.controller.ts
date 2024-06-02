import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { WatchService } from '../application/watch.service';
import { WatchMovieDto } from '../application/dtos/watch-movie.dto';
import { Request } from 'express';
import { WatchHistoryEntryDto } from '../application/dtos/watch-history-entry.dto';
import { WatchHistoryListDto } from '../application/dtos/watch-history-list.dto';
import { Pagination } from '../../../common/types/pagination.type';

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

  @Get('history')
  async listHistory(
    @Query('page-size', new DefaultValuePipe(-1), ParseIntPipe)
    pageSize: number,
    @Query('page-number', new DefaultValuePipe(-1), ParseIntPipe)
    pageNumber: number,
    @Req() request: Request,
  ): Promise<WatchHistoryListDto> {
    const { user } = request;

    let pagination: Pagination;
    if (pageSize >= 0 && pageNumber >= 0) {
      pagination = {
        pageNumber,
        pageSize,
      };
    }

    return this.watchService.listHistory(user.id, pagination);
  }
}
