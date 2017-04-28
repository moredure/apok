# apok
Apok Di Container, which can be easyly testes (mocking POJSO);
Container serches for methods with next signuture `/(lazyton|lazy|factory|singleton)(.*)/`
If found this method will be edded to the context and if you `getBean('classname')` one of this method `(.*)` using for with
as well as `Types['classname']()`;

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

module.exports = User;
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
