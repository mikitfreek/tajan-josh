class Room {
  constructor(roomId, hostId) {
    this.roomId = roomId;
    this.hostId = hostId;
  }
  public() {
    const roomData = {
      id: this.roomId,
      hostId: this.hostId,
      clients: []
    };
    return roomData;
  }
  private() {
    const roomData = {
      last: 0,
      bid: null,
      clients: [],
      cards: []
    };
    return roomData;
  }
}
module.exports = {Room};
