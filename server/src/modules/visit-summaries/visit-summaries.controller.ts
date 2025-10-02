import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VisitSummariesService } from './visit-summaries.service';
import { CreateVisitSummaryDto, UpdateVisitSummaryDto, VisitSummaryResponseDto } from './dto';



/**
 * Controller handling HTTP requests for visit summary operations
 * All endpoints require JWT authentication
 */
@Controller('visit-summaries')
@UseGuards(AuthGuard('jwt'))
export class VisitSummariesController {
  constructor(private readonly visitSummariesService: VisitSummariesService) {}


  /**
   * GET /visit-summaries/:visitId
   * Retrieve visit summary by visit ID
   * @param visitId ID of the visit
   * @param req Request object containing authenticated user
   * @returns Visit summary data or null
   */
  @Get(':visitId')
  @HttpCode(HttpStatus.OK)
  async getVisitSummary(
    @Param('visitId') visitId: string,
    @Request() req,
  ): Promise<VisitSummaryResponseDto | null> {
    const userId = req.user.sub;
    return this.visitSummariesService.getVisitSummaryByVisitId(+visitId, userId);
  }


  /**
   * POST /visit-summaries
   * Create a new visit summary
   * @param createVisitSummaryDto Data for creating the visit summary
   * @param req Request object containing authenticated user
   * @returns Success message
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createVisitSummary(
    @Body() createVisitSummaryDto: CreateVisitSummaryDto,
    @Request() req,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user.sub;
    return this.visitSummariesService.createVisitSummary(userId, createVisitSummaryDto);
  }


  /**
   * PUT /visit-summaries/:visitId
   * Update an existing visit summary
   * @param visitId ID of the visit
   * @param updateVisitSummaryDto Data for updating the visit summary
   * @param req Request object containing authenticated user
   * @returns Success message
   */
  @Put(':visitId')
  @HttpCode(HttpStatus.OK)
  async updateVisitSummary(
    @Param('visitId') visitId: string,
    @Body() updateVisitSummaryDto: UpdateVisitSummaryDto,
    @Request() req,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user.sub;
    return this.visitSummariesService.updateVisitSummary(+visitId, userId, updateVisitSummaryDto);
  }


  /**
   * DELETE /visit-summaries/:visitId
   * Soft delete a visit summary
   * @param visitId ID of the visit
   * @param req Request object containing authenticated user
   * @returns Success message
   */
  @Delete(':visitId')
  @HttpCode(HttpStatus.OK)
  async deleteVisitSummary(
    @Param('visitId') visitId: string,
    @Request() req,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user.sub;
    return this.visitSummariesService.deleteVisitSummary(+visitId, userId);
  }
}