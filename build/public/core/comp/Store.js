export class Store extends EventTarget {
  constructor(localStorageKey) {
    super();
    this.localStorageKey = localStorageKey;
    this._readStorage();
    window.addEventListener("storage", () => {
      this._readStorage();
      this._save();
    }, false);
    this.getClientId = () => this.tajan.id;
  }
  _readStorage() {
    this.tajan = JSON.parse(window.localStorage.getItem(this.localStorageKey) || "{}");
  }
  _save() {
    window.localStorage.setItem(this.localStorageKey, JSON.stringify(this.tajan));
  }
  update(clientId) {
    this.tajan = {
      id: clientId,
      date: Date.now()
    };
    this._save();
  }
}
;
