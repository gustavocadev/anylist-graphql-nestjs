import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Item } from '../items/entities/item.entity';
import { ConfigService } from '@nestjs/config';
import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';
import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';
import { List } from '../lists/entities/list.entity';
import { ListItem } from '../list-item/entities/list-item.entity';
import { ListsService } from '../lists/lists.service';
import { ListItemService } from '../list-item/list-item.service';

@Injectable()
export class SeedService {
  private isProd: boolean;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,

    @InjectRepository(List)
    private readonly listRepository: Repository<List>,

    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,

    private readonly configService: ConfigService,

    private readonly userService: UsersService,
    private readonly itemService: ItemsService,
    private readonly listService: ListsService,
    private readonly listItemService: ListItemService,
  ) {
    this.isProd = this.configService.get('STATE') === 'prod';
  }
  async executeSeed(): Promise<boolean> {
    if (this.isProd)
      throw new UnauthorizedException('Not allowed in production');

    // 1. Clean all data
    await this.deleteDatabase();

    // 2. Add data
    const users = await this.loadUsers();
    await this.loadItems(users);

    // create lists
    const lists = await this.loadLists(users);

    // create listItems with random items
    const items = await this.itemRepository.find();
    this.loadListItems(lists, items);

    return true;
  }

  async deleteDatabase(): Promise<void> {
    // await this.
    await this.listItemRepository.delete({});
    await this.listRepository.delete({});
    await this.itemRepository.delete({});
    await this.userRepository.delete({});
  }

  async loadUsers(): Promise<User[]> {
    const users = [];
    for (const user of SEED_USERS) {
      const newUser = await this.userService.create(user);
      users.push(newUser);
    }
    return users;
  }

  async loadItems(users: User[]): Promise<void> {
    const items: Promise<Item>[] = [];

    for (const item of SEED_ITEMS) {
      // needs to be floor to get a valid index, otherwise it will be out of bounds like 3 which is not valid
      const randomIdx = Math.floor(Math.random() * users.length);
      const user = users.at(randomIdx);

      const newItem = this.itemService.create(item, user);

      items.push(newItem);
    }

    await Promise.all(items);
  }

  async loadLists(users: User[]): Promise<List[]> {
    const lists: Promise<List>[] = [];

    for (const list of SEED_LISTS) {
      // needs to be floor to get a valid index, otherwise it will be out of bounds like 3 which is not valid
      const randomIdx = Math.floor(Math.random() * users.length);
      const user = users.at(randomIdx);

      const newList = this.listService.create(list, user);

      lists.push(newList);
    }

    return await Promise.all(lists);
  }

  async loadListItems(lists: List[], items: Item[]): Promise<void> {
    const listItems: Promise<ListItem>[] = [];

    for (const list of lists) {
      const randomIdx = Math.floor(Math.random() * items.length);
      const item = items.at(randomIdx);

      const newListItem = this.listItemService.create({
        itemId: item,
        listId: list,
        quantity: Math.round(Math.random() * 10),
      });

      listItems.push(newListItem);
    }

    await Promise.all(listItems);
  }
}
