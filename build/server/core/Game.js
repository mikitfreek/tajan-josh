const {Deck} = require("./models/Deck");
const {Client} = require("./models/Client");
const {Room} = require("./models/Room");
const {v4: uuidv4} = require("uuid");
const {Logs} = require("./Logs");
const Logger = new Logs();
const config = require("../game.config.json");
const hostconfig = require("../host.config.json");
const randomColor = () => {
  return Math.floor(Math.random() * 16777215).toString(16);
};
const HOST_SERVER = "https://infinite-mesa-09265.herokuapp.com";
class Game {
  constructor() {
    this.clients = {};
    this.rooms = [];
    this._rooms = [];
  }
  async connect(ws, req) {
    let connectionId = uuidv4();
    Logger.log("New connection: " + connectionId, "warning");
    const payLoad = {
      method: "connect",
      clientId: connectionId
    };
    ws.send(JSON.stringify(payLoad));
    ws.on("message", (msg) => this.message(msg, ws, connectionId));
    ws.on("close", () => {
      Logger.log("Connection closed: " + connectionId, "warning");
    });
  }
  message(msg, ws, connectionId) {
    const req = JSON.parse(msg);
    if (req.method === "load")
      this.load(req, ws, connectionId);
    else if (req.method === "create")
      this.create(req);
    else if (req.method === "request-join")
      this.join(req);
    else if (req.method === "draw")
      this.draw(req);
    else if (req.method === "move")
      this.move(req);
    Logger.print(req);
  }
  load(req, ws, connectionId) {
    const clientId = req.id?.length === 36 ? req.id : connectionId;
    let _clientName, clientUndefined = false;
    if (typeof this.clients[clientId] === "undefined") {
      clientUndefined = true;
      const clientIp = ws._socket?.remoteAddress;
      const elapsed = Date.now();
      const now = new Date(elapsed);
      const clientName = `client_${now.getDate()}_${now.getMonth() + 1}_${now.getHours()}${now.getMinutes()}_${now.getSeconds()}_${now.getMilliseconds()}`;
      _clientName = clientName;
      const clientData = new Client(clientName, clientId, ws, clientIp, config.cardsStart);
      this.clients[clientId] = clientData;
    }
    if (clientId !== connectionId && clientUndefined) {
      Logger.log("* >======== " + _clientName + " ========>", "info");
      Logger.log("Client got back after a while: " + clientId, "info");
    } else if (clientId !== connectionId && !clientUndefined) {
      Logger.log("* >======== " + _clientName + " ========>", "info");
      Logger.log("Loaded exiting client: " + clientId, "info");
    } else if (clientId === connectionId && clientUndefined) {
      Logger.log("* >======== " + _clientName + " ========>", "info");
      Logger.log("New client: " + clientId, "info");
    } else if (clientId === connectionId && !clientUndefined) {
      Logger.log("* >======== " + _clientName + " ========>", "info");
      Logger.log("Memory is has not been delated", "warning");
      Logger.log("Loaded exiting client: " + clientId, "info");
    } else {
      Logger.log("* >======== " + _clientName + " ========>", "info");
      Logger.log("WTF is happening?", "warning");
      Logger.log("Loaded exiting client: " + clientId, "info");
    }
  }
  create(req) {
    const hostId = req.hostId?.length === 36 ? req.hostId : 0;
    const roomId = hostId.split("-")[0];
    this.clients[hostId].room = roomId;
    Logger.log("Room created successfully by client: " + hostId + ", with id: " + roomId);
    Logger.log(process.env.PORT !== void 0 ? `${HOST_SERVER}${process.env.PORT != "" ? `: ${process.env.PORT}` : ""}/#${roomId}` : `http://localhost:${hostconfig.port}/#${roomId}`);
    const roomData = new Room(roomId, hostId);
    this.rooms[roomId] = roomData.public();
    this._rooms[roomId] = roomData.private();
    this.joinRoom(hostId, this.rooms[roomId]);
    const payLoad = {
      method: "create",
      room: this.rooms[roomId]
    };
    const ws = this.clients[hostId].connection;
    ws.send(JSON.stringify(payLoad));
  }
  join(req) {
    const clientId = req.clientId?.length === 36 ? req.clientId : 0;
    const roomId = req.roomId?.length === 8 ? req.roomId : 0;
    if (typeof this.rooms[roomId] !== "undefined") {
      this.clients[clientId].room = roomId;
      if (typeof this.rooms[roomId].clients !== "undefined" && this.rooms[roomId].clients.some((c) => c.id !== clientId) || typeof this.rooms[roomId].clients === "undefined")
        Logger.log(": room clients undefined");
      this.joinRoom(clientId, this.rooms[roomId]);
      const payLoad = {
        method: "join",
        clientId,
        room: this.rooms[roomId]
      };
      this.rooms[roomId].clients.forEach((c) => {
        this.clients[c.id].connection.send(JSON.stringify(payLoad));
      });
      Logger.log("Room: " + roomId + " joined successfully by client: " + clientId);
    } else {
      Logger.log("Get Down! Client " + clientId + " is shooting!! (unmatched room code)");
      const payLoad = {
        method: "error",
        info: "Room not found"
      };
      const ws = this.clients[clientId].connection;
      ws.send(JSON.stringify(payLoad));
      this.overloadProtection(ws, clientId);
    }
  }
  draw(req) {
    const roomId = req.roomId;
    const room = this.rooms[roomId];
    const newDeck = new Deck();
    newDeck.shuffle();
    room.clients.forEach((c) => {
      this.clients[c.id].cards = [];
    });
    for (let i = 0; i < config.cardsMax; i++)
      room.clients.forEach((c) => {
        const client = this.clients[c.id];
        if (client.score - i > 0)
          this.clients[c.id].cards.push(newDeck.deal());
      });
    Logger.log("Dealing cards in room: " + room.id);
    room.clients.forEach((c) => {
      Logger.log(c.id + " received cards");
      let cards = [];
      this.clients[c.id].cards.forEach((card) => {
        cards.push(card);
      });
      const payLoad = {
        method: "draw",
        cards
      };
      this.clients[c.id].connection.send(JSON.stringify(payLoad));
    });
    this.currentPlayer(roomId);
  }
  move(req) {
    const roomId = req.roomId;
    const room = this.rooms[roomId];
    const _room = this._rooms[roomId];
    const bid = req.bid;
    if (bid === "raise") {
      if (_room.bid === null)
        this._rooms[roomId].bid = 0;
      if (bid > _room.bid) {
        this._rooms[roomId].bid = bid;
        ++this._rooms[roomId].last;
        if (_room.last >= room.clients.length)
          this._rooms[roomId].last = 0;
        Logger.log("gituwa mordeczko dobry zakładzik");
        room.clients.forEach((c) => {
          const payLoad = {
            method: "move",
            type: "raise"
          };
          this.clients[c.id].connection.send(JSON.stringify(payLoad));
        });
        this.currentPlayer(roomId);
      } else
        Logger.log("Error: smaller bid detected");
    } else {
      const stat = this.check(room, bid);
      let winner = stat ? 1 : 0;
      room.clients.forEach((c) => {
        const payLoad = {
          method: "move",
          type: "check",
          stat: winner
        };
        this.clients[c.id].connection.send(JSON.stringify(payLoad));
      });
      ++this._rooms[roomId].last;
      if (_room.last >= room.clients.length)
        this._rooms[roomId].last = 0;
    }
  }
  joinRoom(clientId, room) {
    let client = this.clients[clientId];
    if (client.color === "init")
      client.color = randomColor();
    room.clients.push({
      id: clientId,
      name: client.name,
      color: client.color
    });
  }
  currentPlayer(roomId) {
    const room = this.rooms[roomId];
    const _room = this._rooms[roomId];
    const payLoad = {
      method: "turn"
    };
    room.clients.forEach((c, i) => {
      this.clients[c.id].connection.send(JSON.stringify(payLoad));
      Logger.log(c.id + " - " + i);
    });
  }
  check(room, bid) {
    let _cards = [];
    room.clients?.forEach((c) => {
      this.clients[c.id].cards.forEach((card) => {
        _cards.push(card);
      });
    });
    Logger.log(_cards);
    let counts = {
      figures: {},
      colors: {},
      figuresByColors: {
        k: [],
        h: [],
        t: [],
        p: []
      }
    };
    _cards.forEach((card) => {
      const c = counts.figures[card[0]];
      counts.figures[card[0]] = c ? c + 1 : 1;
      const d = counts.colors[card[1]];
      counts.colors[card[1]] = d ? d + 1 : 1;
      counts.figuresByColors[card[1]].push(card[0]);
    });
    Logger.log("===================");
    Logger.log(counts.figures);
    Logger.log(counts.colors);
    Logger.log(counts.figuresByColors);
    let _bid = bid;
    Logger.log(bid);
    _bid.match(/.{1,1}/g);
    let stat = false;
    const f0 = counts.figures[_bid[1]], f1 = counts.figures[_bid[2]], c0 = counts.colors[_bid[1]];
    switch (Number(_bid[0])) {
      case 9:
        const z = config.pokerSymbols.length - 5;
        const arr = counts.figuresByColors[_bid[1]];
        if (arr.includes(counts.figures[config.pokerSymbols[z]]) && arr.includes(counts.figures[config.pokerSymbols[z + 1]]) && arr.includes(counts.figures[config.pokerSymbols[z + 2]]) && arr.includes(counts.figures[config.pokerSymbols[z + 3]]) && arr.includes(counts.figures[config.pokerSymbols[z + 4]]))
          stat = true;
        break;
      case 8:
        const w = config.pokerSymbols.indexOf(_bid[1]);
        const arr1 = counts.figuresByColors[_bid[2]];
        if (arr1.includes(counts.figures[config.pokerSymbols[w]]) && arr1.includes(counts.figures[config.pokerSymbols[w + 1]]) && arr1.includes(counts.figures[config.pokerSymbols[w + 2]]) && arr1.includes(counts.figures[config.pokerSymbols[w + 3]]) && arr1.includes(counts.figures[config.pokerSymbols[w + 4]]))
          stat = true;
        break;
      case 7:
        if (f0 >= 4)
          stat = true;
        break;
      case 6:
        if (c0 >= 4)
          stat = true;
        break;
      case 5:
        if (f0 >= 3 && f1 >= 2)
          stat = true;
        break;
      case 4:
        if (f0 >= 3)
          stat = true;
        break;
      case 3:
        const y = config.pokerSymbols.indexOf(_bid[1]);
        if (f0 >= 1 && counts.figures[config.pokerSymbols[y + 1]] >= 1 && counts.figures[config.pokerSymbols[y + 2]] >= 1 && counts.figures[config.pokerSymbols[y + 3]] >= 1 && counts.figures[config.pokerSymbols[y + 4]] >= 1)
          stat = true;
        break;
      case 2:
        if (f0 >= 2 && f1 >= 2)
          stat = true;
        break;
      case 1:
        if (f0 >= 2)
          stat = true;
        break;
      case 0:
        if (f0 >= 1)
          stat = true;
        break;
    }
    return stat;
  }
  deleteClientData(param) {
    const clientId = param;
    const roomId = this.clients[clientId].room;
    if (typeof this.rooms !== "undefined" && roomId !== "lobby" && roomId !== "init") {
      const room = this.rooms[roomId];
      if (typeof room !== "undefined" && typeof room.clients !== "undefined") {
        this.rooms[roomId].clients.forEach((c, i) => {
          if (c.id === clientId) {
            if (this.rooms[roomId].clients.length === 1) {
              Logger.log("deleted empty room: " + roomId);
              delete this.rooms[roomId];
            } else
              delete this.rooms[roomId].clients[i];
          }
        });
      }
    }
    delete this.clients[clientId];
  }
  overloadProtection(ws, clientId) {
    const payLoad = {
      method: "error",
      info: "Too many attempts"
    };
    const limit = 3, burst = 2, burstTime = 1e3, burstDelay = 5e3;
    if (this.clients[clientId].counters.limit >= limit) {
      if (this.clients[clientId].counters.burst >= burst) {
        Logger.log("* Leaking * :: " + clientId);
      }
      ++this.clients[clientId].counters.burst;
      setTimeout(() => {
        ws.send(JSON.stringify(payLoad));
        Logger.log("* Block * :: " + clientId);
        setTimeout((_) => --this.clients[clientId].counters.burst, burstTime);
      }, burstDelay);
    }
    ++this.clients[clientId].counters.limit;
  }
}
module.exports = {Game};
