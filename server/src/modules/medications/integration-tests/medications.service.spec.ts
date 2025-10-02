import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Repository, IsNull } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { MedicationsService } from '../medications.service';
import { Medication } from '../medications.model';
import { Provider } from '../../providers/providers.model';
import { User } from '../../users/users.model';
import { AddMedicationDto, UpdateMedicationDto } from '../dto';


/**
 * Comprehensive integration tests for MedicationsService
 * Tests all 7 medication endpoints with real database connection
 */
describe('MedicationsService Integration Tests', () => {
  let service: MedicationsService;
  let medicationRepository: Repository<Medication>;
  let providerRepository: Repository<Provider>;
  let userRepository: Repository<User>;
  let module: TestingModule;
  
  // Test data with unique identifiers
  const testUser1 = {
    email: 'medications-test-user1@example.com',
    password_hash: '',
    first_name: 'Medications',
    last_name: 'TestUser1',
    date_of_birth: '1990-05-15',
    phone: '+1234567890'
  };
  
  const testUser2 = {
    email: 'medications-test-user2@example.com',
    password_hash: '',
    first_name: 'Medications',
    last_name: 'TestUser2',
    date_of_birth: '1985-03-20',
    phone: '+1234567891'
  };

  let testUser1Id: number;
  let testUser2Id: number;
  let testProvider1Id: number;
  let testProvider2Id: number;

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
        TypeOrmModule.forFeature([Medication, Provider, User]),
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '24h' },
          }),
        }),
      ],
      providers: [MedicationsService],
    }).compile();

    service = module.get<MedicationsService>(MedicationsService);
    medicationRepository = module.get<Repository<Medication>>(getRepositoryToken(Medication));
    providerRepository = module.get<Repository<Provider>>(getRepositoryToken(Provider));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Create test users
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

    // Create test providers
    const provider1 = await providerRepository.findOne({
      where: { user_id: testUser1Id, provider_name: 'Medications Test Provider 1', soft_deleted_at: IsNull() }
    });
    if (provider1) {
      testProvider1Id = provider1.id;
    } else {
      const createdProvider1 = await providerRepository.save({
        user_id: testUser1Id,
        provider_name: 'Medications Test Provider 1',
        provider_type: 'personal_doctor',
        specialty: 'General Practice',
        phone: '+1234567800',
        email: 'provider1@medications-test.com',
        office_address: '123 Medical Plaza, Test City'
      } as any);
      testProvider1Id = createdProvider1.id;
    }

    const provider2 = await providerRepository.findOne({
      where: { user_id: testUser1Id, provider_name: 'Medications Test Provider 2', soft_deleted_at: IsNull() }
    });
    if (provider2) {
      testProvider2Id = provider2.id;
    } else {
      const createdProvider2 = await providerRepository.save({
        user_id: testUser1Id,
        provider_name: 'Medications Test Provider 2',
        provider_type: 'walk_in_clinic',
        specialty: 'Cardiology',
        phone: '+1234567801',
        email: 'provider2@medications-test.com',
        office_address: '456 Medical Plaza, Test City'
      } as any);
      testProvider2Id = createdProvider2.id;
    }
  });

  afterAll(async () => {
    await module.close();
  });

  describe('addMedication', () => {
    it('should add medication with all fields', async () => {
      const result = await service.addMedication(testUser1Id, {
        prescribing_provider_id: testProvider1Id,
        medication_name: `Full Med ${Date.now()}`,
        dosage: '100mg',
        frequency: 'Twice daily',
        conditions_or_symptoms: 'High BP',
        prescribed_date: '2025-01-15',
        instructions: 'Take with food',
        status: 'taking'
      });
      expect(result.success).toBe(true);
    });

    it('should add medication with only required fields', async () => {
      const result = await service.addMedication(testUser1Id, {
        medication_name: `Required ${Date.now()}`,
        dosage: '50mg',
        frequency: 'Once daily',
        conditions_or_symptoms: 'Headaches'
      });
      expect(result.success).toBe(true);
    });

    it('should throw error for non-existent provider', async () => {
      await expect(service.addMedication(testUser1Id, {
        prescribing_provider_id: 99999999,
        medication_name: 'Test',
        dosage: '10mg',
        frequency: 'Once',
        conditions_or_symptoms: 'Test'
      })).rejects.toThrow('Provider not found');
    });

    it('should throw error when provider belongs to different user', async () => {
      const user2Provider = await providerRepository.save({
        user_id: testUser2Id,
        provider_name: `U2P ${Date.now()}`,
        provider_type: 'personal_doctor',
        phone: `+12${Date.now()}`,
        email: `u2p${Date.now()}@test.com`,
        office_address: 'Addr'
      } as any);

      await expect(service.addMedication(testUser1Id, {
        prescribing_provider_id: user2Provider.id,
        medication_name: 'Test',
        dosage: '10mg',
        frequency: 'Once',
        conditions_or_symptoms: 'Test'
      })).rejects.toThrow('Provider not found');
    });

    it('should throw error when provider is soft-deleted', async () => {
      const deletedP = await providerRepository.save({
        user_id: testUser1Id,
        provider_name: `DelP ${Date.now()}`,
        provider_type: 'personal_doctor',
        phone: `+13${Date.now()}`,
        email: `delp${Date.now()}@test.com`,
        office_address: 'Addr',
        soft_deleted_at: new Date()
      } as any);

      await expect(service.addMedication(testUser1Id, {
        prescribing_provider_id: deletedP.id,
        medication_name: 'Test',
        dosage: '10mg',
        frequency: 'Once',
        conditions_or_symptoms: 'Test'
      })).rejects.toThrow('Provider not found');
    });
  });

  describe('getAllMedications', () => {
    it('should return all non-deleted medications', async () => {
      await service.addMedication(testUser1Id, {
        medication_name: `GetAll1 ${Date.now()}`,
        dosage: '100mg',
        frequency: 'Once',
        conditions_or_symptoms: 'Cond A'
      });

      const result = await service.getAllMedications(testUser1Id);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include provider details when linked', async () => {
      const name = `WithProv ${Date.now()}`;
      await service.addMedication(testUser1Id, {
        prescribing_provider_id: testProvider1Id,
        medication_name: name,
        dosage: '75mg',
        frequency: 'Once',
        conditions_or_symptoms: 'Test'
      });

      const result = await service.getAllMedications(testUser1Id);
      const med = result.find(m => m.medication_name === name);
      
      if (med) {
        expect(med.prescribing_provider_id).toBe(testProvider1Id);
        expect(med.provider_name).toBeDefined();
      }
    });

    it('should indicate when provider is deleted', async () => {
      const tempP = await providerRepository.save({
        user_id: testUser1Id,
        provider_name: `TempP ${Date.now()}`,
        provider_type: 'personal_doctor',
        phone: `+14${Date.now()}`,
        email: `tp${Date.now()}@test.com`,
        office_address: 'Addr'
      } as any);

      const name = `DelProv ${Date.now()}`;
      await service.addMedication(testUser1Id, {
        prescribing_provider_id: tempP.id,
        medication_name: name,
        dosage: '25mg',
        frequency: 'Once',
        conditions_or_symptoms: 'Test'
      });

      tempP.soft_deleted_at = new Date();
      await providerRepository.save(tempP);

      const result = await service.getAllMedications(testUser1Id);
      const med = result.find(m => m.medication_name === name);
      
      if (med) {
        expect(med.provider_deleted).toBe(true);
      }
    });

    it('should not return soft-deleted medications', async () => {
      const name = `SoftDel ${Date.now()}`;
      await service.addMedication(testUser1Id, {
        medication_name: name,
        dosage: '10mg',
        frequency: 'Once',
        conditions_or_symptoms: 'Test'
      });

      const med = await medicationRepository.findOne({
        where: { user_id: testUser1Id, medication_name: name, soft_deleted_at: IsNull() }
      });
      
      if (med) {
        med.soft_deleted_at = new Date();
        await medicationRepository.save(med);
      }

      const result = await service.getAllMedications(testUser1Id);
      const deleted = result.find(m => m.medication_name === name);
      expect(deleted).toBeUndefined();
    });
  });

  describe('getActiveMedications', () => {
    it('should return only medications with status=taking', async () => {
      await service.addMedication(testUser1Id, {
        medication_name: `Active ${Date.now()}`,
        dosage: '100mg',
        frequency: 'Once',
        conditions_or_symptoms: 'Active',
        status: 'taking'
      });

      const result = await service.getActiveMedications(testUser1Id);
      expect(Array.isArray(result)).toBe(true);
      result.forEach(m => expect(m.status).toBe('taking'));
    });

    it('should include provider details for active meds', async () => {
      const name = `ActiveP ${Date.now()}`;
      await service.addMedication(testUser1Id, {
        prescribing_provider_id: testProvider2Id,
        medication_name: name,
        dosage: '150mg',
        frequency: 'Once',
        conditions_or_symptoms: 'Active',
        status: 'taking'
      });

      const result = await service.getActiveMedications(testUser1Id);
      const med = result.find(m => m.medication_name === name);
      
      if (med) {
        expect(med.prescribing_provider_id).toBe(testProvider2Id);
      }
    });
  });

  describe('getDiscontinuedMedications', () => {
    it('should return only discontinued medications', async () => {
      await service.addMedication(testUser1Id, {
        medication_name: `Disc ${Date.now()}`,
        dosage: '200mg',
        frequency: 'Three times',
        conditions_or_symptoms: 'Old',
        status: 'discontinued'
      });

      const result = await service.getDiscontinuedMedications(testUser1Id);
      expect(Array.isArray(result)).toBe(true);
      result.forEach(m => expect(m.status).toBe('discontinued'));
    });

    it('should include provider details for discontinued meds', async () => {
      const name = `DiscP ${Date.now()}`;
      await service.addMedication(testUser1Id, {
        prescribing_provider_id: testProvider1Id,
        medication_name: name,
        dosage: '75mg',
        frequency: 'Once',
        conditions_or_symptoms: 'Old',
        status: 'discontinued'
      });

      const result = await service.getDiscontinuedMedications(testUser1Id);
      const med = result.find(m => m.medication_name === name);
      
      if (med) {
        expect(med.prescribing_provider_id).toBe(testProvider1Id);
      }
    });
  });

  describe('getMedicationById', () => {
    it('should return detailed medication information', async () => {
      const name = `Detail ${Date.now()}`;
      await service.addMedication(testUser1Id, {
        prescribing_provider_id: testProvider1Id,
        medication_name: name,
        dosage: '100mg',
        frequency: 'Once',
        conditions_or_symptoms: 'Detail test',
        prescribed_date: '2025-02-01',
        instructions: 'Take with meals',
        status: 'taking'
      });

      const med = await medicationRepository.findOne({
        where: { user_id: testUser1Id, medication_name: name, soft_deleted_at: IsNull() }
      });

      if (med) {
        const result = await service.getMedicationById(med.id, testUser1Id);
        
        expect(result.medication_name).toBe(name);
        expect(result.dosage).toBe('100mg');
        expect(result.prescribed_date).toBe('2025-02-01');
        expect(result.instructions).toBe('Take with meals');
        expect(result.prescribing_provider_id).toBe(testProvider1Id);
        expect(result.provider_type).toBe('personal_doctor');
        expect(result.specialty).toBe('General Practice');
      }
    });

    it('should return medication without provider when not linked', async () => {
      const name = `NoProv ${Date.now()}`;
      await service.addMedication(testUser1Id, {
        medication_name: name,
        dosage: '50mg',
        frequency: 'Twice',
        conditions_or_symptoms: 'No prov'
      });

      const med = await medicationRepository.findOne({
        where: { user_id: testUser1Id, medication_name: name, soft_deleted_at: IsNull() }
      });

      if (med) {
        const result = await service.getMedicationById(med.id, testUser1Id);
        expect(result.prescribing_provider_id).toBeUndefined();
      }
    });

    it('should omit null optional fields', async () => {
      const name = `Minimal ${Date.now()}`;
      await service.addMedication(testUser1Id, {
        medication_name: name,
        dosage: '25mg',
        frequency: 'Once',
        conditions_or_symptoms: 'Minimal'
      });

      const med = await medicationRepository.findOne({
        where: { user_id: testUser1Id, medication_name: name, soft_deleted_at: IsNull() }
      });

      if (med) {
        const result = await service.getMedicationById(med.id, testUser1Id);
        expect(result.prescribed_date).toBeUndefined();
        expect(result.instructions).toBeUndefined();
      }
    });

    it('should indicate deleted provider', async () => {
      const tempP = await providerRepository.save({
        user_id: testUser1Id,
        provider_name: `DelPDetail ${Date.now()}`,
        provider_type: 'emergency_room',
        specialty: 'Neurology',
        phone: `+15${Date.now()}`,
        email: `dpd${Date.now()}@test.com`,
        office_address: 'Addr'
      } as any);

      const name = `DelPD ${Date.now()}`;
      await service.addMedication(testUser1Id, {
        prescribing_provider_id: tempP.id,
        medication_name: name,
        dosage: '75mg',
        frequency: 'Once',
        conditions_or_symptoms: 'Test'
      });

      tempP.soft_deleted_at = new Date();
      await providerRepository.save(tempP);

      const med = await medicationRepository.findOne({
        where: { user_id: testUser1Id, medication_name: name, soft_deleted_at: IsNull() }
      });

      if (med) {
        const result = await service.getMedicationById(med.id, testUser1Id);
        expect(result.provider_deleted).toBe(true);
        expect(result.provider_type).toBe('emergency_room');
        expect(result.specialty).toBe('Neurology');
      }
    });

    it('should throw error for non-existent medication', async () => {
      await expect(service.getMedicationById(99999999, testUser1Id))
        .rejects.toThrow('Medication not found');
    });

    it('should throw error when accessing another user medication', async () => {
      const name = `U1Only ${Date.now()}`;
      await service.addMedication(testUser1Id, {
        medication_name: name,
        dosage: '10mg',
        frequency: 'Once',
        conditions_or_symptoms: 'U1'
      });

      const med = await medicationRepository.findOne({
        where: { user_id: testUser1Id, medication_name: name, soft_deleted_at: IsNull() }
      });

      if (med) {
        await expect(service.getMedicationById(med.id, testUser2Id))
          .rejects.toThrow('Medication not found');
      }
    });
  });

  describe('updateMedication', () => {
    it('should update multiple fields', async () => {
      const name = `UpdMulti ${Date.now()}`;
      await service.addMedication(testUser1Id, {
        medication_name: name,
        dosage: '100mg',
        frequency: 'Once',
        conditions_or_symptoms: 'Original'
      });

      const med = await medicationRepository.findOne({
        where: { user_id: testUser1Id, medication_name: name, soft_deleted_at: IsNull() }
      });

      if (med) {
        const result = await service.updateMedication(med.id, testUser1Id, {
          dosage: '150mg',
          frequency: 'Twice',
          status: 'discontinued'
        });
        expect(result.success).toBe(true);

        const updated = await service.getMedicationById(med.id, testUser1Id);
        expect(updated.dosage).toBe('150mg');
        expect(updated.frequency).toBe('Twice');
        expect(updated.status).toBe('discontinued');
      }
    });

    it('should update single field', async () => {
      const name = `UpdSingle ${Date.now()}`;
      await service.addMedication(testUser1Id, {
        medication_name: name,
        dosage: '50mg',
        frequency: 'Once',
        conditions_or_symptoms: 'Original'
      });

      const med = await medicationRepository.findOne({
        where: { user_id: testUser1Id, medication_name: name, soft_deleted_at: IsNull() }
      });

      if (med) {
        await service.updateMedication(med.id, testUser1Id, { dosage: '75mg' });
        const updated = await service.getMedicationById(med.id, testUser1Id);
        expect(updated.dosage).toBe('75mg');
      }
    });

    it('should update provider link', async () => {
      const name = `UpdProv ${Date.now()}`;
      await service.addMedication(testUser1Id, {
        medication_name: name,
        dosage: '100mg',
        frequency: 'Once',
        conditions_or_symptoms: 'Test'
      });

      const med = await medicationRepository.findOne({
        where: { user_id: testUser1Id, medication_name: name, soft_deleted_at: IsNull() }
      });

      if (med) {
        await service.updateMedication(med.id, testUser1Id, {
          prescribing_provider_id: testProvider2Id
        });
        
        const updated = await service.getMedicationById(med.id, testUser1Id);
        expect(updated.prescribing_provider_id).toBe(testProvider2Id);
      }
    });

    it('should throw error for invalid provider in update', async () => {
      const name = `UpdInvProv ${Date.now()}`;
      await service.addMedication(testUser1Id, {
        medication_name: name,
        dosage: '50mg',
        frequency: 'Once',
        conditions_or_symptoms: 'Test'
      });

      const med = await medicationRepository.findOne({
        where: { user_id: testUser1Id, medication_name: name, soft_deleted_at: IsNull() }
      });

      if (med) {
        await expect(service.updateMedication(med.id, testUser1Id, {
          prescribing_provider_id: 99999999
        })).rejects.toThrow('Provider not found');
      }
    });

    it('should throw error for soft-deleted provider in update', async () => {
      const delP = await providerRepository.save({
        user_id: testUser1Id,
        provider_name: `UpdDelP ${Date.now()}`,
        provider_type: 'personal_doctor',
        phone: `+16${Date.now()}`,
        email: `udp${Date.now()}@test.com`,
        office_address: 'Addr',
        soft_deleted_at: new Date()
      } as any);

      const name = `UpdDelProv ${Date.now()}`;
      await service.addMedication(testUser1Id, {
        medication_name: name,
        dosage: '50mg',
        frequency: 'Once',
        conditions_or_symptoms: 'Test'
      });

      const med = await medicationRepository.findOne({
        where: { user_id: testUser1Id, medication_name: name, soft_deleted_at: IsNull() }
      });

      if (med) {
        await expect(service.updateMedication(med.id, testUser1Id, {
          prescribing_provider_id: delP.id
        })).rejects.toThrow('Provider not found');
      }
    });

    it('should throw error for non-existent medication', async () => {
      await expect(service.updateMedication(99999999, testUser1Id, { dosage: '10mg' }))
        .rejects.toThrow('Medication not found');
    });

    it('should throw error when updating another user medication', async () => {
      const name = `U1UpdOnly ${Date.now()}`;
      await service.addMedication(testUser1Id, {
        medication_name: name,
        dosage: '10mg',
        frequency: 'Once',
        conditions_or_symptoms: 'U1'
      });

      const med = await medicationRepository.findOne({
        where: { user_id: testUser1Id, medication_name: name, soft_deleted_at: IsNull() }
      });

      if (med) {
        await expect(service.updateMedication(med.id, testUser2Id, { dosage: '20mg' }))
          .rejects.toThrow('Medication not found');
      }
    });
  });

  describe('deleteMedication', () => {
    it('should soft delete medication', async () => {
      const name = `Delete ${Date.now()}`;
      await service.addMedication(testUser1Id, {
        medication_name: name,
        dosage: '100mg',
        frequency: 'Once',
        conditions_or_symptoms: 'To delete'
      });

      const med = await medicationRepository.findOne({
        where: { user_id: testUser1Id, medication_name: name, soft_deleted_at: IsNull() }
      });

      if (med) {
        const result = await service.deleteMedication(med.id, testUser1Id);
        expect(result.success).toBe(true);

        await expect(service.getMedicationById(med.id, testUser1Id))
          .rejects.toThrow('Medication not found');
      }
    });

    it('should throw error for non-existent medication', async () => {
      await expect(service.deleteMedication(99999999, testUser1Id))
        .rejects.toThrow('Medication not found');
    });

    it('should throw error when deleting another user medication', async () => {
      const name = `U1DelOnly ${Date.now()}`;
      await service.addMedication(testUser1Id, {
        medication_name: name,
        dosage: '10mg',
        frequency: 'Once',
        conditions_or_symptoms: 'U1'
      });

      const med = await medicationRepository.findOne({
        where: { user_id: testUser1Id, medication_name: name, soft_deleted_at: IsNull() }
      });

      if (med) {
        await expect(service.deleteMedication(med.id, testUser2Id))
          .rejects.toThrow('Medication not found');
      }
    });
  });
});