import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  ObjectLiteral,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { AbstractRepository } from './abstract.repository';

export type IdType = number | string;

export abstract class AbstractService<T extends ObjectLiteral> {
  protected constructor(protected readonly repository: AbstractRepository<T>) {}

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async findById(id: IdType): Promise<T | null> {
    // eslint-disable-next-line
    return this.repository.findOne({ where: { id } as any });
  }

  async update(
    id: IdType,
    data: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    return this.repository.update(id, data);
  }

  async delete(id: IdType): Promise<void> {
    await this.repository.delete(id);
  }
}
