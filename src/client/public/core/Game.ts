import { Store } from './comp/Store.js'
// import { Listeners } from './comp/Listeners.js' // too complicated
import { Render } from './Render.js'

const Storage = new Store("tajan-josh");
const glob = globalThis

import { Logs } from '../utils/Logs.js'
const Logger = new Logs()

import { Debug } from '../utils/Debug.js'
const Debugger = new Debug()

export class Game {
  Renderer
  Listeners
  clientId
  roomId
  ws
  hashHandlerFlag = true
  joining = false
  actionButtons: HTMLElement;

  constructor() {
    this.initWebSocket()
    
    this.ws.onmessage = async (event) => this.message(event.data)

    this.Renderer = new Render(this.ws)

    // this.Listeners = new Listeners(this.Renderer) // unable to pass Renderer
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
      // Renderer.updateUI()
    }
    // if (typeof clientId === "undefined") {
    //   let _cards_ = createCards([['A','h'],['K','d'],['T','c'],['9','s']])
    //   glob.document.body.appendChild(_cards_)
    // }
  }

  initWebSocket() {
    const host = glob.location.origin.replace(/^(http|https)/, 'ws') // /^http/
    this.ws = new WebSocket(host)
  }

  init() {
    ///////// Create room ////////////
    const alert = glob.document.getElementById('alert')
    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);
    const d = glob.document.createElement('div')
    d.className = 'createbtn'
    d.innerText = 'Create a room'
    d.addEventListener('click', e => {
      const payLoad = {
        'method': 'create',
        'hostId': this.clientId
      }
      // console.log('data')
      this.ws.send(JSON.stringify(payLoad))
    })
    alert.append(d)
    //////////////////////////////////
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
    // console.log('data')
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
    else if (res.method === 'turn')
      this.turn()
    else if (res.method === 'draw')
      this.drawed(res)
    else if (res.method === 'move')
      this.moved(res)

    Logger.print(res)
  }

  //----------
  // Messages
  //----------

  connected(res) {
    // ws.send(clientId)
    this.clientId = res.clientId
    Logger.log('Client id set on init: ' + this.clientId, 'info')

    // get clientId from local storage
    const clientId = Storage.getClientId()
    Logger.log('Client id from local storage: ' + clientId, 'info')

    // COMMENTED FOR DEBUGGING
    // if clientId exists locally
    if (clientId?.length === 36) {
      this.clientId = clientId // set local id
    } 
    // update id if empty
    // else {
    //   Storage.update(this.clientId)
    // }
    // DEBUG COMMENT END

    const payLoad = {
      'method': 'load',
      'id': this.clientId
    }
    this.ws.send(JSON.stringify(payLoad))

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

    // TODO: disable hash handler for a room host hash change
    // https://stackoverflow.com/questions/13233914/prevent-window-onhashchange-from-executing-when-hash-is-set-via-javascript
    this.hashHandlerFlag = false
    glob.location.replace('#' + this.roomId)

    Logger.log(`Room created successfully by client: ${clientId}, with id: ${this.roomId}`, 'success')
    // console.log(glob.location.origin + '/r/' + roomId)
    glob.navigator.clipboard.writeText(glob.location.origin + '/#' + this.roomId).then(res => {
      console.log(`${glob.location.origin + '/#' + this.roomId} - copied to clipboard`);
    })

    // const alert = glob.document.getElementById('alert')
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

    ///////// Deal cards ////////////
    // const alert3 = glob.document.getElementById('alert')

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
    //////////////////////////////////

    Debugger.setRoomId(this.roomId)
  }

  joined(res) {
    const alert = glob.document.getElementById('alert')
    this.roomId = res.room.id
    // if (this.clientId === 'undefined') this.clientId = res.clientId
    this.clientId = res.clientId

    this.Renderer.setData(this.clientId, this.roomId)

    Logger.log(`Room: ${this.roomId} joined successfully by client: ${this.clientId}`, 'success')
    // const alert = glob.document.getElementById('alert')

    // if (this.clientId === res.clientId) {
    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);
    const p = glob.document.createElement('p')
    p.innerText = `${res.clientId} joined a room: ${this.roomId}`
    alert.append(p)
    // }
    // const z = glob.document.querySelector('#online span')
    // z.appendChild(res.room.clients.length)

    ///////// Create room ////////////
    // const alert2 = glob.document.getElementById('online')
    // while (alert2.children.length >= 1) {
    //   alert2.removeChild(alert2.lastChild);
    // }
    // res.room.clients.forEach(c => {
    //   const d2 = glob.document.createElement('div')
    //   // d2.className='createbtn'
    //   d2.innerText = c.name
    //   alert2.append(d2)
    // });
    //////////////////////////////////

    Debugger.setRoomId(this.roomId)
  }

  turn() {
    // show action buttons
    this.actionButtons.style.visibility = ''
    const alert = glob.document.getElementById('alert')
    Logger.log(`Now is your turn, client: ${this.clientId} from room id: ${this.roomId}`, 'info')
    // const alert0 = glob.document.getElementById('alert')

    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);
    const p0 = glob.document.createElement('p')
    p0.innerText = `Now is your turn!`
    alert.append(p0)
  }

  now(res) {
    // hide action buttons
    this.actionButtons.style.visibility = 'hidden'
    const alert = glob.document.getElementById('alert')
    Logger.log(`Now is client: ${res.name} turn, from room id: ${this.roomId}`, 'info')
    // const alert0 = glob.document.getElementById('alert')

    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);
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

    // const alert = glob.document.getElementById('alert')
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
    // wygrane
    if (res.verdict === 1) p.innerText = `Wygrany: ${this.roomId}`
    // przegrany
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