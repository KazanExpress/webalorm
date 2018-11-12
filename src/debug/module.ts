const LOG_PREFIX = (name: string) => name ? `[WebRM:${name}]` : `[WebRM]`;

/**
 * A type of debug errors
 *
 * - `soft` - informative, only logs to console
 * - `hard` - throws exceptions, forcing proper error-handling
 */
export type ExceptionType = 'soft' | 'hard';

/**
 * Dictates the type of debug to set
 *
 * - `*` - debug everything
 * - `connection` - debug the orm connection
 * - `driver` - debug all drivers
 * - `driver:${name}` - debug a driver with ${name}
 * - `db` - debug all repositories
 * - `db:${name}` - debug a repo with ${name}
 * - `db:${name}:entity` - debug all entities in the repository
 * - `db:${name}:entity:${name}` - debug entity ${name}
 */
export type DebugType = '*'
  | 'connection'
  | 'driver'
  // tslint:disable-next-line:no-invalid-template-strings - Need this for correct autocomplete
  | 'driver:${name}'
  | 'db'
  // tslint:disable-next-line:no-invalid-template-strings - Need this for correct autocomplete
  | 'db:${name}'
  // tslint:disable-next-line:no-invalid-template-strings - Need this for correct autocomplete
  | 'db:${name}:entity';

export type DebugState = 'enabled' | 'disabled' | 'custom';

/**
 * Maps all debug types to all errors types, telling which debug type will throw
 */
export type IDebugMap = Partial<{
  [key: string]: boolean | ExceptionType;
}>;

export type LogLevel = 'log' | 'debug' | 'warn' | 'error';

export abstract class Debug {
  private constructor() {}

  /**
   * Shows the current debug state of WebRM
   *
   * - `enabled` - all the logs and exceptions are enabled
   * - `custom` - custom rules are set via a `debug()` function
   * - `disabled` - all the logs and most exceptions are suppressed
   */
  public static state: DebugState = 'disabled';

  /**
   * Contains the map for all debug types and their respective error types for the ORM.
   */
  public static readonly map: IDebugMap = {};


  /**
   * `true` if any debug is enabled
   */
  public static get isEnabled() { return this.state !== 'disabled'; }

  public static error(instanceName: string, type: string, message: any);
  public static error(instanceName: string, type: RegExp, message: any);
  public static error(instanceName: string, type: DebugType, message: any);
  public static error(instanceName: string, type: any, message: any) {
    return this.print(instanceName, type, message, 'error');
  }

  public static log(instanceName: string, type: string, message: any);
  public static log(instanceName: string, type: RegExp, message: any);
  public static log(instanceName: string, type: DebugType, message: any);
  public static log(instanceName: string, type: any, message: any) {
    return this.print(instanceName, type, message, 'log');
  }

  public static warn(instanceName: string, type: string, message: any);
  public static warn(instanceName: string, type: RegExp, message: any);
  public static warn(instanceName: string, type: DebugType, message: any);
  public static warn(instanceName: string, type: any, message: any) {
    return this.print(instanceName, type, message, 'warn');
  }


  /**
   * Returns the current error type for a specific type of debugging
   */
  public static errorTypeFor(type: string): boolean | ExceptionType;
  public static errorTypeFor(type: RegExp): boolean | ExceptionType;
  public static errorTypeFor(type: DebugType): boolean | ExceptionType;
  public static errorTypeFor(type: string | RegExp | DebugType): boolean | ExceptionType {
    if (this.map['*']) { return this.map['*']!; }

    const isString = (t): t is string => typeof t === 'string';

    if (isString(type) && this.map[type]) {
      return this.map[type]!;
    }

    if (isString(type)) {
      const matchingType = Object.keys(this.map)
        .find(t => !!t && t.includes(type) && !!this.map[t]) as ExceptionType | undefined;

      return matchingType || false;
    }

    return (Object.keys(this.map).find(t => type.test(t)) as ExceptionType | undefined) || false;
  }


  public static print(instanceName: string, type: any, message: any, level: LogLevel) {
    if (this.state !== 'disabled') {
      const errorType = this.errorTypeFor(type);
      if (errorType) {
        if (errorType === 'hard' && level === 'error') {
          throw new Error(`${LOG_PREFIX(instanceName)}:${type} - ${message}`);
        } else {
          console[level](`%c${LOG_PREFIX(instanceName)}%c:%c${type}%c - `, message,
            'color: purple',
            'color: initial',
            'color: blue',
            'color: initial'
          );
        }
      }
    }
  }

  private static decoratedLogs: any = {};

  public static prints(message: any, level?: LogLevel, type?: string);
  public static prints(message: any, level?: LogLevel, type?: DebugType);
  public static prints(message: any, level?: LogLevel, type?: RegExp);
  public static prints(message: any, level: LogLevel = 'log', type: any = '*') {
    return (target, key: string, desc: PropertyDescriptor) => {
      Object.defineProperty(this.decoratedLogs, key, desc || {
        value: undefined,
        writable: true,
        enumerable: true
      });
      Object.defineProperty(target, key, {
        get: () => {
          this.print('', type, message, level);

          return this.decoratedLogs[key];
        },
        set: v => {
          this.decoratedLogs[key] = v;
        }
      });
    };
  }
}