import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AnthropicController } from './anthropic.controller';
import { AnthropicService } from './anthropic.service';
import { AuthGuard } from '../../common/middlewares/auth-middleware';
import { Visit } from '../visits/visits.model';
import { Symptom } from '../symptoms/symptoms.model';
import { Medication } from '../medications/medications.model';
import { Provider } from '../providers/providers.model';

/**
 * Module for AI features using Anthropic Claude API
 */
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Visit, Symptom, Medication, Provider]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '24h',
        },
      }),
    }),
  ],
  controllers: [AnthropicController],
  providers: [AnthropicService, AuthGuard],
  exports: [AnthropicService],
})
export class AnthropicModule {}