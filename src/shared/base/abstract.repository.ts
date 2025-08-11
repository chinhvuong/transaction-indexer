import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';

export abstract class AbstractRepository<
  T extends ObjectLiteral,
> extends Repository<T> {
  protected constructor(
    entity: EntityTarget<T>,
    @InjectDataSource() protected readonly dataSource: DataSource,
  ) {
    super(entity, dataSource.manager);
  }
  // Common methods for all repositories can be added here
}
