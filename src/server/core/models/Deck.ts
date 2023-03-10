const CONFIG = require('../../game.config.json')

class Deck {
  deck: any

  constructor(additional_cards = 0) {
    this.deck = [];

    //The order of the suits from strongest to weakest is Spades, Hearts, Diamonds, and Clubs
    const suits = CONFIG.suits;
    // const values = ['9', 'T', 'J', 'Q', 'K', 'A'];
    additional_cards = additional_cards > 7 ? 7 : additional_cards;
    const values = CONFIG.ranks.slice(7 - additional_cards, 13);

    for (let suit in suits) {
      for (let value in values) {
        this.deck.push([`${values[value]}`, `${suits[suit]}`]);
      }
    }
  }

  shuffle() {
    const { deck } = this;
    let m = deck.length;

    let n = 3
    while(n--) {
      while (m) {
        const i = Math.floor(Math.random() * m--);
        [deck[m], deck[i]] = [deck[i], deck[m]];
      }
      const tmp = deck.reverse()
      while(!deck.length) deck.pop()
      while(!tmp.length) deck.push(tmp.pop())
    }
    return this;
  }

  deal() {
    return this.deck.pop();
  }
}
module.exports = { Deck }
