import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeverityProfileController } from './severity.controller';
import { SeverityProfileService } from './severity.service';
import {
  SeverityProfile,
  SeveritySchema,
} from '../../modules/models/severity.profile';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ScoreModule } from '../secretScores/severity.module';
import { PasiScore } from '../secretScores/pasi.scores';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SeverityProfile.name, schema: SeveritySchema },
    ]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '600s' },
      }),
      inject: [ConfigService],
    }),
    ScoreModule,
  ],
  controllers: [SeverityProfileController],
  providers: [SeverityProfileService, PasiScore],
  exports: [SeverityProfileService],
})
export class SeverityProfileModule {}
