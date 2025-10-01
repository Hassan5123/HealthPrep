import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Repository, IsNull } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { SymptomsService } from '../symptoms.service';
import { Symptom } from '../symptoms.model';
import { User } from '../../users/users.model';
import { AddSymptomDto, UpdateSymptomDto } from '../dto';

describe('SymptomsService Integration Tests', () => {
  let service: SymptomsService;
  let symptomRepository: Repository<Symptom>;
  let userRepository: Repository<User>;
  let module: TestingModule;
  
  const testUser1 = {
    email: 'symptoms-test-user1@example.com',
    password_hash: '',
    first_name: 'Symptom',
    last_name: 'TestUser1',
    date_of_birth: '1990-01-01',
    phone: '+1234567890',
    existing_conditions: 'Test conditions for symptom tests'
  };
  
  const testUser2 = {
    email: 'symptoms-test-user2@example.com',
    password_hash: '',
    first_name: 'Symptom',
    last_name: 'TestUser2',
    date_of_birth: '1985-01-01',
    phone: '+1234567891'
  };

  let testUser1Id: number;
  let testUser2Id: number;

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
        TypeOrmModule.forFeature([Symptom, User]),
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '24h' },
          }),
        }),
      ],
      providers: [SymptomsService],
    }).compile();

    service = module.get<SymptomsService>(SymptomsService);
    symptomRepository = module.get<Repository<Symptom>>(getRepositoryToken(Symptom));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    const salt = await bcrypt.genSalt();
    testUser1.password_hash = await bcrypt.hash('testpassword123', salt);
    testUser2.password_hash = await bcrypt.hash('testpassword456', salt);

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
  });

  afterAll(async () => {
    await module.close();
  });

  describe('addSymptom', () => {
    it('should successfully create a symptom with all fields', async () => {
      const addSymptomDto: AddSymptomDto = {
        symptom_name: 'Symptoms Test Headache 1',
        severity: 7,
        onset_date: '2025-09-15',
        description: 'Severe throbbing pain in temples',
        end_date: '2025-09-16',
        location_on_body: 'Head - temples',
        triggers: 'Stress, lack of sleep',
        related_condition: 'Migraine',
        related_medications: 'Aspirin',
        medications_taken: 'Ibuprofen 400mg',
        status: 'resolved'
      };

      const result = await service.addSymptom(testUser1Id, addSymptomDto);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Symptom added successfully');
    });

    it('should successfully create a symptom with only required fields', async () => {
      const addSymptomDto: AddSymptomDto = {
        symptom_name: 'Symptoms Test Fever 1',
        severity: 5,
        onset_date: '2025-09-20',
        status: 'active'
      };

      const result = await service.addSymptom(testUser1Id, addSymptomDto);
      expect(result.success).toBe(true);
    });

    it('should create symptoms with different severity levels', async () => {
      for (const severity of [1, 5, 10]) {
        const addSymptomDto: AddSymptomDto = {
          symptom_name: `Symptoms Test Severity ${severity} Pain 1`,
          severity: severity,
          onset_date: '2025-09-22',
          status: 'active'
        };
        const result = await service.addSymptom(testUser1Id, addSymptomDto);
        expect(result.success).toBe(true);
      }
    });

    it('should associate symptom with correct user', async () => {
      const addSymptomDto: AddSymptomDto = {
        symptom_name: 'Symptoms Test User2 Symptom 1',
        severity: 6,
        onset_date: '2025-09-28',
        status: 'active'
      };

      await service.addSymptom(testUser2Id, addSymptomDto);
      const user1Symptoms = await service.getAllSymptoms(testUser1Id);
      const user2Symptoms = await service.getAllSymptoms(testUser2Id);
      
      expect(user1Symptoms.find(s => s.symptom_name === addSymptomDto.symptom_name)).toBeUndefined();
      expect(user2Symptoms.find(s => s.symptom_name === addSymptomDto.symptom_name)).toBeDefined();
    });
  });

  describe('getAllSymptoms', () => {
    it('should return all non-deleted symptoms for a user', async () => {
      const result = await service.getAllSymptoms(testUser1Id);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(3);
      
      result.forEach(symptom => {
        expect(symptom.symptom_name).toBeDefined();
        expect(symptom.severity).toBeDefined();
        expect(symptom.onset_date).toBeDefined();
        expect(symptom.status).toBeDefined();
        expect(['active', 'resolved']).toContain(symptom.status);
      });
    });

    it('should return symptoms with dates formatted as YYYY-MM-DD', async () => {
      const result = await service.getAllSymptoms(testUser1Id);
      if (result.length > 0) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        result.forEach(symptom => {
          expect(symptom.onset_date).toMatch(dateRegex);
          if (symptom.end_date) {
            expect(symptom.end_date).toMatch(dateRegex);
          }
        });
      }
    });

    it('should return symptoms sorted by most recent onset_date first', async () => {
      const result = await service.getAllSymptoms(testUser1Id);
      if (result.length > 1) {
        for (let i = 1; i < result.length; i++) {
          const prevDate = new Date(result[i-1].onset_date);
          const currDate = new Date(result[i].onset_date);
          expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
        }
      }
    });

    it('should not include soft-deleted symptoms', async () => {
      const addDto: AddSymptomDto = {
        symptom_name: `Symptoms Test To Delete ${Date.now()}`,
        severity: 2,
        onset_date: '2025-09-30',
        status: 'active'
      };
      await service.addSymptom(testUser1Id, addDto);
      
      const dbSymptom = await symptomRepository.findOne({
        where: { user_id: testUser1Id, symptom_name: addDto.symptom_name, soft_deleted_at: IsNull() }
      });
      
      if (dbSymptom) {
        await service.updateSymptom(dbSymptom.id, testUser1Id, { delete: true });
        const symptomsAfterDelete = await service.getAllSymptoms(testUser1Id);
        expect(symptomsAfterDelete.find(s => s.symptom_name === addDto.symptom_name)).toBeUndefined();
      }
    });
  });

  describe('getActiveSymptoms', () => {
    it('should return only symptoms with status active', async () => {
      const result = await service.getActiveSymptoms(testUser1Id);
      expect(Array.isArray(result)).toBe(true);
      
      result.forEach(symptom => {
        expect(symptom.hasOwnProperty('status')).toBe(false);
        expect(symptom.symptom_name).toBeDefined();
        expect(symptom.severity).toBeDefined();
      });
    });

    it('should not return resolved symptoms', async () => {
      const activeDto: AddSymptomDto = {
        symptom_name: `Symptoms Test Active Only ${Date.now()}`,
        severity: 4,
        onset_date: '2025-09-27',
        status: 'active'
      };
      const resolvedDto: AddSymptomDto = {
        symptom_name: `Symptoms Test Resolved Only ${Date.now()}`,
        severity: 3,
        onset_date: '2025-09-20',
        status: 'resolved'
      };
      
      await service.addSymptom(testUser1Id, activeDto);
      await service.addSymptom(testUser1Id, resolvedDto);
      const activeSymptoms = await service.getActiveSymptoms(testUser1Id);
      
      expect(activeSymptoms.find(s => s.symptom_name === activeDto.symptom_name)).toBeDefined();
      expect(activeSymptoms.find(s => s.symptom_name === resolvedDto.symptom_name)).toBeUndefined();
    });
  });

  describe('getResolvedSymptoms', () => {
    it('should return only symptoms with status resolved', async () => {
      const result = await service.getResolvedSymptoms(testUser1Id);
      expect(Array.isArray(result)).toBe(true);
      
      result.forEach(symptom => {
        expect(symptom.hasOwnProperty('status')).toBe(false);
        expect(symptom.symptom_name).toBeDefined();
      });
    });

    it('should not return active symptoms', async () => {
      const activeDto: AddSymptomDto = {
        symptom_name: `Symptoms Test Active Not Resolved ${Date.now()}`,
        severity: 6,
        onset_date: '2025-09-28',
        status: 'active'
      };
      const resolvedDto: AddSymptomDto = {
        symptom_name: `Symptoms Test Resolved Found ${Date.now()}`,
        severity: 4,
        onset_date: '2025-09-22',
        status: 'resolved'
      };
      
      await service.addSymptom(testUser1Id, activeDto);
      await service.addSymptom(testUser1Id, resolvedDto);
      const resolvedSymptoms = await service.getResolvedSymptoms(testUser1Id);
      
      expect(resolvedSymptoms.find(s => s.symptom_name === resolvedDto.symptom_name)).toBeDefined();
      expect(resolvedSymptoms.find(s => s.symptom_name === activeDto.symptom_name)).toBeUndefined();
    });
  });

  describe('getSymptomById', () => {
    let testSymptomId: number;

    beforeAll(async () => {
      const addDto: AddSymptomDto = {
        symptom_name: 'Symptoms Test Detail Symptom 1',
        severity: 8,
        onset_date: '2025-09-10',
        description: 'Detailed test symptom',
        location_on_body: 'Lower back',
        status: 'resolved'
      };
      await service.addSymptom(testUser1Id, addDto);
      const dbSymptom = await symptomRepository.findOne({
        where: { user_id: testUser1Id, symptom_name: addDto.symptom_name, soft_deleted_at: IsNull() }
      });
      if (dbSymptom) testSymptomId = dbSymptom.id;
    });

    it('should return detailed symptom information', async () => {
      if (!testSymptomId) return;
      const result = await service.getSymptomById(testSymptomId, testUser1Id);
      expect(result.symptom_name).toBe('Symptoms Test Detail Symptom 1');
      expect(result.severity).toBe(8);
      expect(result.description).toBe('Detailed test symptom');
    });

    it('should throw NotFoundException for non-existent symptom', async () => {
      await expect(service.getSymptomById(99999999, testUser1Id))
        .rejects.toThrow('Symptom not found or you do not have access to it');
    });

    it('should throw NotFoundException for another user symptom', async () => {
      if (!testSymptomId) return;
      await expect(service.getSymptomById(testSymptomId, testUser2Id))
        .rejects.toThrow('Symptom not found or you do not have access to it');
    });
  });

  describe('updateSymptom', () => {
    it('should successfully update symptom fields', async () => {
      const addDto: AddSymptomDto = {
        symptom_name: `Symptoms Test Update ${Date.now()}`,
        severity: 5,
        onset_date: '2025-09-12',
        status: 'active'
      };
      await service.addSymptom(testUser1Id, addDto);
      
      const dbSymptom = await symptomRepository.findOne({
        where: { user_id: testUser1Id, symptom_name: addDto.symptom_name, soft_deleted_at: IsNull() }
      });
      
      if (dbSymptom) {
        const updateDto: UpdateSymptomDto = {
          severity: 9,
          status: 'resolved'
        };
        const result = await service.updateSymptom(dbSymptom.id, testUser1Id, updateDto);
        expect(result.success).toBe(true);
        expect(result.message).toBe('Symptom updated successfully');
      }
    });

    it('should successfully soft delete symptom', async () => {
      const addDto: AddSymptomDto = {
        symptom_name: `Symptoms Test Delete ${Date.now()}`,
        severity: 6,
        onset_date: '2025-09-17',
        status: 'active'
      };
      await service.addSymptom(testUser1Id, addDto);
      
      const dbSymptom = await symptomRepository.findOne({
        where: { user_id: testUser1Id, symptom_name: addDto.symptom_name, soft_deleted_at: IsNull() }
      });
      
      if (dbSymptom) {
        const result = await service.updateSymptom(dbSymptom.id, testUser1Id, { delete: true });
        expect(result.success).toBe(true);
        expect(result.message).toBe('Symptom deleted successfully');
        
        await expect(service.getSymptomById(dbSymptom.id, testUser1Id))
          .rejects.toThrow('Symptom not found');
      }
    });

    it('should throw NotFoundException for non-existent symptom', async () => {
      await expect(service.updateSymptom(99999999, testUser1Id, { severity: 5 }))
        .rejects.toThrow('Symptom not found or you do not have access to it');
    });

    it('should throw NotFoundException when updating another user symptom', async () => {
      const addDto: AddSymptomDto = {
        symptom_name: `Symptoms Test User1 Only ${Date.now()}`,
        severity: 4,
        onset_date: '2025-09-19',
        status: 'active'
      };
      await service.addSymptom(testUser1Id, addDto);
      
      const dbSymptom = await symptomRepository.findOne({
        where: { user_id: testUser1Id, symptom_name: addDto.symptom_name, soft_deleted_at: IsNull() }
      });
      
      if (dbSymptom) {
        await expect(service.updateSymptom(dbSymptom.id, testUser2Id, { severity: 8 }))
          .rejects.toThrow('Symptom not found or you do not have access to it');
      }
    });
  });
});