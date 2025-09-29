import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { Provider } from './providers.model';
import { CreateProviderDto, UpdateProviderDto, ProviderSummaryDto, ProviderDetailDto } from './dto/provider.dto';

/**
 * Service handling healthcare provider operations
 */
@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private providersRepository: Repository<Provider>,
  ) {}

  /**
   * Get all providers for a specific user
   * @param userId The ID of the authenticated user
   * @returns List of providers with summary information
   */
  async getAllProviders(userId: number): Promise<ProviderSummaryDto[]> {
    // Find all non-deleted providers belonging to the user
    const providers = await this.providersRepository.find({
      where: {
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
      order: {
        provider_name: 'ASC', // Sort alphabetically by name
      },
    });

    // Return limited fields for the summary view
    return providers.map(provider => ({
      id: provider.id,
      provider_name: provider.provider_name,
      provider_type: provider.provider_type,
      specialty: provider.specialty,
    }));
  }

  /**
   * Get a specific provider by ID
   * @param providerId The ID of the provider to retrieve
   * @param userId The ID of the authenticated user
   * @returns The provider details
   */
  async getProviderById(providerId: string, userId: number): Promise<ProviderDetailDto> {
    // Validate and parse provider ID
    const parsedId = parseInt(providerId);
    if (isNaN(parsedId)) {
      throw new NotFoundException('Provider not found');
    }

    // Find the provider by ID
    const provider = await this.providersRepository.findOne({
      where: {
        id: parsedId,
        soft_deleted_at: IsNull(),
      },
    });

    // Check if provider exists
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Verify the provider belongs to the user
    if (provider.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Return detailed view of the provider
    return {
      id: provider.id,
      provider_name: provider.provider_name,
      provider_type: provider.provider_type,
      specialty: provider.specialty,
      phone: provider.phone,
      email: provider.email,
      office_address: provider.office_address,
      notes: provider.notes,
      created_at: provider.created_at,
      updated_at: provider.updated_at,
    };
  }

  /**
   * Create a new provider for a user
   * @param createProviderDto The provider data to create
   * @param userId The ID of the authenticated user
   * @returns The newly created provider
   */
  async createProvider(createProviderDto: CreateProviderDto, userId: number): Promise<ProviderDetailDto> {
    // Create a new provider entity
    const provider = this.providersRepository.create({
      ...createProviderDto,
      user_id: userId,
    });

    // Save the provider to the database
    const savedProvider = await this.providersRepository.save(provider);

    // Return the created provider with detailed view
    return {
      id: savedProvider.id,
      provider_name: savedProvider.provider_name,
      provider_type: savedProvider.provider_type,
      specialty: savedProvider.specialty,
      phone: savedProvider.phone,
      email: savedProvider.email,
      office_address: savedProvider.office_address,
      notes: savedProvider.notes,
      created_at: savedProvider.created_at,
      updated_at: savedProvider.updated_at,
    };
  }

  /**
   * Update an existing provider
   * @param providerId The ID of the provider to update
   * @param updateProviderDto The provider data to update
   * @param userId The ID of the authenticated user
   * @returns The updated provider
   */
  async updateProvider(
    providerId: string,
    updateProviderDto: UpdateProviderDto,
    userId: number,
  ): Promise<ProviderDetailDto> {
    // Validate and parse provider ID
    const parsedId = parseInt(providerId);
    if (isNaN(parsedId)) {
      throw new NotFoundException('Provider not found');
    }

    // Find the provider by ID
    const provider = await this.providersRepository.findOne({
      where: {
        id: parsedId,
        soft_deleted_at: IsNull(),
      },
    });

    // Check if provider exists
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Verify the provider belongs to the user
    if (provider.user_id !== userId) {
      throw new ForbiddenException('You can only update your own providers');
    }

    // Update the provider fields
    provider.provider_name = updateProviderDto.provider_name;
    provider.phone = updateProviderDto.phone;
    provider.email = updateProviderDto.email || null as any;
    provider.office_address = updateProviderDto.office_address || null as any;
    provider.notes = updateProviderDto.notes || null as any;

    // Save the updated provider
    const updatedProvider = await this.providersRepository.save(provider);

    // Return the updated provider with detailed view
    return {
      id: updatedProvider.id,
      provider_name: updatedProvider.provider_name,
      provider_type: updatedProvider.provider_type,
      specialty: updatedProvider.specialty,
      phone: updatedProvider.phone,
      email: updatedProvider.email,
      office_address: updatedProvider.office_address,
      notes: updatedProvider.notes,
      created_at: updatedProvider.created_at,
      updated_at: updatedProvider.updated_at,
    };
  }

  /**
   * Soft delete a provider
   * @param providerId The ID of the provider to delete
   * @param userId The ID of the authenticated user
   * @returns Success message
   */
  async deleteProvider(providerId: string, userId: number): Promise<{ success: boolean; message: string }> {
    // Validate and parse provider ID
    const parsedId = parseInt(providerId);
    if (isNaN(parsedId)) {
      throw new NotFoundException('Provider not found');
    }

    // Find the provider by ID
    const provider = await this.providersRepository.findOne({
      where: {
        id: parsedId,
        soft_deleted_at: IsNull(),
      },
    });

    // Check if provider exists
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Verify the provider belongs to the user
    if (provider.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own providers');
    }

    // Soft delete the provider by setting the soft_deleted_at timestamp
    provider.soft_deleted_at = new Date();
    await this.providersRepository.save(provider);

    return {
      success: true,
      message: 'Provider deleted successfully',
    };
  }
}