const pokerSymbols = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

const pokerColors = ['k', 'h', 't', 'p']; // k: 9826, h: 9825, t: 9831, p: 9828

let _pokerSymbols = pokerSymbols
const cardsSymbols9 = _pokerSymbols.splice(7, 6).reverse()

const cardsColors9 = pokerColors.map(e => {
    if (e === 'k') e = 'karo'
    if (e === 'h') e = 'serducho'
    if (e === 't') e = 'treflik'
    if (e === 'p') e = 'pikuś'
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

// karty od 9
const ranks9 = [
    'Royal flush',      // 09 01 02 // // 2nd color
    'Straight flush',   // 08 01 09 // // 2nd color
    'Four of a kind',   // 07 02 00 // 
    'Flush',            // 06 01 00 //... // 2nd color
    'Full house',       // 05 02 03 // 
    'Three of a kind',  // 04 02 00 // 
    'Straight',         // 03 09 00 //
    'Two pairs',        // 02 03 02 // 03 03 02 02 // sort max to begin
    'Pair',             // 01 02 00 // 02 02 
    'High card',        // 00 02 00 // 02
]

// karty od 8
const ranks8 = [
    'Royal flush',      // 09 01 02 // 2nd color
    'Straight flush',   // 08 01 08_// 2nd color
    'Four of a kind',   // 07 02 00 
    'Full house',       // 06 02 03 
    'Flush',            // 05 01 00 // 2nd color
    'Three of a kind',  // 04 02 00    
    'Straight',         // 02 08_00
    'Two pairs',        // 02 03 02 // sort max to begin
    'Pair',             // 01 02 00 
    'High card',        // 00 02 00 
]

export { pokerSymbols, pokerColors, cardsSymbols9, cardsColors9, cards2Symbols9, cards3Symbols9, cards4Symbols9, cardsStraightSymbols9, ranks9, ranks8 }