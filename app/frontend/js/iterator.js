class Iterator {
	constructor(list) {
		this.list = list;
		this.index = 0;
	}

	hasNext() {
		if(this.index >= this.list.size())
			return false;
		return true;
	}

	next() {
		let ret = this.list.get(this.index);
		this.index++;
		return ret;
	}
}