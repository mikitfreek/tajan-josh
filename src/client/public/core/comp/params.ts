const pokerSymbols = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

const pokerColors = ['c', 'd', 'h', 's'];

let _pokerSymbols = pokerSymbols
const cardsSymbols9 = _pokerSymbols.splice(7, 6).reverse()

// ♠	&spades;	&#9824;	&#x2660;	black spade suit
// ♥	&hearts;	&#9829;	&#x2665;	black heart suit = valentine
// ♦	&diams;	    &#9830;	&#x2666;	black diamond suit
// ♣	&clubs;	    &#9827;	&#x2663;	black club suit = shamrock
const emoji = (e) => String.fromCodePoint(e)
const cardsColors9 = pokerColors.reverse().map(e => {
    if      (e === 's') e = emoji(0x2660) + ' pikuś'
    else if (e === 'h') e = emoji(0x2665) + ' serducho'
    else if (e === 'd') e = emoji(0x2666) + ' karo'
    else if (e === 'c') e = emoji(0x2663) + ' treflik'
    return e
});

const cards2Symbols9 = cardsSymbols9.map(e => {
    e = e + e
    return e
});

const cards3Symbols9 = cardsSymbols9.map(e => {
    e = e + e + e
    return e
});

const cards4Symbols9 = cards2Symbols9.map(e => {
    e = e + e
    return e
});

const cardsStraightSymbols9 = ['TJQKA', '9TJQK']
// let _cardsStraightSymbols9=cardsStraightSymbols9
// const cardsStraightSymbol9 = ['9TJQK']//_cardsStraightSymbols9.splice(1,1)

const ranks9 = [
    'Royal flush',
    'Straight flush',
    'Four of a kind',
    'Flush',
    'Full house',
    'Three of a kind',
    'Straight',
    'Two pairs',
    'Pair',
    'High card',
]

// const ranks8 = [
    // ...
    // 'Full house',
    // 'Flush',
    // ...
// ]

export { pokerSymbols, pokerColors, cardsSymbols9, cardsColors9, cards2Symbols9, cards3Symbols9, cards4Symbols9, cardsStraightSymbols9, ranks9 }