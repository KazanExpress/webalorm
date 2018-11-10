"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const repository_1 = require("../repository");
const fallback_1 = require("../drivers/fallback");
const debug_1 = require("../debug");
class Connection {
    /**
     * Creates an instance of WebOrm.
     * @param connectionName the name of the connection to the storage. Namespaces all respositories invoked from the instance.
     * @param drivers determine a variety of drivers the orm can select from. The first one that fits for the environment is selected.
     * @param repositories sets the relation of a repository name to its contents' prototype.
     * @param apiMap maps the API calls onto the current entity structure
     */
    constructor(connectionName, drivers, repositories, apiMap // TODO
    ) {
        this.connectionName = connectionName;
        this.drivers = drivers;
        this.apiMap = apiMap;
        /**
         * A current map of bound repositories
         */
        this.repositories = {};
        // Select the first supported driver from the bunch
        const SupportedDriver = drivers.find(d => d.isSupported);
        if (SupportedDriver) {
            // TODO: multi-driver mode
            debug_1.Debug.log(this.connectionName, 'orm', `Using driver "${SupportedDriver.name}" as the first supported driver`);
            this.currentDriver = new SupportedDriver(this);
        }
        else {
            debug_1.Debug.warn(this.connectionName, 'orm', 'No supported driver provided. Using fallback.');
            this.currentDriver = new fallback_1.FallbackDriver(this);
        }
        let reProxy;
        if (!Proxy) {
            debug_1.Debug.warn(this.connectionName, 'orm', `window.Proxy is unavailable. Using insufficient property forwarding.`);
            reProxy = (repoName) => Object.defineProperty(this, repoName, {
                get: () => this.repositories[repoName],
            });
        }
        for (const repoName in repositories) {
            const entityConstructor = repositories[repoName];
            this.repositories[repoName] = new repository_1.Repository(repoName, this, entityConstructor);
            reProxy && reProxy(repoName);
        }
        if (Proxy) {
            debug_1.Debug.log(this.connectionName, 'orm', `window.Proxy is available. Using modern property forwarding.`);
            return new Proxy(this, {
                get(target, key) {
                    if (!target.repositories[key]) {
                        if (!target[key]) {
                            debug_1.Debug.log(target.connectionName, 'orm', `Repository "${key}" is not registered upon initialization. No other property with the same name was found.`);
                        }
                        return target[key];
                    }
                    return target.repositories[key];
                }
            });
        }
    }
    static debug(type, exceptions) {
        if (typeof type === 'boolean') {
            debug_1.Debug.state = (type ? 'enabled' : 'disabled');
        }
        else {
            debug_1.Debug.state = ('custom');
            debug_1.Debug.map[type] = exceptions || !debug_1.Debug.map[type];
        }
    }
}
exports.Connection = Connection;
//# sourceMappingURL=constructor.js.map