describe('Iterator Test', function() {  
    it('test List Class', function() {
    	let list = new List(null);
    	list.pushBack("Hello");
    	list.pushBack("World");
    	assert.equal(2, list.size());
    });

     it('test Iterator', function() {
    	let list = new List(null);
    	list.pushBack("Hello");
    	list.pushBack("World");

    	let it = list.iterator();
    	assert.equal(it.next(), "Hello");
    	assert.equal(it.next(), "World");
    });
});