const { Deck } = require('./models/Deck')
const { Client } = require('./models/Client')
const { Room } = require('./models/Room')

const { v4: uuidv4 } = require('uuid')

const { Logs } = require('../utils/Logs')
const Logger = new Logs()

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

  /*-------------
   *  Session
   *------------*/

  async connect(ws, req) {
    try {
      // TODO
      // ws.on('open', async (msg) => {
      //   try {
      //      // connection code here
      //   }
      //   catch (err: any) {
      //     Logger.log(err.stack, 'error')
      //   }
      // })
      const connectionId = uuidv4();
      Logger.log("New connection: " + connectionId, 'warning')

      const payLoad = {
        'method': 'connect',
        'clientId': connectionId
      }
      ws.send(JSON.stringify(payLoad))
      
      // Message from client
      ws.on('message', async (msg) => {
        try {
          this.message(msg, ws, connectionId)
        }
        catch (err: any) {
          Logger.log(err.stack, 'error')
        }
      })
      
      // Session close
      ws.on('close', async () => {
        try {
          const clientId = this.clientsIds[connectionId]
          // TODO: only set player as inactive (done)
          // TODO: delete inactive clients data after a room is closed
          this.deleteClientData(connectionId, clientId)
          Logger.log('Connection closed: ' + clientId, 'warning')
        }
        catch (err: any) {
          Logger.log(err.stack, 'error')
        }
      })
    }
    catch (err: any) {
      Logger.log(err.stack, 'error')
    }
  }

  message(msg, ws, connectionId) {
    const req = JSON.parse(msg) //.utf8Data
    Logger.print(req)

    if (req.method === 'load')
      this.load(req, ws, connectionId)
    else if (req.method === 'create')
      this.create(req)
    else if (req.method === 'request-join')
      this.join(req)
    else if (req.method === 'draw')
      this.firstDraw(req)
    else if (req.method === 'move')
      this.move(req)
  }

  /*-------------
   *  Messeges
   *------------*/

  load(req, ws, connectionId) {
    // validate
    const clientId = req.id?.length === 36 ? req.id : connectionId

    this.clientsIds[connectionId] = clientId
    let clientName, clientUndefined = false;
    // check if another client has same name
    if (typeof this.clients[clientId] === "undefined") {
      clientUndefined = true
      const clientIp = ws._socket?.remoteAddress //req.socket.remoteAddress;
      const elapsed = Date.now();
      const now = new Date(elapsed);

      /// COMMENTED FOR DEBUGGING
      // clientName = req.name
      ///
      /// FOR DEBUGGING
      clientName = `client_${now.getDate()}_${now.getMonth() + 1}_${now.getHours()}${now.getMinutes()}_${now.getSeconds()}_${now.getMilliseconds()}`
      ///

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
    const hostId = req.hostId?.length === 36 ? req.hostId : 0
    // TODO: Give another client host if previons left lobby
    const roomId = hostId.split('-')[0]

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
  }

  join(req) {
    // validate
    const clientId = req.clientId?.length === 36 ? req.clientId : 0 //connectionId
    const roomId = req.roomId?.length === 8 ? req.roomId : 0
    // if exists
    if (typeof this.rooms[roomId] !== 'undefined') {

      this.clients[clientId].room = roomId

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
  }

  /*-------------
   *  Methods
   *------------*/

  joinRoom(clientId, room) {
    const client = this.clients[clientId]
    if (client.color === 'init')
      client.color = randomColor()

    room.clients.push({
      'id': clientId,
      'name': client.name,
      'color': client.color,
      'active': true
    })
    this.rooms[room.id].clients[clientId] = {
      // 'id': clientId,
      'score': CONFIG.cardsStart, // TODO: move to _room.clients
      'cards': [],
    }
  }

  draw(room) {
    const additional_cards = 0;
    const newDeck = new Deck(additional_cards);
    newDeck.shuffle()

    // room.clients.forEach(c => {
    //   this._rooms[room.id].clients[c.id].cards = []
    // })
    // Draw cards
    // 2 times for all, then only for players with penalty cards
    for (let i = 0; i < CONFIG.cardsMax; i++)
      room.clients.forEach(c => {
        const client = this._rooms[room.id].clients[c.id]
        if (i === 0) client.cards = [];
        if (client.score - i > 0)
        client.cards.push(newDeck.deal())
      })
    Logger.log('Dealing cards in room: ' + room.id)

    room.clients.forEach(c => {
      Logger.log(c.id + ' received cards')
      let cards = []
      this._rooms[room.id].clients[c.id].cards.forEach(card => {
        cards.push(card)
      })
      const payLoad = {
        'method': 'draw',
        'cards': cards
      }
      this.clients[c.id].connection.send(JSON.stringify(payLoad))
    })
  }

  raise(roomId, room, _room, bid) {
    if (_room.bid === null) _room.bid = 0

    // check if bid is larger than previous
    if (bid > _room.bid) {
      _room.bid = bid

      Logger.log('gituwa mordeczko dobry zakładzik')

      // send
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
      this.play(roomId)
    } 
    // report error
    else Logger.log(`Smaller bid detected: ${bid} : ${this._rooms[roomId].bid}`, 'error')
  }

  getNextPlayer(roomId, room) {
    // save last player to enable checking by next player
    this._rooms[roomId].player.last = this._rooms[roomId].player.next

    // itterate through inactive players to get next player
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

    room.clients.forEach((c, i) => {
      // trigger current player
      if(i === this._rooms[roomId].player.next) {
        this.clients[c.id].connection.send(JSON.stringify(payLoad)) // if (i === _room.last) 
        Logger.log(`turn: ${c.id} [${i}]`)
      }
      // inform other players
      else if (i !== this._rooms[roomId].player.next) {
        this.clients[c.id].connection.send(JSON.stringify(payLoadNow))
        Logger.log(`send: ${c.id} [${i}] ${this.rooms[roomId].clients[i].active === false ? 'inactive' : ''}`)
      }
      // error
      else Logger.log(`while sending play message`, 'error')
    })
  }

  check(roomId, room, _room) {
    const { verdict, cards } = this.checkBid(room, _room)

    const checker = room.clients[this._rooms[roomId].player.next]
    const victim = room.clients[this._rooms[roomId].player.last]

    // TODO: make player inactive when he has more cards than MAX
    if (!verdict) ++this._rooms[room.id].clients[victim.id].score
    else if (verdict) ++this._rooms[room.id].clients[checker.id].score
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
    // diable check action for first player in each cards draw
    _room.player.check = false // used in play() function
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
      this._rooms[room.id].clients[c.id].cards.forEach(card => {
        allCards.push(card)
      })
    })
    Logger.log(allCards)

    // init sort tables
    const counts = {
      figures: {},
      colors: {},
      figuresByColors: {}
    };
    for (const key of CONFIG.suits) {
      counts.figuresByColors[key] = []
    }

    // sort cards to check
    allCards.forEach(card => {
      const c = counts.figures[card[0]]
      counts.figures[card[0]] = c ? c + 1 : 1
      const d = counts.colors[card[1]]
      counts.colors[card[1]] = d ? d + 1 : 1
      counts.figuresByColors[card[1]].push(
        card[0]
      )
    })

    Logger.print(counts.figures)
    Logger.print(counts.colors)
    Logger.print(counts.figuresByColors)


    // RANKS_9 - cards from 9 to Ace
    //   'Royal flush',      // 09 02 01   // 3rd color
    //   'Straight flush',   // 08 09 01   // 3rd color
    //   'Four of a kind',   // 07 02 00
    //   'Flush',            // 06 00 01   // 3rd color
    //   'Full house',       // 05 02 03
    //   'Three of a kind',  // 04 02 00
    //   'Straight',         // 03 09 00
    //   'Two pairs',        // 02 03 02   // higher figure as 2nd
    //   'Pair',             // 01 02 00
    //   'High card',        // 00 02 00
  
    Logger.log(bid)

    // split bid code into 3 two digit values
    bid = bid.match(/.{1,2}/g);
    for (let i = 0; i < 3; i++)
      bid[i] = Number(bid[i])
    
    // translate bid values
    // values to check; -2 because code 02 is figure 2 with index 0
    const figuresFirst = counts.figures[CONFIG.ranks[bid[1] - 2]],
      figuresSecond = counts.figures[CONFIG.ranks[bid[2] - 2]],
      colors = counts.colors[CONFIG.suits[bid[2] - 1]] // code 01 is first color
    
    Logger.log(`_bid: ${bid}`, 'info')

    // check if cards on table contain bid
    switch (bid[0]) {
      case 9: // Royal flush
        const figT = 10 - 2 // fig T = 10
        const arr = counts.figuresByColors[CONFIG.suits[bid[2] - 1]]
        verdict = (arr.includes(counts.figures[CONFIG.ranks[figT]])
          && arr.includes(counts.figures[CONFIG.ranks[figT + 1]])
          && arr.includes(counts.figures[CONFIG.ranks[figT + 2]])
          && arr.includes(counts.figures[CONFIG.ranks[figT + 3]])
          && arr.includes(counts.figures[CONFIG.ranks[figT + 4]])
        ) ? true : false
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
  }

  /*-------------
   *  Destroy
   *------------*/

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

  /*-------------
   *  Security
   *------------*/

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
