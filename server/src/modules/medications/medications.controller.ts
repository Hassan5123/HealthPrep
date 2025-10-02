import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MedicationsService } from './medications.service';
import { AddMedicationDto, UpdateMedicationDto, MedicationListResponseDto, MedicationDetailResponseDto } from './dto';


/**
 * Controller handling HTTP requests for medication operations
 * All endpoints require JWT authentication
 */
@Controller('medications')
@UseGuards(AuthGuard('jwt'))
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}


  /**
   * GET /medications
   * Get all medications for the authenticated user
   * @param req Request object containing authenticated user
   * @returns Array of all medications with provider details
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllMedications(@Request() req): Promise<MedicationListResponseDto[]> {
    const userId = req.user.sub;
    return this.medicationsService.getAllMedications(userId);
  }


  /**
   * GET /medications/active
   * Get all active (taking) medications for the authenticated user
   * @param req Request object containing authenticated user
   * @returns Array of active medications with provider details
   */
  @Get('active')
  @HttpCode(HttpStatus.OK)
  async getActiveMedications(@Request() req): Promise<MedicationListResponseDto[]> {
    const userId = req.user.sub;
    return this.medicationsService.getActiveMedications(userId);
  }


  /**
   * GET /medications/discontinued
   * Get all discontinued medications for the authenticated user
   * @param req Request object containing authenticated user
   * @returns Array of discontinued medications with provider details
   */
  @Get('discontinued')
  @HttpCode(HttpStatus.OK)
  async getDiscontinuedMedications(@Request() req): Promise<MedicationListResponseDto[]> {
    const userId = req.user.sub;
    return this.medicationsService.getDiscontinuedMedications(userId);
  }


  /**
   * GET /medications/:id
   * Get detailed medication information by ID
   * @param id ID of the medication
   * @param req Request object containing authenticated user
   * @returns Detailed medication information with provider details
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getMedicationById(
    @Param('id') id: string,
    @Request() req,
  ): Promise<MedicationDetailResponseDto> {
    const userId = req.user.sub;
    return this.medicationsService.getMedicationById(+id, userId);
  }


  /**
   * POST /medications
   * Add a new medication
   * @param addMedicationDto Data for adding the medication
   * @param req Request object containing authenticated user
   * @returns Success message
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addMedication(
    @Body() addMedicationDto: AddMedicationDto,
    @Request() req,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user.sub;
    return this.medicationsService.addMedication(userId, addMedicationDto);
  }


  /**
   * PUT /medications/:id
   * Update an existing medication
   * @param id ID of the medication
   * @param updateMedicationDto Data for updating the medication
   * @param req Request object containing authenticated user
   * @returns Success message
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateMedication(
    @Param('id') id: string,
    @Body() updateMedicationDto: UpdateMedicationDto,
    @Request() req,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user.sub;
    return this.medicationsService.updateMedication(+id, userId, updateMedicationDto);
  }


  /**
   * DELETE /medications/:id
   * Soft delete a medication
   * @param id ID of the medication
   * @param req Request object containing authenticated user
   * @returns Success message
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteMedication(
    @Param('id') id: string,
    @Request() req,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user.sub;
    return this.medicationsService.deleteMedication(+id, userId);
  }
}