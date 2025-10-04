import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface VisitContext {
  visit: {
    visit_date: string;
    visit_time: string;
    visit_reason: string;
  };
  provider: {
    provider_name: string;
    provider_type: string;
    specialty: string | null;
  } | null;
  symptoms: Array<{
    symptom_name: string;
    severity: number;
    onset_date: string;
    status: string;
    description?: string;
    triggers?: string;
  }>;
  medications: Array<{
    medication_name: string;
    dosage: string;
    frequency: string;
    status: string;
    conditions_or_symptoms: string;
  }>;
}

@Injectable()
export class AnthropicService {
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });
  }

  /**
   * Generate visit preparation questions using AI
   */
  async generateVisitQuestions(context: VisitContext): Promise<string[]> {
    const prompt = this.buildVisitPrepQuestionsPrompt(context);
    let rawResponse = '';

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 5000,
        temperature: 1.0,
        thinking: {
          type: 'enabled',
          budget_tokens: 3500,
        },
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text response
      const textContent = response.content.find(
        (block) => block.type === 'text',
      );

      if (!textContent || !('text' in textContent)) {
        throw new Error('No text response from AI');
      }

      rawResponse = textContent.text;
      let responseText = rawResponse;

      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        responseText = jsonMatch[1];
      }

      // Parse JSON response
      const questions = JSON.parse(responseText.trim());

      if (!Array.isArray(questions)) {
        throw new Error('AI response is not an array');
      }

      return questions;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse AI response as JSON. Response was: ${rawResponse.substring(0, 500)}`);
      }
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  /**
   * Build the AI prompt for generating visit preparation questions
   */
  private buildVisitPrepQuestionsPrompt(context: VisitContext): string {
    const symptomsText =
      context.symptoms.length > 0
        ? context.symptoms
            .map(
              (s) =>
                `- ${s.symptom_name} (severity ${s.severity}/10, started ${s.onset_date}, status: ${s.status})${s.description ? `: ${s.description}` : ''}${s.triggers ? `, triggers: ${s.triggers}` : ''}`,
            )
            .join('\n')
        : 'None logged';

    const medicationsText =
      context.medications.length > 0
        ? context.medications
            .map(
              (m) =>
                `- ${m.medication_name} ${m.dosage}, ${m.frequency} (status: ${m.status}) - for ${m.conditions_or_symptoms}`,
            )
            .join('\n')
        : 'None logged';

    const providerText = context.provider
      ? `${context.provider.provider_name} (${context.provider.provider_type}${context.provider.specialty ? `, ${context.provider.specialty}` : ''})`
      : 'Provider information not available';

    return `You are helping a patient prepare for their upcoming doctor visit. Based on their health data, generate 5-8 specific, personalized questions they should ask their doctor.

    VISIT DETAILS:
    - Date: ${context.visit.visit_date} at ${context.visit.visit_time}
    - Reason: ${context.visit.visit_reason}
    - Provider: ${providerText}

    CURRENT SYMPTOMS:
    ${symptomsText}

    CURRENT MEDICATIONS:
    ${medicationsText}

    INSTRUCTIONS:
    1. Generate 5-8 specific questions that reference the patient's actual data (symptom names, dates, severities, medications)
    2. Questions should help the patient get the most out of their visit
    3. Consider medication-symptom interactions when relevant
    4. Make questions actionable and answerable by the doctor
    5. Avoid generic questions - be specific to this patient's situation

    Return ONLY a JSON array of question strings, nothing else. Format:
    ["Question 1", "Question 2", "Question 3", ...]`;
  }
}