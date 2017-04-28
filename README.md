# apok
Apok Di Container, which can be easyly testes (mocking POJSO);

### ./index.js
```js
const apok = require('apok');
class Application {
  static main({argv}) {
    const container = Apok.of(__dirname)
      .match('./fixtures/*.js')
      .build();
    const user = container.getBean('User');
    user.run();
  }
}

if (module === require.main) {
  Application.main(process);
}
```

### ./fixtures/user.js

```js
class User {
  constructor(service) {
    this._service = service;
  }
  run() {
    this._service.log();
  }
  static lazytonUser(Types) {
    return new User(Types.Service());
  }
}

module.exports = User2;
```

### ./fixtures/service.js
```js
class Service {
  log() {
    console.log('I\'am running');
   }
  static singletonService() {
    return new Service();
  }
}

module.exports = Service;
```
