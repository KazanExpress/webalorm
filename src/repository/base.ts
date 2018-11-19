import { Debug, Debugable, DebugType } from '../debug';
import { Driver } from '../drivers';
import { ApiDriver, DataMap } from '../drivers/api';
import { IStorableConstructor, Storable } from '../storable';

export interface IRepoConnectionInternal {
  name: string;
  currentDriver: Driver;
}

export interface IRepoConnection extends IRepoConnectionInternal{
  apiDriver?: ApiDriver;
}

export interface IRepoData {
  name: string;
}

export class Repository<
  DM extends DataMap<C, E, A>,
  C extends IStorableConstructor<E>,
  E extends Storable = InstanceType<C>,
  A extends ConstructorParameters<C>[0] = ConstructorParameters<C>[0],
> extends Debugable implements IRepoData {
  protected readonly $debugType: DebugType = `db:${this.name.toLowerCase()}` as DebugType;
  protected readonly connection: IRepoConnectionInternal;
  public readonly $connectionName: string;

  constructor(
    public name: string,
    connection: IRepoConnection,
    private Data: C
  ) {
    super();
    this.connection = connection;
    this.$connectionName = connection.name;

    this.api = connection.apiDriver;

    if (/* this class was instantiated directly (without inheritance) */
      Repository.prototype === this.constructor.prototype
    ) {
      if (this.$debugEnabled) {
        this.$warn(`Using default empty repository.`);
      } else if (Debug.map.db) {
        this.$warn(`Using default empty repository for ${name}`, true);
      }
    }

  }

  public readonly api?: ApiDriver;

  protected makeDataInstance(options: A) {
    return new this.Data(options, this);
  }
}
