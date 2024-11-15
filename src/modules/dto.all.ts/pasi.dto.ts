import { ApiProperty } from '@nestjs/swagger';

class AreaSeverityDto {
  @ApiProperty({ description: 'Erythema severity (0–4)', example: 3 })
  E: number;

  @ApiProperty({ description: 'Induration severity (0–4)', example: 2 })
  I: number;

  @ApiProperty({ description: 'Scaling severity (0–4)', example: 4 })
  D: number;

  @ApiProperty({ description: 'Affected area percentage (1–6)', example: 5 })
  A: number;
}

export class CalculatePasiDto {
  @ApiProperty({
    description: 'Head area severity details',
    type: AreaSeverityDto,
  })
  head: AreaSeverityDto;

  @ApiProperty({
    description: 'Upper limb area severity details',
    type: AreaSeverityDto,
  })
  upperLimb: AreaSeverityDto;

  @ApiProperty({
    description: 'Trunk area severity details',
    type: AreaSeverityDto,
  })
  trunk: AreaSeverityDto;

  @ApiProperty({
    description: 'Lower limb area severity details',
    type: AreaSeverityDto,
  })
  lowerLimb: AreaSeverityDto;
}
