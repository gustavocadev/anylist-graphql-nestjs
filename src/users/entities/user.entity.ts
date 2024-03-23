import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Item } from '../../items/entities/item.entity';
import { List } from '../../lists/entities/list.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity({ name: 'user' })
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('text', { name: 'full_name' })
  @Field(() => String)
  fullName: string;

  @Column('text', { unique: true })
  @Field(() => String)
  email: string;

  @Column('text')
  password: string;

  @Column('text', { array: true, default: ['user'] })
  @Field(() => [String])
  roles: string[];

  @Column('boolean', { default: true, name: 'is_active' })
  @Field(() => Boolean)
  isActive: boolean;

  // my relations
  @ManyToOne(() => User, (user) => user.lastUpdatedBy, { nullable: true })
  @JoinColumn({ name: 'last_updated_by' })
  @Field(() => User, { nullable: true })
  lastUpdatedBy?: Relation<User>;

  @OneToMany(() => Item, (item) => item.userId)
  // I Commented this line because I gonna manage this with a @ResolveField
  // @Field(() => [Item], { defaultValue: [] })
  items: Relation<Item>[];

  @OneToMany(() => List, (list) => list.userId)
  // @Field(() => [List], { defaultValue: [] })
  lists: Relation<List>[];
}
