import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Symptom } from './symptoms.model';
import { AddSymptomDto, UpdateSymptomDto, SymptomListResponseDto, SymptomDetailResponseDto } from './dto';
import { formatDate } from '../../common/utils/format-date.util';


/**
 * Service handling business logic for symptom operations
 */
@Injectable()
export class SymptomsService {
  constructor(
    @InjectRepository(Symptom)
    private symptomsRepository: Repository<Symptom>,
  ) {}


  /**
   * Get all non-deleted symptoms for a user
   * @param userId ID of the authenticated user
   * @returns Array of symptoms with limited fields
   */
  async getAllSymptoms(userId: number): Promise<SymptomListResponseDto[]> {
    // Query symptoms where user_id matches and soft_deleted_at is NULL
    const symptoms = await this.symptomsRepository.find({
      where: {
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
      select: ['symptom_name', 'severity', 'onset_date', 'end_date', 'location_on_body', 'status'],
      order: {
        onset_date: 'DESC', // Most recent symptoms first
      },
    });

    return symptoms.map(symptom => ({
      symptom_name: symptom.symptom_name,
      severity: symptom.severity,
      onset_date: formatDate(symptom.onset_date)!,
      end_date: formatDate(symptom.end_date),
      location_on_body: symptom.location_on_body || null,
      status: symptom.status,
    }));
  }


  /**
   * Get all active symptoms for a user
   * @param userId ID of the authenticated user
   * @returns Array of active symptoms with limited fields
   */
  async getActiveSymptoms(userId: number): Promise<SymptomListResponseDto[]> {
    const symptoms = await this.symptomsRepository.find({
      where: {
        user_id: userId,
        status: 'active',
        soft_deleted_at: IsNull(),
      },
      select: ['symptom_name', 'severity', 'onset_date', 'end_date', 'location_on_body'],
      order: {
        onset_date: 'DESC',
      },
    });

    return symptoms.map(symptom => ({
      symptom_name: symptom.symptom_name,
      severity: symptom.severity,
      onset_date: formatDate(symptom.onset_date)!,
      end_date: formatDate(symptom.end_date),
      location_on_body: symptom.location_on_body || null,
    }));
  }


  /**
   * Get all resolved symptoms for a user
   * @param userId ID of the authenticated user
   * @returns Array of resolved symptoms with limited fields
   */
  async getResolvedSymptoms(userId: number): Promise<SymptomListResponseDto[]> {
    const symptoms = await this.symptomsRepository.find({
      where: {
        user_id: userId,
        status: 'resolved',
        soft_deleted_at: IsNull(),
      },
      select: ['symptom_name', 'severity', 'onset_date', 'end_date', 'location_on_body'],
      order: {
        onset_date: 'DESC',
      },
    });

    return symptoms.map(symptom => ({
      symptom_name: symptom.symptom_name,
      severity: symptom.severity,
      onset_date: formatDate(symptom.onset_date)!,
      end_date: formatDate(symptom.end_date),
      location_on_body: symptom.location_on_body || null,
    }));
  }


  /**
   * Get a specific symptom by ID
   * @param symptomId ID of the symptom
   * @param userId ID of the authenticated user
   * @returns Detailed symptom information
   */
  async getSymptomById(symptomId: number, userId: number): Promise<SymptomDetailResponseDto> {
    // Find symptom by ID, ensuring it belongs to the user and is not deleted
    const symptom = await this.symptomsRepository.findOne({
      where: {
        id: symptomId,
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
      select: [
        'symptom_name',
        'severity',
        'onset_date',
        'description',
        'end_date',
        'location_on_body',
        'triggers',
        'related_condition',
        'related_medications',
        'medications_taken',
        'status',
      ],
    });

    if (!symptom) {
      throw new NotFoundException('Symptom not found or you do not have access to it');
    }

    return {
      symptom_name: symptom.symptom_name,
      severity: symptom.severity,
      onset_date: formatDate(symptom.onset_date)!,
      description: symptom.description || null,
      end_date: formatDate(symptom.end_date),
      location_on_body: symptom.location_on_body || null,
      triggers: symptom.triggers || null,
      related_condition: symptom.related_condition || null,
      related_medications: symptom.related_medications || null,
      medications_taken: symptom.medications_taken || null,
      status: symptom.status,
    };
  }


  /**
   * Add a new symptom for a user
   * @param userId ID of the authenticated user
   * @param addSymptomDto Symptom data
   * @returns Success message
   */
  async addSymptom(userId: number, addSymptomDto: AddSymptomDto): Promise<{ success: boolean; message: string }> {
    // Create new symptom record
    // Using 'as any' to bypass TypeScript inference issue with user_id field
    const newSymptom = this.symptomsRepository.create({
      user_id: userId,
      symptom_name: addSymptomDto.symptom_name,
      severity: addSymptomDto.severity,
      onset_date: new Date(addSymptomDto.onset_date),
      description: addSymptomDto.description || null,
      end_date: addSymptomDto.end_date ? new Date(addSymptomDto.end_date) : null,
      location_on_body: addSymptomDto.location_on_body || null,
      triggers: addSymptomDto.triggers || null,
      related_condition: addSymptomDto.related_condition || null,
      related_medications: addSymptomDto.related_medications || null,
      medications_taken: addSymptomDto.medications_taken || null,
      status: addSymptomDto.status,
    } as any);

    // Save to database
    await this.symptomsRepository.save(newSymptom);

    return {
      success: true,
      message: 'Symptom added successfully',
    };
  }


  /**
   * Update an existing symptom
   * @param symptomId ID of the symptom to update
   * @param userId ID of the authenticated user
   * @param updateSymptomDto Update data
   * @returns Success message
   */
  async updateSymptom(
    symptomId: number,
    userId: number,
    updateSymptomDto: UpdateSymptomDto,
  ): Promise<{ success: boolean; message: string }> {
    const symptom = await this.symptomsRepository.findOne({
      where: {
        id: symptomId,
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
    });

    if (!symptom) {
      throw new NotFoundException('Symptom not found or you do not have access to it');
    }

    // Update fields if provided
    if (updateSymptomDto.symptom_name !== undefined) {
      symptom.symptom_name = updateSymptomDto.symptom_name;
    }
    if (updateSymptomDto.severity !== undefined) {
      symptom.severity = updateSymptomDto.severity;
    }
    if (updateSymptomDto.onset_date !== undefined) {
      symptom.onset_date = new Date(updateSymptomDto.onset_date);
    }
    if (updateSymptomDto.description !== undefined) {
      symptom.description = updateSymptomDto.description;
    }
    if (updateSymptomDto.end_date !== undefined) {
      symptom.end_date = new Date(updateSymptomDto.end_date);
    }
    if (updateSymptomDto.location_on_body !== undefined) {
      symptom.location_on_body = updateSymptomDto.location_on_body;
    }
    if (updateSymptomDto.triggers !== undefined) {
      symptom.triggers = updateSymptomDto.triggers;
    }
    if (updateSymptomDto.related_condition !== undefined) {
      symptom.related_condition = updateSymptomDto.related_condition;
    }
    if (updateSymptomDto.related_medications !== undefined) {
      symptom.related_medications = updateSymptomDto.related_medications;
    }
    if (updateSymptomDto.medications_taken !== undefined) {
      symptom.medications_taken = updateSymptomDto.medications_taken;
    }
    if (updateSymptomDto.status !== undefined) {
      symptom.status = updateSymptomDto.status;
    }

    // Save updated symptom
    await this.symptomsRepository.save(symptom);

    return {
      success: true,
      message: 'Symptom updated successfully',
    };
  }


  /**
   * Soft delete a symptom
   * @param symptomId ID of the symptom to delete
   * @param userId ID of the authenticated user
   * @returns Success message
   */
  async deleteSymptom(symptomId: number, userId: number): Promise<{ success: boolean; message: string }> {
    const symptom = await this.symptomsRepository.findOne({
      where: {
        id: symptomId,
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
    });

    if (!symptom) {
      throw new NotFoundException('Symptom not found or you do not have access to it');
    }

    // Soft delete by setting soft_deleted_at timestamp
    symptom.soft_deleted_at = new Date();
    await this.symptomsRepository.save(symptom);

    return {
      success: true,
      message: 'Symptom deleted successfully',
    };
  }
}