import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ListItem } from '../../list-item/entities/list-item.entity';

@Entity({ name: 'list' })
@ObjectType()
export class List {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column('text')
  name: string;

  // relations, index.
  @Field(() => User)
  @ManyToOne(() => User, (user) => user.lists, { nullable: false })
  @Index()
  @JoinColumn({ name: 'user_id' })
  userId: Relation<User>;

  // @Field(() => [ListItem])
  @OneToMany(() => ListItem, (listItem) => listItem.listId, { lazy: true })
  listItems: Relation<ListItem>[];
}
