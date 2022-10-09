const pokerSymbols = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
const pokerColors = ["k", "h", "t", "p"];
let _pokerSymbols = pokerSymbols;
const cardsSymbols9 = _pokerSymbols.splice(7, 6).reverse();
const cardsColors9 = pokerColors.map((e) => {
  if (e === "k")
    e = "karo";
  if (e === "h")
    e = "serducho";
  if (e === "t")
    e = "treflik";
  if (e === "p")
    e = "pikuś";
  return e;
});
const cards2Symbols9 = cardsSymbols9.map((e) => {
  e = e + e;
  return e;
});
const cards3Symbols9 = cardsSymbols9.map((e) => {
  e = e + e + e;
  return e;
});
const cards4Symbols9 = cards2Symbols9.map((e) => {
  e = e + e;
  return e;
});
const cardsStraightSymbols9 = ["TJQKA", "9TJQK"];
const ranks9 = [
  "Royal flush",
  "Straight flush",
  "Four of a kind",
  "Flush",
  "Full house",
  "Three of a kind",
  "Straight",
  "Two pairs",
  "Pair",
  "High card"
];
const ranks8 = [
  "Royal flush",
  "Straight flush",
  "Four of a kind",
  "Full house",
  "Flush",
  "Three of a kind",
  "Straight",
  "Two pairs",
  "Pair",
  "High card"
];
export {pokerSymbols, pokerColors, cardsSymbols9, cardsColors9, cards2Symbols9, cards3Symbols9, cards4Symbols9, cardsStraightSymbols9, ranks9, ranks8};
