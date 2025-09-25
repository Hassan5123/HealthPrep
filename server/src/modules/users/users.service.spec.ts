import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { INestApplication, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as path from 'path';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './users.model';
// Import necessary models to fix entity metadata errors
import { Symptom } from '../symptoms/symptoms.model';
import { Visit } from '../visits/visits.model';
import { Medication } from '../medications/medications.model';
import { Provider } from '../providers/providers.model';
import { VisitSummary } from '../visit_summaries/visit-summaries.model';
import { VisitPrep } from '../visit_prep/visit-prep.model';
import { RegisterDto, LoginDto } from './dto';

/**
 * Integration test for UsersService
 * These tests use a real database connection
 */
// Longer timeout for integration tests - 30 seconds
jest.setTimeout(30000);

describe('UsersService Integration Tests', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  // This will run before all tests - sets up the test environment
  beforeAll(async () => {
    // Create a testing module with real dependencies
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // Load environment variables
        ConfigModule.forRoot({
          isGlobal: true, 
          envFilePath: path.resolve(process.cwd(), '.env')
        }),
        
        // Use TypeORM with real database connection
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
            // Include all required entities to avoid metadata errors
            entities: [User, Symptom, Visit, Medication, Provider, VisitSummary, VisitPrep],
            synchronize: false,
            dropSchema: false,
          }),
        }),
        
        // Import TypeORM repository for User entity
        TypeOrmModule.forFeature([User]),
        
        // Import JWT module for authentication
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get('JWT_SECRET') || 'testSecret',
            signOptions: { expiresIn: '24h' },
          }),
        }),
      ],
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    // Create the NestJS application
    app = moduleFixture.createNestApplication();
    await app.init();

    try {
      // Get service instances
      usersService = moduleFixture.get<UsersService>(UsersService);
      userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
      jwtService = moduleFixture.get<JwtService>(JwtService);

      console.log('Test setup successful. Database connection established.');
    } catch (error) {
      console.error('Error during test setup:', error);
      throw error;
    }
  });
  
  // This will run after all tests
  afterAll(async () => {
    
    if (app) {
      await app.close();
      console.log('Test app closed successfully.');
    }
  });
  
  // Helper function to create a test user directly in the database
  async function createTestUser(email: string, options: { 
    softDeleted?: boolean,
    firstName?: string, 
    lastName?: string,
    dateOfBirth?: Date
  } = {}) {
    const {
      softDeleted = false,
      firstName = 'Test',
      lastName = 'User',
      dateOfBirth = new Date('1990-01-01')
    } = options;

    const salt = await bcrypt.genSalt();
    const user = userRepository.create({
      email,
      password_hash: await bcrypt.hash('Password123!', salt),
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      soft_deleted_at: softDeleted ? new Date() : null,
    });
    
    return await userRepository.save(user);
  }

  /**
   * REGISTRATION TESTS
   */
  describe('Registration Tests', () => {
    it('1. should successfully register a new user with all fields', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        email: 'test1@example.com',
        password: 'SecurePassword123!',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-01-01',
        phone: '123-456-7890',
        existing_conditions: 'None',
      };

      // Act
      const result = await usersService.register(registerDto);
      console.log('Full registration result:', result);

      // Assert
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.first_name).toBe(registerDto.first_name);
      expect(result.user.last_name).toBe(registerDto.last_name);
      expect(result.user.phone).toBe(registerDto.phone);
      expect(result.user.existing_conditions).toBe(registerDto.existing_conditions);
      
      // Verify the token is valid
      const decodedToken = jwtService.verify(result.token);
      expect(decodedToken).toBeDefined();
      expect(decodedToken.email).toBe(registerDto.email);
      expect(decodedToken.sub).toBeDefined();
    });

    it('2. should successfully register a user with only required fields', async () => {
      // Arrange - only required fields provided
      const registerDto: RegisterDto = {
        email: 'minimal@example.com',
        password: 'SecurePassword123!',
        first_name: 'Minimal',
        last_name: 'User',
        date_of_birth: '1995-05-05',
        // No phone or existing_conditions
      };

      // Act
      const result = await usersService.register(registerDto);
      console.log('Minimal registration result:', result);

      // Assert
      expect(result).toBeDefined();
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.phone).toBeNull();
      expect(result.user.existing_conditions).toBeNull();
      expect(result.token).toBeDefined();
    });

    it('3. should throw ConflictException when registering with an existing email', async () => {
      // Arrange - Create a user first
      await createTestUser('existing@example.com');
      
      const registerDto: RegisterDto = {
        email: 'existing@example.com', // Using an email that already exists
        password: 'SecurePassword123!',
        first_name: 'Duplicate',
        last_name: 'User',
        date_of_birth: '1990-01-01',
      };

      // Act & Assert
      await expect(usersService.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(usersService.register(registerDto)).rejects.toThrow('User with this email already exists');
    });
    
    it('4. should create a valid JWT token that contains user information', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        email: 'jwt_test@example.com',
        password: 'SecurePassword123!',
        first_name: 'JWT',
        last_name: 'Tester',
        date_of_birth: '1992-03-15',
      };

      // Act
      const result = await usersService.register(registerDto);

      // Assert
      expect(result.token).toBeDefined();
      
      // Decode and verify token
      const decodedToken = jwtService.verify(result.token);
      expect(decodedToken.email).toBe(registerDto.email);
      expect(typeof decodedToken.sub).toBe('number'); // User ID should be included
      expect(decodedToken.iat).toBeDefined(); // Issued at timestamp
      expect(decodedToken.exp).toBeDefined(); // Expiration timestamp
      
      // Verify the token expiration is ~24 hours from now
      const now = Math.floor(Date.now() / 1000);
      expect(decodedToken.exp - now).toBeGreaterThan(86300); // ~24 hours in seconds - small margin
    });

    it('5. should hash the password securely, not storing plaintext', async () => {
      // Arrange
      const plainPassword = 'VerySecurePassword456!';
      const registerDto: RegisterDto = {
        email: 'password_test@example.com',
        password: plainPassword,
        first_name: 'Password',
        last_name: 'Tester',
        date_of_birth: '1985-07-20',
      };

      // Act
      const result = await usersService.register(registerDto);
      
      // Get the user directly from the database to check the stored password
      const savedUser = await userRepository.findOne({ 
        where: { email: registerDto.email }
      });

      // Assert
      expect(savedUser).toBeDefined();
      expect(savedUser?.password_hash).not.toBe(plainPassword);
      expect(savedUser?.password_hash.length).toBeGreaterThan(20); // Bcrypt hash is longer
      
      // Verify that the hash is valid by comparing with bcrypt
      const isPasswordValid = await bcrypt.compare(plainPassword, savedUser?.password_hash || '');
      expect(isPasswordValid).toBe(true);
    });
  });

  /**
   * LOGIN TESTS
   */
  describe('Login Tests', () => {
    // Set up the test users before all login tests
    beforeAll(async () => {
      // Create test users for login tests
      console.log('Setting up test users for login tests');
      await createTestUser('test@example.com');
      await createTestUser('softdeleted@example.com', { softDeleted: true });
    });

    it('1. should successfully login an existing user', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!', // This matches what we set in createTestUser
      };

      // Act
      const result = await usersService.login(loginDto);
      console.log('Login result:', result);

      // Assert
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(loginDto.email);
      expect(result.user.first_name).toBe('Test'); // From createTestUser default
      expect(result.user.last_name).toBe('User');  // From createTestUser default
    });

    it('2. should throw UnauthorizedException when login with wrong password', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      // Act & Assert
      await expect(usersService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(usersService.login(loginDto)).rejects.toThrow('Invalid email or password');
    });

    it('3. should throw UnauthorizedException when login with non-existent email', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      // Act & Assert
      await expect(usersService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(usersService.login(loginDto)).rejects.toThrow('Invalid email or password');
    });

    it('4. should throw UnauthorizedException when login with soft-deleted account', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'softdeleted@example.com',
        password: 'Password123!',
      };

      // Act & Assert
      await expect(usersService.login(loginDto)).rejects.toThrow('This account has been deactivated');
    });
    
    it('5. should return a valid JWT token on successful login', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      // Act
      const result = await usersService.login(loginDto);

      // Assert
      expect(result.token).toBeDefined();
      
      // Verify token contents
      const decodedToken = jwtService.verify(result.token);
      expect(decodedToken.email).toBe(loginDto.email);
      expect(decodedToken.sub).toBeDefined(); // User ID
      
      // Verify expiration
      const now = Math.floor(Date.now() / 1000);
      expect(decodedToken.exp - now).toBeGreaterThan(86300); // ~24 hours in seconds
    });
    
    it('6. should return the correct user data structure on successful login', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      // Act
      const result = await usersService.login(loginDto);

      // Assert - check user properties
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('first_name');
      expect(result.user).toHaveProperty('last_name');
      expect(result.user).toHaveProperty('date_of_birth');
      expect(result.user).toHaveProperty('created_at');
      expect(result.user).toHaveProperty('updated_at');
      
      // Make sure sensitive fields are not included
      expect(result.user).not.toHaveProperty('password_hash');
      expect(result.user).not.toHaveProperty('soft_deleted_at');
    });
    
    it('7. should handle case-sensitive password validation correctly', async () => {
      // First create a new user with a specific password
      await createTestUser('case-test@example.com');
      
      // Try with incorrect password case
      const loginDto: LoginDto = {
        email: 'case-test@example.com',
        password: 'password123!', // Lowercase 'p' instead of 'P'
      };

      // Act & Assert
      await expect(usersService.login(loginDto)).rejects.toThrow('Invalid email or password');
    });
  });
});