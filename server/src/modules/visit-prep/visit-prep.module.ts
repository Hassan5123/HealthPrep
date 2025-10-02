import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VisitPrepController } from './visit-prep.controller';
import { VisitPrepService } from './visit-prep.service';
import { VisitPrep } from './visit-prep.model';
import { Visit } from '../visits/visits.model';
import { User } from '../users/users.model';


/**
 * Module for visit preparation management
 * Handles creating, updating, and retrieving visit preparation information
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([VisitPrep, Visit, User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [VisitPrepController],
  providers: [VisitPrepService],
  exports: [VisitPrepService],
})
export class VisitPrepModule {}