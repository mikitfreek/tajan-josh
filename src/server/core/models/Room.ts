class Room {
  roomId: string
  hostId: string

  constructor(roomId, hostId) {
    this.roomId = roomId
    this.hostId = hostId
    
  }

  public() {
    const roomData = {
      'id': this.roomId,
      'hostId': this.hostId,
      'clients': []
    }

    return roomData
  }

  private() {
    const _roomData = {
      'cards': [],
      // 'clients': ['cards': [],'score': cardsStart], // TODO: move from client model
      'player': {
        'last': null,
        'next': 0,
        'opener': 0, // TODO: get next round opening player
        'check': false,
      },
      'bid': null,
      'clients': []
    }

    return _roomData
  }
}

module.exports = { Room }
