import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MovieService } from '../application/movie.service';
import { MovieCreateDto } from '../application/dtos/movie-create.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RoleGuard } from '../../../common/guards/role.guard';

@UseGuards(JwtAuthGuard)
@Controller('movie')
export class MovieController {
  constructor(private movieService: MovieService) {}

  @UseGuards(RoleGuard)
  @Post()
  async create(@Body() movieCreateDto: MovieCreateDto) {
    await this.movieService.create(movieCreateDto);

    return { result: 'success' };
  }
}
