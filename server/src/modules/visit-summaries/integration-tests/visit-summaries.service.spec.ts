import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Repository, IsNull } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { VisitSummariesService } from '../visit-summaries.service';
import { VisitSummary } from '../visit-summaries.model';
import { Visit } from '../../visits/visits.model';
import { Provider } from '../../providers/providers.model';
import { User } from '../../users/users.model';
import { CreateVisitSummaryDto, UpdateVisitSummaryDto } from '../dto';


/**
 * Comprehensive integration tests for VisitSummariesService
 * Tests all 4 visit-summaries endpoints with real database connection
 */
describe('VisitSummariesService Integration Tests', () => {
  let service: VisitSummariesService;
  let visitSummaryRepository: Repository<VisitSummary>;
  let visitRepository: Repository<Visit>;
  let providerRepository: Repository<Provider>;
  let userRepository: Repository<User>;
  let module: TestingModule;
  
  // Test data with unique identifiers
  const testUser1 = {
    email: 'visit-summaries-test-user1@example.com',
    password_hash: '',
    first_name: 'VisitSummaries',
    last_name: 'TestUser1',
    date_of_birth: '1990-01-01',
    phone: '+1234567890'
  };
  
  const testUser2 = {
    email: 'visit-summaries-test-user2@example.com',
    password_hash: '',
    first_name: 'VisitSummaries',
    last_name: 'TestUser2',
    date_of_birth: '1985-01-01',
    phone: '+1234567891'
  };

  let testUser1Id: number;
  let testUser2Id: number;
  let testProvider1Id: number;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env'
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'mysql',
            host: configService.get('DB_HOST'),
            port: configService.get<number>('DB_PORT') || 3306,
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            entities: [__dirname + '/../../**/*.model{.ts,.js}'],
            synchronize: false,
            ssl: { rejectUnauthorized: false }
          }),
        }),
        TypeOrmModule.forFeature([VisitSummary, Visit, Provider, User]),
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '24h' },
          }),
        }),
      ],
      providers: [VisitSummariesService],
    }).compile();

    service = module.get<VisitSummariesService>(VisitSummariesService);
    visitSummaryRepository = module.get<Repository<VisitSummary>>(getRepositoryToken(VisitSummary));
    visitRepository = module.get<Repository<Visit>>(getRepositoryToken(Visit));
    providerRepository = module.get<Repository<Provider>>(getRepositoryToken(Provider));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Create test users
    const salt = await bcrypt.genSalt();
    testUser1.password_hash = await bcrypt.hash('testpassword123', salt);
    testUser2.password_hash = await bcrypt.hash('testpassword456', salt);

    // Insert or get existing test users
    const user1 = await userRepository.findOne({ where: { email: testUser1.email } });
    if (user1) {
      testUser1Id = user1.id;
    } else {
      const createdUser1 = await userRepository.save(testUser1);
      testUser1Id = createdUser1.id;
    }

    const user2 = await userRepository.findOne({ where: { email: testUser2.email } });
    if (user2) {
      testUser2Id = user2.id;
    } else {
      const createdUser2 = await userRepository.save(testUser2);
      testUser2Id = createdUser2.id;
    }

    // Create test provider
    const provider1 = await providerRepository.findOne({
      where: { user_id: testUser1Id, provider_name: 'Visit Summaries Test Provider', soft_deleted_at: IsNull() }
    });
    if (provider1) {
      testProvider1Id = provider1.id;
    } else {
      const createdProvider1 = await providerRepository.save({
        user_id: testUser1Id,
        provider_name: 'Visit Summaries Test Provider',
        provider_type: 'personal_doctor',
        specialty: 'Internal Medicine',
        phone: '+1234567800',
        email: 'provider@visitsummaries-test.com',
        office_address: '789 Medical Plaza, Test City'
      });
      testProvider1Id = createdProvider1.id;
    }
  });

  afterAll(async () => {
    await module.close();
  });

  describe('createVisitSummary', () => {
    it('should successfully create visit summary with all fields', async () => {
      // Create a unique visit for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2025-12-10',
        visit_time: '10:30:00',
        visit_reason: `Visit Summary Create All Fields ${Date.now()}`,
        status: 'completed'
      } as any);

      const createDto: CreateVisitSummaryDto = {
        visit_id: uniqueVisit.id,
        new_diagnosis: 'Type 2 Diabetes',
        follow_up_instructions: 'Schedule follow-up in 3 months',
        doctor_recommendations: 'Increase physical activity and monitor blood sugar',
        patient_concerns_addressed: 'Discussed medication side effects',
        patient_concerns_not_addressed: 'Need specialist referral',
        visit_summary_notes: 'Comprehensive checkup completed successfully'
      };

      const result = await service.createVisitSummary(testUser1Id, createDto);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Visit summary created successfully');
    });

    it('should successfully create visit summary with only required fields', async () => {
      // Create a unique visit for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2025-12-11',
        visit_time: '14:30:00',
        visit_reason: `Visit Summary Create Required Only ${Date.now()}`,
        status: 'completed'
      } as any);

      const createDto: CreateVisitSummaryDto = {
        visit_id: uniqueVisit.id,
        visit_summary_notes: 'Basic visit summary notes'
      };

      const result = await service.createVisitSummary(testUser1Id, createDto);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Visit summary created successfully');
    });

    it('should throw NotFoundException for non-existent visit', async () => {
      const createDto: CreateVisitSummaryDto = {
        visit_id: 99999999,
        visit_summary_notes: 'Test notes'
      };

      await expect(service.createVisitSummary(testUser1Id, createDto))
        .rejects.toThrow('Visit not found or you do not have access to it');
    });

    it('should throw BadRequestException when visit summary already exists', async () => {
      // Create a unique visit and summary for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2025-12-12',
        visit_time: '11:00:00',
        visit_reason: `Visit Summary Duplicate Test ${Date.now()}`,
        status: 'completed'
      } as any);

      await service.createVisitSummary(testUser1Id, {
        visit_id: uniqueVisit.id,
        visit_summary_notes: 'First summary'
      });

      const createDto: CreateVisitSummaryDto = {
        visit_id: uniqueVisit.id,
        visit_summary_notes: 'Duplicate summary attempt'
      };

      await expect(service.createVisitSummary(testUser1Id, createDto))
        .rejects.toThrow('Visit summary already exists for this visit');
    });
  });

  describe('getVisitSummaryByVisitId', () => {
    it('should return visit summary data when it exists', async () => {
      // Create unique visit and summary for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2025-12-13',
        visit_time: '09:00:00',
        visit_reason: `Visit Summary Get All Fields ${Date.now()}`,
        status: 'completed'
      } as any);

      await service.createVisitSummary(testUser1Id, {
        visit_id: uniqueVisit.id,
        new_diagnosis: 'Hypertension Stage 1',
        follow_up_instructions: 'Monitor blood pressure daily',
        doctor_recommendations: 'Reduce sodium intake',
        patient_concerns_addressed: 'Discussed medication options',
        patient_concerns_not_addressed: 'Need lifestyle counseling',
        visit_summary_notes: 'Blood pressure management visit'
      });

      const result = await service.getVisitSummaryByVisitId(uniqueVisit.id, testUser1Id);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.new_diagnosis).toBe('Hypertension Stage 1');
        expect(result.follow_up_instructions).toBe('Monitor blood pressure daily');
        expect(result.doctor_recommendations).toBe('Reduce sodium intake');
        expect(result.patient_concerns_addressed).toBe('Discussed medication options');
        expect(result.patient_concerns_not_addressed).toBe('Need lifestyle counseling');
        expect(result.visit_summary_notes).toBe('Blood pressure management visit');
      }
    });

    it('should return visit summary with only required fields', async () => {
      // Create unique visit and summary for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2025-12-14',
        visit_time: '13:00:00',
        visit_reason: `Visit Summary Get Required Only ${Date.now()}`,
        status: 'completed'
      } as any);

      await service.createVisitSummary(testUser1Id, {
        visit_id: uniqueVisit.id,
        visit_summary_notes: 'Basic visit summary notes'
      });

      const result = await service.getVisitSummaryByVisitId(uniqueVisit.id, testUser1Id);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.new_diagnosis).toBeUndefined();
        expect(result.follow_up_instructions).toBeUndefined();
        expect(result.doctor_recommendations).toBeUndefined();
        expect(result.patient_concerns_addressed).toBeUndefined();
        expect(result.patient_concerns_not_addressed).toBeUndefined();
        expect(result.visit_summary_notes).toBe('Basic visit summary notes');
      }
    });

    it('should return null when visit summary does not exist', async () => {
      // Create a visit without summary
      const tempVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2026-01-01',
        visit_time: '09:00:00',
        visit_reason: `Visit Summary No Summary Visit ${Date.now()}`,
        status: 'completed'
      } as any);

      const result = await service.getVisitSummaryByVisitId(tempVisit.id, testUser1Id);
      expect(result).toBeNull();
    });

    it('should throw NotFoundException for non-existent visit', async () => {
      await expect(service.getVisitSummaryByVisitId(99999999, testUser1Id))
        .rejects.toThrow('Visit not found or you do not have access to it');
    });

    it('should throw NotFoundException when accessing another user visit', async () => {
      // Create unique visit and summary for user1
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2025-12-18',
        visit_time: '10:00:00',
        visit_reason: `Visit Summary Unauthorized Access ${Date.now()}`,
        status: 'completed'
      } as any);

      await service.createVisitSummary(testUser1Id, {
        visit_id: uniqueVisit.id,
        visit_summary_notes: 'User1 summary'
      });

      // Try to access as user2
      await expect(service.getVisitSummaryByVisitId(uniqueVisit.id, testUser2Id))
        .rejects.toThrow('Visit not found or you do not have access to it');
    });
  });

  describe('updateVisitSummary', () => {
    it('should successfully update visit summary fields', async () => {
      // Create unique visit and summary for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2025-12-15',
        visit_time: '10:00:00',
        visit_reason: `Visit Summary Update Multiple ${Date.now()}`,
        status: 'completed'
      } as any);

      await service.createVisitSummary(testUser1Id, {
        visit_id: uniqueVisit.id,
        new_diagnosis: 'Original diagnosis',
        follow_up_instructions: 'Original instructions',
        visit_summary_notes: 'Original summary'
      });

      const updateDto: UpdateVisitSummaryDto = {
        new_diagnosis: 'Updated: Pre-diabetes',
        follow_up_instructions: 'Updated: Check glucose levels monthly',
        visit_summary_notes: 'Updated visit summary notes'
      };

      const result = await service.updateVisitSummary(uniqueVisit.id, testUser1Id, updateDto);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Visit summary updated successfully');

      // Verify the update
      const updated = await service.getVisitSummaryByVisitId(uniqueVisit.id, testUser1Id);
      expect(updated?.new_diagnosis).toBe('Updated: Pre-diabetes');
      expect(updated?.follow_up_instructions).toBe('Updated: Check glucose levels monthly');
      expect(updated?.visit_summary_notes).toBe('Updated visit summary notes');
    });

    it('should successfully update single field', async () => {
      // Create unique visit and summary for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2025-12-16',
        visit_time: '11:00:00',
        visit_reason: `Visit Summary Update Single ${Date.now()}`,
        status: 'completed'
      } as any);

      await service.createVisitSummary(testUser1Id, {
        visit_id: uniqueVisit.id,
        visit_summary_notes: 'Original summary'
      });

      const updateDto: UpdateVisitSummaryDto = {
        doctor_recommendations: 'Single field update: Regular exercise recommended'
      };

      const result = await service.updateVisitSummary(uniqueVisit.id, testUser1Id, updateDto);
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException for non-existent visit', async () => {
      const updateDto: UpdateVisitSummaryDto = {
        visit_summary_notes: 'Test update'
      };

      await expect(service.updateVisitSummary(99999999, testUser1Id, updateDto))
        .rejects.toThrow('Visit not found or you do not have access to it');
    });

    it('should throw NotFoundException when visit summary does not exist', async () => {
      // Create a visit without summary
      const tempVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2026-02-01',
        visit_time: '11:00:00',
        visit_reason: `Visit Summary Update No Summary ${Date.now()}`,
        status: 'completed'
      } as any);

      const updateDto: UpdateVisitSummaryDto = {
        visit_summary_notes: 'Trying to update non-existent summary'
      };

      await expect(service.updateVisitSummary(tempVisit.id, testUser1Id, updateDto))
        .rejects.toThrow('Visit summary not found for this visit');
    });

    it('should throw NotFoundException when updating another user visit summary', async () => {
      // Create unique visit and summary for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2025-12-17',
        visit_time: '15:00:00',
        visit_reason: `Visit Summary Update Unauthorized ${Date.now()}`,
        status: 'completed'
      } as any);

      await service.createVisitSummary(testUser1Id, {
        visit_id: uniqueVisit.id,
        visit_summary_notes: 'User1 summary'
      });

      const updateDto: UpdateVisitSummaryDto = {
        visit_summary_notes: 'Unauthorized update'
      };

      await expect(service.updateVisitSummary(uniqueVisit.id, testUser2Id, updateDto))
        .rejects.toThrow('Visit not found or you do not have access to it');
    });
  });

  describe('deleteVisitSummary', () => {
    it('should successfully soft delete visit summary', async () => {
      // Create unique visit and summary for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2026-03-01',
        visit_time: '15:00:00',
        visit_reason: `Visit Summary Delete Test ${Date.now()}`,
        status: 'completed'
      } as any);

      await service.createVisitSummary(testUser1Id, {
        visit_id: uniqueVisit.id,
        visit_summary_notes: 'To be deleted'
      });

      const result = await service.deleteVisitSummary(uniqueVisit.id, testUser1Id);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Visit summary deleted successfully');

      // Verify it returns null after deletion
      const deleted = await service.getVisitSummaryByVisitId(uniqueVisit.id, testUser1Id);
      expect(deleted).toBeNull();
    });

    it('should throw NotFoundException for non-existent visit', async () => {
      await expect(service.deleteVisitSummary(99999999, testUser1Id))
        .rejects.toThrow('Visit not found or you do not have access to it');
    });

    it('should throw NotFoundException when visit summary does not exist', async () => {
      // Create a visit without summary
      const tempVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2026-04-01',
        visit_time: '12:00:00',
        visit_reason: `Visit Summary Delete No Summary ${Date.now()}`,
        status: 'completed'
      } as any);

      await expect(service.deleteVisitSummary(tempVisit.id, testUser1Id))
        .rejects.toThrow('Visit summary not found for this visit');
    });

    it('should throw NotFoundException when deleting another user visit summary', async () => {
      // Create unique visit and summary for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2026-04-02',
        visit_time: '16:00:00',
        visit_reason: `Visit Summary Delete Unauthorized ${Date.now()}`,
        status: 'completed'
      } as any);

      await service.createVisitSummary(testUser1Id, {
        visit_id: uniqueVisit.id,
        visit_summary_notes: 'User1 summary to delete'
      });

      await expect(service.deleteVisitSummary(uniqueVisit.id, testUser2Id))
        .rejects.toThrow('Visit not found or you do not have access to it');
    });
  });
});