import {Bid} from "./Bid.js";
import * as params from "./params.js";
export class Render {
  constructor(ws, clientId, roomId) {
    this.ws = ws;
    this.clientId = clientId;
    this.roomId = roomId;
  }
  static createCards(data) {
    const cards = document.createElement("div");
    cards.className = "cards";
    for (let i = 0; i < data.length; i++) {
      const card = document.createElement("div");
      card.className = "card";
      const label = document.createElement("div");
      label.className = "label";
      if (data[i][1] === "h" || data[i][1] === "d")
        label.className += " red";
      for (let k = 0; k < 2; k++) {
        const span = document.createElement("span");
        span.innerHTML = data[i][k];
        label.appendChild(span);
      }
      card.appendChild(label);
      cards.appendChild(card);
    }
    return cards;
  }
  renderSidebar() {
    const ui = document.getElementById("renderUi");
    const menu = document.getElementById("menu");
    menu.onclick = () => {
      this.animateSidebar(ui);
    };
    const closeBtn = document.getElementById("btn");
    closeBtn.onclick = () => {
      this.animateSidebar(ui);
    };
  }
  animateSidebar(ui) {
    if (ui.classList.contains("hidden")) {
      ui.classList.remove("hidden");
      setTimeout(function() {
        ui.classList.remove("visuallyhidden");
      }, 20);
    } else {
      ui.classList.add("visuallyhidden");
      setTimeout(function() {
        ui.classList.add("hidden");
      }, 60);
    }
  }
  updateUI() {
    let bid = "090102";
    let _bid = bid.match(/.{1,2}/g);
    let bid_ = new Bid(bid);
    const bid_last = document.getElementById("last");
    const span0 = document.createElement("span");
    let _arr = [], arr = [], color;
    const BB = (sym, col) => {
      let n = 0, _max = 0;
      for (let i = 0; i < sym.length; i++) {
        let curr = bid_.cards.split(sym[i]).length - 1;
        if (curr != 0) {
          _arr[n] = curr > _max && curr;
          arr[n] = sym[i];
          n++;
        }
      }
      if (col > 0) {
        for (let i = 0; i < sym.length; i++) {
          color = bid_.cards.split(params.pokerColors[i]).length - 1 != 0 ? params.pokerColors[i] : "";
        }
      }
    };
    console.log(color);
    switch (Number(_bid[0])) {
      case 6:
        BB(params.pokerColors, 0);
        break;
      case 8:
        BB(params.pokerSymbols, 0);
        break;
      case 9:
        BB(params.pokerSymbols, 0);
        break;
      default:
        BB(params.pokerSymbols, 0);
        break;
    }
    span0.innerHTML = _arr[0] + "x <i>" + arr[0] + "</i>";
    const span1 = document.createElement("span");
    span1.innerHTML = _arr.length > 1 ? _arr[1] + "x <i>" + arr[1] + "</i>" : "";
    const span2 = document.createElement("span");
    span2.innerHTML = _arr.length > 2 ? _arr[2] + "x <i>" + arr[2] + "</i>" : "";
    bid_last.appendChild(span0);
    bid_last.appendChild(span1);
    bid_last.appendChild(span2);
  }
  toggleDarkMode() {
    const e = document.body;
    e.classList.toggle("dark-mode");
  }
  openMd(id) {
    const md = document.createElement("div");
    md.classList.add("md-modal");
    const exit = document.createElement("span");
    exit.innerHTML = "&#10005;";
    exit.classList.add("exit");
    md.appendChild(exit);
    const title = document.createElement("div");
    title.classList.add("title");
    const content = document.createElement("div");
    content.classList.add("content");
    const lists = document.createElement("div");
    lists.classList.add("lists");
    const list0 = document.createElement("select");
    list0.id = "ranks";
    list0.name = "Ranks";
    list0.title = "ranks";
    list0.size = 10;
    const render = this;
    list0.addEventListener("change", function() {
      setBid(0, list0.options.selectedIndex);
      onButtonClick(list0.options.selectedIndex);
    }, false);
    params.ranks9.forEach(function(e, i) {
      const p = document.createElement("option");
      p.appendChild(document.createTextNode(e));
      list0.appendChild(p);
    });
    switch (id) {
      case "raise":
        title.innerHTML = "Raise a bet!";
        lists.appendChild(list0);
        content.appendChild(lists);
        break;
      case "fire":
        title.innerHTML = "Check last player!";
        const mess = document.createElement("div");
        mess.classList.add("message");
        mess.innerHTML = "Are you sure to check last player figure?";
        content.appendChild(mess);
        break;
    }
    md.appendChild(title);
    md.appendChild(content);
    const _btns = document.createElement("div");
    _btns.classList.add("btns-action", "confirm");
    const _btns1 = document.createElement("button");
    _btns1.classList.add("btn", "cancel");
    _btns1.innerHTML = "Cancel";
    let s_;
    const setBid = (col, val0, val1 = 0, val2 = 0) => {
      switch (col) {
        case 0:
          s_ = `0${9 - val0}`;
          break;
        case 1:
          s_ = `0${9 - val0}0${val1}`;
          break;
        case 2:
          s_ = `0${9 - val0}0${val1}0${val2}`;
          break;
      }
    };
    let bid__ = id === "raise" ? s_ : "check";
    const ranks_ = document.getElementById("ranks");
    const cards_ = document.getElementById("cards");
    const cards2_ = document.getElementById("cards2");
    const _btns2 = document.createElement("button");
    _btns2.classList.add("btn");
    _btns2.id = id;
    _btns2.addEventListener("click", (e) => {
      const alert = document.getElementById("alert");
      while (alert.children.length >= 1)
        alert.removeChild(alert.lastChild);
      const d = document.createElement("div");
      d.innerText = "Send bid..";
      console.log(bid__);
      d.addEventListener("click", (e2) => {
        const payLoad = {
          method: "move",
          roomId: this.roomId,
          clientId: this.clientId,
          bid: bid__
        };
        this.ws.send(JSON.stringify(payLoad));
      });
      alert.append(d);
    });
    _btns2.innerHTML = "Accept";
    _btns.appendChild(_btns1);
    _btns.appendChild(_btns2);
    md.appendChild(_btns);
    document.body.appendChild(md);
    const btns = document.getElementById("action");
    btns.style.visibility = "hidden";
    const esc = [
      exit,
      _btns1
    ];
    esc.forEach((e) => {
      e.addEventListener("click", () => {
        document.body.removeChild(document.body.lastChild);
        btns.style.visibility = "visible";
      });
    });
    const onButtonClick = (val) => {
      while (lists.children.length > 1)
        lists.removeChild(lists.lastChild);
      const list1 = document.createElement("select");
      list1.id = "cards";
      list1.name = "Cards";
      list1.title = "cards";
      list1.size = 10;
      let _width = "4.1rem";
      if (val == 7 || val == 4)
        list1.style.minWidth = _width;
      list1.addEventListener("change", function() {
        setBid(1, list0.options.selectedIndex, list1.options.selectedIndex);
        if (lists.childNodes.length > 2) {
          onButtonClick2(list1.options.selectedIndex);
        }
      }, false);
      let symbols = [
        params.cardsColors9,
        params.cardsColors9,
        params.cards4Symbols9,
        params.cardsColors9,
        params.cards3Symbols9,
        params.cards3Symbols9,
        params.cardsStraightSymbols9,
        params.cards2Symbols9,
        params.cards2Symbols9,
        params.cardsSymbols9
      ];
      symbols[val].forEach(function(e, i) {
        const p = document.createElement("option");
        p.appendChild(document.createTextNode(e));
        list1.appendChild(p);
      });
      lists.appendChild(list1);
      const list2 = document.createElement("select");
      list2.id = "cards2";
      list2.addEventListener("change", function() {
        if (lists.childNodes.length > 2) {
          setBid(2, list0.options.selectedIndex, list1.options.selectedIndex, list2.options.selectedIndex);
        }
      }, false);
      if (val == 7 || val == 4) {
        list2.name = "Cards";
        list2.title = "cards";
        list2.size = 10;
        list2.style.minWidth = _width;
        params.cards2Symbols9.forEach(function(e, i) {
          const p = document.createElement("option");
          p.appendChild(document.createTextNode(e));
          list2.appendChild(p);
        });
        lists.appendChild(list2);
      }
      const onButtonClick2 = (val2) => {
        Array.from(list2.options).forEach(function(e) {
          e.disabled = false;
        });
        list2.options[val2].disabled = true;
        list2.options[val2].selected = false;
      };
    };
    const raise = document.getElementById("raise");
    raise.addEventListener("click", function() {
      render.openMd("raise");
    });
    const fire = document.getElementById("fire");
    fire.addEventListener("click", function() {
      render.openMd("fire");
    });
    const online = document.getElementById("online");
    online.addEventListener("click", function() {
      console.log("online: ");
    });
  }
}
