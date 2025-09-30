import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { ProvidersService } from '../providers.service';
import { Provider } from '../providers.model';
import { User } from '../../users/users.model';
import { CreateProviderDto, UpdateProviderDto } from '../dto/provider.dto';

/**
 * Comprehensive integration tests for ProvidersService
 * Tests all 5 provider endpoints with real database connection
 */
describe('ProvidersService Integration Tests', () => {
  let service: ProvidersService;
  let providerRepository: Repository<Provider>;
  let userRepository: Repository<User>;
  let module: TestingModule;
  
  // Test data with unique identifiers to prevent conflicts
  const testUser1 = {
    email: 'providers-test-user1@example.com',
    password_hash: '',
    first_name: 'Provider',
    last_name: 'TestUser1',
    date_of_birth: '1990-01-01',
    phone: '+1234567890',
    existing_conditions: 'Test conditions for provider tests'
  };
  
  const testUser2 = {
    email: 'providers-test-user2@example.com',
    password_hash: '',
    first_name: 'Provider',
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
        TypeOrmModule.forFeature([Provider, User]),
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '24h' },
          }),
        }),
      ],
      providers: [ProvidersService],
    }).compile();

    service = module.get<ProvidersService>(ProvidersService);
    providerRepository = module.get<Repository<Provider>>(getRepositoryToken(Provider));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Create test users for provider tests
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
  });

  afterAll(async () => {
    await module.close();
  });

  describe('createProvider', () => {
    it('should successfully create a provider with all required fields', async () => {
      const createProviderDto: CreateProviderDto = {
        provider_name: 'Providers Test Family Doctor 1',
        provider_type: 'personal_doctor',
        phone: '+1-555-0001',
        email: 'providers-test-doctor1@example.com',
        specialty: 'Family Medicine',
        office_address: '123 Provider Test St, Test City, TC 12345',
        notes: 'Test notes for provider creation'
      };

      const result = await service.createProvider(createProviderDto, testUser1Id);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.provider_name).toBe(createProviderDto.provider_name);
      expect(result.provider_type).toBe(createProviderDto.provider_type);
      expect(result.phone).toBe(createProviderDto.phone);
      expect(result.email).toBe(createProviderDto.email);
      expect(result.specialty).toBe(createProviderDto.specialty);
      expect(result.office_address).toBe(createProviderDto.office_address);
      expect(result.notes).toBe(createProviderDto.notes);
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });

    it('should successfully create a provider with only required fields', async () => {
      const createProviderDto: CreateProviderDto = {
        provider_name: 'Providers Test Walk-in Clinic 1',
        provider_type: 'walk_in_clinic',
        phone: '+1-555-0002'
      };

      const result = await service.createProvider(createProviderDto, testUser1Id);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.provider_name).toBe(createProviderDto.provider_name);
      expect(result.provider_type).toBe(createProviderDto.provider_type);
      expect(result.phone).toBe(createProviderDto.phone);
      expect(result.email).toBeNull();
      expect(result.specialty).toBeNull();
      expect(result.office_address).toBeNull();
      expect(result.notes).toBeNull();
    });

    it('should create providers for different provider types', async () => {
      const emergencyRoomDto: CreateProviderDto = {
        provider_name: 'Providers Test Emergency Room 1',
        provider_type: 'emergency_room',
        phone: '+1-555-0003',
        office_address: '456 Emergency Ave, Test City, TC 12345'
      };

      const result = await service.createProvider(emergencyRoomDto, testUser1Id);

      expect(result.provider_type).toBe('emergency_room');
      expect(result.provider_name).toBe(emergencyRoomDto.provider_name);
    });

    it('should associate provider with correct user', async () => {
      const createProviderDto: CreateProviderDto = {
        provider_name: 'Providers Test User2 Doctor 1',
        provider_type: 'personal_doctor',
        phone: '+1-555-0004'
      };

      await service.createProvider(createProviderDto, testUser2Id);

      // Verify provider belongs to user2, not user1
      const user1Providers = await service.getAllProviders(testUser1Id);
      const user2Providers = await service.getAllProviders(testUser2Id);
      
      expect(user1Providers.find(p => p.provider_name === createProviderDto.provider_name)).toBeUndefined();
      expect(user2Providers.find(p => p.provider_name === createProviderDto.provider_name)).toBeDefined();
    });
  });

  describe('getAllProviders', () => {
    it('should return all providers for a user', async () => {
      const result = await service.getAllProviders(testUser1Id);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(3); // Created at least 3 providers for user1
      
      // Verify response format
      result.forEach(provider => {
        expect(provider.id).toBeDefined();
        expect(provider.provider_name).toBeDefined();
        expect(provider.provider_type).toBeDefined();
        expect(['personal_doctor', 'walk_in_clinic', 'emergency_room']).toContain(provider.provider_type);
        // specialty can be null, so just check it exists in response
        expect(provider.hasOwnProperty('specialty')).toBe(true);
      });
    });

    it('should return providers sorted alphabetically by name', async () => {
      const result = await service.getAllProviders(testUser1Id);
      
      if (result.length > 1) {
        for (let i = 1; i < result.length; i++) {
          expect(result[i].provider_name.localeCompare(result[i-1].provider_name)).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('should return only providers belonging to the specific user', async () => {
      const user1Providers = await service.getAllProviders(testUser1Id);
      const user2Providers = await service.getAllProviders(testUser2Id);
      
      // Find a provider name that exists for user2 but not user1
      const user2OnlyProvider = user2Providers.find(p => 
        !user1Providers.some(u1p => u1p.provider_name === p.provider_name)
      );
      
      expect(user2OnlyProvider).toBeDefined();
    });

    it('should return empty array for user with no providers', async () => {
      // Create a new user with no providers
      const newUser = {
        email: 'providers-test-empty-user@example.com',
        password_hash: await bcrypt.hash('password', await bcrypt.genSalt()),
        first_name: 'Empty',
        last_name: 'User',
        date_of_birth: '1995-01-01'
      };
      
      const existingUser = await userRepository.findOne({ where: { email: newUser.email } });
      let newUserId: number;
      
      if (existingUser) {
        newUserId = existingUser.id;
      } else {
        const createdUser = await userRepository.save(newUser);
        newUserId = createdUser.id;
      }
      
      const result = await service.getAllProviders(newUserId);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should not return soft-deleted providers', async () => {
      // Create a provider and then soft delete it
      const createDto: CreateProviderDto = {
        provider_name: 'Providers Test To Delete 1',
        provider_type: 'personal_doctor',
        phone: '+1-555-0005'
      };
      
      const createdProvider = await service.createProvider(createDto, testUser1Id);
      await service.deleteProvider(createdProvider.id.toString(), testUser1Id);
      
      const providers = await service.getAllProviders(testUser1Id);
      const foundDeleted = providers.find(p => p.id === createdProvider.id);
      
      expect(foundDeleted).toBeUndefined();
    });
  });

  describe('getProviderById', () => {
    let testProviderId: number;

    beforeAll(async () => {
      const createDto: CreateProviderDto = {
        provider_name: 'Providers Test Detail Provider 1',
        provider_type: 'personal_doctor',
        phone: '+1-555-0006',
        email: 'providers-test-detail@example.com',
        specialty: 'Internal Medicine',
        office_address: '789 Detail Test Blvd, Test City, TC 12345',
        notes: 'Detailed test provider notes'
      };
      
      const created = await service.createProvider(createDto, testUser1Id);
      testProviderId = created.id;
    });

    it('should return detailed provider information for valid ID and owner', async () => {
      const result = await service.getProviderById(testProviderId.toString(), testUser1Id);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(testProviderId);
      expect(result.provider_name).toBe('Providers Test Detail Provider 1');
      expect(result.provider_type).toBe('personal_doctor');
      expect(result.phone).toBe('+1-555-0006');
      expect(result.email).toBe('providers-test-detail@example.com');
      expect(result.specialty).toBe('Internal Medicine');
      expect(result.office_address).toBe('789 Detail Test Blvd, Test City, TC 12345');
      expect(result.notes).toBe('Detailed test provider notes');
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });

    it('should throw NotFoundException for non-existent provider ID', async () => {
      const nonExistentId = '99999999';
      
      await expect(service.getProviderById(nonExistentId, testUser1Id))
        .rejects.toThrow('Provider not found');
    });

    it('should throw ForbiddenException when user tries to access another user\'s provider', async () => {
      await expect(service.getProviderById(testProviderId.toString(), testUser2Id))
        .rejects.toThrow('Access denied');
    });

    it('should throw NotFoundException for soft-deleted provider', async () => {
      // Create and delete a provider
      const createDto: CreateProviderDto = {
        provider_name: 'Providers Test Deleted Provider 1',
        provider_type: 'walk_in_clinic',
        phone: '+1-555-0007'
      };
      
      const created = await service.createProvider(createDto, testUser1Id);
      await service.deleteProvider(created.id.toString(), testUser1Id);
      
      await expect(service.getProviderById(created.id.toString(), testUser1Id))
        .rejects.toThrow('Provider not found');
    });

    it('should handle invalid provider ID format', async () => {
      const invalidId = 'invalid-id';
      
      await expect(service.getProviderById(invalidId, testUser1Id))
        .rejects.toThrow('Provider not found');
    });
  });

  describe('updateProvider', () => {
    let testProviderId: number;

    beforeAll(async () => {
      const createDto: CreateProviderDto = {
        provider_name: 'Providers Test Update Provider 1',
        provider_type: 'personal_doctor',
        phone: '+1-555-0008',
        email: 'providers-test-update-original@example.com',
        specialty: 'Original Specialty',
        office_address: 'Original Address',
        notes: 'Original notes'
      };
      
      const created = await service.createProvider(createDto, testUser1Id);
      testProviderId = created.id;
    });

    it('should successfully update all editable fields', async () => {
      const updateDto: UpdateProviderDto = {
        provider_name: 'Providers Test Updated Provider Name 1',
        phone: '+1-555-0009',
        email: 'providers-test-update-new@example.com',
        office_address: 'New Updated Address 123',
        notes: 'Updated notes for testing'
      };

      const result = await service.updateProvider(testProviderId.toString(), updateDto, testUser1Id);
      
      expect(result.id).toBe(testProviderId);
      expect(result.provider_name).toBe(updateDto.provider_name);
      expect(result.phone).toBe(updateDto.phone);
      expect(result.email).toBe(updateDto.email);
      expect(result.office_address).toBe(updateDto.office_address);
      expect(result.notes).toBe(updateDto.notes);
      // Provider type and specialty should remain unchanged
      expect(result.provider_type).toBe('personal_doctor');
      expect(result.specialty).toBe('Original Specialty');
      expect(result.updated_at).toBeDefined();
    });

    it('should update provider with optional fields set to undefined/null', async () => {
      const updateDto: UpdateProviderDto = {
        provider_name: 'Providers Test Minimal Update 1',
        phone: '+1-555-0010'
        // email, office_address, notes not provided (undefined)
      };

      const result = await service.updateProvider(testProviderId.toString(), updateDto, testUser1Id);
      
      expect(result.provider_name).toBe(updateDto.provider_name);
      expect(result.phone).toBe(updateDto.phone);
      expect(result.email).toBeNull();
      expect(result.office_address).toBeNull();
      expect(result.notes).toBeNull();
    });

    it('should throw NotFoundException for non-existent provider', async () => {
      const updateDto: UpdateProviderDto = {
        provider_name: 'Should Not Work',
        phone: '+1-555-0011'
      };

      await expect(service.updateProvider('99999999', updateDto, testUser1Id))
        .rejects.toThrow('Provider not found');
    });

    it('should throw ForbiddenException when user tries to update another user\'s provider', async () => {
      const updateDto: UpdateProviderDto = {
        provider_name: 'Should Not Work',
        phone: '+1-555-0012'
      };

      await expect(service.updateProvider(testProviderId.toString(), updateDto, testUser2Id))
        .rejects.toThrow('You can only update your own providers');
    });

    it('should throw NotFoundException for soft-deleted provider', async () => {
      // Create and delete a provider for this test
      const createDto: CreateProviderDto = {
        provider_name: 'Providers Test Update Deleted 1',
        provider_type: 'emergency_room',
        phone: '+1-555-0013'
      };
      
      const created = await service.createProvider(createDto, testUser1Id);
      await service.deleteProvider(created.id.toString(), testUser1Id);
      
      const updateDto: UpdateProviderDto = {
        provider_name: 'Should Not Work',
        phone: '+1-555-0014'
      };

      await expect(service.updateProvider(created.id.toString(), updateDto, testUser1Id))
        .rejects.toThrow('Provider not found');
    });

    it('should handle invalid provider ID format', async () => {
      const updateDto: UpdateProviderDto = {
        provider_name: 'Should Not Work',
        phone: '+1-555-0015'
      };

      await expect(service.updateProvider('invalid-id', updateDto, testUser1Id))
        .rejects.toThrow('Provider not found');
    });
  });

  describe('deleteProvider', () => {
    let testProviderId: number;

    beforeAll(async () => {
      const createDto: CreateProviderDto = {
        provider_name: 'Providers Test Delete Provider 1',
        provider_type: 'walk_in_clinic',
        phone: '+1-555-0016',
        notes: 'Provider to be deleted'
      };
      
      const created = await service.createProvider(createDto, testUser1Id);
      testProviderId = created.id;
    });

    it('should successfully soft delete a provider', async () => {
      const result = await service.deleteProvider(testProviderId.toString(), testUser1Id);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Provider deleted successfully');
      
      // Verify provider is soft deleted (not returned in getAllProviders)
      const providers = await service.getAllProviders(testUser1Id);
      const deletedProvider = providers.find(p => p.id === testProviderId);
      expect(deletedProvider).toBeUndefined();
      
      // Verify provider still exists in database but with soft_deleted_at set
      const dbProvider = await providerRepository.findOne({ 
        where: { id: testProviderId },
        withDeleted: true 
      });
      expect(dbProvider).toBeDefined();
      expect(dbProvider!.soft_deleted_at).toBeDefined();
    });

    it('should throw NotFoundException for non-existent provider', async () => {
      await expect(service.deleteProvider('99999999', testUser1Id))
        .rejects.toThrow('Provider not found');
    });

    it('should throw ForbiddenException when user tries to delete another user\'s provider', async () => {
      // Create a provider for user2 to test unauthorized deletion
      const createDto: CreateProviderDto = {
        provider_name: 'Providers Test User2 Delete Provider 1',
        provider_type: 'personal_doctor',
        phone: '+1-555-0017'
      };
      
      const created = await service.createProvider(createDto, testUser2Id);

      await expect(service.deleteProvider(created.id.toString(), testUser1Id))
        .rejects.toThrow('You can only delete your own providers');
    });

    it('should throw NotFoundException for already soft-deleted provider', async () => {
      // Create a provider, delete it, then try to delete again
      const createDto: CreateProviderDto = {
        provider_name: 'Providers Test Double Delete 1',
        provider_type: 'emergency_room',
        phone: '+1-555-0018'
      };
      
      const created = await service.createProvider(createDto, testUser1Id);
      await service.deleteProvider(created.id.toString(), testUser1Id);
      
      // Try to delete again
      await expect(service.deleteProvider(created.id.toString(), testUser1Id))
        .rejects.toThrow('Provider not found');
    });

    it('should handle invalid provider ID format', async () => {
      await expect(service.deleteProvider('invalid-id', testUser1Id))
        .rejects.toThrow('Provider not found');
    });

    it('should allow deletion and recreation with same name', async () => {
      // Create provider with unique name for this test
      const uniqueName = `Providers Test Recreate Provider ${Date.now()}`;
      const createDto: CreateProviderDto = {
        provider_name: uniqueName,
        provider_type: 'personal_doctor',
        phone: '+1-555-0019'
      };
      
      const created = await service.createProvider(createDto, testUser1Id);
      
      // Delete provider
      await service.deleteProvider(created.id.toString(), testUser1Id);
      
      // Create new provider with same name (should work)
      const recreated = await service.createProvider(createDto, testUser1Id);
      
      expect(recreated.id).not.toBe(created.id);
      expect(recreated.provider_name).toBe(createDto.provider_name);
      
      // Verify both exist in database but only one is active
      const activeProviders = await service.getAllProviders(testUser1Id);
      const activeWithSameName = activeProviders.filter(p => p.provider_name === createDto.provider_name);
      expect(activeWithSameName.length).toBe(1);
      expect(activeWithSameName[0].id).toBe(recreated.id);
    });
  });
});