var expect = require("expect.js");
var im = require('../../imutate');


describe('copy-on-write', function() {
  it('should apply method in context', function() {
    var fn = jasmine.createSpy('action');

    var o = { foo: { bar: {} } };
    im(o, 'foo.bar', fn);
    expect(fn.mostRecentCall.args[0]).to.equal(o.foo.bar);
  });
  it('should copy-on-write all containers', function() {
    var inner = {};
    var outer = { bar: inner };

    var ans = im(outer, 'bar', im.assoc, 'foo', 'woo');

    expect(ans).to.eql(
        {
          bar: {
            foo: 'woo'
          }
        }
    );

    expect(ans).to.not.equal(outer);
    expect(ans.bar).to.not.equal(outer.bar);
  });
  it('should not touch unaffected paths', function() {
    var inner = {};
    var outer = { bar: inner, robot: [1, {}] };

    var ans = im(outer, 'bar', im.assoc, 'foo', 'woo');

    expect(ans).to.eql(
        {
          bar: {
            foo: 'woo'
          },
          robot: outer.robot

        }
    );

    expect(ans).to.not.equal(outer);
    expect(ans.bar).to.not.equal(outer.bar);
    expect(ans.robot).to.equal(outer.robot);
  });
});

describe('conj', function () {
  describe('#conj/array', function () {
    it('should conjoin a array and an array', function () {
      expect(im.conj([1], [2])).to.eql([1, 2]);
    });
    it('should conjoin an array and a value', function () {
      expect(im.conj([8], 9)).to.eql([8, 9]);
    });
  });
  describe('#conj/map', function () {
    it('should add map to map', function () {
      var val = {};
      var res = im.conj(val, {'foo': 'bar'});

      expect(res).to.eql({foo: 'bar'});
      expect(val).to.not.equal(res);
    })
  })
});
describe('assoc', function () {
  describe('#assoc/map', function () {
    it('should add a key val pair to a map', function () {
      var map = { farr: 'bing' };
      var res = im.assoc(map, 'wibble', 'woo');
      expect(res).to.eql({
        farr: 'bing',
        wibble: 'woo'
      });
      expect(res).to.not.equal(map);
    })
  })
});
describe('only', function() {
  describe('should create function to update indexed item', function() {
    it('should increment 4 to 5 in the array [2,4,6]', function(){
      var arr = [2,4,6];

      var target4 = im.only(4);

      var res = target4(arr, function(i) {
        return i + 1;
      });

      expect(res).to.eql([2,5,6]);
    });
    it('should only mutate apple', function(){
      var apple = {},
          orange = {},
          pair = {};

      var arr = [orange, pair, apple];

      var shop = {
        till: {},
        staff: [],
        stock: {
          meat: {},
          fruit: arr
        }
      };

      var shop2 = im(shop, 'stock.fruit', im.only(apple), im.assoc, 'bitten', true);

      expect(shop2.stock.fruit[2]).to.eql({ bitten: true });
      expect(shop2.staff).to.equal(shop.staff);
      expect(shop2.till).to.equal(shop.till);
      expect(shop2.stock.meat).to.equal(shop.stock.meat);
      expect(shop2.stock.fruit).to.not.equal(shop.stock.fruit);
    })
  })
});

