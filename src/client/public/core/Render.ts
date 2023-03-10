// import { Parser } from './Parser'
import { View } from './comp/View.js'
import { Bid } from './comp/Bid.js'
import * as params from './comp/params.js'

const glob = globalThis

export class Render {
  ws
  clientId
  roomId

  constructor(ws) {
    this.ws = ws

    const ViewNow = new View()
    ViewNow.init()
  }

  setData(clientId, roomId) {
    this.clientId = clientId
    this.roomId = roomId
  }

  static createCards(data) {
    // console.log(data)
    const cards = document.createElement('div')
    cards.className = 'cards'

    const emoji = (e) => String.fromCodePoint(e)
    const suits = (e) => {
      if      (e === 's') e = emoji(0x2660)
      else if (e === 'h') e = emoji(0x2665)
      else if (e === 'd') e = emoji(0x2666)
      else if (e === 'c') e = emoji(0x2663)
      return e
    };

    for (let i = 0; i < data.length; i++) {
      const card = document.createElement('div')
      card.className = 'card'
      const label = document.createElement('div')
      label.className = 'label'
      if (data[i][1] === 'h' || data[i][1] === 'd')
        label.className += ' red'
      for (let k = 0; k < 2; k++) {
        const span = document.createElement('span')
        span.innerHTML = k === 1 ? suits(data[i][1]) : data[i][k]
        label.appendChild(span)
      }
      card.appendChild(label)
      cards.appendChild(card)
    }
    return cards
  }

  renderSidebar() {
    const ui: any = document.getElementById('UI')
    const menu = document.getElementById('menu')

    menu.onclick = () => {
      this.animateSidebar(ui)
    }

    // const sidebar = document.querySelector('.sidebar');
    const closeBtn = document.getElementById('btn')
    closeBtn.onclick = () => {
      this.animateSidebar(ui)
    }
  }

  animateSidebar(ui) {
    if (ui.classList.contains('hidden')) {
      ui.classList.remove('hidden');
      setTimeout(() => {
        ui.classList.remove('visuallyhidden');
      }, 20);
    } else {
      ui.classList.add('visuallyhidden');
      setTimeout(() => {
        ui.classList.add('hidden');
      }, 60);
      // ui.addEventListener('transitionend', function() {
      //   ui.classList.add('hidden');
      // }, {
      //   capture: false,
      //   once: true,
      //   passive: false
      // });
    }
  }

  updateUI(bid) {
    /////////////////
    // let bid = '090102'; // output from server ------> client  // ['K','K','Q','Q','Q']
    // let cards = 'AhApAtKkKp'; // - ,, -
    // /////////////////

    let _bid = bid.match(/.{1,2}/g);

    // let _cards = cards.match(/.{1,2}/g);

    let bid_ = new Bid(bid);
    // console.log(bid_.cards);

    ////////////////////////////////////////////////////////////////
    // // bid UI
    const bid_last = document.getElementById('last');
    // const bid_lastfig = document.getElementById('last-fig');
    const span0 = document.createElement('span');

    let _arr = [],
      arr = [],
      color;
    const BB = (sym, col) => {
      let n = 0, _max = 0;
      for (let i = 0; i < sym.length; i++) {
        let curr = (bid_.cards.split(sym[i]).length - 1);
        if (curr != 0) {
          _arr[n] = (curr > _max) && curr;
          arr[n] = sym[i];
          n++;
        }
      }
      if (col > 0) {
        for (let i = 0; i < sym.length; i++) {
          color = ((bid_.cards.split(params.pokerColors[i]).length - 1) != 0) ? params.pokerColors[i] : '';
        }
      }
    }
    console.log(color)
    // figures
    switch (Number(_bid[0])) {
      case 6:
        BB(params.pokerColors, 0);
        break;
      case 8:
        BB(params.pokerSymbols, 0);
        break;
      case 9:
        BB(params.pokerSymbols, 0); ////////////// edit
        break;
      default:
        BB(params.pokerSymbols, 0);
        break;
    }
    // colors
    // let BB = () => { for (let i = 0; i < pokerSymbols.length; i++) {
    //   ((bid_.cards.split(pokerColors[i]).length - 1) > 0) }}
    // if ()

    span0.innerHTML = _arr[0] + 'x <i>' + arr[0] + '</i>';
    const span1 = document.createElement('span');
    span1.innerHTML = (_arr.length > 1) ? _arr[1] + 'x <i>' + arr[1] + '</i>' : '';
    const span2 = document.createElement('span');
    span2.innerHTML = (_arr.length > 2) ? _arr[2] + 'x <i>' + arr[2] + '</i>' : '';
    bid_last.appendChild(span0);
    bid_last.appendChild(span1);
    bid_last.appendChild(span2);
    // bid_lastfig.innerHTML = ranks09[ranks09.length-Number(_bid[0])-1];

    // let list0_, list1_, list2_//, s__
    // let s = -1

  }

  toggleDarkMode() {
    const e = document.body;
    e.classList.toggle("dark-mode");
  }

  openMd = (clientId, roomId, id) => {
    const md = document.createElement('div');

    md.classList.add('md-modal')

    const exit = document.createElement('span');
    exit.innerHTML = '&#10005;';
    exit.classList.add('exit'); // esc
    //exit.id = 'exit';
    md.appendChild(exit);

    const title = document.createElement('div');
    title.classList.add('title');

    const content = document.createElement('div');
    content.classList.add('content');

    //////////////////////////////////
    const lists = document.createElement('div');
    lists.classList.add('lists');

    const list0 = document.createElement('select');
    list0.id = 'ranks'
    list0.name = 'Ranks'
    list0.title = "ranks"
    list0.size = 10

    list0.addEventListener('change', () => {
      bid = setBid(list0.options.selectedIndex)

      onButtonClick(list0.options.selectedIndex);
      // list0_= list0.options.selectedIndex
      // list2.options.selectedIndex
    }, false);

    // list.innerHTML = "";
    params.ranks9.forEach(function (e, i) {
      const p = document.createElement('option');
      p.appendChild(document.createTextNode(e));
      // p.value=String(ranks9.length-i)
      list0.appendChild(p);
    });


    // cardsSymbols9.forEach(function(e) {
    //   var p = document.createElement('option');
    //   p.appendChild(document.createTextNode(e));
    //   list1.appendChild(p);
    // });


    // function onButtonClick() {
    //   console.log('click')
    //   // ranks9.forEach(function(e) {
    //   //   var p = document.createElement('option');
    //   //   p.appendChild(document.createTextNode(e));
    //   //   list1.appendChild(p);
    //   // });
    //   // lists.appendChild(list1);
    //   // content.appendChild(lists);
    // }

    // const _buttons = document.querySelectorAll('option'); //getElementsByTagName('option')
    // _buttons.forEach(e => {
    //   e.addEventListener('click', onButtonClick, false);
    // })

    //////////////////////////////////


    switch (id) {
      case 'raise':
        title.innerHTML = 'Raise a bet!';
        // content.innerHTML = 'Select..!';

        lists.appendChild(list0);

        content.appendChild(lists);
        break;
      case 'check':
        title.innerHTML = 'Check last player!';

        const mess = document.createElement('div');
        mess.classList.add('message')
        mess.innerHTML = 'Are you sure to check last player figure?';
        content.appendChild(mess);
        break;
      // case 'checked':
      //   title.innerHTML = 'Check last player!';

      //   const mess1 = document.createElement('div');
      //   mess1.classList.add('message')
      //   mess1.innerHTML = 'Are you sure to check last player figure?';
      //   content.appendChild(mess1);
      //   break;
      // case 'checkedu':
      //   title.innerHTML = 'Check last player!';

      //   const mess2 = document.createElement('div');
      //   mess2.classList.add('message')
      //   mess2.innerHTML = 'Are you sure to check last player figure?';
      //   content.appendChild(mess2);
      //   break;
    }

    md.appendChild(title);
    md.appendChild(content);

    // btns accept
    const _btns = document.createElement('div');
    _btns.classList.add('btns-action', 'confirm');

    const _btns1 = document.createElement('button');
    _btns1.classList.add('btn', 'cancel'); // esc
    _btns1.innerHTML = 'Cancel';

    // let   list0__=list0.options.selectedIndex, 
    //       list1__=list1.options.selectedIndex, 
    //       list2__=list2.options.selectedIndex
    //let    s=String('0' + Number(9 - list0_) + '0' + list1_ + '0' + list2_), // = list0.options.selectedIndex
    // const ranks9 = [
    //   'Royal flush',      // 09 02 01 // 9k   // 3rd color
    //   'Straight flush',   // 08 09 01 // 89k  // 3rd color
    //   'Four of a kind',   // 07 02 00 // 79
    //   'Flush',            // 06 00 01 // 6k   // 3rd color
    //   'Full house',       // 05 02 03 // 59T
    //   'Three of a kind',  // 04 02 00 // 49
    //   'Straight',         // 03 09 00 // 39
    //   'Two pairs',        // 02 03 02 // 29T  03 03 02 02 // sort max to begin
    //   'Pair',             // 01 02 00 // 19   02 02 
    //   'High card',        // 00 02 00 // 09   02
    let bid;
    const setBid = (paramBid, param1 = -1, param2 = -1) => {
      let b = 9 - paramBid // 9 - number of bids
      let n = 13 + 1 // 13 figures in max scenario; + 1 because code 02 is figure 2
      let n1 = n, n2 = n
      if (b === 3 || b === 8) n1 = 9 + 1 // 9 straight bids; +1 as above
      if (b === 6 || b === 8 || b === 9) n2 = 4 // color bids
      let one = param1 === -1 ? '00' : String(n1 - param1)
      let two = param2 === -1 ? '00' : String(n2 - param2)
      one = one.length === 1 ? `0${one}` : one
      two = two.length === 1 ? `0${two}` : two

      return `0${b}${one}${two}`
    }
    // let bid = (id === 'raise') ? s_ : 'check';
    // const bid = s_

    const ranks_ = document.getElementById('ranks')
    const cards_ = document.getElementById('cards')
    const cards2_ = document.getElementById('cards2')

    const btns = document.getElementById('action');
    btns.style.visibility = 'hidden';
    const closeMd = () => {
      // document.body.removeChild(document.body.lastChild);
      md.remove()
      btns.style.visibility = 'visible';
    }

    let _btns2 = document.createElement('button');
    _btns2.classList.add('btn');
    _btns2.innerHTML = 'Accept';

    _btns.appendChild(_btns1);
    _btns.appendChild(_btns2);

    md.appendChild(_btns);

    // add canvas to dom
    document.body.appendChild(md);

    // _btns2.id = (id === 'raise') ? 'raise-accept' : 'fire-accept'
    let allow = false
    _btns2.addEventListener('click', (e) => {
      const alert = document.getElementById('alert')
      while (alert.children.length >= 1)
        alert.removeChild(alert.lastChild);
      const d = document.createElement('div')
      if (allow || id === 'check') {
        // d.className='createbtn'
        d.innerText = 'Bid is too small' // sending bid to server
        // console.log(bid)
        // raise
        switch (id) {
          case 'raise':
            const payLoad1 = {
              'method': 'move',
              'type': 'raise',
              'roomId': roomId,
              'clientId': clientId,
              'bid': bid
            }
            this.ws.send(JSON.stringify(payLoad1))
            break;
          case 'check':
            const payLoad2 = {
              'method': 'move',
              'type': 'check',
              'roomId': roomId,
              'clientId': clientId,
            }
            this.ws.send(JSON.stringify(payLoad2))
            break;
          }
        // alert.append(d);

        closeMd()
      }
      else d.innerText = 'Check all options'
      alert.append(d);
    });

    const esc = [
      exit,
      _btns1
    ]
    esc.forEach((e) => {
      e.addEventListener('click', () => {
        closeMd()
      });
    });

    const onButtonClick = (val) => {
      while (lists.children.length > 1)
        lists.removeChild(lists.lastChild);

      const list1 = document.createElement('select');
      list1.id = 'cards'
      list1.name = 'Cards'
      list1.title = "cards"
      list1.size = 10
      let _width = '4.1rem'
      if (val == 7 || val == 4) list1.style.minWidth = _width
      list1.addEventListener('change', () => {
        if (val == 0 || val == 3)
          bid = setBid(list0.options.selectedIndex, -1, list1.options.selectedIndex)
        else if (val == 1)
          bid = setBid(list0.options.selectedIndex, 0, list1.options.selectedIndex)
        else bid = setBid(list0.options.selectedIndex, list1.options.selectedIndex)

        // console.log(s)
        if (lists.childNodes.length > 2) {
          onButtonClick2(list1.options.selectedIndex);
          // list1_= list1.options.selectedIndex
          // s__='0' + (9 - Number(list0__)) + '0' + list1__
        }
        else allow = true
      }, false);

      let symbols = [
        params.cardsColors9,
        params.cardsColors9, //here cardsStraightSymbol9
        params.cards4Symbols9,
        params.cardsColors9,
        params.cards3Symbols9,
        params.cards3Symbols9,
        params.cardsStraightSymbols9,
        params.cards2Symbols9,
        params.cards2Symbols9,
        params.cardsSymbols9
      ]
      symbols[val].forEach(function (e, i) {
        const p = document.createElement('option');
        p.appendChild(document.createTextNode(e));
        // p.value=String(symbols.length-i)
        list1.appendChild(p);
      });

      lists.appendChild(list1);

      const list2 = document.createElement('select');
      list2.id = 'cards2'
      list2.addEventListener('change', () => {
        if (lists.childNodes.length > 2) {
          onButtonClick1(list2.options.selectedIndex)
          bid = setBid(list0.options.selectedIndex, list1.options.selectedIndex, list2.options.selectedIndex)

          // list2_= list2.options.selectedIndex
          // s__='0' + Number(9 - list0__) + '0' + list1__ + '0' + list2__
        }
      }, false);
      if (val == 7 || val == 4) { // || val==1

        list2.name = 'Cards'
        list2.title = "cards"
        list2.size = 10
        list2.style.minWidth = _width

        //const _symbols= (val==7 || val==4) ? cards2Symbols9 : cardsColors9;

        params.cards2Symbols9.forEach(function (e, i) {
          const p = document.createElement('option');
          p.appendChild(document.createTextNode(e));
          // p.value=String(cards2Symbols9.length-i)
          list2.appendChild(p);
        });

        lists.appendChild(list2);
      }
      let val1 = 0, val2 = 0
      const checkSelected = () => {
        if (list1.options[val1].selected === true 
          && list2.options[val2].selected === true) allow = true
      }
      const onButtonClick2 = (val) => {
        Array.from(list2.options).forEach(function (e) { e.disabled = false });
        val1 = val
        checkSelected()
        list2.options[val].disabled = true;
        list2.options[val].selected = false;
      }
      const onButtonClick1 = (val) => {
        Array.from(list1.options).forEach(function (e) { e.disabled = false });
        val2 = val
        checkSelected()
        list1.options[val].disabled = true;
        list1.options[val].selected = false;
      }
    }
  }
}