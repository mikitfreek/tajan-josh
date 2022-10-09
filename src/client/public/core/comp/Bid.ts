import { pokerColors, pokerSymbols } from './params.js'

export class Bid {
    // field 
    cards: string;

    // constructor 
    constructor(cards: string) {

      let a, b, c, d, e;

      const bid = cards.match(/.{1,2}/g);
    //   const B = (n: number) => pokerColors[Number(bid[1 + n])]; /////////

      for (let i = 0; i < bid.length; i++) {
        switch (i) {
          case 0:
            a = pokerSymbols[Number(bid[1]) - 2];
            break;
          case 1:
            b = pokerSymbols[Number(bid[2]) - 2];
            break;
          case 2:
            c = pokerSymbols[Number(bid[3]) - 2];
            break;
          case 3:
            d = pokerSymbols[Number(bid[4]) - 2];
            break;
          case 4:
            e = pokerSymbols[Number(bid[5]) - 2];
            break;
        }
      }

      const na = pokerColors[Number(bid[1])];

      switch (Number(bid[0])) {
        case 9: // Royal flush
          cards = na + b + c + d;//
          break;
        case 8: // Straight flush
          cards = na + b + b;//
          break;
        case 7: // Four of a kind
          cards = a + a + a + a;
          break;
        case 6: // Flush
          cards = na + na + na + na;//
          break;
        case 5: // Full house
          cards = a + a + a + b + b;
          break;
        case 4: // Three of a kind
          cards = a + a + a;
          break;
        case 3: // Straight
          cards = a + b + c + d + e;
          break;
        case 2: // Two pairs
          cards = a + a + b + b;
          break;
        case 1: // Pair
          cards = a + a;
          break;
        case 0: // High card
          cards = a;
          break;
      }

      this.cards = cards
    }
  }