import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity({ name: 'item' })
@ObjectType()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('text')
  @Field(() => String)
  name: string;

  // @Column('float')
  // @Field(() => Float)
  // quantity: number;

  @Column('text', {
    nullable: true,
    name: 'quantity_units',
  })
  @Field(() => String, { nullable: true })
  quantityUnits?: string;

  // By default, the relation decorators are nullable: true. If you want to make them non-nullable, you can set the nullable option to false.
  @ManyToOne(() => User, (user) => user.items, { nullable: false })
  @Index()
  @JoinColumn({ name: 'user_id' })
  @Field(() => User)
  userId: Relation<User>;
}
