import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ListItem } from './entities/list-item.entity';
import { PaginationArgs } from '../common/dto/args/pagination.arg';
import { List } from '../lists/entities/list.entity';
import { SearchArgs } from '../common/dto/args/search.arg';

@Injectable()
export class ListItemService {
  constructor(
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,
  ) {}
  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {
    const newListItem = this.listItemRepository.create({
      ...createListItemInput,
    });
    await this.listItemRepository.save(newListItem);
    return this.findOne(newListItem.id);
  }

  async findAll(
    list: List,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<ListItem[]> {
    const queryBuilder = this.listItemRepository.createQueryBuilder('listItem');
    queryBuilder
      .innerJoinAndSelect('listItem.listId', 'listId')
      .where('listItem.listId = :listId', { listId: list.id })
      .limit(paginationArgs.limit)
      .offset(paginationArgs.offset);

    if (searchArgs.search) {
      queryBuilder.andWhere('listItem.name ilike :search', {
        search: `%${searchArgs.search}%`,
      });
    }

    return queryBuilder.getMany();
  }

  findOne(id: string): Promise<ListItem> {
    const listItem = this.listItemRepository.findOne({ where: { id } });
    if (!listItem) {
      throw new NotFoundException(`List Item with ID ${id} not found`);
    }
    return listItem;
  }

  async update(
    id: string,
    updateListItemInput: UpdateListItemInput,
  ): Promise<ListItem> {
    await this.listItemRepository.update(id, updateListItemInput);
    return this.findOne(id);
  }

  remove(id: string) {
    return `This action removes a #${id} listItem`;
  }

  countListItemsByList(list: List): Promise<number> {
    return this.listItemRepository.count({ where: { listId: list } });
  }
}
