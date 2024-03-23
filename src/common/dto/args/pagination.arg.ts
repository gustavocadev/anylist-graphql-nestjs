import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsPositive, Min } from 'class-validator';

@ArgsType()
export abstract class PaginationArgs {
  @Field(() => Int, { defaultValue: 0, nullable: true })
  @Min(0)
  @IsOptional()
  offset?: number;

  @Field(() => Int, { defaultValue: 10, nullable: true })
  @IsOptional()
  @IsPositive()
  limit?: number;
}
