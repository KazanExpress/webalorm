import { IStorable } from './istorable';
export declare class Entity implements IStorable {
    constructor(options: any);
    repository: any;
    $save(): Promise<void>;
    $delete(): Promise<void>;
}
