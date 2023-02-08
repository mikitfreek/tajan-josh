import {Store} from "./comp/Store.js";
import {Render} from "./comp/Render.js";
const Storage = new Store("tajan-josh");
const glob = globalThis;
import {Logs} from "./comp/Logs.js";
const Logger = new Logs();
import {Debug} from "./comp/Debug.js";
const Debugger = new Debug();
export class Game {
  constructor() {
    this.hashHandlerFlag = true;
    this.initWebSocket();
    this.ws.onmessage = (event) => this.message(event.data);
    const Renderer = new Render(this.ws, this.clientId, this.roomId);
    glob.window.onload = () => {
      this.init();
      Renderer.renderSidebar();
      Renderer.toggleDarkMode();
      Renderer.updateUI();
    };
  }
  initWebSocket() {
    const host = glob.location.origin.replace(/^http/, "ws");
    this.ws = new WebSocket(host);
    Debugger.setWs(this.ws);
  }
  init() {
    const alert = glob.document.getElementById("alert");
    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);
    const d = glob.document.createElement("div");
    d.className = "createbtn";
    d.innerText = "Create a room";
    d.addEventListener("click", (e) => {
      const payLoad = {
        method: "create",
        hostId: this.clientId
      };
      this.ws.send(JSON.stringify(payLoad));
    });
    alert.append(d);
    Debugger.interface();
  }
  hashHandler() {
    if (glob.location.hash === "" || glob.location.hash === "#") {
    } else if (glob.location.hash.length === 9) {
      const roomCode = glob.location.hash.substring(1);
      const req = {clientId: this.clientId, roomId: roomCode};
      this.requestJoin(req);
    } else
      Logger.log(`request has a wrong room code: "${glob.location.hash}"`, "error");
  }
  requestJoin(req) {
    const payLoad = {
      method: "request-join",
      clientId: req.clientId,
      roomId: req.roomId
    };
    this.ws.send(JSON.stringify(payLoad));
  }
  message(msg) {
    const res = JSON.parse(msg);
    if (res.method === "connect")
      this.connected(res);
    else if (res.method === "create")
      this.created(res);
    else if (res.method === "join")
      this.joined(res);
    else if (res.method === "turn")
      this.turn(res);
    else if (res.method === "draw")
      this.drawed(res);
    else if (res.method === "move")
      this.moved(res);
    Logger.print(res);
  }
  connected(res) {
    this.clientId = res.clientId;
    Logger.log("Client id set on init: " + this.clientId, "info");
    const clientId = Storage.getClientId();
    Logger.log("Client id from local storage: " + clientId, "info");
    if (clientId?.length === 36) {
      this.clientId = clientId;
    }
    const payLoad = {
      method: "load",
      id: this.clientId
    };
    this.ws.send(JSON.stringify(payLoad));
    this.hashHandler();
    glob.window.onhashchange = () => {
      if (this.hashHandlerFlag)
        this.hashHandler();
    };
    Debugger.setClientId(this.clientId);
  }
  created(res) {
    const alert = glob.document.getElementById("alert");
    this.roomId = res.room.id;
    const clientId = res.room.hostId;
    Logger.log("Room created successfully by client: " + clientId + ", with id: " + this.roomId, "success");
    glob.navigator.clipboard.writeText(glob.location.origin + "/#" + this.roomId).then((res2) => {
      console.log(`${glob.location.origin + "/#" + this.roomId} - copied to clipboard`);
    });
    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);
    const p = glob.document.createElement("p");
    p.innerText = `Created a room! id: ${this.roomId}`;
    alert.append(p);
    const inp = glob.document.createElement("input");
    inp.value = `${glob.location.origin.replace(/^(http|https):\/\//, "") + "/#" + this.roomId}`;
    alert.append(inp);
    const a = glob.document.createElement("span");
    a.innerText = `- copied to clipboard! -`;
    a.className = "clip";
    alert.append(a);
    const d3 = glob.document.createElement("div");
    d3.className = "createbtn";
    d3.innerText = "Deal cards";
    d3.addEventListener("click", (e) => {
      const payLoad = {
        method: "draw",
        roomId: this.roomId
      };
      this.ws.send(JSON.stringify(payLoad));
    });
    alert.append(d3);
    Debugger.setRoomId(this.roomId);
  }
  joined(res) {
    const alert = glob.document.getElementById("alert");
    this.roomId = res.room.id;
    if (this.clientId === "undefined")
      this.clientId = res.clientId;
    Logger.log("Room:" + this.roomId + " joined successfully by client: " + this.clientId, "success");
    if (this.clientId === res.clientId) {
      while (alert.children.length >= 1)
        alert.removeChild(alert.lastChild);
      const p = glob.document.createElement("p");
      p.innerText = `${res.clientId} joined a room: ${this.roomId}`;
      alert.append(p);
    }
    Debugger.setRoomId(this.roomId);
  }
  turn(res) {
    const alert = glob.document.getElementById("alert");
    Logger.log("Now is client: " + this.clientId + " turn, from room id: " + this.roomId, "info");
    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);
    const p0 = glob.document.createElement("p");
    p0.innerText = `Now is your turn!`;
    alert.append(p0);
  }
  drawed(res) {
    const alert = glob.document.getElementById("alert");
    const cards = res.cards;
    Logger.print(cards);
    Logger.log("Room:" + this.roomId + " ; client: " + this.clientId + " ; cards: " + [cards]);
    let check = glob.document.querySelector(".cards");
    if (check !== null)
      glob.document.body.removeChild(check);
    let _cards_ = Render.createCards(cards);
    glob.document.body.appendChild(_cards_);
    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);
    const p = glob.document.createElement("p");
    p.innerText = `Dealing cards in room: ${this.roomId}`;
    alert.append(p);
  }
  moved(res) {
    const alert = glob.document.getElementById("alert");
    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);
    if (res.type === "check") {
      if (res.stat === 1) {
        while (alert.children.length >= 1)
          alert.removeChild(alert.lastChild);
        const p = glob.document.createElement("p");
        p.innerText = `Wygrany: ${this.roomId}`;
        alert.append(p);
      } else {
        while (alert.children.length >= 1)
          alert.removeChild(alert.lastChild);
        const p = glob.document.createElement("p");
        p.innerText = `Przegrany: ${this.roomId}`;
        alert.append(p);
      }
    } else {
      while (alert.children.length >= 1)
        alert.removeChild(alert.lastChild);
      const p = glob.document.createElement("p");
      p.innerText = `Raise: ${this.roomId}`;
      alert.append(p);
    }
  }
}
