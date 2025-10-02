import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VisitPrepService } from './visit-prep.service';
import { CreateVisitPrepDto, UpdateVisitPrepDto, VisitPrepResponseDto, UserConditionsResponseDto } from './dto';



/**
 * Controller handling visit preparation endpoints
 * All endpoints are protected by JWT authentication
 */
@Controller('visit-prep')
@UseGuards(AuthGuard('jwt'))
export class VisitPrepController {
  constructor(private readonly visitPrepService: VisitPrepService) {}


  /**
   * Endpoint to get visit prep by visit ID
   * Returns visit prep data or null if none exists
   */
  @Get('visit/:visitId')
  async getVisitPrepByVisitId(
    @Request() req,
    @Param('visitId', ParseIntPipe) visitId: number,
  ): Promise<VisitPrepResponseDto | null> {
    const userId = req.user.sub;
    return await this.visitPrepService.getVisitPrepByVisitId(visitId, userId);
  }


  /**
   * Endpoint to get user's existing conditions
   * Returns parsed conditions array or indication that none exist
   */
  @Get('conditions')
  async getUserConditions(@Request() req): Promise<UserConditionsResponseDto> {
    const userId = req.user.sub;
    return await this.visitPrepService.getUserConditions(userId);
  }


  /**
   * Endpoint to create a new visit prep record
   * @param req Request object containing authenticated user
   * @param createVisitPrepDto DTO with visit prep details
   * @returns Success message
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createVisitPrep(
    @Request() req,
    @Body() createVisitPrepDto: CreateVisitPrepDto,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user.sub;
    return await this.visitPrepService.createVisitPrep(userId, createVisitPrepDto);
  }


  /**
   * Endpoint to update an existing visit prep record
   * @param req Request object containing authenticated user
   * @param visitId ID of the visit
   * @param updateVisitPrepDto DTO with updated fields
   * @returns Success message
   */
  @Put('visit/:visitId')
  async updateVisitPrep(
    @Request() req,
    @Param('visitId', ParseIntPipe) visitId: number,
    @Body() updateVisitPrepDto: UpdateVisitPrepDto,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user.sub;
    return await this.visitPrepService.updateVisitPrep(visitId, userId, updateVisitPrepDto);
  }


  /**
   * Endpoint to delete (soft delete) a visit prep record
   * @param req Request object containing authenticated user
   * @param visitId ID of the visit
   * @returns Success message
   */
  @Delete('visit/:visitId')
  async deleteVisitPrep(
    @Request() req,
    @Param('visitId', ParseIntPipe) visitId: number,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user.sub;
    return await this.visitPrepService.deleteVisitPrep(visitId, userId);
  }
}