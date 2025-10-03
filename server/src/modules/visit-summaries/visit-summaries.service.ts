import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { VisitSummary } from './visit-summaries.model';
import { Visit } from '../visits/visits.model';
import { CreateVisitSummaryDto, UpdateVisitSummaryDto, VisitSummaryResponseDto } from './dto';


/**
 * Service handling business logic for visit summary operations
 */
@Injectable()
export class VisitSummariesService {
  constructor(
    @InjectRepository(VisitSummary)
    private visitSummaryRepository: Repository<VisitSummary>,
    @InjectRepository(Visit)
    private visitRepository: Repository<Visit>,
  ) {}


  /**
   * Get visit summary record by visit ID
   * Verifies user owns the visit before returning summary data
   * @param visitId ID of the visit
   * @param userId ID of the authenticated user
   * @returns Visit summary data or null if not found
   */
  async getVisitSummaryByVisitId(visitId: number, userId: number): Promise<VisitSummaryResponseDto | null> {
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

    // Get the visit summary record
    const visitSummary = await this.visitSummaryRepository.findOne({
      where: {
        visit_id: visitId,
        soft_deleted_at: IsNull(),
      },
    });

    // If no summary found, return null
    if (!visitSummary) {
      return null;
    }

    // Build response with only non-null fields
    const response: VisitSummaryResponseDto = {
      visit_summary_notes: visitSummary.visit_summary_notes,
    };

    if (visitSummary.new_diagnosis) {
      response.new_diagnosis = visitSummary.new_diagnosis;
    }
    if (visitSummary.follow_up_instructions) {
      response.follow_up_instructions = visitSummary.follow_up_instructions;
    }
    if (visitSummary.doctor_recommendations) {
      response.doctor_recommendations = visitSummary.doctor_recommendations;
    }
    if (visitSummary.patient_concerns_addressed) {
      response.patient_concerns_addressed = visitSummary.patient_concerns_addressed;
    }
    if (visitSummary.patient_concerns_not_addressed) {
      response.patient_concerns_not_addressed = visitSummary.patient_concerns_not_addressed;
    }

    return response;
  }


  /**
   * Create a new visit summary
   * @param userId ID of the authenticated user
   * @param createVisitSummaryDto Data for creating the visit summary
   * @returns Success message
   */
  async createVisitSummary(userId: number, createVisitSummaryDto: CreateVisitSummaryDto): Promise<{ success: boolean; message: string }> {
    const { visit_id } = createVisitSummaryDto;

    // Verify the visit exists and belongs to the user
    const visit = await this.visitRepository.findOne({
      where: {
        id: visit_id,
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found or you do not have access to it');
    }

    // Visit summary can only be created for completed visits (not scheduled)
    if (visit.status === 'scheduled') {
      throw new BadRequestException('Cannot create visit summary for a scheduled visit. Visit must be completed first.');
    }

    // Check if visit summary already exists for this visit
    const existingSummary = await this.visitSummaryRepository.findOne({
      where: {
        visit_id,
        soft_deleted_at: IsNull(),
      },
    });

    if (existingSummary) {
      throw new BadRequestException('Visit summary already exists for this visit');
    }

    // Create new visit summary record
    const visitSummary = this.visitSummaryRepository.create({
      visit_id: createVisitSummaryDto.visit_id,
      new_diagnosis: createVisitSummaryDto.new_diagnosis || null,
      follow_up_instructions: createVisitSummaryDto.follow_up_instructions || null,
      doctor_recommendations: createVisitSummaryDto.doctor_recommendations || null,
      patient_concerns_addressed: createVisitSummaryDto.patient_concerns_addressed || null,
      patient_concerns_not_addressed: createVisitSummaryDto.patient_concerns_not_addressed || null,
      visit_summary_notes: createVisitSummaryDto.visit_summary_notes,
    } as any);

    await this.visitSummaryRepository.save(visitSummary);

    return {
      success: true,
      message: 'Visit summary created successfully',
    };
  }


  /**
   * Update an existing visit summary
   * @param visitId ID of the visit
   * @param userId ID of the authenticated user
   * @param updateVisitSummaryDto Data for updating the visit summary
   * @returns Success message
   */
  async updateVisitSummary(visitId: number, userId: number, updateVisitSummaryDto: UpdateVisitSummaryDto): Promise<{ success: boolean; message: string }> {
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

    // Visit summary can only be updated for completed visits (not scheduled)
    if (visit.status === 'scheduled') {
      throw new BadRequestException('Cannot update visit summary for a scheduled visit. Visit must be completed first.');
    }

    // Get the visit summary record
    const visitSummary = await this.visitSummaryRepository.findOne({
      where: {
        visit_id: visitId,
        soft_deleted_at: IsNull(),
      },
    });

    if (!visitSummary) {
      throw new NotFoundException('Visit summary not found for this visit');
    }

    // Update fields if provided
    if (updateVisitSummaryDto.new_diagnosis !== undefined) {
      visitSummary.new_diagnosis = updateVisitSummaryDto.new_diagnosis;
    }
    if (updateVisitSummaryDto.follow_up_instructions !== undefined) {
      visitSummary.follow_up_instructions = updateVisitSummaryDto.follow_up_instructions;
    }
    if (updateVisitSummaryDto.doctor_recommendations !== undefined) {
      visitSummary.doctor_recommendations = updateVisitSummaryDto.doctor_recommendations;
    }
    if (updateVisitSummaryDto.patient_concerns_addressed !== undefined) {
      visitSummary.patient_concerns_addressed = updateVisitSummaryDto.patient_concerns_addressed;
    }
    if (updateVisitSummaryDto.patient_concerns_not_addressed !== undefined) {
      visitSummary.patient_concerns_not_addressed = updateVisitSummaryDto.patient_concerns_not_addressed;
    }
    if (updateVisitSummaryDto.visit_summary_notes !== undefined) {
      visitSummary.visit_summary_notes = updateVisitSummaryDto.visit_summary_notes;
    }

    await this.visitSummaryRepository.save(visitSummary);

    return {
      success: true,
      message: 'Visit summary updated successfully',
    };
  }


  /**
   * Soft delete a visit summary
   * @param visitId ID of the visit
   * @param userId ID of the authenticated user
   * @returns Success message
   */
  async deleteVisitSummary(visitId: number, userId: number): Promise<{ success: boolean; message: string }> {
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

    // Get the visit summary record
    const visitSummary = await this.visitSummaryRepository.findOne({
      where: {
        visit_id: visitId,
        soft_deleted_at: IsNull(),
      },
    });

    if (!visitSummary) {
      throw new NotFoundException('Visit summary not found for this visit');
    }

    // Soft delete by setting soft_deleted_at timestamp
    visitSummary.soft_deleted_at = new Date();
    await this.visitSummaryRepository.save(visitSummary);

    return {
      success: true,
      message: 'Visit summary deleted successfully',
    };
  }
}