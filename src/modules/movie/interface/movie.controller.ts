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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('movie')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('movie')
export class MovieController {
  constructor(private movieService: MovieService) {}

  @UseGuards(RoleGuard)
  @Post()
  @ApiOperation({ summary: 'Create new movie' })
  @ApiBody({ type: MovieUpsertDto })
  @ApiResponse({ status: 201, description: 'Successful creation' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'Conflict in movie name or session rooms',
  })
  async create(@Body() movieUpsertDto: MovieUpsertDto) {
    await this.movieService.create(movieUpsertDto);

    return { result: 'success' };
  }

  @Get()
  @ApiOperation({ summary: 'List movies with optional filters' })
  @ApiQuery({
    name: 'page-size',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'page-number',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'permitted-for-age',
    required: false,
    type: Number,
    description: 'Age permitted for',
    example: 18,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Name of the movie',
    example: 'Inception',
  })
  @ApiQuery({
    name: 'sort-by',
    required: false,
    enum: MovieSort,
    description: 'Criteria to sort by',
    example: MovieSort.NAME,
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: Order,
    description: 'Sort order',
    example: Order.ASC,
  })
  @ApiResponse({
    status: 200,
    description: 'List of movies',
    type: MoviesListDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Update an existing movie by ID' })
  @ApiBody({ type: MovieUpsertDto })
  @ApiResponse({ status: 201, description: 'Successful update' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict in movie name or session rooms',
  })
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() movieUpsertDto: MovieUpsertDto,
  ) {
    await this.movieService.update(id, movieUpsertDto);

    return { result: 'success' };
  }

  @UseGuards(RoleGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an existing movie by ID' })
  @ApiResponse({ status: 201, description: 'Successful deletion' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  async delete(@Param('id', new ParseIntPipe()) id: number) {
    await this.movieService.delete(id);

    return { result: 'success' };
  }
}
