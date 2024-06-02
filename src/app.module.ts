import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './db/config';
import { UserModule } from './modules/user/user.module';
import { MovieModule } from './modules/movie/movie.module';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'process';
import { TicketModule } from './modules/ticket/ticket.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig),
    MovieModule,
    TicketModule,
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
