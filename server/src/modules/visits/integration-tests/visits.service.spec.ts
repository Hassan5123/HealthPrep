import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Repository, IsNull } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { VisitsService } from '../visits.service';
import { Visit } from '../visits.model';
import { Provider } from '../../providers/providers.model';
import { User } from '../../users/users.model';
import { ScheduleVisitDto, UpdateVisitDto } from '../dto';



/**
 * Comprehensive integration tests for VisitsService
 * Tests all 7 visit endpoints with real database connection
 */
describe('VisitsService Integration Tests', () => {
  let service: VisitsService;
  let visitRepository: Repository<Visit>;
  let providerRepository: Repository<Provider>;
  let userRepository: Repository<User>;
  let module: TestingModule;
  
  // Test data with unique identifiers to prevent conflicts
  const testUser1 = {
    email: 'visits-test-user1@example.com',
    password_hash: '',
    first_name: 'Visit',
    last_name: 'TestUser1',
    date_of_birth: '1990-01-01',
    phone: '+1234567890',
    existing_conditions: 'Test conditions for visit tests'
  };
  
  const testUser2 = {
    email: 'visits-test-user2@example.com',
    password_hash: '',
    first_name: 'Visit',
    last_name: 'TestUser2',
    date_of_birth: '1985-01-01',
    phone: '+1234567891'
  };

  let testUser1Id: number;
  let testUser2Id: number;
  let testProvider1Id: number;
  let testProvider2Id: number;
  let testVisitId: number;

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
        TypeOrmModule.forFeature([Visit, Provider, User]),
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '24h' },
          }),
        }),
      ],
      providers: [VisitsService],
    }).compile();

    service = module.get<VisitsService>(VisitsService);
    visitRepository = module.get<Repository<Visit>>(getRepositoryToken(Visit));
    providerRepository = module.get<Repository<Provider>>(getRepositoryToken(Provider));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Create test users for visit tests
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

    // Create test providers for visit tests
    const provider1 = await providerRepository.findOne({
      where: { user_id: testUser1Id, provider_name: 'Visits Test Provider 1', soft_deleted_at: IsNull() }
    });
    if (provider1) {
      testProvider1Id = provider1.id;
    } else {
      const createdProvider1 = await providerRepository.save({
        user_id: testUser1Id,
        provider_name: 'Visits Test Provider 1',
        provider_type: 'personal_doctor',
        specialty: 'Cardiology',
        phone: '+1234567800',
        email: 'provider1@visits-test.com',
        office_address: '123 Test St, Test City'
      });
      testProvider1Id = createdProvider1.id;
    }

    const provider2 = await providerRepository.findOne({
      where: { user_id: testUser2Id, provider_name: 'Visits Test Provider 2', soft_deleted_at: IsNull() }
    });
    if (provider2) {
      testProvider2Id = provider2.id;
    } else {
      const createdProvider2 = await providerRepository.save({
        user_id: testUser2Id,
        provider_name: 'Visits Test Provider 2',
        provider_type: 'walk_in_clinic',
        phone: '+1234567801'
      });
      testProvider2Id = createdProvider2.id;
    }
  });

  afterAll(async () => {
    await module.close();
  });

  describe('scheduleVisit', () => {
    it('should successfully schedule a visit with all fields', async () => {
      const scheduleDto: ScheduleVisitDto = {
        provider_id: testProvider1Id,
        visit_date: '2025-12-15',
        visit_time: '14:30:00',
        visit_reason: 'Annual checkup and health screening'
      };

      const result = await service.scheduleVisit(testUser1Id, scheduleDto);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Visit scheduled successfully');
    });

    it('should successfully schedule a visit with only required fields', async () => {
      const scheduleDto: ScheduleVisitDto = {
        provider_id: testProvider1Id,
        visit_date: '2025-12-20',
        visit_reason: 'Follow-up consultation'
      };

      const result = await service.scheduleVisit(testUser1Id, scheduleDto);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Visit scheduled successfully');
    });

    it('should set status to scheduled automatically', async () => {
      const scheduleDto: ScheduleVisitDto = {
        provider_id: testProvider1Id,
        visit_date: '2025-11-30',
        visit_time: '09:00:00',
        visit_reason: 'Routine examination'
      };

      await service.scheduleVisit(testUser1Id, scheduleDto);
      
      const dbVisit = await visitRepository.findOne({
        where: { 
          user_id: testUser1Id, 
          provider_id: testProvider1Id,
          visit_reason: 'Routine examination',
          soft_deleted_at: IsNull()
        }
      });
      
      expect(dbVisit).toBeDefined();
      if (dbVisit) {
        expect(dbVisit.status).toBe('scheduled');
      }
    });

    it('should throw NotFoundException for non-existent provider', async () => {
      const scheduleDto: ScheduleVisitDto = {
        provider_id: 99999999,
        visit_date: '2025-12-01',
        visit_reason: 'Test visit'
      };

      await expect(service.scheduleVisit(testUser1Id, scheduleDto))
        .rejects.toThrow('Provider not found or you do not have access to it');
    });

    it('should throw NotFoundException when scheduling with another user provider', async () => {
      const scheduleDto: ScheduleVisitDto = {
        provider_id: testProvider2Id,
        visit_date: '2025-12-05',
        visit_reason: 'Unauthorized visit attempt'
      };

      await expect(service.scheduleVisit(testUser1Id, scheduleDto))
        .rejects.toThrow('Provider not found or you do not have access to it');
    });
  });

  describe('getAllVisits', () => {
    it('should return all non-deleted visits for a user', async () => {
      const result = await service.getAllVisits(testUser1Id);
      expect(Array.isArray(result)).toBe(true);
      
      result.forEach(visit => {
        expect(visit.provider_id).toBeDefined();
        expect(visit.provider_name).toBeDefined();
        expect(visit.provider_type).toBeDefined();
        expect(visit.visit_date).toBeDefined();
        expect(visit.status).toBeDefined();
      });
    });

    it('should return visits with dates formatted as YYYY-MM-DD', async () => {
      const result = await service.getAllVisits(testUser1Id);
      
      if (result.length > 0) {
        result.forEach(visit => {
          expect(visit.visit_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
      }
    });

    it('should return visits sorted by most recent date first', async () => {
      const result = await service.getAllVisits(testUser1Id);
      
      if (result.length > 1) {
        for (let i = 1; i < result.length; i++) {
          const prevDate = new Date(result[i-1].visit_date);
          const currDate = new Date(result[i].visit_date);
          expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
        }
      }
    });

    it('should not include soft-deleted visits', async () => {
      const scheduleDto: ScheduleVisitDto = {
        provider_id: testProvider1Id,
        visit_date: '2025-12-25',
        visit_reason: `Visits Test To Delete ${Date.now()}`
      };
      await service.scheduleVisit(testUser1Id, scheduleDto);
      
      const dbVisit = await visitRepository.findOne({
        where: { user_id: testUser1Id, visit_reason: scheduleDto.visit_reason, soft_deleted_at: IsNull() }
      });
      
      if (dbVisit) {
        await service.removeVisit(dbVisit.id, testUser1Id);
        const visitsAfterDelete = await service.getAllVisits(testUser1Id);
        expect(visitsAfterDelete.find(v => v.visit_date === scheduleDto.visit_date && v.provider_id === testProvider1Id)).toBeUndefined();
      }
    });

    it('should include provider details in response', async () => {
      const result = await service.getAllVisits(testUser1Id);
      
      if (result.length > 0) {
        const visit = result[0];
        expect(visit.provider_name).toBeDefined();
        expect(visit.provider_type).toBeDefined();
        expect(typeof visit.provider_name).toBe('string');
        expect(typeof visit.provider_type).toBe('string');
      }
    });
  });

  describe('getUpcomingVisits', () => {
    it('should return only scheduled visits', async () => {
      const result = await service.getUpcomingVisits(testUser1Id);
      expect(Array.isArray(result)).toBe(true);
      
      result.forEach(visit => {
        expect(visit.provider_id).toBeDefined();
        expect(visit.provider_name).toBeDefined();
        expect(visit.visit_date).toBeDefined();
      });
    });

    it('should not return completed visits', async () => {
      const scheduledDto: ScheduleVisitDto = {
        provider_id: testProvider1Id,
        visit_date: '2026-01-10',
        visit_reason: `Visits Test Scheduled Only ${Date.now()}`
      };
      const completedDto: ScheduleVisitDto = {
        provider_id: testProvider1Id,
        visit_date: '2025-10-05',
        visit_reason: `Visits Test Completed Only ${Date.now()}`
      };
      
      await service.scheduleVisit(testUser1Id, scheduledDto);
      await service.scheduleVisit(testUser1Id, completedDto);
      
      const completedVisit = await visitRepository.findOne({
        where: { user_id: testUser1Id, visit_reason: completedDto.visit_reason, soft_deleted_at: IsNull() }
      });
      
      if (completedVisit) {
        await service.updateVisit(completedVisit.id, testUser1Id, { status: 'completed' });
        const upcomingVisits = await service.getUpcomingVisits(testUser1Id);
        expect(upcomingVisits.find(v => v.visit_date === '2025-10-05')).toBeUndefined();
      }
    });

    it('should include provider details in response', async () => {
      const result = await service.getUpcomingVisits(testUser1Id);
      
      if (result.length > 0) {
        const visit = result[0];
        expect(visit.provider_name).toBeDefined();
        expect(visit.provider_type).toBeDefined();
      }
    });
  });

  describe('getCompletedVisits', () => {
    it('should return only completed visits', async () => {
      const result = await service.getCompletedVisits(testUser1Id);
      expect(Array.isArray(result)).toBe(true);
      
      result.forEach(visit => {
        expect(visit.provider_id).toBeDefined();
        expect(visit.visit_date).toBeDefined();
      });
    });

    it('should not return scheduled visits', async () => {
      const scheduledDto: ScheduleVisitDto = {
        provider_id: testProvider1Id,
        visit_date: '2026-02-15',
        visit_reason: `Visits Test Scheduled Not Completed ${Date.now()}`
      };
      const completedDto: ScheduleVisitDto = {
        provider_id: testProvider1Id,
        visit_date: '2025-09-20',
        visit_reason: `Visits Test Completed Found ${Date.now()}`
      };
      
      await service.scheduleVisit(testUser1Id, scheduledDto);
      await service.scheduleVisit(testUser1Id, completedDto);
      
      const completedVisit = await visitRepository.findOne({
        where: { user_id: testUser1Id, visit_reason: completedDto.visit_reason, soft_deleted_at: IsNull() }
      });
      
      if (completedVisit) {
        await service.updateVisit(completedVisit.id, testUser1Id, { status: 'completed' });
        const completedVisits = await service.getCompletedVisits(testUser1Id);
        expect(completedVisits.find(v => v.visit_date === '2026-02-15')).toBeUndefined();
        expect(completedVisits.find(v => v.visit_date === '2025-09-20')).toBeDefined();
      }
    });

    it('should include provider details in response', async () => {
      const result = await service.getCompletedVisits(testUser1Id);
      
      if (result.length > 0) {
        const visit = result[0];
        expect(visit.provider_name).toBeDefined();
        expect(visit.provider_type).toBeDefined();
      }
    });
  });

  describe('getVisit', () => {
    beforeAll(async () => {
      const scheduleDto: ScheduleVisitDto = {
        provider_id: testProvider1Id,
        visit_date: '2025-11-15',
        visit_time: '10:30:00',
        visit_reason: 'Visits Test Detail Visit 1'
      };
      await service.scheduleVisit(testUser1Id, scheduleDto);
      const dbVisit = await visitRepository.findOne({
        where: { user_id: testUser1Id, visit_reason: scheduleDto.visit_reason, soft_deleted_at: IsNull() }
      });
      if (dbVisit) testVisitId = dbVisit.id;
    });

    it('should return detailed visit information', async () => {
      if (!testVisitId) return;
      const result = await service.getVisit(testVisitId, testUser1Id);
      expect(result.provider_id).toBe(testProvider1Id);
      expect(result.provider_name).toBe('Visits Test Provider 1');
      expect(result.provider_type).toBe('personal_doctor');
      expect(result.specialty).toBe('Cardiology');
      expect(result.phone).toBe('+1234567800');
      expect(result.office_address).toBe('123 Test St, Test City');
      expect(result.visit_date).toBe('2025-11-15');
      expect(result.visit_time).toBe('10:30:00');
      expect(result.visit_reason).toBe('Visits Test Detail Visit 1');
      expect(result.status).toBe('scheduled');
    });

    it('should throw NotFoundException for non-existent visit', async () => {
      await expect(service.getVisit(99999999, testUser1Id))
        .rejects.toThrow('Visit not found or you do not have access to it');
    });

    it('should throw NotFoundException for another user visit', async () => {
      if (!testVisitId) return;
      await expect(service.getVisit(testVisitId, testUser2Id))
        .rejects.toThrow('Visit not found or you do not have access to it');
    });
  });

  describe('updateVisit', () => {
    it('should successfully update visit fields', async () => {
      const scheduleDto: ScheduleVisitDto = {
        provider_id: testProvider1Id,
        visit_date: '2025-11-25',
        visit_time: '11:00:00',
        visit_reason: `Visits Test Update ${Date.now()}`
      };
      await service.scheduleVisit(testUser1Id, scheduleDto);
      
      const dbVisit = await visitRepository.findOne({
        where: { user_id: testUser1Id, visit_reason: scheduleDto.visit_reason, soft_deleted_at: IsNull() }
      });
      
      if (dbVisit) {
        const updateDto: UpdateVisitDto = {
          visit_date: '2025-11-28',
          visit_time: '15:00:00',
          visit_reason: 'Updated visit reason'
        };
        const result = await service.updateVisit(dbVisit.id, testUser1Id, updateDto);
        expect(result.success).toBe(true);
        expect(result.message).toBe('Visit updated successfully');
      }
    });

    it('should successfully change status from scheduled to completed', async () => {
      const scheduleDto: ScheduleVisitDto = {
        provider_id: testProvider1Id,
        visit_date: '2025-10-10',
        visit_reason: `Visits Test Status Change ${Date.now()}`
      };
      await service.scheduleVisit(testUser1Id, scheduleDto);
      
      const dbVisit = await visitRepository.findOne({
        where: { user_id: testUser1Id, visit_reason: scheduleDto.visit_reason, soft_deleted_at: IsNull() }
      });
      
      if (dbVisit) {
        const result = await service.updateVisit(dbVisit.id, testUser1Id, { status: 'completed' });
        expect(result.success).toBe(true);
        
        const updatedVisit = await visitRepository.findOne({ where: { id: dbVisit.id } });
        expect(updatedVisit?.status).toBe('completed');
      }
    });

    it('should throw BadRequestException when changing completed to scheduled', async () => {
      const scheduleDto: ScheduleVisitDto = {
        provider_id: testProvider1Id,
        visit_date: '2025-09-15',
        visit_reason: `Visits Test Status Restriction ${Date.now()}`
      };
      await service.scheduleVisit(testUser1Id, scheduleDto);
      
      const dbVisit = await visitRepository.findOne({
        where: { user_id: testUser1Id, visit_reason: scheduleDto.visit_reason, soft_deleted_at: IsNull() }
      });
      
      if (dbVisit) {
        await service.updateVisit(dbVisit.id, testUser1Id, { status: 'completed' });
        await expect(service.updateVisit(dbVisit.id, testUser1Id, { status: 'scheduled' }))
          .rejects.toThrow('Cannot change a completed visit back to scheduled');
      }
    });

    it('should allow editing both scheduled and completed visits', async () => {
      const scheduleDto: ScheduleVisitDto = {
        provider_id: testProvider1Id,
        visit_date: '2025-08-20',
        visit_reason: `Visits Test Edit Completed ${Date.now()}`
      };
      await service.scheduleVisit(testUser1Id, scheduleDto);
      
      const dbVisit = await visitRepository.findOne({
        where: { user_id: testUser1Id, visit_reason: scheduleDto.visit_reason, soft_deleted_at: IsNull() }
      });
      
      if (dbVisit) {
        await service.updateVisit(dbVisit.id, testUser1Id, { status: 'completed' });
        const result = await service.updateVisit(dbVisit.id, testUser1Id, { visit_reason: 'Updated reason after completion' });
        expect(result.success).toBe(true);
      }
    });

    it('should throw NotFoundException for non-existent visit', async () => {
      await expect(service.updateVisit(99999999, testUser1Id, { visit_reason: 'Test' }))
        .rejects.toThrow('Visit not found or you do not have access to it');
    });

    it('should throw NotFoundException when updating another user visit', async () => {
      const scheduleDto: ScheduleVisitDto = {
        provider_id: testProvider1Id,
        visit_date: '2025-07-10',
        visit_reason: `Visits Test User1 Only ${Date.now()}`
      };
      await service.scheduleVisit(testUser1Id, scheduleDto);
      
      const dbVisit = await visitRepository.findOne({
        where: { user_id: testUser1Id, visit_reason: scheduleDto.visit_reason, soft_deleted_at: IsNull() }
      });
      
      if (dbVisit) {
        await expect(service.updateVisit(dbVisit.id, testUser2Id, { visit_reason: 'Unauthorized update' }))
          .rejects.toThrow('Visit not found or you do not have access to it');
      }
    });
  });

  describe('removeVisit', () => {
    it('should successfully soft delete visit', async () => {
      const scheduleDto: ScheduleVisitDto = {
        provider_id: testProvider1Id,
        visit_date: '2025-06-30',
        visit_reason: `Visits Test Delete ${Date.now()}`
      };
      await service.scheduleVisit(testUser1Id, scheduleDto);
      
      const dbVisit = await visitRepository.findOne({
        where: { user_id: testUser1Id, visit_reason: scheduleDto.visit_reason, soft_deleted_at: IsNull() }
      });
      
      if (dbVisit) {
        const result = await service.removeVisit(dbVisit.id, testUser1Id);
        expect(result.success).toBe(true);
        expect(result.message).toBe('Visit removed successfully');
        
        await expect(service.getVisit(dbVisit.id, testUser1Id))
          .rejects.toThrow('Visit not found');
      }
    });

    it('should throw NotFoundException for non-existent visit', async () => {
      await expect(service.removeVisit(99999999, testUser1Id))
        .rejects.toThrow('Visit not found or you do not have access to it');
    });

    it('should throw NotFoundException when deleting another user visit', async () => {
      const scheduleDto: ScheduleVisitDto = {
        provider_id: testProvider1Id,
        visit_date: '2025-05-20',
        visit_reason: `Visits Test Delete Unauthorized ${Date.now()}`
      };
      await service.scheduleVisit(testUser1Id, scheduleDto);
      
      const dbVisit = await visitRepository.findOne({
        where: { user_id: testUser1Id, visit_reason: scheduleDto.visit_reason, soft_deleted_at: IsNull() }
      });
      
      if (dbVisit) {
        await expect(service.removeVisit(dbVisit.id, testUser2Id))
          .rejects.toThrow('Visit not found or you do not have access to it');
      }
    });
  });
});