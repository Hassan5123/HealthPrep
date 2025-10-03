import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Visit } from './visits.model';
import { Provider } from '../providers/providers.model';
import { ScheduleVisitDto, UpdateVisitDto, VisitListResponseDto, VisitScheduledListResponseDto, VisitDetailResponseDto } from './dto';
import { formatDate } from '../../common/utils/format-date.util';


/**
 * Service handling business logic for visit operations
 */
@Injectable()
export class VisitsService {
  constructor(
    @InjectRepository(Visit)
    private visitsRepository: Repository<Visit>,
    @InjectRepository(Provider)
    private providersRepository: Repository<Provider>,
  ) {}

  

  /**
   * Get all non-deleted visits for a user
   * @param userId ID of the authenticated user
   * @returns Array of visits with provider details
   */
  async getAllVisits(userId: number): Promise<VisitListResponseDto[]> {
    const visits = await this.visitsRepository.find({
      where: {
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
      order: {
        visit_date: 'DESC',
      },
    });

    // For each visit, get provider details
    const visitsWithProviders = await Promise.all(
      visits.map(async (visit) => {
        const provider = await this.providersRepository.findOne({
          where: {
            id: visit.provider_id,
            soft_deleted_at: IsNull(),
          },
        });

        // Skip visit if provider is soft-deleted
        if (!provider) {
          return null;
        }

        return {
          provider_id: provider.id,
          provider_name: provider.provider_name,
          provider_type: provider.provider_type,
          specialty: provider.specialty || null,
          visit_date: formatDate(visit.visit_date)!,
          visit_time: visit.visit_time || null,
          status: visit.status,
        };
      })
    );

    // Filter out visits with deleted providers
    return visitsWithProviders.filter(visit => visit !== null) as VisitListResponseDto[];
  }


  /**
   * Get all upcoming (scheduled) visits for a user
   * @param userId ID of the authenticated user
   * @returns Array of scheduled visits with provider details
   */
  async getUpcomingVisits(userId: number): Promise<VisitScheduledListResponseDto[]> {
    const visits = await this.visitsRepository.find({
      where: {
        user_id: userId,
        status: 'scheduled',
        soft_deleted_at: IsNull(),
      },
      order: {
        visit_date: 'ASC',
      },
    });

    // For each visit, get provider details
    const visitsWithProviders = await Promise.all(
      visits.map(async (visit) => {
        const provider = await this.providersRepository.findOne({
          where: {
            id: visit.provider_id,
            soft_deleted_at: IsNull(),
          },
        });

        // Skip visit if provider is soft-deleted
        if (!provider) {
          return null;
        }

        return {
          provider_id: provider.id,
          provider_name: provider.provider_name,
          provider_type: provider.provider_type,
          specialty: provider.specialty || null,
          visit_date: formatDate(visit.visit_date)!,
          visit_time: visit.visit_time || null,
        };
      })
    );

    // Filter out visits with deleted providers
    return visitsWithProviders.filter(visit => visit !== null) as VisitScheduledListResponseDto[];
  }


  /**
   * Get all completed visits for a user
   * @param userId ID of the authenticated user
   * @returns Array of completed visits with provider details
   */
  async getCompletedVisits(userId: number): Promise<VisitScheduledListResponseDto[]> {
    const visits = await this.visitsRepository.find({
      where: {
        user_id: userId,
        status: 'completed',
        soft_deleted_at: IsNull(),
      },
      order: {
        visit_date: 'DESC',
      },
    });

    // For each visit, get provider details
    const visitsWithProviders = await Promise.all(
      visits.map(async (visit) => {
        const provider = await this.providersRepository.findOne({
          where: {
            id: visit.provider_id,
            soft_deleted_at: IsNull(),
          },
        });

        // Skip visit if provider is soft-deleted
        if (!provider) {
          return null;
        }

        return {
          provider_id: provider.id,
          provider_name: provider.provider_name,
          provider_type: provider.provider_type,
          specialty: provider.specialty || null,
          visit_date: formatDate(visit.visit_date)!,
          visit_time: visit.visit_time || null,
        };
      })
    );

    // Filter out visits with deleted providers
    return visitsWithProviders.filter(visit => visit !== null) as VisitScheduledListResponseDto[];
  }


  /**
   * Get a specific visit by ID
   * @param visitId ID of the visit
   * @param userId ID of the authenticated user
   * @returns Detailed visit information with provider details
   */
  async getVisit(visitId: number, userId: number): Promise<VisitDetailResponseDto> {
    const visit = await this.visitsRepository.findOne({
      where: {
        id: visitId,
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found or you do not have access to it');
    }

    // Get provider details
    const provider = await this.providersRepository.findOne({
      where: {
        id: visit.provider_id,
        soft_deleted_at: IsNull(),
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider for this visit is no longer available');
    }

    return {
      provider_id: provider.id,
      provider_name: provider.provider_name,
      provider_type: provider.provider_type,
      specialty: provider.specialty || null,
      phone: provider.phone,
      office_address: provider.office_address || null,
      visit_date: formatDate(visit.visit_date)!,
      visit_time: visit.visit_time || null,
      visit_reason: visit.visit_reason,
      status: visit.status,
    };
  }


  /**
   * Schedule a new visit for a user
   * @param userId ID of the authenticated user
   * @param scheduleVisitDto DTO with visit details
   * @returns Success message
   */
  async scheduleVisit(userId: number, scheduleVisitDto: ScheduleVisitDto): Promise<{ success: boolean; message: string }> {
    // Verify provider exists and belongs to the user
    const provider = await this.providersRepository.findOne({
      where: {
        id: scheduleVisitDto.provider_id,
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found or you do not have access to it');
    }

    // Create new visit
    const visit = this.visitsRepository.create({
      user_id: userId,
      provider_id: scheduleVisitDto.provider_id,
      visit_date: scheduleVisitDto.visit_date,
      visit_time: scheduleVisitDto.visit_time,
      visit_reason: scheduleVisitDto.visit_reason,
      status: 'scheduled',
    } as any);

    await this.visitsRepository.save(visit);

    return {
      success: true,
      message: 'Visit scheduled successfully',
    };
  }


  /**
   * Update an existing visit
   * @param visitId ID of the visit to update
   * @param userId ID of the authenticated user
   * @param updateVisitDto DTO with updated fields
   * @returns Success message
   */
  async updateVisit(
    visitId: number,
    userId: number,
    updateVisitDto: UpdateVisitDto,
  ): Promise<{ success: boolean; message: string }> {
    const visit = await this.visitsRepository.findOne({
      where: {
        id: visitId,
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found or you do not have access to it');
    }

    // Validate status change: cannot change from completed to scheduled
    if (updateVisitDto.status && visit.status === 'completed' && updateVisitDto.status === 'scheduled') {
      throw new BadRequestException('Cannot change a completed visit back to scheduled');
    }

    // Update fields if provided
    if (updateVisitDto.visit_date !== undefined) {
      visit.visit_date = new Date(updateVisitDto.visit_date);
    }
    if (updateVisitDto.visit_time !== undefined) {
      visit.visit_time = updateVisitDto.visit_time;
    }
    if (updateVisitDto.visit_reason !== undefined) {
      visit.visit_reason = updateVisitDto.visit_reason;
    }
    if (updateVisitDto.status !== undefined) {
      visit.status = updateVisitDto.status;
    }

    await this.visitsRepository.save(visit);

    return {
      success: true,
      message: 'Visit updated successfully',
    };
  }


  /**
   * Soft delete a visit
   * @param visitId ID of the visit to delete
   * @param userId ID of the authenticated user
   * @returns Success message
   */
  async removeVisit(visitId: number, userId: number): Promise<{ success: boolean; message: string }> {
    const visit = await this.visitsRepository.findOne({
      where: {
        id: visitId,
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found or you do not have access to it');
    }

    // Soft delete by setting soft_deleted_at timestamp
    visit.soft_deleted_at = new Date();
    await this.visitsRepository.save(visit);

    return {
      success: true,
      message: 'Visit removed successfully',
    };
  }
}