import { Render } from './comp/Render.js'
import { Debug } from './comp/Debug.js'


export class Game {
  clientId
  roomId
  ws
  glob

  constructor() {
    this.glob = globalThis;
    this.initWebSocket()
    
    this.ws.onmessage = (event) => {
      this.message(event.data)
    };

    const Renderer = new Render(this.ws, this.clientId, this.roomId)

    this.glob.window.onload = () => {
      this.init()
      Renderer.renderSidebar()
      Renderer.toggleDarkMode()
      Renderer.updateUI()
    }
    // if (typeof clientId === "undefined") {
    //   let _cards_ = createCards([['A','h'],['K','d'],['T','c'],['9','s']])
    //   document.body.appendChild(_cards_)
    // }
  }

  initWebSocket() {
    const host = this.glob.window.location.origin.replace(/^http/, 'ws')
    this.ws = new WebSocket(host)
  }

  init() {
    ///////// Create room ////////////
    const alert = document.getElementById('alert')
    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);
    const d = document.createElement('div')
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

    const Debuger = new Debug(this.ws, this.clientId, this.roomId)
    Debuger.interface()
  }

  message(msg) {
    const req = JSON.parse(msg) //.utf8Data
    if (req.method === 'connect')
      this.connect(req)
    else if (req.method === 'create')
      this.create(req)
    else if (req.method === 'join')
      this.join(req)
    else if (req.method === 'draw')
      this.draw(req)
    else if (req.method === 'move')
      this.move(req)
  }

  connect(res) {
    // ws.send(clientId)
    this.clientId = res.clientId
    console.log('Client id set successfully ' + this.clientId)
  }

  turn(res) {
    const alert = document.getElementById('alert')
    console.log('Now is client: ' + this.clientId + ' turn, from room id: ' + this.roomId)
    // const alert0 = document.getElementById('alert')

    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);
    const p0 = document.createElement('p')
    p0.innerText = `Now is your turn!`
    alert.append(p0)
  }

  create(res) {
    const alert = document.getElementById('alert')
    this.roomId = res.room.id
    const clientId = res.room.hostId
    console.log('Room created successfully by client: ' + clientId + ', with id: ' + this.roomId)
    // console.log(this.glob.window.location.origin + '/r/' + roomId)
    navigator.clipboard.writeText(this.glob.window.location.origin + '/r/' + this.roomId).then(res => {
      console.log(`${this.glob.window.location.origin + '/r/' + this.roomId} - copied to clipboard`);
    })
    // const alert = document.getElementById('alert')
    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);
    const p = document.createElement('p')
    p.innerText = `Created a room! id: ${this.roomId}`
    alert.append(p)
    const inp = document.createElement('input')
    inp.value = `${this.glob.window.location.origin.replace(/^(http|https):\/\//, '') + '/r/' + this.roomId}`
    alert.append(inp)
    const a = document.createElement('span')
    a.innerText = `- copied to clipboard! -`
    a.className = 'clip'
    alert.append(a)

    ///////// Deal cards ////////////
    // const alert3 = document.getElementById('alert')

    const d3 = document.createElement('div')
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
  }

  join(res) {
    const alert = document.getElementById('alert')
    this.roomId = res.room.id
    if (this.clientId === 'undefined') this.clientId = res.clientId
    console.log('Room:' + this.roomId + ' joined successfully by client: ' + this.clientId)
    // const alert = document.getElementById('alert')

    if (this.clientId === res.clientId) {
      while (alert.children.length >= 1)
        alert.removeChild(alert.lastChild);
      const p = document.createElement('p')
      p.innerText = `${res.clientId} joined a room: ${this.roomId}`
      alert.append(p)
    }
    // const z = document.querySelector('#online span')
    // z.appendChild(res.room.clients.length)

    ///////// Create room ////////////
    // const alert2 = document.getElementById('online')
    // while (alert2.children.length >= 1) {
    //   alert2.removeChild(alert2.lastChild);
    // }
    // res.room.clients.forEach(c => {
    //   const d2 = document.createElement('div')
    //   // d2.className='createbtn'
    //   d2.innerText = c.name
    //   alert2.append(d2)
    // });
    //////////////////////////////////
  }

  draw(res) {
    const alert = document.getElementById('alert')
    const cards = res.cards
    console.log('Room:' + this.roomId + ' ; client: ' + this.clientId + ' ; cards: ' + [cards])

    let check = document.querySelector('.cards')
    if (check !== null) document.body.removeChild(check)
    let _cards_ = Render.createCards(cards)
    document.body.appendChild(_cards_)

    // const alert = document.getElementById('alert')
    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);
    const p = document.createElement('p')
    p.innerText = `Dealing cards in room: ${this.roomId}`
    alert.append(p)
  }

  move(res) {
    const alert = document.getElementById('alert')
    while (alert.children.length >= 1)
      alert.removeChild(alert.lastChild);
    if (res.type === 'check') {
      if (res.stat === 1) {
        //wygrany
        while (alert.children.length >= 1)
          alert.removeChild(alert.lastChild);
        const p = document.createElement('p')
        p.innerText = `Wygrany: ${this.roomId}`
        alert.append(p)
      } else {
        //przegrany
        while (alert.children.length >= 1)
          alert.removeChild(alert.lastChild);
        const p = document.createElement('p')
        p.innerText = `Przegrany: ${this.roomId}`
        alert.append(p)
      }
    } else {
      //raise
      //const alert = document.getElementById('alert')
      while (alert.children.length >= 1)
        alert.removeChild(alert.lastChild);
      const p = document.createElement('p')
      p.innerText = `Raise: ${this.roomId}`
      alert.append(p)
    }
  }
}