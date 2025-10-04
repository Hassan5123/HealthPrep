import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../../app.module';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../users/users.model';
import { Provider } from '../../providers/providers.model';
import { Visit } from '../../visits/visits.model';
import { Symptom } from '../../symptoms/symptoms.model';
import { Medication } from '../../medications/medications.model';

/**
 * End-to-end test script for AI visit question generation
 * 
 * This script:
 * 1. Creates test data (user, provider, visit, symptoms, medications)
 * 2. Logs in to get JWT token
 * 3. Calls the AI endpoint to generate questions
 * 4. Displays the results
 * 5. Cleans up all test data
 */

interface TestData {
  userId: number;
  providerId: number;
  visitId: number;
  symptomIds: number[];
  medicationIds: number[];
}

async function runTest() {
  console.log('='.repeat(80));
  console.log('AI VISIT QUESTION GENERATION - END-TO-END TEST');
  console.log('='.repeat(80));
  console.log();

  let app: INestApplication | undefined;
  let testData: TestData | null = null;

  try {
    // Bootstrap NestJS application
    console.log('🚀 Starting application...\n');
    app = await NestFactory.create(AppModule);
    await app.init();
    await app.listen(5001);

    const baseUrl = 'http://localhost:5001';

    // Get database connection and repositories
    const dataSource = app.get(DataSource);
    const userRepo = dataSource.getRepository(User);
    const providerRepo = dataSource.getRepository(Provider);
    const visitRepo = dataSource.getRepository(Visit);
    const symptomRepo = dataSource.getRepository(Symptom);
    const medicationRepo = dataSource.getRepository(Medication);

    console.log('📝 STEP 1: Creating test data...\n');

    // 1. Create test user
    const passwordHash = await bcrypt.hash('TestPassword123!', 10);
    const user = await userRepo.save({
      email: `ai-test-${Date.now()}@example.com`,
      password_hash: passwordHash,
      first_name: 'AI',
      last_name: 'TestUser',
      date_of_birth: '1990-05-15',
      phone: '+1234567890',
    } as any);

    console.log(`✅ Created user: ${user.email} (ID: ${user.id})`);

    // 2. Create test provider
    const provider = await providerRepo.save({
      user_id: user.id,
      provider_name: 'Dr. Sarah Johnson',
      provider_type: 'personal_doctor',
      specialty: 'Cardiology',
      phone: '+1987654321',
      office_address: '123 Medical Center Drive, Health City, HC 12345',
    } as any);

    console.log(`✅ Created provider: ${provider.provider_name} (ID: ${provider.id})`);

    // 3. Create scheduled visit
    const visit = await visitRepo.save({
      user_id: user.id,
      provider_id: provider.id,
      visit_date: '2025-06-15',
      visit_time: '10:30:00',
      visit_reason: 'Follow-up appointment for chest pain and irregular heartbeat. Need to discuss recent test results and medication effectiveness.',
      status: 'scheduled',
    } as any);

    console.log(`✅ Created visit: ${visit.visit_date} at ${visit.visit_time} (ID: ${visit.id})`);

    // 4. Create 2 symptoms
    const symptom1 = await symptomRepo.save({
      user_id: user.id,
      symptom_name: 'Chest Pain',
      severity: 7,
      onset_date: '2025-01-10',
      status: 'active',
      description: 'Sharp pain in center of chest, especially during physical activity. Comes and goes throughout the day.',
      triggers: 'Exercise, stress, heavy meals',
      location_on_body: 'Center chest',
    } as any);

    const symptom2 = await symptomRepo.save({
      user_id: user.id,
      symptom_name: 'Irregular Heartbeat',
      severity: 6,
      onset_date: '2025-01-15',
      status: 'active',
      description: 'Heart feels like it is skipping beats or racing. Episodes last 5-10 minutes.',
      triggers: 'Caffeine, anxiety, lying down',
      location_on_body: 'Chest',
    } as any);

    console.log(`✅ Created symptoms: ${symptom1.symptom_name}, ${symptom2.symptom_name}`);

    // 5. Create 2 medications
    const medication1 = await medicationRepo.save({
      user_id: user.id,
      provider_id: provider.id,
      medication_name: 'Metoprolol',
      dosage: '50mg',
      frequency: 'Twice daily',
      prescribed_date: '2025-01-20',
      conditions_or_symptoms: 'High blood pressure and irregular heartbeat',
      status: 'taking',
      instructions: 'Take with food. Do not stop suddenly without consulting doctor.',
    } as any);

    const medication2 = await medicationRepo.save({
      user_id: user.id,
      provider_id: provider.id,
      medication_name: 'Aspirin',
      dosage: '81mg',
      frequency: 'Once daily',
      prescribed_date: '2025-01-20',
      conditions_or_symptoms: 'Heart health and blood clot prevention',
      status: 'taking',
      instructions: 'Take in the morning with water.',
    } as any);

    console.log(`✅ Created medications: ${medication1.medication_name}, ${medication2.medication_name}\n`);

    testData = {
      userId: user.id,
      providerId: provider.id,
      visitId: visit.id,
      symptomIds: [symptom1.id, symptom2.id],
      medicationIds: [medication1.id, medication2.id],
    };

    // 6. Login to get JWT token
    console.log('🔐 STEP 2: Logging in to get JWT token...\n');

    const loginResponse = await fetch(`${baseUrl}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        password: 'TestPassword123!',
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${await loginResponse.text()}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    if (!token) {
      throw new Error(`No token in login response: ${JSON.stringify(loginData)}`);
    }

    console.log(`✅ Logged in successfully\n`);

    // 7. Call AI endpoint
    console.log('🤖 STEP 3: Calling AI endpoint to generate questions...\n');
    console.log(`   Endpoint: POST ${baseUrl}/anthropic/generate-visit-questions/${visit.id}`);
    console.log(`   Auth: Bearer ${token.substring(0, 20)}...`);
    console.log();

    const aiResponse = await fetch(
      `${baseUrl}/anthropic/generate-visit-questions/${visit.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI endpoint failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();

    // 8. Display results
    console.log('📊 CONTEXT SENT TO AI:');
    console.log('='.repeat(80));
    console.log(`Visit Date: ${visit.visit_date} at ${visit.visit_time}`);
    console.log(`Visit Reason: ${visit.visit_reason}`);
    console.log(`Provider: ${provider.provider_name} (${provider.provider_type} - ${provider.specialty})`);
    console.log();
    console.log('Symptoms:');
    console.log(`  1. ${symptom1.symptom_name} (Severity ${symptom1.severity}/10)`);
    console.log(`     - ${symptom1.description}`);
    console.log(`     - Triggers: ${symptom1.triggers}`);
    console.log(`  2. ${symptom2.symptom_name} (Severity ${symptom2.severity}/10)`);
    console.log(`     - ${symptom2.description}`);
    console.log(`     - Triggers: ${symptom2.triggers}`);
    console.log();
    console.log('Medications:');
    console.log(`  1. ${medication1.medication_name} ${medication1.dosage} - ${medication1.frequency}`);
    console.log(`     - For: ${medication1.conditions_or_symptoms}`);
    console.log(`  2. ${medication2.medication_name} ${medication2.dosage} - ${medication2.frequency}`);
    console.log(`     - For: ${medication2.conditions_or_symptoms}`);
    console.log();

    console.log('💡 AI-GENERATED QUESTIONS:');
    console.log('='.repeat(80));
    aiData.questions.forEach((question: string, index: number) => {
      console.log(`${index + 1}. ${question}`);
    });
    console.log();

    console.log('📈 METADATA:');
    console.log('='.repeat(80));
    console.log(`✅ Generated ${aiData.metadata.questionsGenerated} questions`);
    console.log(`📝 Based on ${aiData.metadata.dataIncluded.symptoms} symptoms`);
    console.log(`💊 Based on ${aiData.metadata.dataIncluded.medications} medications`);
    console.log(`👨‍⚕️ Provider included: ${aiData.metadata.dataIncluded.hasProvider ? 'Yes' : 'No'}`);
    console.log();

    console.log('✅ TEST COMPLETED SUCCESSFULLY!\n');
  } catch (error) {
    console.error('❌ TEST FAILED:');
    console.error(error.message);
    console.error();
    if (error.stack) {
      console.error('Stack trace:');
      console.error(error.stack);
    }
  } finally {
    // Cleanup
    if (testData && app) {
      console.log('🧹 STEP 4: Cleaning up test data...\n');
      try {
        const dataSource = app.get(DataSource);
        const visitRepo = dataSource.getRepository(Visit);
        const symptomRepo = dataSource.getRepository(Symptom);
        const medicationRepo = dataSource.getRepository(Medication);
        const providerRepo = dataSource.getRepository(Provider);
        const userRepo = dataSource.getRepository(User);
        
        // Delete in correct order to respect foreign key constraints
        // Visit has ON DELETE RESTRICT for provider, so delete it first
        await visitRepo.delete({ id: testData.visitId });
        await symptomRepo.delete(testData.symptomIds);
        await medicationRepo.delete(testData.medicationIds);
        await providerRepo.delete({ id: testData.providerId });
        // Finally delete user (cascades to any remaining data)
        await userRepo.delete({ id: testData.userId });
        
        console.log('✅ Test data cleaned up successfully\n');
      } catch (cleanupError) {
        console.error('⚠️  Cleanup warning:', cleanupError.message);
      }
    }

    if (app) {
      await app.close();
      console.log('👋 Application closed');
    }
  }
}

runTest();