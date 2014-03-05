d3.select('body').append('div').append('ol');

// set div up with some initial data
var div = d3.select('div').datum({
  id: 'things, prod them!',
  items: [
    { foo: 'bar', prods: 0 },
    { foo: 'boo', prods: 0 },
    { foo: 'grr', prods: 0 },
    { foo: 'wobble', prods: 0 },
    { foo: 'wibble', prods: 0 },
    { foo: 'who?', prods: 0 },
    { foo: 'farr', prods: 0 }
  ]
});

/**
 * Updates the provided item in the data with the pure function fn
 * @param item - to update
 * @param fn - pure
 */
var updateItem = function (item, fn) {
  div.datum(
      imutate(
          div.datum(),
          'items',
          imutate.only(item),
          fn
      )
  );
  render(div);
};


/**
 * Reference check based change selector.  Assumes the use
 * of immutable data
 * @param d - the new data
 * @returns {?Node}
 */
function changed(d) {
  var o = this['__last_data__'];
  var dirty = o !== d;
  this['__last_data__'] = d;
  return dirty ? this : null;
}

/**
 * Render all the items, only updating them when they have changed
 * @param sel
 */
function render(sel) {
  var things = sel.datum();
  sel.selectAll('h1').data([things.id]).enter().append('h1').text(String);

  var items = sel.selectAll('li').data(things.items);

  items.enter().append('li');
  items.select(changed).call(blink).call(label);

  items.on('click', onClick);
}

/**
 * Update selection to text reprehension of an item
 * @param sel
 */
function label(sel) {
  sel.text(function (d) {
    return d.foo + " prods:" + d.prods;
  });
}

function blink(sel) {
  sel.style('color', 'red')
      .transition()
      .delay(500)
      .style('color', 'black')
}

/**
 * Increment a items prod count
 * @param item
 * @returns {Object} a new item
 */
function prod(item) {
  return imutate.assoc(item, 'prods', function(n){
    return n + 1;
  });
}

function onClick(item) {
  updateItem(item, prod);
}

render(div);

