import { IStorable } from './istorable';
import { NonEnumerable, Key } from '../util';

export class Entity<
  IDKey extends Key = string,
  ID = any
> implements IStorable {
  // TODO: check to be writable
  @NonEnumerable
  private __col__: Array<string> = [];

  @NonEnumerable
  private __idCol__?: IDKey;

  @NonEnumerable
  private __idValue__?: ID;

  constructor(options) {
    if (this.__idCol__) {
      this.__idValue__ = options[this.__idCol__];
    }
  }

  public $save() {
    return Promise.resolve();
  }

  public $delete() {
    return Promise.resolve();
  }

  public static Column(target: typeof Entity['prototype'], key: string) {
    target.__col__.push(key);
  }

  public static ID(target: typeof Entity['prototype'], key: string) {
    target.__idCol__ = key;
  }
}