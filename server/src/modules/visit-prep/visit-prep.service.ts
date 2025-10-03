import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { VisitPrep } from './visit-prep.model';
import { Visit } from '../visits/visits.model';
import { User } from '../users/users.model';
import { CreateVisitPrepDto, UpdateVisitPrepDto, VisitPrepResponseDto, UserConditionsResponseDto } from './dto';


/**
 * Service handling business logic for visit preparation operations
 */
@Injectable()
export class VisitPrepService {
  constructor(
    @InjectRepository(VisitPrep)
    private visitPrepRepository: Repository<VisitPrep>,
    @InjectRepository(Visit)
    private visitRepository: Repository<Visit>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}


  /**
   * Get visit prep record by visit ID
   * Verifies user owns the visit before returning prep data
   * @param visitId ID of the visit
   * @param userId ID of the authenticated user
   * @returns Visit prep data or null if not found
   */
  async getVisitPrepByVisitId(visitId: number, userId: number): Promise<VisitPrepResponseDto | null> {
    // First verify the visit exists and belongs to the user
    const visit = await this.visitRepository.findOne({
      where: {
        id: visitId,
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found or you do not have access to it');
    }

    // Get the visit prep record
    const visitPrep = await this.visitPrepRepository.findOne({
      where: {
        visit_id: visitId,
        soft_deleted_at: IsNull(),
      },
    });

    // Return null if no prep record exists (frontend will handle this)
    if (!visitPrep) {
      return null;
    }

    // Return only the specified fields
    return {
      questions_to_ask: visitPrep.questions_to_ask || null,
      symptoms_to_discuss: visitPrep.symptoms_to_discuss || null,
      conditions_to_discuss: visitPrep.conditions_to_discuss || null,
      medications_to_discuss: visitPrep.medications_to_discuss || null,
      goals_for_visit: visitPrep.goals_for_visit || null,
      prep_summary_notes: visitPrep.prep_summary_notes,
    };
  }


  /**
   * Get user's existing conditions parsed as an array
   * @param userId ID of the authenticated user
   * @returns Conditions array or indication that none exist
   */
  async getUserConditions(userId: number): Promise<UserConditionsResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has existing conditions
    if (!user.existing_conditions || user.existing_conditions.trim() === '') {
      return {
        has_conditions: false,
      };
    }

    // Parse conditions by splitting on ", " (comma + space)
    const conditionsArray = user.existing_conditions
      .split(',')
      .map(condition => condition.trim())
      .filter(condition => condition.length > 0);

    return {
      has_conditions: true,
      conditions: conditionsArray,
    };
  }


  /**
   * Create a new visit prep record
   * Verifies user owns the visit before creating prep
   * @param userId ID of the authenticated user
   * @param createVisitPrepDto DTO with visit prep details
   * @returns Success message
   */
  async createVisitPrep(
    userId: number,
    createVisitPrepDto: CreateVisitPrepDto,
  ): Promise<{ success: boolean; message: string }> {
    // Verify the visit exists and belongs to the user
    const visit = await this.visitRepository.findOne({
      where: {
        id: createVisitPrepDto.visit_id,
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found or you do not have access to it');
    }

    // Visit prep can only be created for scheduled visits (not completed)
    if (visit.status === 'completed') {
      throw new BadRequestException('Cannot create visit preparation for a completed visit');
    }

    // Check if visit prep already exists for this visit
    const existingPrep = await this.visitPrepRepository.findOne({
      where: {
        visit_id: createVisitPrepDto.visit_id,
        soft_deleted_at: IsNull(),
      },
    });

    if (existingPrep) {
      throw new BadRequestException('Visit preparation already exists for this visit');
    }

    // Create new visit prep record
    const visitPrep = this.visitPrepRepository.create({
      visit_id: createVisitPrepDto.visit_id,
      questions_to_ask: createVisitPrepDto.questions_to_ask,
      symptoms_to_discuss: createVisitPrepDto.symptoms_to_discuss,
      conditions_to_discuss: createVisitPrepDto.conditions_to_discuss,
      medications_to_discuss: createVisitPrepDto.medications_to_discuss,
      goals_for_visit: createVisitPrepDto.goals_for_visit,
      prep_summary_notes: createVisitPrepDto.prep_summary_notes,
    } as any);

    await this.visitPrepRepository.save(visitPrep);

    return {
      success: true,
      message: 'Visit preparation created successfully',
    };
  }


  /**
   * Update an existing visit prep record
   * Verifies user owns the visit before updating prep
   * @param visitId ID of the visit
   * @param userId ID of the authenticated user
   * @param updateVisitPrepDto DTO with updated fields
   * @returns Success message
   */
  async updateVisitPrep(
    visitId: number,
    userId: number,
    updateVisitPrepDto: UpdateVisitPrepDto,
  ): Promise<{ success: boolean; message: string }> {
    // Verify the visit exists and belongs to the user
    const visit = await this.visitRepository.findOne({
      where: {
        id: visitId,
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found or you do not have access to it');
    }

    // Visit prep can only be updated for scheduled visits (not completed)
    if (visit.status === 'completed') {
      throw new BadRequestException('Cannot update visit preparation for a completed visit');
    }

    // Get the visit prep record
    const visitPrep = await this.visitPrepRepository.findOne({
      where: {
        visit_id: visitId,
        soft_deleted_at: IsNull(),
      },
    });

    if (!visitPrep) {
      throw new NotFoundException('Visit preparation not found for this visit');
    }

    // Update fields if provided
    if (updateVisitPrepDto.questions_to_ask !== undefined) {
      visitPrep.questions_to_ask = updateVisitPrepDto.questions_to_ask;
    }
    if (updateVisitPrepDto.symptoms_to_discuss !== undefined) {
      visitPrep.symptoms_to_discuss = updateVisitPrepDto.symptoms_to_discuss;
    }
    if (updateVisitPrepDto.conditions_to_discuss !== undefined) {
      visitPrep.conditions_to_discuss = updateVisitPrepDto.conditions_to_discuss;
    }
    if (updateVisitPrepDto.medications_to_discuss !== undefined) {
      visitPrep.medications_to_discuss = updateVisitPrepDto.medications_to_discuss;
    }
    if (updateVisitPrepDto.goals_for_visit !== undefined) {
      visitPrep.goals_for_visit = updateVisitPrepDto.goals_for_visit;
    }
    if (updateVisitPrepDto.prep_summary_notes !== undefined) {
      visitPrep.prep_summary_notes = updateVisitPrepDto.prep_summary_notes;
    }

    await this.visitPrepRepository.save(visitPrep);

    return {
      success: true,
      message: 'Visit preparation updated successfully',
    };
  }


  /**
   * Soft delete a visit prep record
   * Verifies user owns the visit before deleting prep
   * @param visitId ID of the visit
   * @param userId ID of the authenticated user
   * @returns Success message
   */
  async deleteVisitPrep(visitId: number, userId: number): Promise<{ success: boolean; message: string }> {
    // Verify the visit exists and belongs to the user
    const visit = await this.visitRepository.findOne({
      where: {
        id: visitId,
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found or you do not have access to it');
    }

    // Get the visit prep record
    const visitPrep = await this.visitPrepRepository.findOne({
      where: {
        visit_id: visitId,
        soft_deleted_at: IsNull(),
      },
    });

    if (!visitPrep) {
      throw new NotFoundException('Visit preparation not found for this visit');
    }

    // Soft delete by setting soft_deleted_at timestamp
    visitPrep.soft_deleted_at = new Date();
    await this.visitPrepRepository.save(visitPrep);

    return {
      success: true,
      message: 'Visit preparation deleted successfully',
    };
  }
}