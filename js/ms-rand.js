"use strict";
/*
 * Microsoft C Run-time-Library-compatible Random Number Generator
 * Copyright by Shlomi Fish, 2011.
 * Released under the MIT/Expat License
 * ( http://en.wikipedia.org/wiki/MIT_License ).
 * */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MSRand = function () {
    function MSRand(args) {
        _classCallCheck(this, MSRand);

        var that = this;
        that.gamenumber = args.gamenumber;
        that.rander = fc_solve__hll_ms_rand__get_singleton();
        fc_solve__hll_ms_rand__init(that.rander, "" + that.gamenumber);
        return;
    }

    _createClass(MSRand, [{
        key: "max_rand",
        value: function max_rand(mymax) {
            return fc_solve__hll_ms_rand__mod_rand(this.rander, mymax);
        }
    }, {
        key: "shuffle",
        value: function shuffle(deck) {
            if (deck.length) {
                var i = deck.length;
                while (--i) {
                    var j = this.max_rand(i + 1);
                    var tmp = deck[i];
                    deck[i] = deck[j];
                    deck[j] = tmp;
                }
            }
            return deck;
        }
    }]);

    return MSRand;
}();
