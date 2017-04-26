const cache = Symbol(':cache');

/**
 * Apok Dependency Injection Container
 */
class Apok {
  /**
   * Constructor for dependency injection container
   * @constructor
   */
  constructor() {
    this[cache] = new Map();
  }
  /**
   * Returns executed method for some interface method
   * that should be implmented in derived containers classes
   * @param  {String} bean some string that describes implemented bean factory
   * @return {Object} instanciated class
   */
  getBean(bean) {
    return this[bean]();
  }
  /**
   * Lazy object initialization helper
   * @param  {Function} constructor code block for bean creation
   * @return {Proxy} proxy for lazy created object
   */
  lazy(constructor) {
    let instance = null;
    return new Proxy({}, {
      get(target, prop) {
        if (!instance) {
          instance = constructor();
        }
        return instance[prop];
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
    if (this[cache].has(bean)) {
      this[cache].set(bean, constructor());
    }
    return this[cache].get(bean);
  }
}

module.exports = Apok;
