import { ArgsType, Field } from '@nestjs/graphql';
import { ValidRoles } from '../../../auth/enums/valid-roles.enum';
import { IsArray, IsOptional } from 'class-validator';

@ArgsType()
export abstract class ValidRolesArgs {
  @Field(() => [ValidRoles], { nullable: true })
  @IsArray()
  @IsOptional()
  roles: ValidRoles[] = [];
}
