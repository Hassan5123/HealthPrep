import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../../common/middlewares/auth-middleware';
import { ProvidersService } from './providers.service';
import { CreateProviderDto, UpdateProviderDto, ProviderSummaryDto, ProviderDetailDto } from './dto/provider.dto';


/**
 * Controller handling healthcare provider endpoints
 * All routes are protected by the AuthGuard
 */
@Controller('providers')
@UseGuards(AuthGuard)
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  /**
   * Get all providers for the authenticated user
   * @param req Request object containing authenticated user
   * @returns List of providers with summary information
   */
  @Get()
  async getAllProviders(@Request() req): Promise<ProviderSummaryDto[]> {
    // Extract user ID from JWT payload
    const userId = req.user.sub;
    return await this.providersService.getAllProviders(userId);
  }

  /**
   * Get a specific provider by ID
   * @param req Request object containing authenticated user
   * @param providerId ID of the provider to retrieve
   * @returns The provider details
   */
  @Get(':id')
  async getProviderById(
    @Request() req,
    @Param('id') providerId: string,
  ): Promise<ProviderDetailDto> {
    // Extract user ID from JWT payload
    const userId = req.user.sub;
    return await this.providersService.getProviderById(providerId, userId);
  }

  /**
   * Create a new provider
   * @param req Request object containing authenticated user
   * @param createProviderDto Provider data to create
   * @returns The newly created provider
   */
  @Post()
  async createProvider(
    @Request() req,
    @Body() createProviderDto: CreateProviderDto,
  ): Promise<ProviderDetailDto> {
    // Extract user ID from JWT payload
    const userId = req.user.sub;
    return await this.providersService.createProvider(createProviderDto, userId);
  }

  /**
   * Update an existing provider
   * @param req Request object containing authenticated user
   * @param providerId ID of the provider to update
   * @param updateProviderDto Provider data to update
   * @returns The updated provider
   */
  @Put(':id')
  async updateProvider(
    @Request() req,
    @Param('id') providerId: string,
    @Body() updateProviderDto: UpdateProviderDto,
  ): Promise<ProviderDetailDto> {
    // Extract user ID from JWT payload
    const userId = req.user.sub;
    return await this.providersService.updateProvider(providerId, updateProviderDto, userId);
  }

  /**
   * Soft Delete a provider
   * @param req Request object containing authenticated user
   * @param providerId ID of the provider to delete
   * @returns Success message
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteProvider(
    @Request() req,
    @Param('id') providerId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Extract user ID from JWT payload
    const userId = req.user.sub;
    return await this.providersService.deleteProvider(providerId, userId);
  }
}