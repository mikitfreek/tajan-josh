import { Store } from './comp/Store.js'
import { Render } from './Render.js'

const Storage = new Store("tajan-josh");
const glob = globalThis

import { Logs } from '../utils/Logs.js'
const Logger = new Logs()

import { Debug } from '../utils/Debug.js'
const Debugger = new Debug()

export class Game {
  ws: WebSocket
  Renderer: Render
  clientId: string
  name: string
  roomId: string
  actionButtons: HTMLElement
  hashHandlerFlag: boolean = true
  joining: boolean = false

  constructor() {
    this.initWebSocket()
    
    this.ws.onmessage = async (event) => this.message(event.data)

    this.Renderer = new Render(this.ws)

    this.listeners()
    
    // hide action buttons
    this.actionButtons = glob.document.getElementById('action')
    this.actionButtons.style.visibility = 'hidden'

    glob.window.onload = () => {

      if (!this.joining) this.init()

      Debugger.setWs(this.ws)
      Debugger.interface()

      this.Renderer.renderSidebar()
      this.Renderer.toggleDarkMode()
    }
  }

  initWebSocket() {
    const host = glob.location.origin.replace(/^(http|https)/, 'ws')
    this.ws = new WebSocket(host)
  }

  /*-------------
   *  Methods
   *------------*/

  init() {
    /// Create room
    const alert = glob.document.getElementById('alert')
    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);
    const d = glob.document.createElement('div')
    d.className = 'createbtn'
    d.innerText = 'Create a room'
    d.addEventListener('click', () => {
      const payLoad = {
        'method': 'create',
        'hostId': this.clientId
      }
      this.ws.send(JSON.stringify(payLoad))
    })
    alert.append(d)
    ///
  }

  hashHandler() {
    if (glob.location.hash === ""
    || glob.location.hash === "#") { } // do nothing
    else if (glob.location.hash.length === 9) {
      this.joining = true
      const roomCode = glob.location.hash.substring(1)
      const req = { clientId: this.clientId, roomId: roomCode }
      this.requestJoin(req)
    } else Logger.log(`request has a wrong room code: "${glob.location.hash}"`, 'error')
  }

  requestJoin(req) {
    const payLoad = {
      'method': 'request-join',
      'clientId': req.clientId,
      'roomId': req.roomId
    }
    this.ws.send(JSON.stringify(payLoad))
  }

  message(msg) {
    const res = JSON.parse(msg) //.utf8Data
    if (res.method === 'connect')
      this.connected(res)
    else if (res.method === 'create')
      this.created(res)
    else if (res.method === 'join')
      this.joined(res)
    else if (res.method === 'draw')
      this.drawed(res)
    else if (res.method === 'play')
      this.play(res)
    else if (res.method === 'move')
      this.moved(res)

    Logger.print(res)
  }

  /*-------------
   *  Messeges
   *------------*/

  connected(res) {
    this.clientId = res.clientId
    Logger.log('Client id set on init: ' + this.clientId, 'info')

    // get clientId from local storage
    const clientId = Storage.getClientId()
    Logger.log('Client id from local storage: ' + clientId, 'info')

    /// COMMENTED FOR DEBUGGING
    // if clientId exists locally
    if (clientId?.length === 36) {
      this.clientId = clientId // set local id
    } 
    // update id if empty
    // else {
    //   Storage.update(this.clientId)
    // }
    ///

    /// COMMENTED FOR DEBUGGING
    // this.name = ''
    // while (this.name === '' || this.name.indexOf(' ') >= 0)
    //   this.name = glob.window.prompt("Please enter your nickname (dont use space)")
    ///

    // TODO: message loaded
    const payLoad = {
      'method': 'load',
      'id': this.clientId,
      'name': this.name
    }
    this.ws.send(JSON.stringify(payLoad))

    /// FOR DEBUGGING
    // const payLoad2 = {
    //   'method': 'create',
    //   'hostId': this.clientId
    // }
    // // console.log('data')
    // this.ws.send(JSON.stringify(payLoad2))
    ///

    // room code handlers
    this.hashHandler()
    glob.window.onhashchange = () => {
      if (this.hashHandlerFlag) 
        this.hashHandler()
    }

    Debugger.setClientId(this.clientId)
  }

  created(res) {
    const alert = glob.document.getElementById('alert')
    this.roomId = res.room.id
    const clientId = res.room.hostId

    /// FOR DEBUGGING
    // const payLoad = {
    //   'method': 'draw',
    //   'roomId': this.roomId
    // }
    // // console.log('data')
    // this.ws.send(JSON.stringify(payLoad))
    ///

    // TODO: disable hash handler for a room host hash change
    // https://stackoverflow.com/questions/13233914/prevent-window-onhashchange-from-executing-when-hash-is-set-via-javascript
    this.hashHandlerFlag = false
    glob.location.replace('#' + this.roomId)

    Logger.log(`Room created successfully by client: ${clientId}, with id: ${this.roomId}`, 'success')

    glob.navigator.clipboard.writeText(glob.location.origin + '/#' + this.roomId).then(res => {
      console.log(`${glob.location.origin + '/#' + this.roomId} - copied to clipboard`);
    })

    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);
    const p = glob.document.createElement('p')
    p.innerText = `Created a room! id: ${this.roomId}`
    alert.append(p)
    const inp = glob.document.createElement('input')
    inp.value = `${glob.location.origin.replace(/^(http|https):\/\//, '') + '/#' + this.roomId}`
    alert.append(inp)
    const a = glob.document.createElement('span')
    a.innerText = `- copied to clipboard! -`
    a.className = 'clip'
    alert.append(a)

    /// deal cards
    const d3 = glob.document.createElement('div')
    d3.className = 'createbtn'
    d3.innerText = 'Deal cards'
    d3.addEventListener('click', e => {
      const payLoad = {
        'method': 'draw',
        'roomId': this.roomId
      }
      // console.log('data')
      this.ws.send(JSON.stringify(payLoad))
    })
    alert.append(d3)
    ///

    Debugger.setRoomId(this.roomId)
  }

  joined(res) {
    const alert = glob.document.getElementById('alert')
    this.roomId = res.room.id

    this.Renderer.setData(this.clientId, this.roomId)

    Logger.log(`Room: ${this.roomId} joined successfully by client: ${res.clientId}`, 'success')

    let message
    if (res.clientId !== this.clientId) {
      message = `${res.clientId} joined a room: ${this.roomId}`
    }
    else if (res.clientId === this.clientId) {
      while (alert.children.length >= 1)
        alert.removeChild(alert.lastChild);
      message = `You (${res.clientId}) joined a room: ${this.roomId}`
    }
    const p = glob.document.createElement('p')
    p.innerText = message
    alert.append(p)

    Debugger.setRoomId(this.roomId)
  }

  play(res) {
    const alert = glob.document.getElementById('alert')

    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);

    if (res.type === 'turn')
      this.turn(res, alert)
    else if (res.type === 'now')
      this.now(res, alert)
    else Logger.log(`wrong queue message: type`, 'error')
  }

  turn(res, alert) {
    // show action buttons
    this.actionButtons.style.visibility = 'visible'
    // show and hide check button
    if (!res.check) glob.document.getElementById('check').style.visibility = 'hidden'

    Logger.log(`Now is your turn, client: ${this.clientId} from room id: ${this.roomId}`, 'info')

    const p0 = glob.document.createElement('p')
    p0.innerText = `Now is your turn!`
    alert.append(p0)
  }

  now(res, alert) {
    // hide action buttons
    glob.document.getElementById('check').style.visibility = null
    this.actionButtons.style.visibility = 'hidden'

    Logger.log(`Now is client: ${res.name} turn, from room id: ${this.roomId}`, 'info')

    const p0 = glob.document.createElement('p')
    p0.innerText = `Waiting for ${res.name} move`
    alert.append(p0)
  }

  drawed(res) {
    const alert = glob.document.getElementById('alert')
    const cards = res.cards
    Logger.print(cards)
    Logger.log(`Room: ${this.roomId}, client: ${this.clientId}, cards: ${[cards]}`)

    let check = glob.document.querySelector('.cards')
    if (check !== null) glob.document.body.removeChild(check)
    let _cards_ = Render.createCards(cards)
    glob.document.body.appendChild(_cards_)

    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);
    const p = glob.document.createElement('p')
    p.innerText = `Dealing cards in room: ${this.roomId}`
    alert.append(p)
  }

  moved(res) {
    const alert = glob.document.getElementById('alert')

    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);

    if (res.type === 'check')
      this.checked(res, alert)
    else if (res.type === 'raise')
      this.raised(res, alert)
    else Logger.log(`wrong move message: type`, 'error')
  }

  checked(res, alert) {
    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);
    const p = glob.document.createElement('p')
    // winner
    if (res.verdict === 1) p.innerText = `Wygrany: ${this.roomId}`
    // loser
    else if (res.verdict === 0) p.innerText = `Przegrany: ${this.roomId}`
    else Logger.log(`wrong move message: verdict`, 'error')
    alert.append(p)

    // TODO: disply all cards
  }

  raised(res, alert) {
    this.Renderer.updateUI(res.bid)
    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);
    const p = glob.document.createElement('p')
    p.innerText = `Raise: ${this.roomId}`
    alert.append(p)
  }

  /*-------------
   *  Listeners
   *------------*/

  listeners() {
    const raise = glob.document.getElementById('raise')
    raise.addEventListener("click", () => {
        this.Renderer.openMd(this.clientId, this.roomId, 'raise');
    });

    const check = glob.document.getElementById('check')
    check.addEventListener("click", () => {
        this.Renderer.openMd(this.clientId, this.roomId, 'check');
    });

    const online = glob.document.getElementById('online')
    online.addEventListener("click", () => {
        console.log('online: ');
    });
  }
}
