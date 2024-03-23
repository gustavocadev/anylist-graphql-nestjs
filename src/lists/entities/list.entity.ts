import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

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
}
