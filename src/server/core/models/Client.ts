class Client {
  
  constructor(clientName, clientId, ws, clientIp, cardsStart) {

    const clientData = {
      'name': clientName,
      'id': clientId,
      'connection': ws,
      'ip': clientIp,
      'room': 'init',
      'color': 'init',
      'score': cardsStart,
      'cards': [],
      'counters': {
        'limit': 0,
        'burst': 0
      }
    }

    return clientData
  }
}
module.exports = { Client }
