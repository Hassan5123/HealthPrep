import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import * as path from 'path';

import { UsersModule } from './modules/users/users.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { SymptomsModule } from './modules/symptoms/symptoms.module';
import { VisitsModule } from './modules/visits/visits.module';
import { VisitPrepModule } from './modules/visit-prep/visit-prep.module';
import { VisitSummariesModule } from './modules/visit-summaries/visit-summaries.module';
import { MedicationsModule } from './modules/medications/medications.module';
import { AnthropicModule } from './modules/anthropic/anthropic.module';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true, // Make config available throughout the application
      envFilePath: path.resolve(process.cwd(), '.env')
    }),
    
    // Database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get<string>('DB_PORT') ? parseInt(configService.get<string>('DB_PORT') || '3306', 10) : 3306,
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.model{.ts,.js}'],
        synchronize: false, // Disable schema sync to prevent dropping indexes needed by FKs
        ssl: { rejectUnauthorized: false },
        logging: configService.get('DB_LOGGING') === 'true',
        migrationsRun: false,
        // Additional options to better handle existing schema
        dropSchema: false,
        keepConnectionAlive: true,
      }),
    }),
    
    // Feature modules
    UsersModule,
    ProvidersModule,
    SymptomsModule,
    VisitsModule,
    VisitPrepModule,
    VisitSummariesModule,
    MedicationsModule,
    AnthropicModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}