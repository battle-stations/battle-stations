class List {
	constructor(list) {
		if(list)
			this.list = list;
		else
			this.list = [];
	}

	get(index) {
		if(index < 0 || (index > this.list.length - 1))
			throw "Out of Bounds";
		return this.list[index];
	}

	pushBack(element) {
		this.list.push(element);
	}

	size() {
		return this.list.length;
	}

	iterator() {
		return new Iterator(this);
	}
}