import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from '../ticket/domain/entities/ticket.entity';
import { WatchController } from './interface/watch.controller';
import { WatchService } from './application/watch.service';
import { TimeService } from '../time/application/time.service';
import { History } from './domain/entities/history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([History, Ticket])],
  controllers: [WatchController],
  providers: [TimeService, WatchService],
})
export class WatchModule {}
