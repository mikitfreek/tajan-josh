// import { checkPrime } from "crypto"

// import { Deck } from './Deck'
const { Deck } = require('./models/Deck')
const { Client } = require('./models/Client')
const { Room } = require('./models/Room')

const { v4: uuidv4 } = require('uuid')

const { Logs } = require('./Logs')
const Logger = new Logs()
// Import
const config = require('../game.config.json')
const hostconfig = require('../host.config.json')

const randomColor = () => { return Math.floor(Math.random() * 16777215).toString(16) }

const HOST_SERVER = 'https://infinite-mesa-09265.herokuapp.com'

class Game {
  clients: any
  rooms: any
  _rooms: any

  constructor() {
    this.clients = {}
    this.rooms = []
    this._rooms = []
  }

  async connect(ws, req) { //, roomCode
    let connectionId = uuidv4();
    Logger.log("New connection: " + connectionId, 'warning')

    // let clientId = connectionId
    // clientId = this.init(ws, connectId) //await; , req
    const payLoad = {
      'method': 'connect',
      'clientId': connectionId
    }
    ws.send(JSON.stringify(payLoad))
  
    // refactored: Set roomCode 
    // if(arguments.length === 3){
    //   const req = { clientId: clientId, roomId: roomCode }
    //   this.join(req)
    // }
    // else this.clients[clientId].room = 'lobby'
    // console.log(clientId)
  
    // Message from client
    ws.on('message', (msg) => this.message(msg, ws, connectionId))
  
    // Close
    ws.on('close', () => {
      // clients[clientId].active = false
      // this.deleteClientData(clientId) // important
      Logger.log('Connection closed: ' + connectionId, 'warning')
      // clearInterval(id)
    })
    // var id = setInterval(function() {
    //   // console.log('websocket connection');
    //   ws.send(JSON.stringify(ws.id), function() {  }) //new Date()
    // }, 60000)
    // console.log(Number(Object.keys(clients).length))
  }

  // async init(ws, req, connectId) {
  //   return new Promise((resolve, reject) => {
  //     const payLoad = {
  //       'method': 'connect',
  //       'clientId': connectId
  //     }
  //     ws.send(JSON.stringify(payLoad))

  //     ws.on('message', async (msg) => {
  //       let clientId
  //       if (JSON.parse(msg).method !== "load")
  //         clientId = connectId
  //       else {
          
  //         clientId = await JSON.parse(msg).id
  //         console.log(clientId)
  //         // check if another client has same name   // ws.id = req.headers['sec-websocket-key'];
  //         if (typeof this.clients[clientId] === "undefined") {
  //           const clientIp = req.socket.remoteAddress;
  //           const clientName = `client_${Object.keys(this.clients).length}_${Date.now()}`//req.url.replace('/?uuid=', '')

  //           const clientData = new Client(clientName, clientId, ws, clientIp, config.cardsStart)
  //           this.clients[clientId] = clientData

  //           console.log('* >======== ' + clientName + ' ========>');
  //           console.log('New connection: ' + clientId);
  //         }
  //         // return clientId
  //         resolve(clientId)
  //       }
  //     })
  //   })
  // }

  message(msg, ws, connectionId) {
    const req = JSON.parse(msg) //.utf8Data
    if (req.method === 'load')
      this.load(req, ws, connectionId)
    else if (req.method === 'create')
      this.create(req)
    else if (req.method === 'request-join')
      this.join(req)
    // else if (req.method === 'join')
    //   this.join(req)
    else if (req.method === 'draw')
      this.draw(req)
    else if (req.method === 'move')
      this.move(req)


    Logger.print(req)
  }

  //----------
  // Messeges
  //----------

  load(req, ws, connectionId) {
    // validate
    const clientId = req.id?.length === 36 ? req.id : connectionId
    let _clientName, clientUndefined = false;
    // check if another client has same name   // ws.id = req.headers['sec-websocket-key'];
    if (typeof this.clients[clientId] === "undefined") {
      clientUndefined = true
      const clientIp = ws._socket?.remoteAddress //req.socket.remoteAddress;
      const elapsed = Date.now();
      const now = new Date(elapsed);
      const clientName = `client_${now.getDate()}_${now.getMonth() + 1}_${now.getHours()}${now.getMinutes()}_${now.getSeconds()}_${now.getMilliseconds()}`//req.url.replace('/?uuid=', '') // ${Object.keys(this.clients).length}
      _clientName= clientName

      const clientData = new Client(clientName, clientId, ws, clientIp, config.cardsStart)
      this.clients[clientId] = clientData
    }

    if (clientId !== connectionId && clientUndefined) {
      Logger.log('* >======== ' + _clientName + ' ========>', 'info');
      Logger.log('Client got back after a while: ' + clientId, 'info');
    }
    else if (clientId !== connectionId && !clientUndefined) {
      Logger.log('* >======== ' + _clientName + ' ========>', 'info');
      Logger.log('Loaded exiting client: ' + clientId, 'info');
    }
    else if (clientId === connectionId && clientUndefined) {
      Logger.log('* >======== ' + _clientName + ' ========>', 'info');
      Logger.log('New client: ' + clientId, 'info');
    }
    else if (clientId === connectionId && !clientUndefined) {
      Logger.log('* >======== ' + _clientName + ' ========>', 'info');
      Logger.log('Memory is has not been delated', 'warning');
      Logger.log('Loaded exiting client: ' + clientId, 'info');
    }
    else {
      Logger.log('* >======== ' + _clientName + ' ========>', 'info');
      Logger.log('WTF is happening?', 'warning');
      Logger.log('Loaded exiting client: ' + clientId, 'info');
    }
  }

  create(req) {
    // validate
    const hostId = req.hostId?.length === 36 ? req.hostId : 0//connectionId
    // TODO: Give another client host if previons left lobby
    const roomId = hostId.split('-')[0]
    // client.room = roomId
    this.clients[hostId].room = roomId
    Logger.log('Room created successfully by client: ' + hostId + ', with id: ' + roomId)
    Logger.log((process.env.PORT!==undefined) 
    ? `${HOST_SERVER}${process.env.PORT!='' ? `: ${process.env.PORT}` : ''}/#${roomId}` 
    : `http://localhost:${hostconfig.port}/#${roomId}`)

    const roomData = new Room(roomId, hostId)
    
    this.rooms[roomId] = roomData.public()
    this._rooms[roomId] = roomData.private()

    this.joinRoom(hostId, this.rooms[roomId])

    const payLoad = {
      'method': 'create',
      'room': this.rooms[roomId]
    }

    const ws = this.clients[hostId].connection
    ws.send(JSON.stringify(payLoad))
    // console.log(rooms)
  }

  join(req) {
    // validate
    const clientId = req.clientId?.length === 36 ? req.clientId : 0 //connectionId
    const roomId = req.roomId?.length === 8 ? req.roomId : 0
    // if exists
    if (typeof this.rooms[roomId] !== 'undefined') {
      // client.room = roomId
      this.clients[clientId].room = roomId
      // &&  typeof rooms[roomId].clients !== 'undefined' 
      //&&  
      // if(!rooms[roomId].clients.some(c => c.clientId === clientId) ) {

      if ((typeof this.rooms[roomId].clients !== 'undefined'
        && this.rooms[roomId].clients.some(c => c.id !== clientId))
        || typeof this.rooms[roomId].clients === 'undefined')
        Logger.log(': room clients undefined')

      this.joinRoom(clientId, this.rooms[roomId])

      const payLoad = {
        'method': 'join',
        'clientId': clientId,
        'room': this.rooms[roomId]
      }

      this.rooms[roomId].clients.forEach(c => {
        this.clients[c.id].connection.send(JSON.stringify(payLoad))
      })

      Logger.log('Room: ' + roomId + ' joined successfully by client: ' + clientId)
      // console.log(rooms[roomId].clients)

      // const ws = clients[clientId].connection
      // ws.send(JSON.stringify(payLoad))
    }
    // if doesnt exist
    else {
      Logger.log('Get Down! Client ' + clientId + ' is shooting!! (unmatched room code)')
      const payLoad = {
        'method': 'error',
        'info': 'Room not found'
      }

      const ws = this.clients[clientId].connection

      ws.send(JSON.stringify(payLoad))

      this.overloadProtection(ws, clientId)
    }
  }

  draw(req) {
    const roomId = req.roomId
    const room = this.rooms[roomId]

    const newDeck = new Deck();
    newDeck.shuffle()

    room.clients.forEach(c => {
      this.clients[c.id].cards = []
    })
    // Draw cards
    // 2 times for all, then only for
    for (let i = 0; i < config.cardsMax; i++)
      room.clients.forEach(c => {
        const client = this.clients[c.id]
        if (client.score - i > 0)
          this.clients[c.id].cards.push(newDeck.deal())
      })
    Logger.log('Dealing cards in room: ' + room.id)

    room.clients.forEach(c => {
      Logger.log(c.id + ' received cards')
      let cards = []
      this.clients[c.id].cards.forEach(card => {
        cards.push(card)
      })
      const payLoad = {
        'method': 'draw',
        'cards': cards
      }
      this.clients[c.id].connection.send(JSON.stringify(payLoad))
    })
    this.currentPlayer(roomId)
  }

  move(req) {
    const roomId = req.roomId
    const room = this.rooms[roomId]
    const _room = this._rooms[roomId]
    const bid = req.bid

    // action: raise
    if (bid === 'raise') {
      if (_room.bid === null) this._rooms[roomId].bid = 0
      // raise = Number(); ranks[raise]

      // check if bid>room.lastbid
      if (bid > _room.bid) {
        this._rooms[roomId].bid = bid
        ++this._rooms[roomId].last
        if (_room.last >= room.clients.length) this._rooms[roomId].last = 0
        Logger.log('gituwa mordeczko dobry zakładzik')
        // room

        //send
        room.clients.forEach(c => {
          const payLoad = {
            'method': 'move',
            'type': 'raise'
          }
          this.clients[c.id].connection.send(JSON.stringify(payLoad))
        })
        this.currentPlayer(roomId)
      } // else report error
      else Logger.log('Error: smaller bid detected')
    }
    // action: check
    else {
      const stat = this.check(room, bid)

      let winner = (stat) ? 1 : 0;
      //send
      room.clients.forEach(c => {
        const payLoad = {
          'method': 'move',
          'type': 'check',
          'stat': winner
        }
        this.clients[c.id].connection.send(JSON.stringify(payLoad))
      })
      ++this._rooms[roomId].last
      if (_room.last >= room.clients.length) this._rooms[roomId].last = 0
    }
    // ++_rooms[roomId].last
  }

  //----------
  // Methods
  //----------

  joinRoom(clientId, room) {
    let client = this.clients[clientId]
    if (client.color === 'init')
      client.color = randomColor()

    room.clients.push({
      'id': clientId,
      'name': client.name,
      'color': client.color
    })
  }

  currentPlayer(roomId) {
    const room = this.rooms[roomId]
    const _room = this._rooms[roomId]
    const payLoad = {
      'method': 'turn'
    }
    // this.clients[_room.last - 1].connection.send(JSON.stringify(payLoad))
    room.clients.forEach((c, i) => {
      this.clients[c.id].connection.send(JSON.stringify(payLoad)) // if (i === _room.last) 
      Logger.log(c.id + " - " + i)
    })
    // room.clients.forEach((c, i) => {
    //   if (i === _room.last) this.clients[c.id].connection.send(JSON.stringify(payLoad))
    // })
  }

  check(room, bid) {
    // sum cards on hands
    let _cards = []
    room.clients?.forEach(c => {
      this.clients[c.id].cards.forEach(card => {
        _cards.push(card)
      })
    })
    Logger.log(_cards)

    // check if cards contain bid
    let counts = {
      figures: {},
      colors: {},
      figuresByColors: {
        'k': [],
        'h': [],
        't': [],
        'p': []
      }
    };
    // for(col in pokerColors)
    //   counts.figuresByColors[col] = []

    _cards.forEach(card => {
      const c = counts.figures[card[0]]
      counts.figures[card[0]] = c ? c + 1 : 1;
      const d = counts.colors[card[1]]
      counts.colors[card[1]] = d ? d + 1 : 1;
      // const b = counts.figuresByColors[card[1] + card[0]]
      // counts.figuresByColors[card[1] + card[0]] = b ? b + 1 : 1;

      // if (i<1) counts.figuresByColors[card[1]] = []
      counts.figuresByColors[card[1]].push(
        card[0]
      )
    })
    Logger.log('===================')
    Logger.log(counts.figures)
    Logger.log(counts.colors)
    Logger.log(counts.figuresByColors)
    // console.log(counts.colorsByFig['h'][pokerSymbols[4]])

    // const ranks9 = [
    //   'Royal flush',      // 09 01 02 // 9k   // 2nd color
    //   'Straight flush',   // 08 01 09 // 89k  // 2nd color
    //   'Four of a kind',   // 07 02 00 // 79
    //   'Flush',            // 06 01 00 // 6k   // 2nd color
    //   'Full house',       // 05 02 03 // 59T
    //   'Three of a kind',  // 04 02 00 // 49
    //   'Straight',         // 03 09 00 // 39
    //   'Two pairs',        // 02 03 02 // 29T  03 03 02 02 // sort max to begin
    //   'Pair',             // 01 02 00 // 19   02 02 
    //   'High card',        // 00 02 00 // 09   02
    // ]
    //_bid='5QT'//'0Q'
    // bid.match(/.{1,2}/g);
    let _bid = bid
    Logger.log(bid)
    _bid.match(/.{1,1}/g);
    let stat = false;
    const f0 = counts.figures[_bid[1]],
      f1 = counts.figures[_bid[2]],
      c0 = counts.colors[_bid[1]]
    switch (Number(_bid[0])) {
      case 9: // Royal flush
        const z = config.pokerSymbols.length - 5
        const arr = counts.figuresByColors[_bid[1]]
        if (arr.includes(counts.figures[config.pokerSymbols[z]])
          && arr.includes(counts.figures[config.pokerSymbols[z + 1]])
          && arr.includes(counts.figures[config.pokerSymbols[z + 2]])
          && arr.includes(counts.figures[config.pokerSymbols[z + 3]])
          && arr.includes(counts.figures[config.pokerSymbols[z + 4]])
        ) stat = true //counts.colorsByFig[card[1]].card[0]
        break;
      case 8: // Straight flush
        const w = config.pokerSymbols.indexOf(_bid[1])
        const arr1 = counts.figuresByColors[_bid[2]]
        if (arr1.includes(counts.figures[config.pokerSymbols[w]])
          && arr1.includes(counts.figures[config.pokerSymbols[w + 1]])
          && arr1.includes(counts.figures[config.pokerSymbols[w + 2]])
          && arr1.includes(counts.figures[config.pokerSymbols[w + 3]])
          && arr1.includes(counts.figures[config.pokerSymbols[w + 4]])
        ) stat = true
        break;
      case 7: // Four of a kind
        if (f0 >= 4) stat = true
        break;
      case 6: // Flush
        if (c0 >= 4) stat = true
        break;
      case 5: // Full house
        if (f0 >= 3 && f1 >= 2) stat = true
        break;
      case 4: // Three of a kind
        if (f0 >= 3) stat = true
        break;
      case 3: // Straight
        //f0
        // counts.figures[_bid[1]]
        const y = config.pokerSymbols.indexOf(_bid[1])
        if (f0 >= 1
          && counts.figures[config.pokerSymbols[y + 1]] >= 1
          && counts.figures[config.pokerSymbols[y + 2]] >= 1
          && counts.figures[config.pokerSymbols[y + 3]] >= 1
          && counts.figures[config.pokerSymbols[y + 4]] >= 1
        ) stat = true
        break;
      case 2: // Two pairs
        if (f0 >= 2 && f1 >= 2) stat = true
        break;
      case 1: // Pair;
        if (f0 >= 2) stat = true
        break;
      case 0: // High card
        if (f0 >= 1) stat = true
        break;
    }
    return stat
    // const w0 = clients[room.clients[_room.last].id]
    // const w1 = clients[room.clients[_room.last+1].id]

    // rooms[roomId].clients.forEach(c => {
    //   clients[c.id].connection.send(JSON.stringify(payLoad))
    // })
  }

  //----------
  // Destroy
  //----------

  deleteClientData(param) {
    const clientId = param
    const roomId = this.clients[clientId].room 
    if (typeof this.rooms !== 'undefined' && roomId !== 'lobby' && roomId !== 'init') {

      const room = this.rooms[roomId]
      // room.clients.splice((room.clients[clientId].index), 1);
      // let index = Object.keys(clients).findIndex( e => {
      //   if (e === clientId) { return true; } });

      // console.log(Object.keys(clients))

      if (typeof room !== 'undefined'
        && typeof room.clients !== 'undefined') {
        this.rooms[roomId].clients.forEach((c, i) => {
          if (c.id === clientId) {
            if (this.rooms[roomId].clients.length === 1) {
              Logger.log('deleted empty room: ' + roomId)
              delete this.rooms[roomId]
            } else
            delete this.rooms[roomId].clients[i]
            // if (this.rooms[roomId].clients.length === 0) {
            //   console.log('deleted empty room: ' + roomId)
            //   delete this.rooms[roomId]
            // }
          }
        })
      }
    } delete this.clients[clientId]
  }

  //----------
  // Security
  //----------

  overloadProtection(ws, clientId) {
    const payLoad = {
      'method': 'error',
      'info': 'Too many attempts'
    }
    const limit = 3, burst = 2, burstTime = 1000, burstDelay = 5000
      if (this.clients[clientId].counters.limit >= limit) {
        if (this.clients[clientId].counters.burst >= burst) {
          Logger.log('* Leaking * :: ' + clientId)
        }
        ++this.clients[clientId].counters.burst
        setTimeout(() => {
          ws.send(JSON.stringify(payLoad))
          Logger.log('* Block * :: ' + clientId)
          setTimeout(_ => --this.clients[clientId].counters.burst, burstTime)
        }, burstDelay)
      }
      ++this.clients[clientId].counters.limit
  }
}

module.exports = { Game }

// const { join } = require('path')

// const cardsMax = 5,//5
// cardsStart = 5//2
// const pokerSymbols = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

// const pokerColors = ['k', 'h', 't', 'p']; // k: 9826, h: 9825, t: 9831, p: 9828
// // karty od 9
// const ranks09 = [
//   'Royal flush',      // 09 01 02 // // 2nd color
//   'Straight flush',   // 08 01 09 // // 2nd color
//   'Four of a kind',   // 07 02 00 // 
//   'Flush',            // 06 01 00 //... // 2nd color
//   'Full house',       // 05 02 03 // 
//   'Three of a kind',  // 04 02 00 // 
//   'Straight',         // 03 09 00 //
//   'Two pairs',        // 02 03 02 // 03 03 02 02 // sort max to begin
//   'Pair',             // 01 02 00 // 02 02 
//   'High card',        // 00 02 00 // 02
// ]

// karty do 8
// const ranks08 = [
//   'Royal flush',      // 09 01 02 // 2nd color
//   'Straight flush',   // 08 01 08_// 2nd color
//   'Four of a kind',   // 07 02 00
//   'Full house',       // 06 02 03
//   'Flush',            // 05 01 00 // 2nd color
//   'Three of a kind',  // 04 02 00
//   'Straight',         // 02 08 00
//   'Two pairs',        // 02 03 02 // sort max to begin
//   'Pair',             // 01 02 00
//   'High card',        // 00 02 00
// ]



          // const ranks9 = [
          //   'Royal flush',      // 09 01 02 // 9k   // 2nd color
          //   'Straight flush',   // 08 01 09 // 89k  // 2nd color
          //   'Four of a kind',   // 07 02 00 // 79
          //   'Flush',            // 06 01 00 // 6k   // 2nd color
          //   'Full house',       // 05 02 03 // 59T
          //   'Three of a kind',  // 04 02 00 // 49
          //   'Straight',         // 03 09 00 // 39
          //   'Two pairs',        // 02 03 02 // 29T  03 03 02 02 // sort max to begin
          //   'Pair',             // 01 02 00 // 19   02 02 
          //   'High card',        // 00 02 00 // 09   02
          // ]