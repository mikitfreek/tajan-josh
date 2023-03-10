// import { checkPrime } from "crypto"

// import { Deck } from './Deck'
const { Deck } = require('./models/Deck')
const { Client } = require('./models/Client')
const { Room } = require('./models/Room')

const { v4: uuidv4 } = require('uuid')

const { Logs } = require('../utils/Logs')
const Logger = new Logs()
// Import
const CONFIG = require('../game.config.json')
const HOST_CONFIG = require('../host.config.json')
const HOST_SERVER = 'https://infinite-mesa-09265.herokuapp.com'

const randomColor = () => { return Math.floor(Math.random() * 16777215).toString(16) }

class Game {
  clients: any
  clientsIds: any
  rooms: any
  _rooms: any

  constructor() {
    this.clients = {}
    this.clientsIds = []
    this.rooms = []
    this._rooms = []
  }

  async connect(ws, req) { //, roomCode
    try {
      const connectionId = uuidv4();
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
      ws.on('message', async (msg) => {
        try {
          this.message(msg, ws, connectionId)
        }
        catch (err: any) {
          Logger.log(err.stack, 'error')
        }
      })
      // use req for ip gethering
      
      // Close
      ws.on('close', async () => {
        try {
          // clients[clientId].active = false
          const clientId = this.clientsIds[connectionId]
          // TODO: only set player as inactive
          // delete inactive clients data after a room is closed
          this.deleteClientData(connectionId, clientId) // TODO: important
          Logger.log('Connection closed: ' + clientId, 'warning')
          // clearInterval(id)
        }
        catch (err: any) {
          Logger.log(err.stack, 'error')
        }
      })
      // var id = setInterval(function() {
      //   // console.log('websocket connection');
      //   ws.send(JSON.stringify(ws.id), function() {  }) //new Date()
      // }, 60000)
      // console.log(Number(Object.keys(clients).length))
    }
    catch (err: any) {
      Logger.log(err.stack, 'error')
    }
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
    Logger.print(req)

    if (req.method === 'load')
      this.load(req, ws, connectionId)
    else if (req.method === 'create')
      this.create(req)
    else if (req.method === 'request-join')
      this.join(req)
    // else if (req.method === 'join')
    //   this.join(req)
    else if (req.method === 'draw')
      this.firstDraw(req)
    else if (req.method === 'move')
      this.move(req)
  }

  //----------
  // Messeges
  //----------

  load(req, ws, connectionId) {
    // validate
    const clientId = req.id?.length === 36 ? req.id : connectionId

    this.clientsIds[connectionId] = clientId
    let clientName, clientUndefined = false;
    // check if another client has same name   // ws.id = req.headers['sec-websocket-key'];
    if (typeof this.clients[clientId] === "undefined") {
      clientUndefined = true
      const clientIp = ws._socket?.remoteAddress //req.socket.remoteAddress;
      const elapsed = Date.now();
      const now = new Date(elapsed);

      // DEBUG
      clientName = `client_${now.getDate()}_${now.getMonth() + 1}_${now.getHours()}${now.getMinutes()}_${now.getSeconds()}_${now.getMilliseconds()}`//req.url.replace('/?uuid=', '') // ${Object.keys(this.clients).length}
      //
      // clientName = req.name

      const clientData = new Client(clientName, clientId, ws, clientIp, CONFIG.cardsStart)
      this.clients[clientId] = clientData
    }

    Logger.log('* >======== ' + clientName + ' ========>', clientName !== undefined ? 'info' : 'error')
    if (clientId !== connectionId && clientUndefined)
      Logger.log('Client got back after a while: ' + clientId, 'info')
    else if (clientId !== connectionId && !clientUndefined)
      Logger.log('Loaded exiting client: ' + clientId, 'info')
    else if (clientId === connectionId && clientUndefined)
      Logger.log('New client: ' + clientId, 'info')
    else if (clientId === connectionId && !clientUndefined) {
      Logger.log('Memory is has not been deleted', 'error')
      Logger.log('Loaded exiting client: ' + clientId, 'info')
    }
    else {
      Logger.log('WTF is happening?', 'error');
      Logger.log('Loaded exiting client: ' + clientId, 'info')
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
    : `http://localhost:${HOST_CONFIG.port}/#${roomId}`)

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
    else this.overloadCheck(clientId)
  }

  firstDraw(req) {
    const roomId = req.roomId
    const room = this.rooms[roomId]

    this.draw(room)
    this.play(roomId)
  }

  move(req) {
    const roomId = req.roomId
    const room = this.rooms[roomId]
    const _room = this._rooms[roomId]
    const type = req.type

    // Logger.log('data')
    // Logger.print(req)
    // Logger.print(roomId)
    // Logger.print(this._rooms[roomId])

    // action: raise
    if (type === 'raise') this.raise(roomId, room, _room, req.bid)
    // action: check
    else if (type === 'check') this.check(roomId, room, _room)
    // error
    else Logger.log(`wrong move message`, 'error')
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
      'color': client.color,
      'active': true
    })
  }

  draw(room) {
    const additional_cards = 0;
    const newDeck = new Deck(additional_cards);
    newDeck.shuffle()

    room.clients.forEach(c => {
      this.clients[c.id].cards = []
    })
    // Draw cards
    // 2 times for all, then only for
    for (let i = 0; i < CONFIG.cardsMax; i++)
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
  }

  // not working bid check:
  // pair
  // two pairs
  raise(roomId, room, _room, bid) {
    if (_room.bid === null) _room.bid = 0
    // raise = Number(); ranks[raise]

    // check if bid>room.lastbid
    if (bid > _room.bid) {
      _room.bid = bid
      // moved to getNextPlayer
      // ++this._rooms[roomId].last
      // if (_room.last >= room.clients.length) this._rooms[roomId].last = 0

      Logger.log('gituwa mordeczko dobry zakładzik')

      //send
      const current = room.clients[this._rooms[roomId].player.next].name
      room.clients.forEach(c => {
        const payLoad = {
          'method': 'move',
          'type': 'raise',
          'name': current,
          'bid': bid
        }
        this.clients[c.id].connection.send(JSON.stringify(payLoad))
      })
      this.getNextPlayer(roomId, room)
      // this.draw(room)
      this.play(roomId)
    } // else report error
    else Logger.log(`Smaller bid detected: ${bid} : ${this._rooms[roomId].bid}`, 'error')
  }

  getNextPlayer(roomId, room) {
    // save last player to enable checking by next player
    this._rooms[roomId].player.last = this._rooms[roomId].player.next

    // itterate through inactive players ro get next player
    for (let i = 0; i < room.clients.length; i++) {
      ++this._rooms[roomId].player.next
      if (this._rooms[roomId].player.next >= room.clients.length) 
        this._rooms[roomId].player.next = 0
      if (room.clients[this._rooms[roomId].player.next].active === true)
        break;
    }
  }

  play(roomId) {
    const room = this.rooms[roomId]
    const _room = this._rooms[roomId]
    const payLoad = {
      'method': 'play',
      'type': 'turn',
      'check': _room.player.check
    }
    if (_room.player.check === false) _room.player.check = true
    const payLoadNow = {
      'method': 'play',
      'type': 'now',
      'name': room.clients[this._rooms[roomId].player.next].name
    }
    // this.clients[_room.last - 1].connection.send(JSON.stringify(payLoad))
    // TODO: send only to current player
    room.clients.forEach((c, i) => {
      if(i === this._rooms[roomId].player.next) {
        this.clients[c.id].connection.send(JSON.stringify(payLoad)) // if (i === _room.last) 
        Logger.log(`turn: ${c.id} [${i}]`)
      }
      else if (i !== this._rooms[roomId].player.next) {
        this.clients[c.id].connection.send(JSON.stringify(payLoadNow))
        Logger.log(`send: ${c.id} [${i}] ${this.rooms[roomId].clients[i].active === false ? 'inactive' : ''}`)
      }
      else Logger.log(`while sending play message`, 'error')
    })
    // room.clients.forEach((c, i) => {
    //   if (i === _room.last) this.clients[c.id].connection.send(JSON.stringify(payLoad))
    // })
  }

  check(roomId, room, _room) {
    const { verdict, cards } = this.checkBid(room, _room)

    const checker = room.clients[this._rooms[roomId].player.next]
    const victim = room.clients[this._rooms[roomId].player.last]

    // let winner = (verdict) ? 1 : 0;

    // ++card counter
    if (!verdict) ++this.clients[victim.id].score
    else if (verdict) ++this.clients[checker.id].score
    else Logger.log(`verdict: ${verdict} with bid: ${_room.bid}`, 'error')

    room.clients.forEach(c => {
      const payLoad = {
        'method': 'move',
        'type': 'check',
        'names': {
          'checker': checker.name,
          'victim': victim.name
        },
        'verdict': Number(verdict),
        'cards': cards
      }
      this.clients[c.id].connection.send(JSON.stringify(payLoad))
    })
    
    this.getNextPlayer(roomId, room)
    this.draw(room)
    _room.player.check = false
    this.play(roomId)
    // reset minimum bid for next round
    _room.bid = null
  }

  checkBid(room, _room) {
    let bid = _room.bid

    // final verdict
    let verdict = null;
    
    // sum cards on hands
    let allCards = []
    room.clients?.forEach(c => {
      this.clients[c.id].cards.forEach(card => {
        allCards.push(card)
      })
    })
    Logger.log(allCards)

    // check if cards contain bid
    // sort tables
    const counts = {
      figures: {},
      colors: {},
      // figuresByColors: {
      //   'k': [],
      //   'h': [],
      //   't': [],
      //   'p': []
      // }
      figuresByColors: {}
    };
    for (const key of CONFIG.suits) {
      counts.figuresByColors[key] = []
    }
    // for(col in pokerColors)
    //   counts.figuresByColors[col] = []

    // sort cards to check
    allCards.forEach(card => {
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
    // Logger.log('===================')
    Logger.print(counts.figures)
    Logger.print(counts.colors)
    Logger.print(counts.figuresByColors)
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
    ///// NEW
    // const ranks9 = [
    //   'Royal flush',      // 09 02 01 // 9k   // 3rd color
    //   'Straight flush',   // 08 09 01 // 89k  // 3rd color
    //   'Four of a kind',   // 07 02 00 // 79
    //   'Flush',            // 06 00 01 // 6k   // 3rd color
    //   'Full house',       // 05 02 03 // 59T
    //   'Three of a kind',  // 04 02 00 // 49
    //   'Straight',         // 03 09 00 // 39
    //   'Two pairs',        // 02 03 02 // 29T  03 03 02 02 // sort max to begin
    //   'Pair',             // 01 02 00 // 19   02 02 
    //   'High card',        // 00 02 00 // 09   02
  
    //_bid='5QT'//'0Q'
    // bid.match(/.{1,2}/g);
    Logger.log(bid)
    bid = bid.match(/.{1,2}/g);
    for (let i = 0; i < 3; i++)
      bid[i] = Number(bid[i])
    
    // values to check; -2 because code 02 is figure 2 with index 0
    const figuresFirst = counts.figures[CONFIG.ranks[bid[1] - 2]],
      figuresSecond = counts.figures[CONFIG.ranks[bid[2] - 2]],
      colors = counts.colors[CONFIG.suits[bid[2] - 1]] // code 01 is first color
    Logger.log(`_bid: ${bid}`, 'info')
    switch (bid[0]) {
      case 9: // Royal flush
        const figT = 10 - 2 // fig T = 10
        const arr = counts.figuresByColors[CONFIG.suits[bid[2] - 1]]
        verdict = (arr.includes(counts.figures[CONFIG.ranks[figT]])
          && arr.includes(counts.figures[CONFIG.ranks[figT + 1]])
          && arr.includes(counts.figures[CONFIG.ranks[figT + 2]])
          && arr.includes(counts.figures[CONFIG.ranks[figT + 3]])
          && arr.includes(counts.figures[CONFIG.ranks[figT + 4]])
        ) ? true : false //counts.colorsByFig[card[1]].card[0]
        break;
      case 8: // Straight flush
        const fig = bid[1] - 2
        const arr1 = counts.figuresByColors[CONFIG.suits[bid[2] - 1]]
        verdict = (arr1.includes(counts.figures[CONFIG.ranks[fig]])
          && arr1.includes(counts.figures[CONFIG.ranks[fig + 1]])
          && arr1.includes(counts.figures[CONFIG.ranks[fig + 2]])
          && arr1.includes(counts.figures[CONFIG.ranks[fig + 3]])
          && arr1.includes(counts.figures[CONFIG.ranks[fig + 4]])
        ) ? true : false
        break;
      case 7: // Four of a kind
        verdict = (figuresFirst >= 4) ? true : false
        break;
      case 6: // Flush
        verdict = (colors >= 4) ? true : false
        break;
      case 5: // Full house
        verdict = (figuresFirst >= 3 && figuresSecond >= 2) ? true : false
        break;
      case 4: // Three of a kind
        verdict = (figuresFirst >= 3) ? true : false
        break;
      case 3: // Straight
        //f0
        // counts.figures[_bid[1]]
        const fig1 = bid[1] - 2
        verdict = (figuresFirst >= 1
          && counts.figures[CONFIG.ranks[fig1 + 1]] >= 1
          && counts.figures[CONFIG.ranks[fig1 + 2]] >= 1
          && counts.figures[CONFIG.ranks[fig1 + 3]] >= 1
          && counts.figures[CONFIG.ranks[fig1 + 4]] >= 1
        ) ? true : false
        break;
      case 2: // Two pairs
        verdict = (figuresFirst >= 2 && figuresSecond >= 2) ? true : false
        break;
      case 1: // Pair;
        verdict = (figuresFirst >= 2) ? true : false
        break;
      case 0: // High card
        verdict = (figuresFirst >= 1) ? true : false
        break;
    }
    Logger.log(`verdict: ${verdict}`, 'info')
    
    const cards = counts.figuresByColors
    return { verdict, cards }
    // const w0 = clients[room.clients[_room.last].id]
    // const w1 = clients[room.clients[_room.last+1].id]

    // rooms[roomId].clients.forEach(c => {
    //   clients[c.id].connection.send(JSON.stringify(payLoad))
    // })
  }

  //----------
  // Destroy
  //----------

  deleteClientData(param1, param2) {
    const connectionId = param1
    const clientId = param2
   
    // TODO: what if player opened multiple tabs with sessions, closed them
    //       and then reloaded last session
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
            // delete this.rooms[roomId].clients[i]
            // instead make player inactive
            this.rooms[roomId].clients[i].active = false

            // if (this.rooms[roomId].clients.length === 0) {
            //   console.log('deleted empty room: ' + roomId)
            //   delete this.rooms[roomId]
            // }
          }
        })
      }
    } 
    // allow disconected player to comeback
    // only delete when the game in a room ends
    // delete this.clients[clientId] 
    delete this.clientsIds[connectionId]
  }

  //----------
  // Security
  //----------

  overloadCheck(clientId) {
    Logger.log('Get Down! Client ' + clientId + ' is shooting!! (unmatched room code)')
    const payLoad = {
      'method': 'error',
      'info': 'Room not found'
    }

    const ws = this.clients[clientId].connection

    ws.send(JSON.stringify(payLoad))

    this.overloadProtection(ws, clientId)
  }

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