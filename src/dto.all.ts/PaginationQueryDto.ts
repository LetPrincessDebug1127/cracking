import { IsOptional, IsInt, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Page phải lớn hơn hoặc bằng 1' })
  page?: number = 1;
}
