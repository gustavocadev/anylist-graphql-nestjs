import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListInput } from './dto/inputs/create-list.input';
import { UpdateListInput } from './dto/inputs/update-list.input';
import { InjectRepository } from '@nestjs/typeorm';
import { List } from './entities/list.entity';
import { ILike, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { PaginationArgs } from '../common/dto/args/pagination.arg';
import { SearchArgs } from '../common/dto/args/search.arg';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) {}

  create(createListInput: CreateListInput, user: User) {
    const newList = this.listRepository.create({
      ...createListInput,
      userId: user,
    });

    return this.listRepository.save(newList);
  }

  findAll(user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs) {
    return this.listRepository.find({
      where: {
        userId: user,
        name: searchArgs.search && ILike(`%${searchArgs.search}%`),
      },
      take: paginationArgs.limit,
      skip: paginationArgs.offset,
      relations: { userId: true },
    });
  }

  async findOne(id: string, user: User) {
    const list = await this.listRepository.findOne({
      where: { id, userId: user },
    });
    if (!list) throw new NotFoundException(`List #${id} not found`);

    return list;
  }

  async update(id: string, updateListInput: UpdateListInput, user: User) {
    const list = await this.findOne(id, user);
    await this.listRepository.update(id, updateListInput);
    return list;
  }

  async remove(id: string, user: User) {
    const list = await this.findOne(id, user);
    await this.listRepository.delete({ id, userId: user });
    return list;
  }

  async listCountByUser(user: User) {
    return this.listRepository.count({ where: { userId: user } });
  }
}
