import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput } from './dto/inputs/create-item.input';
import { UpdateItemInput } from './dto/inputs/update-item.input';
import { ILike, Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { PaginationArgs } from '../common/dto/args/pagination.arg';
import { SearchArgs } from '../common/dto/args/search.arg';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRespository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const item = this.itemsRespository.create(createItemInput);

    item.userId = user;

    return this.itemsRespository.save(item);
  }

  findAll(user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs) {
    return this.itemsRespository.find({
      where: {
        userId: user,
        name: searchArgs.search && ILike(`%${searchArgs.search}%`),
      },
      skip: paginationArgs.offset,
      take: paginationArgs.limit,
    });
  }

  async findOne(id: string, user: User): Promise<Item> {
    // load relation as well
    const product = await this.itemsRespository.findOne({
      relations: {
        userId: true,
      },
      where: {
        id,
        userId: user,
      },
    });

    if (!product) throw new NotFoundException(`Product #${id} not found`);

    return product;
  }

  async update(
    id: string,
    updateItemInput: UpdateItemInput,
    user: User,
  ): Promise<Item> {
    const product = await this.findOne(id, user);
    await this.itemsRespository.update(id, updateItemInput);

    return product;
  }

  async remove(id: string, user: User) {
    const item = await this.findOne(id, user);
    await this.itemsRespository.remove(item);

    return item;
  }

  async itemCountByUser(user: User): Promise<number> {
    return this.itemsRespository.count({
      where: {
        userId: user,
      },
    });
  }
}
