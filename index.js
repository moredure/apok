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
    this._cache = new Map();
    this._patterns = [];
    this._methodNamePattern = /(lazyton|lazy|factory|singleton)(.*)/;
    this._context = {};
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
    globby
      .sync(this._patterns.map(this._join.bind(this)))
      .map(require.bind(require))
      .reduce(this._inject.bind(this), this._context);
    return this;
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
  _inject(context, clazz) {
    return Object.getOwnPropertyNames(clazz)
      .filter((factoryName) => this._methodNamePattern.test(factoryName))
      .map((factoryName) => this._methodNamePattern.exec(factoryName))
      .reduce((context, [entire, scope, className]) => {
        const self = this;
        let instanciate = () => clazz[entire](context);
        return Object.assign(context, {
          [className]() {
            if (scope === 'singleton') {
              return self.singleton(className, instanciate);
            } else if (scope === 'factory') {
              return instanciate();
            } else if (scope === 'lazy') {
              return self.lazy(instanciate);
            } else if (scope === 'lazyton') {
              return self.singleton(className, () => self.lazy(instanciate));
            } else {
              throw new TypeError('Injection failed!');
            }
          },
        });
      }, context);
  }
  /**
   * Lazy initializer
   * @param  {Function} constructor constructor function
   * @return {Proxy} proxy for initialization object
   */
  lazy(constructor) {
    let instance = null;
    return new Proxy({}, {
      get(target, property) {
        if (!instance) {
          instance = constructor();
        }
        return instance[property];
      }
    });
  }
  /**
   * Caches result of callback with key value
   * @param  {String} key string which describes bean created in constructor
   * @param  {Function} constructor code block for bean creation
   * @return {Object} returns new or cached value
   */
  singleton(bean, constructor) {
    if (!this._cache.has(bean)) {
      this._cache.set(bean, constructor());
    }
    return this._cache.get(bean);
  }
  /**
   * Prototype for mocking (e.g. sinon, mocha)
   * @return {Object} context
   */
  get prototype() {
    return this._context;
  }
  /**
   * Setter for prototype cannot be set!!!
   * @throws {TypeError} If setter called error thrown
   */
  set prototype(prototype) {
    throw new TypeError('Prototype cannot be replaced!!!');
  }
  /**
   * API method to create bean from context
   * @return {Object} bean instance
   */
  getBean(bean) {
    return this._context[bean]();
  }
  /**
   * Static factory
   * @param  {Srging} dirname mount point
   * @return {Apok} new container
   */
  static of(dirname) {
    return new Apok(dirname);
  }
}
