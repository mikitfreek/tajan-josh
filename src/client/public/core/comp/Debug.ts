export class Debug {
  clientId
  roomId
  ws

  constructor() { }

  setWs = (ws) => this.ws = ws
  setClientId = (clientId) => this.clientId = clientId
  setRoomId = (roomId) => this.roomId = roomId

  interface() {
    const bidd = document.createElement('input')
    bidd.id = 'bid-code'
    bidd.placeholder = '00 02 00 ... 09 01 02 ..'
    document.body.append(bidd)

    const btnBid = document.createElement('button')
    btnBid.id = 'bid'
    btnBid.innerText = 'raise'
    document.body.append(btnBid)
    btnBid.addEventListener('click', e => {
      const payLoad = {
        'method': 'move',
        'roomId': this.roomId,
        'clientId': this.clientId,
        'bid': bidd.value
      }
      this.ws.send(JSON.stringify(payLoad))
    })

    const btnCheck = document.createElement('button')
    btnCheck.id = 'check'
    btnCheck.innerText = 'check'
    document.body.append(btnCheck)
    btnCheck.addEventListener('click', e => {
      const payLoad = {
        'method': 'move',
        'roomId': this.roomId,
        'clientId': this.clientId,
        'bid': 'check'
      }
      this.ws.send(JSON.stringify(payLoad))
    })

    const btnDraw = document.createElement('button')
    btnDraw.id = 'draw'
    btnDraw.innerText = 'draw'
    document.body.append(btnDraw)
    btnDraw.addEventListener('click', e => {
      const payLoad = {
        'method': 'draw',
        'roomId': this.roomId
      }
      this.ws.send(JSON.stringify(payLoad))
    })

    const btnCreate = document.createElement('button')
    btnCreate.id = 'create'
    btnCreate.innerText = 'create'
    document.body.append(btnCreate)
    btnCreate.addEventListener('click', e => {
      const payLoad = {
        'method': 'create',
        'hostId': this.clientId
      }
      // console.log('data')
      this.ws.send(JSON.stringify(payLoad))
    })

    // const destRoomId = document.createElement('input')
    // destRoomId.id = 'join-code'
    // destRoomId.placeholder = 'Enter room id..'
    // document.body.append(destRoomId)

    // const btnJoin = document.createElement('button')
    // btnJoin.id = 'join'
    // btnJoin.innerText = 'join'
    // document.body.append(btnJoin)
    // btnJoin.addEventListener('click', e => {
    //   const dest = destRoomId.value
    //   if (dest.length===8){
    //     //if (roomId === null)

    //     const payLoad = {
    //       'method': 'join',
    //       'clientId': clientId,
    //       'roomId': dest
    //     }
    //     ws.send(JSON.stringify(payLoad))
    //   }
    // })
  }
}