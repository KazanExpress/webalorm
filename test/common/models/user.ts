import { Record } from '../../..';
import { Product } from './product';
import { RecordDataMap } from '../../../src/apiMap';

export interface IUserOptions {
  name: string;
  birthDate: Date;
  cart: Product[];
}

export class User extends Record implements IUserOptions {
  public name: string;

  public birthDate: Date;

  public cart: Product[];

  constructor(options: IUserOptions, repo?) {
    super(options, repo);
    this.name = options.name;
    this.birthDate = options.birthDate;
    this.cart = options.cart;
  }
}

export class UserApiMap implements RecordDataMap<typeof User> {
  public async create(
    ormOptions: IUserOptions,
    { username }: { username: string; password: string }
  ): Promise<IUserOptions> {
    return {
      birthDate: new Date(),
      cart: [],
      name: username
    };
  }

  public async delete() {
    return {
      birthDate: new Date(),
      cart: [],
      name: 'asd'
    };
  }

  public update = undefined;
  public read = undefined;
}
