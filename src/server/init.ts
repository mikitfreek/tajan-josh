// import { Host } from './Host.js'
const { Host } = require('./core/Host')

class App {
  constructor() {
    return new Host()
    // console.log("helloworld")
  }
}

new App()