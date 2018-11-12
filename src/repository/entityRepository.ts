import { DataMap } from '../drivers/api';
import { QueryResult } from '../queryResult';
import { Entity, IStorable, IStorableConstructor } from '../storable';
import { Key } from '../util';
import { IRepoConnection, Repository } from './base';

type PartialWithId<T, ID, IDKey extends Key> = Partial<T> & {
  [key in IDKey]: ID;
};

type Arg<T extends undefined | ((arg: any) => any)> = T extends (arg: infer U) => any ? U : undefined;

export class EntityRepository<
  // TODO: hide most of the generic params from end-user..?
  DM extends DataMap<E>,
  C extends IStorableConstructor<E>,
  E extends IStorable = InstanceType<C>,
  A extends ConstructorParameters<C>[0] = ConstructorParameters<C>[0],
  ID = E extends Entity<string, infer IdType> ? IdType : any,
  IDKey extends string = E extends Entity<infer IdKey, unknown> ? IdKey : string,
> extends Repository<DM, C, E, A> {
  public readonly columns: Array<string> = [];
  public readonly primaryKey: string | number;

  constructor(
    name: string,
    connection: IRepoConnection,
    entity: C
  ) {
    super(name, connection, entity);
    this.primaryKey = entity.prototype.__id__;

    if (entity.prototype.__col__) {
      this.columns = Object.keys(entity.prototype.__col__);
      delete entity.prototype.__col__;
    } else {
      this.columns = Object.keys(entity.prototype);
    }
  }

  public async add(
    options: A,
    // TODO: up to debate - singular arguments always or multiple args inference?
    apiOptions?: Arg<DM['create']>
  ) {
    const instance = new this.Data(options);

    try {
      // Call local driver changes synchronously
      const queryResult = new QueryResult<E>(true, await this.connection.currentDriver.create(this.name, instance));

      // Call api driver asynchronously
      if (apiOptions && this.connection.apiDriver) {
        this.connection.apiDriver.create(this.name, apiOptions).then(res => {
          queryResult.result = res;
        }).catch(e => {
          queryResult.error = e;
        });
      }

      return queryResult;
    } catch (e) {
      // TODO: logs
      return new QueryResult<E>(false, instance, e);
    }
  }

  public get(id: ID): QueryResult<E> {
    return new QueryResult(
      true,
      new this.Data({})
    );
  }

  public update(entity: PartialWithId<A, ID, IDKey>): QueryResult<E> {
    return new QueryResult(
      true,
      new this.Data({})
    );
  }

  public updateById(id: ID, query: (entity: E) => Partial<A>): QueryResult<E> {
    return new QueryResult(
      true,
      new this.Data(query({} as any))
    );
  }

  public delete(entity: PartialWithId<A, ID, IDKey> | ID): QueryResult<E> {
    return new QueryResult(
      true,
      new this.Data({})
    );
  }

  // TODO: Find, find by, etc...

  public count() {
    // TODO: count entities
  }
}
