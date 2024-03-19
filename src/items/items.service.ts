import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput } from './dto/inputs/create-item.input';
import { UpdateItemInput } from './dto/inputs/update-item.input';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRespository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput): Promise<Item> {
    const item = this.itemsRespository.create(createItemInput);
    return this.itemsRespository.save(item);
  }

  findAll() {
    return this.itemsRespository.find();
  }

  findOne(id: string): Promise<Item> {
    const product = this.itemsRespository.findOneBy({ id });

    if (!product) throw new NotFoundException(`Product #${id} not found`);

    return product;
  }

  async update(id: string, updateItemInput: UpdateItemInput): Promise<Item> {
    await this.itemsRespository.update(id, updateItemInput);
    const product = await this.findOne(id);

    if (!product) throw new NotFoundException(`Product #${id} not found`);

    return product;
  }

  async remove(id: string) {
    const item = await this.itemsRespository.findOneBy({ id });
    await this.itemsRespository.delete({
      id,
    });

    return item;
  }
}
