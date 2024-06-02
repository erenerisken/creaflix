import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '../movie/domain/entities/session.entity';
import { Ticket } from './domain/entities/ticket.entity';
import { TicketController } from './interface/ticket.controller';
import { TicketService } from './application/ticket.service';
import { TimeService } from '../time/application/time.service';

@Module({
  imports: [TypeOrmModule.forFeature([Session, Ticket])],
  controllers: [TicketController],
  providers: [TicketService, TimeService],
})
export class TicketModule {}
