const express = require('express')
const WsServer = require('ws')
const { createServer } = require('http')
const { Game } = require('./Game')

const config = require('../host.config.json')

// const ENV_PROD = process.env.NODE_ENV === 'production'
// const ENV_DEV = process.env.NODE_ENV === 'develop'
// const { __SNOWPACK_ENV__ } = require('snowpack')
// const ENV_DEV = __SNOWPACK_ENV__.MODE

// console.log(ENV_PROD + " " + ENV_DEV + " " + process.env.NODE_ENV)

const app = express()
const server = createServer(app)

// const path = require('path')
// var chokidar = require('chokidar')

class Host {
  roomCodes: any

  constructor() {
    this.roomCodes=[]
    const wss = this.initWebSocketServer()

    const Session = new Game()

    wss.on('connection', async (ws, req) => {
      
      // Session.connect(ws, req)
      if (this.roomCodes.length !== 0) {
        const code = this.roomCodes[0];
        delete this.roomCodes[0]
        Session.connect(ws, req, code)
        console.log('Joincode: ' + code + '\n\n' + this.roomCodes)
      } else
        Session.connect(ws, req)
    })
  }
  
  // getJoinCode = () => { return this.joinCode }
  // setJoinCode = (code) => this.joinCode = code

  initWs() {
    const options = {
      noServer: true
    }
  
    return new WsServer.Server(options)
  }
  
  async initHttpServer(port) {
    // app.set('view engine', 'ejs')
  
    // if(!production) {
    //   const watcher = chokidar.watch('./build')
    //   watcher.on('ready', function() {
    //     watcher.on('all', function() {
    //       console.log("Clearing /build/ module cache from server")
    //       Object.keys(require.cache).forEach(function(id) {
    //         if (/[\/\\]build[\/\\]/.test(id)) delete require.cache[id]
    //       })
    //     })
    //   })
    // }

    // app.use(express.static(__dirname + '/../web/'));

    // app.use(async (req, res, next) => {
    //   try {
    //     const buildResult = await server.loadUrl(req.url);
    //     res.send(buildResult.contents);
    //   } catch (err) {
    //     next(err);
    //   }
    // });

    // app.use( async (req, res, next) => {
    //   require(__dirname + '/../public/')(req, res, next)
    // })
  
    

    // app.get('/', async (req, res) => {
    //   // res.redirect('/game');
    //   // res.sendFile(__dirname + '/../public/index.html');
    //   // res.render('index');
    //   // res.send("main")
    //   // try {
    //   //   const buildResult = await server.loadUrl('index.html');
    //   //   res.send(buildResult.contents);
    //   // } catch (err) {
    //   //   next(err);
    //   //   res.send(req.url);
    //   // }
    // });

    app.get('/r/:roomId', async (req, res) => {
      const roomId = req.params.roomId
      const param = roomId !== 'favicon.ico' && 
                   !roomId.includes('index') &&
                    roomId.length === 8 ? 1 : 0
      if (param) {
        console.log('app.get: ' + roomId)
        this.roomCodes.push(roomId)
        // res.sendFile(__dirname + '/../public/index.html');
        res.redirect('back');
        // res.send("hello")
        // res.render('index');

        // app.use(function (req, res, next) {
        //   require(__dirname + '/../web/')(req, res, next)
        // })
        // express.static(__dirname + '/../web')
      } else res.redirect('back');
    });

    app.use(express.static(__dirname + '/../../public'));
    // app.use('/game', express.static(__dirname + '/../public'));
    // app.use(express.static(__dirname + '/../../public/index.js'));
    // app.use(express.static(__dirname + '/../public/assets'));
    // app.use(express.static(__dirname + '/../public/style.css'));
    
    server.listen(process.env.PORT || port, () => {
      console.log('Server is working on: ')
      console.log((process.env.PORT!==undefined) 
      ? `https://infinite-mesa-09265.herokuapp.com:${process.env.PORT}`
      : `http://localhost:${port}`)
    }) // http://localhost:${process.env.PORT || port}`)

    // var server = app.listen(3000, function () {
    //   var host = 'localhost';
    //   var port = server.address().port;
    //   console.log('listening on http://'+host+':'+port+'/');
    // });
  
    return app
  }
  
  initWebSocketServer(port = config.port) {
    this.initHttpServer(port)
    const wss = this.initWs()
  
    server.on('upgrade', async (req, socket, head) => {
      try {
        wss.handleUpgrade(req, socket, head, (ws) => {
          // Do something before firing the connected event
          wss.emit('connection', ws, req)
        })
      } catch (err) {
        // Socket uprade failed
        // Close socket and clean
        console.log('Socket upgrade failed', err)
        socket.destroy()
      }
    })
  
    return wss
  }
}
module.exports = { Host }






///////////////////

///////////////////

//connect !!!!!!!!!!!!!!!!!

///////////////////////////////////////
// GAME LOGIC
///////////////////////////////////////

// // prawdopodobienstwo
// // dla kart:
// // od 9 4*6=24
// // 8 os. Full House:  ; Flush
// // 9 os. Full House:  ; Flush
// // od 8 4*7=28
// // 8 os. Full House:  ; Flush
// // 9 os. Full House:  ; Flush
// // od 7 4*8=32
// // 8 os. Full House:  ; Flush
// // 9 os. Full House:  ; Flush

// /////////////////
// // let bid = '090102'; // output from server ------> client  // ['K','K','Q','Q','Q']
// /////////////////
// // let cards = 'AhApAtKkKp'; // - ,, -
// /////////////////

// // Season enums can be grouped as static members of a class
// // class Season {
// //   // Create new instances of the same class as static attributes
// //   static Summer = new Season('summer')
// //   static Autumn = new Season('autumn')
// //   static Winter = new Season('winter')
// //   static Spring = new Season('spring')

// //   constructor(name) {
// //     this.name = name
// //   }
// // }

// // // Now we can access enums using namespaced assignments
// // // this makes it semantically clear that 'Summer' is a 'Season'
// // let season = Season.Summer

// // // We can verify whether a particular variable is a Season enum
// // console.log(season instanceof Season)
// // // true
// // console.log(Symbol('something') instanceof Season)
// // //false

// // // We can explicitly check the type based on each enums class
// // console.log(season.constructor.name)
// // 'Season'

/////////////
// 1. Draw clients random cards
// class Deck { !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


// 2. MAKE A BID / CHANGE CURRENT client

// 3. WAIT FOR CHECK()

// CHECK()
// 1. SUM ALL CARDS ON HANDS

// 2. CHECK FOR LAST BID

// 3. RESPONSE
