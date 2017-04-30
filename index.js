const globby = require('globby');
const path = require('path');

/**
 * Apok
 */
class Apok {
  /**
   * Constructor for dependency injection container
   * @param  {String} dirname mount point
   */
  constructor(dirname) {
    this._dirname = dirname;
    this._cache = {};
    this._patterns = [];
    this._context = {};
    this._snapshots = [];
  }
  /**
   * Match file name pattern (lookup path)
   * @param  {String} pattern [description]
   * @return {Apok} this context
   */
  match(pattern) {
    this._patterns.push(pattern);
    return this;
  }
  /**
   * Build container
   * @return {Apok} builded container with context
   */
  build() {
    const required = this._require();
    return required.reduce(this._inject, this);
  }
  /**
   * [_require description]
   * @return {[type]} [description]
   */
  _require() {
    const files = this._load();
    return files.map(require.bind(require));
  }

  /**
   * [_load description]
   * @return {[type]} [description]
   */
  _load() {
    let filePatterns = this._patterns.map(this._join);
    return globby.sync(filePatterns);
  }
  /**
   * Join full path with pattern
   * @param  {String} pattern globby pattern
   * @return {String} full path pattern
   */
  _join(pattern) {
    return path.join(this._dirname, pattern);
  }
  /**
   * Injects constructors to context
   * @return {Object} context
   */
  _inject(self, clazz) {
    const properties = Object.getOwnPropertyNames(clazz);
    return properties.reduce(this._reduce(clazz), self);
  }
  /**
   * [_reduce description]
   * @param  {[type]} self     [description]
   * @param  {[type]} property [description]
   * @return {[type]}          [description]
   */
  _reduce(clazz) {
    return (self, prop) => {
      if (typeof clazz[prop] !== 'function') {
        return self;
      }
      const object = {
        [prop](...args) {
          let instance;
          if (clazz[prop].isVisited) {
            throw new TypeError(`Cycle in ${clazz.name}.${prop}()!`);
          }
          clazz[prop].isVisited = true;
          if (clazz[prop].length === 0) {
            instance = self._singleton(prop, clazz[prop].bind(self, ...args));
          } else {
            instance = clazz[prop].bind(self, ...args)();
          }
          delete clazz[prop].isVisited;
          return instance;
        },
      }
      return Object.assign(self, object);
    };
  }
  /**
   * Caches result of callback with key value
   * @param  {String} key string which describes bean created in constructor
   * @param  {Function} constructor code block for bean creation
   * @return {Object} returns new or cached value
   */
  _singleton(bean, constructor) {
    if (!(bean in this._cache)) {
      this._cache[bean] = constructor();
    }
    return this._cache[bean];
  }
  /**
   * [snapshot description]
   * @return {[type]} [description]
   */
  snapshot() {
    this._snapshots.push(Object.assign({}, this._cache));
  }
  /**
   * [restore description]
   * @return {[type]} [description]
   */
  restore() {
    this._cache = this._snapshots.pop();
  }
  /**
   * Static factory
   * @param  {Srging} dirname mount point
   * @return {Apok} new container
   */
  static of(dirname) {
    const container = new Apok(dirname);
    container._load = container._load.bind(container);
    container._join = container._join.bind(container);
    container._inject = container._inject.bind(container);
    container._reduce = container._reduce.bind(container);
    container._singleton = container._singleton.bind(container);
    return container;
  }
}

module.exports = Apok;
