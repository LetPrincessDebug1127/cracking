import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SeverityProfile } from '../models/severity.profile';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { PasiScore } from '../secretScores/pasi.scores';
import { CalculatePasiDto } from '../dto.all.ts/severityProfile/pasi.dto';

@Injectable()
export class SeverityProfileService {
  constructor(
    @InjectModel(SeverityProfile.name)
    private readonly severityProfileModel: Model<SeverityProfile>,
    private readonly pasiScoreService: PasiScore,
  ) {}

  async createProfile(
    userId: Types.ObjectId,
    severityPercentage: CalculatePasiDto,
  ) {
    const { pasi, percentage } =
      this.pasiScoreService.calculatePASI(severityPercentage);
    return await this.severityProfileModel.create({
      user_id: userId,
      severityPercentage: percentage,
      sunPoints: 0,
    });
  }
}
