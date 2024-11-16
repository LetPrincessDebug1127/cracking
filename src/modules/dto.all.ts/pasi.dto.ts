import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AreaSeverityDto {
  @ApiProperty({ description: 'Erythema severity (0–4)', example: 3 })
  @IsNumber()
  @Min(0)
  @Max(4)
  E: number;

  @ApiProperty({ description: 'Induration severity (0–4)', example: 2 })
  @IsNumber()
  @Min(0)
  @Max(4)
  I: number;

  @ApiProperty({ description: 'Scaling severity (0–4)', example: 4 })
  @IsNumber()
  @Min(0)
  @Max(4)
  D: number;

  @ApiProperty({ description: 'Affected area percentage (1–6)', example: 5 })
  @IsNumber()
  @Min(1)
  @Max(6)
  A: number;
}

export class CalculatePasiDto {
  @ApiProperty({
    description: 'Head area severity details',
    type: AreaSeverityDto,
  })
  @ValidateNested()
  @Type(() => AreaSeverityDto)
  head: AreaSeverityDto;

  @ApiProperty({
    description: 'Upper limb area severity details',
    type: AreaSeverityDto,
  })
  @ValidateNested()
  @Type(() => AreaSeverityDto)
  upperLimb: AreaSeverityDto;

  @ApiProperty({
    description: 'Trunk area severity details',
    type: AreaSeverityDto,
  })
  @ValidateNested()
  @Type(() => AreaSeverityDto)
  trunk: AreaSeverityDto;

  @ApiProperty({
    description: 'Lower limb area severity details',
    type: AreaSeverityDto,
  })
  @ValidateNested()
  @Type(() => AreaSeverityDto)
  lowerLimb: AreaSeverityDto;
}
