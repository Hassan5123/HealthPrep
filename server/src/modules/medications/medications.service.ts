import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Medication } from './medications.model';
import { Provider } from '../providers/providers.model';
import { AddMedicationDto, UpdateMedicationDto, MedicationListResponseDto, MedicationDetailResponseDto } from './dto';


/**
 * Service handling business logic for medication operations
 */
@Injectable()
export class MedicationsService {
  constructor(
    @InjectRepository(Medication)
    private medicationsRepository: Repository<Medication>,
    @InjectRepository(Provider)
    private providersRepository: Repository<Provider>,
  ) {}


  /**
   * Helper method to format dates from Date objects to YYYY-MM-DD strings
   */
  private formatDate(date: Date | string): string | null {
    if (!date) return null;
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  }


  /**
   * Helper method to build list response with provider details
   * Handles provider lookup and deletion status
   */
  private async buildListResponse(medication: Medication): Promise<MedicationListResponseDto> {
    const response: MedicationListResponseDto = {
      medication_name: medication.medication_name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      status: medication.status,
    };

    // Add instructions if not null
    if (medication.instructions) {
      response.instructions = medication.instructions;
    }

    // If prescribing_provider_id exists, look up provider details
    if (medication.prescribing_provider_id) {
      const provider = await this.providersRepository.findOne({
        where: { id: medication.prescribing_provider_id },
      });

      // If provider exists and belongs to the user
      if (provider && provider.user_id === medication.user_id) {
        response.prescribing_provider_id = provider.id;
        response.provider_name = provider.provider_name;
        
        // Indicate if provider is deleted
        if (provider.soft_deleted_at !== null) {
          response.provider_deleted = true;
        }
      }
    }

    return response;
  }


  /**
   * Get all non-deleted medications for a user
   * @param userId ID of the authenticated user
   * @returns Array of medications with provider details
   */
  async getAllMedications(userId: number): Promise<MedicationListResponseDto[]> {
    const medications = await this.medicationsRepository.find({
      where: {
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
      order: {
        created_at: 'DESC',
      },
    });

    return Promise.all(medications.map(med => this.buildListResponse(med)));
  }


  /**
   * Get all active (taking) medications for a user
   * @param userId ID of the authenticated user
   * @returns Array of active medications with provider details
   */
  async getActiveMedications(userId: number): Promise<MedicationListResponseDto[]> {
    const medications = await this.medicationsRepository.find({
      where: {
        user_id: userId,
        status: 'taking',
        soft_deleted_at: IsNull(),
      },
      order: {
        created_at: 'DESC',
      },
    });

    return Promise.all(medications.map(med => this.buildListResponse(med)));
  }


  /**
   * Get all discontinued medications for a user
   * @param userId ID of the authenticated user
   * @returns Array of discontinued medications with provider details
   */
  async getDiscontinuedMedications(userId: number): Promise<MedicationListResponseDto[]> {
    const medications = await this.medicationsRepository.find({
      where: {
        user_id: userId,
        status: 'discontinued',
        soft_deleted_at: IsNull(),
      },
      order: {
        created_at: 'DESC',
      },
    });

    return Promise.all(medications.map(med => this.buildListResponse(med)));
  }


  /**
   * Get a specific medication by ID with detailed information
   * @param medicationId ID of the medication
   * @param userId ID of the authenticated user
   * @returns Detailed medication information with provider details
   */
  async getMedicationById(medicationId: number, userId: number): Promise<MedicationDetailResponseDto> {
    const medication = await this.medicationsRepository.findOne({
      where: {
        id: medicationId,
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
    });

    if (!medication) {
      throw new NotFoundException('Medication not found or you do not have access to it');
    }

    const response: MedicationDetailResponseDto = {
      medication_name: medication.medication_name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      conditions_or_symptoms: medication.conditions_or_symptoms,
      status: medication.status,
    };

    // Add prescribed_date if not null
    if (medication.prescribed_date) {
      const formattedDate = this.formatDate(medication.prescribed_date);
      if (formattedDate) {
        response.prescribed_date = formattedDate;
      }
    }

    // Add instructions if not null
    if (medication.instructions) {
      response.instructions = medication.instructions;
    }

    // If prescribing_provider_id exists, look up provider details
    if (medication.prescribing_provider_id) {
      const provider = await this.providersRepository.findOne({
        where: { id: medication.prescribing_provider_id },
      });

      // If provider exists and belongs to the user
      if (provider && provider.user_id === userId) {
        response.prescribing_provider_id = provider.id;
        response.provider_name = provider.provider_name;
        response.provider_type = provider.provider_type;
        
        // Add specialty if not null
        if (provider.specialty) {
          response.specialty = provider.specialty;
        }
        
        // Indicate if provider is deleted
        if (provider.soft_deleted_at !== null) {
          response.provider_deleted = true;
        }
      }
    }

    return response;
  }


  /**
   * Add a new medication
   * @param userId ID of the authenticated user
   * @param addMedicationDto Data for adding the medication
   * @returns Success message
   */
  async addMedication(userId: number, addMedicationDto: AddMedicationDto): Promise<{ success: boolean; message: string }> {
    // If prescribing_provider_id is provided, validate it
    if (addMedicationDto.prescribing_provider_id) {
      const provider = await this.providersRepository.findOne({
        where: {
          id: addMedicationDto.prescribing_provider_id,
          user_id: userId,
          soft_deleted_at: IsNull(),
        },
      });

      if (!provider) {
        throw new NotFoundException('Provider not found or you do not have access to it');
      }
    }

    // Create new medication record
    const medication = this.medicationsRepository.create({
      user_id: userId,
      prescribing_provider_id: addMedicationDto.prescribing_provider_id || null,
      medication_name: addMedicationDto.medication_name,
      dosage: addMedicationDto.dosage,
      frequency: addMedicationDto.frequency,
      conditions_or_symptoms: addMedicationDto.conditions_or_symptoms,
      prescribed_date: addMedicationDto.prescribed_date || null,
      instructions: addMedicationDto.instructions || null,
      status: addMedicationDto.status || 'taking',
    } as any);

    await this.medicationsRepository.save(medication);

    return {
      success: true,
      message: 'Medication added successfully',
    };
  }


  /**
   * Update an existing medication
   * @param medicationId ID of the medication
   * @param userId ID of the authenticated user
   * @param updateMedicationDto Data for updating the medication
   * @returns Success message
   */
  async updateMedication(medicationId: number, userId: number, updateMedicationDto: UpdateMedicationDto): Promise<{ success: boolean; message: string }> {
    // Get the medication
    const medication = await this.medicationsRepository.findOne({
      where: {
        id: medicationId,
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
    });

    if (!medication) {
      throw new NotFoundException('Medication not found or you do not have access to it');
    }

    // If prescribing_provider_id is provided, validate it
    if (updateMedicationDto.prescribing_provider_id !== undefined) {
      if (updateMedicationDto.prescribing_provider_id !== null) {
        const provider = await this.providersRepository.findOne({
          where: {
            id: updateMedicationDto.prescribing_provider_id,
            user_id: userId,
            soft_deleted_at: IsNull(),
          },
        });

        if (!provider) {
          throw new NotFoundException('Provider not found or you do not have access to it');
        }
      }
      medication.prescribing_provider_id = updateMedicationDto.prescribing_provider_id;
    }

    // Update fields if provided
    if (updateMedicationDto.medication_name !== undefined) {
      medication.medication_name = updateMedicationDto.medication_name;
    }
    if (updateMedicationDto.dosage !== undefined) {
      medication.dosage = updateMedicationDto.dosage;
    }
    if (updateMedicationDto.frequency !== undefined) {
      medication.frequency = updateMedicationDto.frequency;
    }
    if (updateMedicationDto.conditions_or_symptoms !== undefined) {
      medication.conditions_or_symptoms = updateMedicationDto.conditions_or_symptoms;
    }
    if (updateMedicationDto.prescribed_date !== undefined) {
      medication.prescribed_date = updateMedicationDto.prescribed_date as any;
    }
    if (updateMedicationDto.instructions !== undefined) {
      medication.instructions = updateMedicationDto.instructions;
    }
    if (updateMedicationDto.status !== undefined) {
      medication.status = updateMedicationDto.status;
    }

    await this.medicationsRepository.save(medication);

    return {
      success: true,
      message: 'Medication updated successfully',
    };
  }


  /**
   * Soft delete a medication
   * @param medicationId ID of the medication
   * @param userId ID of the authenticated user
   * @returns Success message
   */
  async deleteMedication(medicationId: number, userId: number): Promise<{ success: boolean; message: string }> {
    const medication = await this.medicationsRepository.findOne({
      where: {
        id: medicationId,
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
    });

    if (!medication) {
      throw new NotFoundException('Medication not found or you do not have access to it');
    }

    // Soft delete by setting soft_deleted_at timestamp
    medication.soft_deleted_at = new Date();
    await this.medicationsRepository.save(medication);

    return {
      success: true,
      message: 'Medication deleted successfully',
    };
  }
}