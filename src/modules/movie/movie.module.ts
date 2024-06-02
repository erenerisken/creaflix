import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './domain/entities/movie.entity';
import { MovieController } from './interface/movie.controller';
import { MovieService } from './application/movie.service';
import { Session } from './domain/entities/session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Session])],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
