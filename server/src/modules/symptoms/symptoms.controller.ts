import { Controller, Get, Post, Put, Param, Body, UseGuards, Request, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '../../common/middlewares/auth-middleware';
import { SymptomsService } from './symptoms.service';
import { AddSymptomDto, UpdateSymptomDto, SymptomListResponseDto, SymptomDetailResponseDto } from './dto';


/**
 * Controller handling symptom-related endpoints
 * All endpoints are protected by JWT authentication
 */
@Controller('symptoms')
@UseGuards(AuthGuard)
export class SymptomsController {
  constructor(private readonly symptomsService: SymptomsService) {}

  /**
   * Endpoint to get all symptoms for the authenticated user
   * Returns all non-deleted symptoms with limited fields
   * @param req Request object containing authenticated user
   * @returns Array of symptoms
   */
  @Get()
  async getAllSymptoms(@Request() req): Promise<SymptomListResponseDto[]> {
    // Extract user ID from JWT payload
    const userId = req.user.sub;
    return await this.symptomsService.getAllSymptoms(userId);
  }


  /**
   * Endpoint to get all active symptoms for the authenticated user
   * Returns only symptoms with status 'active'
   * @param req Request object containing authenticated user
   * @returns Array of active symptoms
   */
  @Get('active')
  async getActiveSymptoms(@Request() req): Promise<SymptomListResponseDto[]> {
    const userId = req.user.sub;
    return await this.symptomsService.getActiveSymptoms(userId);
  }


  /**
   * Endpoint to get all resolved symptoms for the authenticated user
   * Returns only symptoms with status 'resolved'
   * @param req Request object containing authenticated user
   * @returns Array of resolved symptoms
   */
  @Get('resolved')
  async getResolvedSymptoms(@Request() req): Promise<SymptomListResponseDto[]> {
    const userId = req.user.sub;
    return await this.symptomsService.getResolvedSymptoms(userId);
  }


  /**
   * Endpoint to get a specific symptom by ID
   * Returns detailed information about the symptom
   * Ensures the symptom belongs to the authenticated user
   * @param req Request object containing authenticated user
   * @param symptomId ID of the symptom to retrieve
   * @returns Detailed symptom information
   */
  @Get(':id')
  async getSymptomById(
    @Request() req,
    @Param('id', ParseIntPipe) symptomId: number,
  ): Promise<SymptomDetailResponseDto> {
    const userId = req.user.sub;
    return await this.symptomsService.getSymptomById(symptomId, userId);
  }


  /**
   * Endpoint to add a new symptom for the authenticated user
   * @param req Request object containing authenticated user
   * @param addSymptomDto Symptom data from request body
   * @returns Success message
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addSymptom(
    @Request() req,
    @Body() addSymptomDto: AddSymptomDto,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user.sub;
    return await this.symptomsService.addSymptom(userId, addSymptomDto);
  }


  /**
   * Endpoint to update an existing symptom
   * Can update symptom fields or soft delete the symptom
   * Ensures the symptom belongs to the authenticated user
   * @param req Request object containing authenticated user
   * @param symptomId ID of the symptom to update
   * @param updateSymptomDto Update data from request body
   * @returns Success message
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateSymptom(
    @Request() req,
    @Param('id', ParseIntPipe) symptomId: number,
    @Body() updateSymptomDto: UpdateSymptomDto,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user.sub;
    return await this.symptomsService.updateSymptom(symptomId, userId, updateSymptomDto);
  }
}