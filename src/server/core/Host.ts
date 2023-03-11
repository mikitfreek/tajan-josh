const express = require('express')
const WsServer = require('ws')
const { createServer } = require('http')
const { Game } = require('./Game')

const HOST_CONFIG = require('../host.config.json')

const app = express()
const server = createServer(app)

class Host {

  constructor() {

    const wss = this.initWebSocketServer()

    // init game engine
    const Session = new Game()

    wss.on('connection', async (ws, req) => {
      // create and connect user session
      Session.connect(ws, req)
    })
  }

  initWs() {
    const options = {
      noServer: true
    }

    return new WsServer.Server(options)
  }
  
  async initHttpServer(port) {

    // host client
    app.use(express.static(__dirname + '/../../public'));
    
    server.listen(process.env.PORT || port, () => {
      console.log('Server is working on: ')
      console.log((process.env.PORT!==undefined) 
      ? `https://infinite-mesa-09265.herokuapp.com:${process.env.PORT}`
      : `http://localhost:${port}`)
    })

    return app
  }
  
  initWebSocketServer(port = HOST_CONFIG.port) {
    this.initHttpServer(port)
    const wss = this.initWs()
  
    server.on('upgrade', async (req, socket, head) => {
      try {
        wss.handleUpgrade(req, socket, head, (ws) => {
          // do something before firing the connected event

          // connection event
          wss.emit('connection', ws, req)
        })
      } catch (err) {
        // socket upgrade failed
        console.log('Socket upgrade failed', err)
        // close socket
        socket.destroy()
      }
    })

    return wss
  }
}

module.exports = { Host }
