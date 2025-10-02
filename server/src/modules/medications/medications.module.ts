import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicationsController } from './medications.controller';
import { MedicationsService } from './medications.service';
import { Medication } from './medications.model';
import { Provider } from '../providers/providers.model';


/**
 * Module for medications feature
 * Handles medication tracking and management operations
 */
@Module({
  imports: [TypeOrmModule.forFeature([Medication, Provider])],
  controllers: [MedicationsController],
  providers: [MedicationsService],
  exports: [MedicationsService],
})
export class MedicationsModule {}