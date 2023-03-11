export class Store extends EventTarget {
    localStorageKey: string
    tajan: { id: string; date: number; };
    getClientId: () => string;
    
	constructor(localStorageKey) {
		super();
		this.localStorageKey = localStorageKey;
		this._readStorage();
		// handle todos edited in another window
		window.addEventListener(
			"storage",
			() => {
				this._readStorage();
				this._save();
			},
			false
		);
		// GETTER methods
		this.getClientId = () => this.tajan.id;
	}
	_readStorage() {
		this.tajan = JSON.parse(window.localStorage.getItem(this.localStorageKey) || '{}');
	}
	_save() { 
		window.localStorage.setItem(
			this.localStorageKey,
			JSON.stringify(this.tajan)
		);
		// this.dispatchEvent(new CustomEvent("save"));
	}
	// MUTATE methods
    update(clientId) {
		this.tajan = {
			id: clientId,
			date: Date.now(),
		};
		this._save();
	}
};