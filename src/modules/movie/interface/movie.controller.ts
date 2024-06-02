import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MovieService } from '../application/movie.service';
import { MovieUpsertDto } from '../application/dtos/movie-upsert.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RoleGuard } from '../../../common/guards/role.guard';
import { MoviesListDto } from '../application/dtos/movies-list.dto';
import { MovieFilter } from '../application/types/movie-filter.interface';
import { MovieSort } from '../application/enums/movie-sort.enum';
import { Order } from '../../../common/enums/order.enum';

@UseGuards(JwtAuthGuard)
@Controller('movie')
export class MovieController {
  constructor(private movieService: MovieService) {}

  @UseGuards(RoleGuard)
  @Post()
  async create(@Body() movieUpsertDto: MovieUpsertDto) {
    await this.movieService.create(movieUpsertDto);

    return { result: 'success' };
  }

  @Get()
  async list(
    @Query('page-size', new DefaultValuePipe(-1), ParseIntPipe)
    pageSize: number,
    @Query('page-number', new DefaultValuePipe(-1), ParseIntPipe)
    pageNumber: number,
    @Query('permitted-for-age', new DefaultValuePipe(-1), ParseIntPipe)
    permittedForAge: number,
    @Query('name') name: string,
    @Query(
      'sort-by',
      new DefaultValuePipe(MovieSort.NAME),
      new ParseEnumPipe(MovieSort),
    )
    sortCriteria: MovieSort,
    @Query('order', new DefaultValuePipe(Order.ASC), new ParseEnumPipe(Order))
    order: Order,
  ): Promise<MoviesListDto> {
    const filters: MovieFilter = {
      permittedForAge: permittedForAge >= 0 ? permittedForAge : undefined,
      name,
      sortCriteria,
      order,
    };
    if (pageSize >= 0 && pageNumber >= 0) {
      filters.pagination = {
        pageNumber,
        pageSize,
      };
    }

    return this.movieService.list(filters);
  }

  @UseGuards(RoleGuard)
  @Put(':id')
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() movieUpsertDto: MovieUpsertDto,
  ) {
    await this.movieService.update(id, movieUpsertDto);

    return { result: 'success' };
  }

  @UseGuards(RoleGuard)
  @Delete(':id')
  async delete(@Param('id', new ParseIntPipe()) id: number) {
    await this.movieService.delete(id);

    return { result: 'success' };
  }
}
