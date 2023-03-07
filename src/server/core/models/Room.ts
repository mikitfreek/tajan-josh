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
      // 'score': cardsStart,
      // 'cards': [],
      'cards': [],
      'player': {
        'last': null,
        'next': 0,
      },
      'bid': null,
    }

    return _roomData
  }
}
module.exports = { Room }
