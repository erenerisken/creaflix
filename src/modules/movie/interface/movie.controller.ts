import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MovieService } from '../application/movie.service';
import { MovieUpsertDto } from '../application/dtos/movie-upsert.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RoleGuard } from '../../../common/guards/role.guard';

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
}
