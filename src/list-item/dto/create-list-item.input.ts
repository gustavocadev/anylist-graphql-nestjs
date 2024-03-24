import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { List } from '../../lists/entities/list.entity';
import { Item } from '../../items/entities/item.entity';

@InputType()
export class CreateListItemInput {
  @Field(() => Number, { defaultValue: 0, nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @Field(() => ID)
  @IsUUID()
  listId: List;

  @Field(() => ID)
  @IsUUID()
  itemId: Item;
}
