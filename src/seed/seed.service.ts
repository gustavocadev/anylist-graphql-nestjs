import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Item } from '../items/entities/item.entity';
import { ConfigService } from '@nestjs/config';
import { SEED_ITEMS, SEED_USERS } from './data/seed-data';
import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';

@Injectable()
export class SeedService {
  private isProd: boolean;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,

    private readonly configService: ConfigService,

    private readonly userService: UsersService,
    private readonly itemService: ItemsService,
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

    return true;
  }

  async deleteDatabase(): Promise<void> {
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
}
