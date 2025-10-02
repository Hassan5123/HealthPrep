import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitSummariesController } from './visit-summaries.controller';
import { VisitSummariesService } from './visit-summaries.service';
import { VisitSummary } from './visit-summaries.model';
import { Visit } from '../visits/visits.model';


/**
 * Module for visit summaries feature
 * Handles post-visit summary operations
 */
@Module({
  imports: [TypeOrmModule.forFeature([VisitSummary, Visit])],
  controllers: [VisitSummariesController],
  providers: [VisitSummariesService],
  exports: [VisitSummariesService],
})
export class VisitSummariesModule {}