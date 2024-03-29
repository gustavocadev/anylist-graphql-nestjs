import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateListInput {
  @Field(() => String, { description: 'Example field (placeholder)' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
