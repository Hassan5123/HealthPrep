import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VisitsService } from './visits.service';
import { ScheduleVisitDto, UpdateVisitDto, VisitListResponseDto, VisitScheduledListResponseDto, VisitDetailResponseDto } from './dto';


/**
 * Controller handling visit-related endpoints
 * All endpoints are protected by JWT authentication
 */
@Controller('visits')
@UseGuards(AuthGuard('jwt'))
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}


  /**
   * Endpoint to get all visits for the authenticated user
   * Returns all visits with provider details
   */
  @Get()
  async getAllVisits(@Request() req): Promise<VisitListResponseDto[]> {
    const userId = req.user.sub;
    return await this.visitsService.getAllVisits(userId);
  }


  /**
   * Endpoint to get all upcoming (scheduled) visits for the authenticated user
   * Returns only scheduled visits with provider details
   */
  @Get('upcoming')
  async getUpcomingVisits(@Request() req): Promise<VisitScheduledListResponseDto[]> {
    const userId = req.user.sub;
    return await this.visitsService.getUpcomingVisits(userId);
  }


  /**
   * Endpoint to get all completed visits for the authenticated user
   * Returns only completed visits with provider details
   */
  @Get('completed')
  async getCompletedVisits(@Request() req): Promise<VisitScheduledListResponseDto[]> {
    const userId = req.user.sub;
    return await this.visitsService.getCompletedVisits(userId);
  }


  /**
   * Endpoint to get a specific visit by ID
   * Returns detailed information about the visit including provider details
   */
  @Get(':id')
  async getVisit(
    @Request() req,
    @Param('id', ParseIntPipe) visitId: number,
  ): Promise<VisitDetailResponseDto> {
    const userId = req.user.sub;
    return await this.visitsService.getVisit(visitId, userId);
  }


  /**
   * Endpoint to schedule a new visit for the authenticated user
   * @param req Request object containing authenticated user
   * @param scheduleVisitDto DTO with visit details
   * @returns Success message
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async scheduleVisit(
    @Request() req,
    @Body() scheduleVisitDto: ScheduleVisitDto,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user.sub;
    return await this.visitsService.scheduleVisit(userId, scheduleVisitDto);
  }


  /**
   * Endpoint to update an existing visit
   * Can update visit fields or change status from scheduled to completed
   * @param req Request object containing authenticated user
   * @param visitId ID of the visit to update
   * @param updateVisitDto DTO with updated fields
   * @returns Success message
   */
  @Put(':id')
  async updateVisit(
    @Request() req,
    @Param('id', ParseIntPipe) visitId: number,
    @Body() updateVisitDto: UpdateVisitDto,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user.sub;
    return await this.visitsService.updateVisit(visitId, userId, updateVisitDto);
  }


  /**
   * Endpoint to remove (soft delete) a visit
   * @param req Request object containing authenticated user
   * @param visitId ID of the visit to remove
   * @returns Success message
   */
  @Delete(':id')
  async removeVisit(
    @Request() req,
    @Param('id', ParseIntPipe) visitId: number,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user.sub;
    return await this.visitsService.removeVisit(visitId, userId);
  }
}