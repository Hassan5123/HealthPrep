import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';
import { Visit } from './visits.model';
import { Provider } from '../providers/providers.model';


/**
 * Module for visit management
 * Handles scheduling, updating, and retrieving healthcare visit information
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Visit, Provider]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [VisitsController],
  providers: [VisitsService],
  exports: [VisitsService],
})
export class VisitsModule {}