import {pokerColors, pokerSymbols} from "./params.js";
export class Bid {
  constructor(cards) {
    let a, b, c, d, e;
    const bid = cards.match(/.{1,2}/g);
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
      case 9:
        cards = na + b + c + d;
        break;
      case 8:
        cards = na + b + b;
        break;
      case 7:
        cards = a + a + a + a;
        break;
      case 6:
        cards = na + na + na + na;
        break;
      case 5:
        cards = a + a + a + b + b;
        break;
      case 4:
        cards = a + a + a;
        break;
      case 3:
        cards = a + b + c + d + e;
        break;
      case 2:
        cards = a + a + b + b;
        break;
      case 1:
        cards = a + a;
        break;
      case 0:
        cards = a;
        break;
    }
    this.cards = cards;
  }
}
