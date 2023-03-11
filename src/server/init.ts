const { Host } = require('./core/Host')

class App {
  constructor() {
    return new Host()
  }
}

new App()