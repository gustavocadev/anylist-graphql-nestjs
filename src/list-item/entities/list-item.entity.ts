import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { List } from '../../lists/entities/list.entity';
import { Item } from '../../items/entities/item.entity';

@Entity('list_item')
// @Unique('listItem-item', ['list', 'item'])
@ObjectType()
export class ListItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Number, { description: 'The quantity of the items to buy' })
  @Column('numeric')
  quantity: number;

  @Field(() => Boolean)
  @Column('boolean', { name: 'is_completed', default: false, nullable: false })
  isCompleted: boolean;

  // relations
  @Field(() => List)
  @ManyToOne(() => List, (list) => list.listItems, { lazy: true })
  @JoinColumn({ name: 'list_id' })
  listId: Relation<List>;

  @Field(() => Item)
  @ManyToOne(() => Item, (item) => item.listItems, { lazy: true })
  @JoinColumn({ name: 'item_id' })
  itemId: Relation<Item>;
}
