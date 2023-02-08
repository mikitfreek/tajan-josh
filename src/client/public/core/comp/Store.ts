export class Store extends EventTarget {
    localStorageKey: string
    tajan: { id: string; date: number; };
    getClientId: () => string;

    // get: (id: any) => any;
    // isAllCompleted: () => any;
    // hasCompleted: () => any;
    // all: (filter: any) => any;
    
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
	// add(todo) {
	// 	this.tajan.push({
	// 		title: todo.title,
	// 		completed: false,
	// 		id: "id_" + Date.now(),
	// 	});
	// 	this._save();
	// }
	// remove({ id }) {
	// 	this.tajan = this.tajan.filter((todo) => todo.id !== id);
	// 	this._save();
	// }
	// toggle({ id }) {
	// 	this.tajan = this.tajan.map((todo) =>
	// 		todo.id === id ? { ...todo, completed: !todo.completed } : todo
	// 	);
	// 	this._save();
	// }
	// clearCompleted() {
	// 	this.tajan = this.tajan.filter((todo) => !todo.completed);
	// 	this._save();
	// }
	// update(todo) {
	// 	this.tajan = this.tajan.map((t) => (t.id === todo.id ? todo : t));
	// 	this._save();
	// }
	// toggleAll() {
	// 	const completed = !this.hasCompleted() || !this.isAllCompleted();
	// 	this.tajan = this.tajan.map((todo) => ({ ...todo, completed }));
	// 	this._save();
	// }
	// revert() {
	// 	this._save();
	// }
};