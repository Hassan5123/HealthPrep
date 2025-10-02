import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Repository, IsNull } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { VisitPrepService } from '../visit-prep.service';
import { VisitPrep } from '../visit-prep.model';
import { Visit } from '../../visits/visits.model';
import { Provider } from '../../providers/providers.model';
import { User } from '../../users/users.model';
import { CreateVisitPrepDto, UpdateVisitPrepDto } from '../dto';

/**
 * Comprehensive integration tests for VisitPrepService
 * Tests all 5 visit-prep endpoints with real database connection
 */
describe('VisitPrepService Integration Tests', () => {
  let service: VisitPrepService;
  let visitPrepRepository: Repository<VisitPrep>;
  let visitRepository: Repository<Visit>;
  let providerRepository: Repository<Provider>;
  let userRepository: Repository<User>;
  let module: TestingModule;
  
  // Test data with unique identifiers
  const testUser1 = {
    email: 'visit-prep-test-user1@example.com',
    password_hash: '',
    first_name: 'VisitPrep',
    last_name: 'TestUser1',
    date_of_birth: '1990-01-01',
    phone: '+1234567890',
    existing_conditions: 'Hypertension, Diabetes Type 2, Asthma'
  };
  
  const testUser2 = {
    email: 'visit-prep-test-user2@example.com',
    password_hash: '',
    first_name: 'VisitPrep',
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
        TypeOrmModule.forFeature([VisitPrep, Visit, Provider, User]),
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '24h' },
          }),
        }),
      ],
      providers: [VisitPrepService],
    }).compile();

    service = module.get<VisitPrepService>(VisitPrepService);
    visitPrepRepository = module.get<Repository<VisitPrep>>(getRepositoryToken(VisitPrep));
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
      where: { user_id: testUser1Id, provider_name: 'Visit Prep Test Provider', soft_deleted_at: IsNull() }
    });
    if (provider1) {
      testProvider1Id = provider1.id;
    } else {
      const createdProvider1 = await providerRepository.save({
        user_id: testUser1Id,
        provider_name: 'Visit Prep Test Provider',
        provider_type: 'personal_doctor',
        specialty: 'Internal Medicine',
        phone: '+1234567800',
        email: 'provider@visitprep-test.com',
        office_address: '789 Medical Plaza, Test City'
      });
      testProvider1Id = createdProvider1.id;
    }
  });

  afterAll(async () => {
    await module.close();
  });

  describe('createVisitPrep', () => {
    it('should successfully create visit prep with all fields', async () => {
      // Create a unique visit for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2025-12-10',
        visit_time: '10:30:00',
        visit_reason: `Visit Prep Create All Fields ${Date.now()}`,
        status: 'scheduled'
      } as any);

      const createDto: CreateVisitPrepDto = {
        visit_id: uniqueVisit.id,
        questions_to_ask: 'What are the side effects of the medication?',
        symptoms_to_discuss: 'Headaches and fatigue',
        conditions_to_discuss: 'Hypertension management',
        medications_to_discuss: 'Current blood pressure medication',
        goals_for_visit: 'Review blood pressure and adjust medication if needed',
        prep_summary_notes: 'Annual checkup with focus on blood pressure control'
      };

      const result = await service.createVisitPrep(testUser1Id, createDto);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Visit preparation created successfully');
    });

    it('should successfully create visit prep with only required fields', async () => {
      // Create a unique visit for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2025-12-11',
        visit_time: '14:30:00',
        visit_reason: `Visit Prep Create Required Only ${Date.now()}`,
        status: 'scheduled'
      } as any);

      const createDto: CreateVisitPrepDto = {
        visit_id: uniqueVisit.id,
        prep_summary_notes: 'Basic visit prep notes'
      };

      const result = await service.createVisitPrep(testUser1Id, createDto);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Visit preparation created successfully');
    });

    it('should throw NotFoundException for non-existent visit', async () => {
      const createDto: CreateVisitPrepDto = {
        visit_id: 99999999,
        prep_summary_notes: 'Test notes'
      };

      await expect(service.createVisitPrep(testUser1Id, createDto))
        .rejects.toThrow('Visit not found or you do not have access to it');
    });

    it('should throw BadRequestException when visit prep already exists', async () => {
      // Create a unique visit and prep for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2025-12-12',
        visit_time: '11:00:00',
        visit_reason: `Visit Prep Duplicate Test ${Date.now()}`,
        status: 'scheduled'
      } as any);

      await service.createVisitPrep(testUser1Id, {
        visit_id: uniqueVisit.id,
        prep_summary_notes: 'First prep'
      });

      const createDto: CreateVisitPrepDto = {
        visit_id: uniqueVisit.id,
        prep_summary_notes: 'Duplicate prep attempt'
      };

      await expect(service.createVisitPrep(testUser1Id, createDto))
        .rejects.toThrow('Visit preparation already exists for this visit');
    });
  });

  describe('getVisitPrepByVisitId', () => {
    it('should return visit prep data when it exists', async () => {
      // Create unique visit and prep for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2025-12-13',
        visit_time: '09:00:00',
        visit_reason: `Visit Prep Get All Fields ${Date.now()}`,
        status: 'scheduled'
      } as any);

      await service.createVisitPrep(testUser1Id, {
        visit_id: uniqueVisit.id,
        questions_to_ask: 'What are the side effects of the medication?',
        symptoms_to_discuss: 'Headaches and fatigue',
        conditions_to_discuss: 'Hypertension management',
        medications_to_discuss: 'Current blood pressure medication',
        goals_for_visit: 'Review blood pressure and adjust medication if needed',
        prep_summary_notes: 'Annual checkup with focus on blood pressure control'
      });

      const result = await service.getVisitPrepByVisitId(uniqueVisit.id, testUser1Id);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.questions_to_ask).toBe('What are the side effects of the medication?');
        expect(result.symptoms_to_discuss).toBe('Headaches and fatigue');
        expect(result.conditions_to_discuss).toBe('Hypertension management');
        expect(result.medications_to_discuss).toBe('Current blood pressure medication');
        expect(result.goals_for_visit).toBe('Review blood pressure and adjust medication if needed');
        expect(result.prep_summary_notes).toBe('Annual checkup with focus on blood pressure control');
      }
    });

    it('should return visit prep with only required fields', async () => {
      // Create unique visit and prep for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2025-12-14',
        visit_time: '13:00:00',
        visit_reason: `Visit Prep Get Required Only ${Date.now()}`,
        status: 'scheduled'
      } as any);

      await service.createVisitPrep(testUser1Id, {
        visit_id: uniqueVisit.id,
        prep_summary_notes: 'Basic visit prep notes'
      });

      const result = await service.getVisitPrepByVisitId(uniqueVisit.id, testUser1Id);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.questions_to_ask).toBeNull();
        expect(result.symptoms_to_discuss).toBeNull();
        expect(result.conditions_to_discuss).toBeNull();
        expect(result.medications_to_discuss).toBeNull();
        expect(result.goals_for_visit).toBeNull();
        expect(result.prep_summary_notes).toBe('Basic visit prep notes');
      }
    });

    it('should return null when visit prep does not exist', async () => {
      // Create a visit without prep
      const tempVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2026-01-01',
        visit_time: '09:00:00',
        visit_reason: `Visit Prep No Prep Visit ${Date.now()}`,
        status: 'scheduled'
      } as any);

      const result = await service.getVisitPrepByVisitId(tempVisit.id, testUser1Id);
      expect(result).toBeNull();
    });

    it('should throw NotFoundException for non-existent visit', async () => {
      await expect(service.getVisitPrepByVisitId(99999999, testUser1Id))
        .rejects.toThrow('Visit not found or you do not have access to it');
    });

    it('should throw NotFoundException when accessing another user visit', async () => {
      // Create unique visit and prep for user1
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2025-12-18',
        visit_time: '10:00:00',
        visit_reason: `Visit Prep Unauthorized Access ${Date.now()}`,
        status: 'scheduled'
      } as any);

      await service.createVisitPrep(testUser1Id, {
        visit_id: uniqueVisit.id,
        prep_summary_notes: 'User1 prep'
      });

      // Try to access as user2
      await expect(service.getVisitPrepByVisitId(uniqueVisit.id, testUser2Id))
        .rejects.toThrow('Visit not found or you do not have access to it');
    });
  });

  describe('getUserConditions', () => {
    it('should return parsed conditions array when user has conditions', async () => {
      const result = await service.getUserConditions(testUser1Id);
      
      expect(result.has_conditions).toBe(true);
      expect(result.conditions).toBeDefined();
      expect(Array.isArray(result.conditions)).toBe(true);
      expect(result.conditions).toHaveLength(3);
      expect(result.conditions).toContain('Hypertension');
      expect(result.conditions).toContain('Diabetes Type 2');
      expect(result.conditions).toContain('Asthma');
    });

    it('should return has_conditions false when user has no conditions', async () => {
      const result = await service.getUserConditions(testUser2Id);
      
      expect(result.has_conditions).toBe(false);
      expect(result.conditions).toBeUndefined();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      await expect(service.getUserConditions(99999999))
        .rejects.toThrow('User not found');
    });
  });

  describe('updateVisitPrep', () => {
    it('should successfully update visit prep fields', async () => {
      // Create unique visit and prep for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2025-12-15',
        visit_time: '10:00:00',
        visit_reason: `Visit Prep Update Multiple ${Date.now()}`,
        status: 'scheduled'
      } as any);

      await service.createVisitPrep(testUser1Id, {
        visit_id: uniqueVisit.id,
        questions_to_ask: 'Original questions',
        symptoms_to_discuss: 'Original symptoms',
        prep_summary_notes: 'Original summary'
      });

      const updateDto: UpdateVisitPrepDto = {
        questions_to_ask: 'Updated: Any new test results available?',
        symptoms_to_discuss: 'Updated: Occasional dizziness',
        prep_summary_notes: 'Updated prep summary notes'
      };

      const result = await service.updateVisitPrep(uniqueVisit.id, testUser1Id, updateDto);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Visit preparation updated successfully');

      // Verify the update
      const updated = await service.getVisitPrepByVisitId(uniqueVisit.id, testUser1Id);
      expect(updated?.questions_to_ask).toBe('Updated: Any new test results available?');
      expect(updated?.symptoms_to_discuss).toBe('Updated: Occasional dizziness');
      expect(updated?.prep_summary_notes).toBe('Updated prep summary notes');
    });

    it('should successfully update single field', async () => {
      // Create unique visit and prep for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2025-12-16',
        visit_time: '11:00:00',
        visit_reason: `Visit Prep Update Single ${Date.now()}`,
        status: 'scheduled'
      } as any);

      await service.createVisitPrep(testUser1Id, {
        visit_id: uniqueVisit.id,
        prep_summary_notes: 'Original summary'
      });

      const updateDto: UpdateVisitPrepDto = {
        goals_for_visit: 'Single field update: Discuss diet changes'
      };

      const result = await service.updateVisitPrep(uniqueVisit.id, testUser1Id, updateDto);
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException for non-existent visit', async () => {
      const updateDto: UpdateVisitPrepDto = {
        prep_summary_notes: 'Test update'
      };

      await expect(service.updateVisitPrep(99999999, testUser1Id, updateDto))
        .rejects.toThrow('Visit not found or you do not have access to it');
    });

    it('should throw NotFoundException when visit prep does not exist', async () => {
      // Create a visit without prep
      const tempVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2026-02-01',
        visit_time: '11:00:00',
        visit_reason: `Visit Prep Update No Prep ${Date.now()}`,
        status: 'scheduled'
      } as any);

      const updateDto: UpdateVisitPrepDto = {
        prep_summary_notes: 'Trying to update non-existent prep'
      };

      await expect(service.updateVisitPrep(tempVisit.id, testUser1Id, updateDto))
        .rejects.toThrow('Visit preparation not found for this visit');
    });

    it('should throw NotFoundException when updating another user visit prep', async () => {
      // Create unique visit and prep for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2025-12-17',
        visit_time: '15:00:00',
        visit_reason: `Visit Prep Update Unauthorized ${Date.now()}`,
        status: 'scheduled'
      } as any);

      await service.createVisitPrep(testUser1Id, {
        visit_id: uniqueVisit.id,
        prep_summary_notes: 'User1 prep'
      });

      const updateDto: UpdateVisitPrepDto = {
        prep_summary_notes: 'Unauthorized update'
      };

      await expect(service.updateVisitPrep(uniqueVisit.id, testUser2Id, updateDto))
        .rejects.toThrow('Visit not found or you do not have access to it');
    });
  });

  describe('deleteVisitPrep', () => {
    it('should successfully soft delete visit prep', async () => {
      // Create unique visit and prep for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2026-03-01',
        visit_time: '15:00:00',
        visit_reason: `Visit Prep Delete Test ${Date.now()}`,
        status: 'scheduled'
      } as any);

      await service.createVisitPrep(testUser1Id, {
        visit_id: uniqueVisit.id,
        prep_summary_notes: 'To be deleted'
      });

      const result = await service.deleteVisitPrep(uniqueVisit.id, testUser1Id);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Visit preparation deleted successfully');

      // Verify it returns null after deletion
      const deleted = await service.getVisitPrepByVisitId(uniqueVisit.id, testUser1Id);
      expect(deleted).toBeNull();
    });

    it('should throw NotFoundException for non-existent visit', async () => {
      await expect(service.deleteVisitPrep(99999999, testUser1Id))
        .rejects.toThrow('Visit not found or you do not have access to it');
    });

    it('should throw NotFoundException when visit prep does not exist', async () => {
      // Create a visit without prep
      const tempVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2026-04-01',
        visit_time: '12:00:00',
        visit_reason: `Visit Prep Delete No Prep ${Date.now()}`,
        status: 'scheduled'
      } as any);

      await expect(service.deleteVisitPrep(tempVisit.id, testUser1Id))
        .rejects.toThrow('Visit preparation not found for this visit');
    });

    it('should throw NotFoundException when deleting another user visit prep', async () => {
      // Create unique visit and prep for this test
      const uniqueVisit = await visitRepository.save({
        user_id: testUser1Id,
        provider_id: testProvider1Id,
        visit_date: '2026-04-02',
        visit_time: '16:00:00',
        visit_reason: `Visit Prep Delete Unauthorized ${Date.now()}`,
        status: 'scheduled'
      } as any);

      await service.createVisitPrep(testUser1Id, {
        visit_id: uniqueVisit.id,
        prep_summary_notes: 'User1 prep to delete'
      });

      await expect(service.deleteVisitPrep(uniqueVisit.id, testUser2Id))
        .rejects.toThrow('Visit not found or you do not have access to it');
    });
  });
});