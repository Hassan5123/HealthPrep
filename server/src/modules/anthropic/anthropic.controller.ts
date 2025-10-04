import {
  Controller,
  Post,
  Param,
  UseGuards,
  Req,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '../../common/middlewares/auth-middleware';
import { Repository, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AnthropicService, VisitContext } from './anthropic.service';
import { Visit } from '../visits/visits.model';
import { Symptom } from '../symptoms/symptoms.model';
import { Medication } from '../medications/medications.model';
import { Provider } from '../providers/providers.model';
import { formatDate } from '../../common/utils/format-date.util';

@Controller('anthropic')
export class AnthropicController {
  constructor(
    private readonly anthropicService: AnthropicService,
    @InjectRepository(Visit)
    private visitRepository: Repository<Visit>,
    @InjectRepository(Symptom)
    private symptomRepository: Repository<Symptom>,
    @InjectRepository(Medication)
    private medicationRepository: Repository<Medication>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
  ) {}

  @Post('generate-visit-questions/:visitId')
  @UseGuards(AuthGuard)
  async generateVisitQuestions(@Param('visitId') visitId: string, @Req() req) {
    const userId = req.user.sub;
    const parsedVisitId = parseInt(visitId, 10);

    if (isNaN(parsedVisitId)) {
      throw new BadRequestException('Invalid visit ID');
    }

    // Fetch visit with provider
    const visit = await this.visitRepository.findOne({
      where: {
        id: parsedVisitId,
        soft_deleted_at: IsNull(),
      },
      relations: ['provider'],
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    if (visit.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Fetch user's symptoms (active and resolved, not soft deleted)
    const symptoms = await this.symptomRepository.find({
      where: {
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
      order: {
        onset_date: 'DESC',
      },
    });

    // Fetch user's medications (taking and discontinued, not soft deleted)
    const medications = await this.medicationRepository.find({
      where: {
        user_id: userId,
        soft_deleted_at: IsNull(),
      },
      order: {
        created_at: 'DESC',
      },
    });

    // Build context for AI
    const context: VisitContext = {
      visit: {
        visit_date: formatDate(visit.visit_date)!,
        visit_time: visit.visit_time || 'Not specified',
        visit_reason: visit.visit_reason,
      },
      provider: visit.provider
        ? {
            provider_name: visit.provider.provider_name,
            provider_type: visit.provider.provider_type,
            specialty: visit.provider.specialty,
          }
        : null,
      symptoms: symptoms.map((s) => ({
        symptom_name: s.symptom_name,
        severity: s.severity,
        onset_date: formatDate(s.onset_date)!,
        status: s.status,
        description: s.description,
        triggers: s.triggers,
      })),
      medications: medications.map((m) => ({
        medication_name: m.medication_name,
        dosage: m.dosage,
        frequency: m.frequency,
        status: m.status,
        conditions_or_symptoms: m.conditions_or_symptoms,
      })),
    };

    // Generate questions using AI
    const questions =
      await this.anthropicService.generateVisitQuestions(context);

    return {
      success: true,
      questions: questions,
      metadata: {
        questionsGenerated: questions.length,
        dataIncluded: {
          symptoms: symptoms.length,
          medications: medications.length,
          hasProvider: !!visit.provider,
        },
      },
    };
  }
}