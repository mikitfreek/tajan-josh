class Deck {
  constructor() {
    this.deck = [];
    const suits = ["k", "h", "t", "p"];
    const values = ["9", "T", "J", "Q", "K", "A"];
    for (let suit in suits) {
      for (let value in values) {
        this.deck.push([`${values[value]}`, `${suits[suit]}`]);
      }
    }
  }
  shuffle() {
    const {deck} = this;
    let m = deck.length;
    let n = 3;
    while (n--) {
      while (m) {
        const i = Math.floor(Math.random() * m--);
        [deck[m], deck[i]] = [deck[i], deck[m]];
      }
      const tmp = deck.reverse();
      while (!deck.length)
        deck.pop();
      while (!tmp.length)
        deck.push(tmp.pop());
    }
    return this;
  }
  deal() {
    return this.deck.pop();
  }
}
module.exports = {Deck};
