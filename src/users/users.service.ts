import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { SignupInput } from '../auth/dto/inputs/signup.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { DatabaseError } from 'pg';
import * as argon2 from 'argon2';
import { ValidRolesArgs } from './dto/args/roles.arg';

@Injectable()
export class UsersService {
  #logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(signupInput: SignupInput): Promise<User> {
    try {
      const newUser = this.userRepository.create({
        ...signupInput,
        password: await argon2.hash(signupInput.password),
      });

      return this.userRepository.save(newUser);
    } catch (err) {
      this.#handleDBErrors(err);
    }
  }

  async findAll(validRoles: ValidRolesArgs) {
    console.log(validRoles);
    if (validRoles.roles.length === 0)
      return this.userRepository.find({
        relations: {
          lastUpdatedBy: true,
        },
      });

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (validRoles.roles.length) {
      //where the user.roles contains any of the roles
      queryBuilder
        .where('user.roles && :roles', { roles: validRoles.roles })
        .leftJoinAndSelect('user.lastUpdatedBy', 'lastUpdatedBy');
    }
    return queryBuilder.getMany();
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.userRepository.findOneOrFail({ where: { email } });
    } catch (error) {
      this.#handleDBErrors(error);
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      return await this.userRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      this.#handleDBErrors(error);
    }
  }

  async update(id: string, updateUserInput: UpdateUserInput, userAdmin: User) {
    try {
      const updatedUser = await this.userRepository.preload(updateUserInput);
      updatedUser.lastUpdatedBy = userAdmin;

      return await this.userRepository.save(updatedUser);
    } catch (error) {
      this.#handleDBErrors(error);
    }
  }

  async block(id: string, userAdmin: User): Promise<User> {
    const userToBlock = await this.findOneById(id);
    // edit relation
    userToBlock.isActive = false;
    userToBlock.lastUpdatedBy = userAdmin;

    return await this.userRepository.save(userToBlock);
  }

  #handleDBErrors(error: DatabaseError): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail.replace('Key ', ''));
    }

    this.#logger.error(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}
