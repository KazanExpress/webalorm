import { DebugType } from './module';
export declare abstract class Debugable {
    /**
     * The debug type for this class' actions
     */
    protected readonly abstract debugType: DebugType;
    /**
     * The name of the connection this class uses
     */
    abstract readonly connectionName: string;
    /**
     * `true` if the debug is enabled for this class
     */
    readonly isDebugEnabled: boolean | "soft" | "hard";
    private $logFactory;
    protected readonly $log: (message: any) => undefined;
    protected readonly $warn: (message: any) => undefined;
    protected readonly $error: (message: any) => undefined;
    protected readonly $debug: (message: any) => undefined;
}
export declare class DebugInstance extends Debugable {
    protected readonly debugType: DebugType;
    readonly connectionName: string;
    constructor(debugType: DebugType, connectionName: string);
    $log: Debugable['$log'];
    $warn: Debugable['$warn'];
    $error: Debugable['$error'];
    $debug: Debugable['$debug'];
}
