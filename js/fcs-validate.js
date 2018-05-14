var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("fcs-validate", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    // Adapted from http://www.inventpartners.com/javascript_is_int - thanks.
    function is_int(input) {
        var value = "" + input;
        if ((parseFloat(value) === parseInt(value, 10)) && !isNaN(input)) {
            return true;
        }
        else {
            return false;
        }
    }
    var _ranks__int_to_str = "0A23456789TJQK";
    var _ranks__str_to_int = {};
    function _perl_range(start, end) {
        var ret = [];
        for (var i = start; i <= end; i++) {
            ret.push(i);
        }
        return ret;
    }
    _perl_range(1, 13).forEach(function (rank) {
        _ranks__str_to_int[_ranks__int_to_str.substring(rank, rank + 1)] = rank;
    });
    var _suits__int_to_str = "HCDS";
    var _suits__str_to_int = {};
    _perl_range(0, 3).forEach(function (suit) {
        _suits__str_to_int[_suits__int_to_str.substring(suit, suit + 1)] = suit;
    });
    var Card = /** @class */ (function () {
        function Card(rank, suit) {
            if (!is_int(rank)) {
                throw "rank is not an integer.";
            }
            if (!is_int(suit)) {
                throw "suit is not an integer.";
            }
            if (rank < 1) {
                throw "rank is too low.";
            }
            if (rank > 13) {
                throw "rank is too high.";
            }
            if (suit < 0) {
                throw "suit is negative.";
            }
            if (suit > 3) {
                throw "suit is too high.";
            }
            this.rank = rank;
            this.suit = suit;
        }
        Card.prototype.getRank = function () {
            return this.rank;
        };
        Card.prototype.getSuit = function () {
            return this.suit;
        };
        Card.prototype.toString = function () {
            return _ranks__int_to_str.substring(this.rank, this.rank + 1) +
                _suits__int_to_str.substring(this.suit, this.suit + 1);
        };
        return Card;
    }());
    var Column = /** @class */ (function () {
        function Column(cards) {
            this.cards = cards;
        }
        Column.prototype.getLen = function () {
            return this.cards.length;
        };
        Column.prototype.getCard = function (idx) {
            var that = this;
            if (idx < 0) {
                throw "idx is below zero.";
            }
            if (idx >= that.getLen()) {
                throw "idx exceeds the length of the column.";
            }
            return that.cards[idx];
        };
        Column.prototype.getArrOfStrs = function () {
            var that = this;
            return _perl_range(0, that.getLen() - 1).map(function (i) {
                return that.getCard(i).toString();
            });
        };
        return Column;
    }());
    var suit_re = '[HCDS]';
    var rank_re = '[A23456789TJQK]';
    var card_re = '(' + rank_re + ')(' + suit_re + ')';
    function fcs_js__card_from_string(s) {
        var m = s.match('^' + card_re + '$');
        if (!m) {
            throw "Invalid format for a card - \"" + s + "\"";
        }
        return new Card(_ranks__str_to_int[m[1]], _suits__str_to_int[m[2]]);
    }
    exports.fcs_js__card_from_string = fcs_js__card_from_string;
    var BaseResult = /** @class */ (function () {
        function BaseResult(is_correct, start_char_idx, num_consumed_chars, error) {
            this.is_correct = is_correct;
            this.num_consumed_chars = num_consumed_chars;
            this.error = error;
            this.start_char_idx = start_char_idx;
        }
        BaseResult.prototype.getEnd = function () {
            return (this.start_char_idx + this.num_consumed_chars);
        };
        return BaseResult;
    }());
    var ColumnParseResult = /** @class */ (function (_super) {
        __extends(ColumnParseResult, _super);
        function ColumnParseResult(is_correct, start_char_idx, num_consumed_chars, error, cards) {
            var _this = _super.call(this, is_correct, start_char_idx, num_consumed_chars, error) || this;
            _this.col = new Column(cards);
            return _this;
        }
        return ColumnParseResult;
    }(BaseResult));
    var StringParser = /** @class */ (function () {
        function StringParser(s) {
            this.s = s;
            this.consumed = 0;
        }
        StringParser.prototype.consume = function (m) {
            var that = this;
            var len_match = m[1].length;
            that.consumed += len_match;
            that.s = that.s.substring(len_match);
            return;
        };
        StringParser.prototype.getConsumed = function () {
            return this.consumed;
        };
        StringParser.prototype.isNotEmpty = function () {
            return (this.s.length > 0);
        };
        StringParser.prototype.match = function (re) {
            return this.s.match(re);
        };
        StringParser.prototype.consume_match = function (re) {
            var that = this;
            var m = that.match(re);
            if (m) {
                that.consume(m);
            }
            return m;
        };
        return StringParser;
    }());
    var CardsStringParser = /** @class */ (function (_super) {
        __extends(CardsStringParser, _super);
        function CardsStringParser(s, card_mapper) {
            var _this = _super.call(this, s) || this;
            _this.is_start = true;
            _this.cards = [];
            _this.card_mapper = card_mapper;
            return _this;
        }
        CardsStringParser.prototype.afterStart = function () {
            this.is_start = false;
            return;
        };
        CardsStringParser.prototype.getStartSpace = function () {
            return (this.is_start ? '' : ' +');
        };
        CardsStringParser.prototype.should_loop = function () {
            var that = this;
            return (that.isNotEmpty() && (!that.consume_match(/^(\s*(?:#[^\n]*)?\n?)$/)));
        };
        CardsStringParser.prototype.add = function (m) {
            this.cards.push(this.card_mapper(m[2]));
            this.afterStart();
            return;
        };
        CardsStringParser.prototype.loop = function (re, callback) {
            var p = this;
            while (p.should_loop()) {
                var m = p.consume_match('^(' + p.getStartSpace() + '(' + re + ')' + ')');
                if (!m) {
                    p.consume_match('^( *)');
                    return callback();
                }
                p.add(m);
            }
            return null;
        };
        return CardsStringParser;
    }(StringParser));
    function fcs_js__column_from_string(start_char_idx, orig_s, force_leading_colon) {
        var p = new CardsStringParser(orig_s, fcs_js__card_from_string);
        var match = p.consume_match('^((?:\: +)?)');
        if (force_leading_colon && (!match[1].length)) {
            return new ColumnParseResult(false, start_char_idx, p.getConsumed(), 'Columns must start with a ":" in strict mode.', []);
        }
        var ret = p.loop(card_re, function () {
            return new ColumnParseResult(false, start_char_idx, p.getConsumed(), 'Wrong card format - should be [Rank][Suit]', []);
        });
        if (ret) {
            return ret;
        }
        return new ColumnParseResult(true, start_char_idx, p.getConsumed(), '', p.cards);
    }
    exports.fcs_js__column_from_string = fcs_js__column_from_string;
    var Freecells = /** @class */ (function () {
        function Freecells(num_freecells, cards) {
            if (!is_int(num_freecells)) {
                throw "num_freecells is not an integer.";
            }
            this.num_freecells = num_freecells;
            if (cards.length !== num_freecells) {
                throw "cards length mismatch.";
            }
            this.cards = cards;
        }
        Freecells.prototype.getNum = function () {
            return this.num_freecells;
        };
        Freecells.prototype.getCard = function (idx) {
            var that = this;
            if (idx < 0) {
                throw "idx is below zero.";
            }
            if (idx >= that.getNum()) {
                throw "idx exceeds the length of the column.";
            }
            return that.cards[idx];
        };
        Freecells.prototype.getArrOfStrs = function () {
            var that = this;
            return _perl_range(0, that.getNum() - 1).map(function (i) {
                var card = that.getCard(i);
                return ((card !== null) ? card.toString() : '-');
            });
        };
        return Freecells;
    }());
    // TODO : Merge common functionality with ColumnParseResult into a base class.
    var FreecellsParseResult = /** @class */ (function (_super) {
        __extends(FreecellsParseResult, _super);
        function FreecellsParseResult(is_correct, start_char_idx, num_consumed_chars, error, num_freecells, fc) {
            var _this = _super.call(this, is_correct, start_char_idx, num_consumed_chars, error) || this;
            if (is_correct) {
                _this.freecells = new Freecells(num_freecells, fc);
            }
            return _this;
        }
        return FreecellsParseResult;
    }(BaseResult));
    function fcs_js__freecells_from_string(num_freecells, start_char_idx, orig_s) {
        var p = new CardsStringParser(orig_s, function (card_str) {
            return ((card_str === '-') ? null :
                fcs_js__card_from_string(card_str));
        });
        function make_ret(verdict, err_str) {
            return new FreecellsParseResult(verdict, start_char_idx, p.getConsumed(), err_str, num_freecells, verdict ? p.cards : []);
        }
        if (!p.consume_match(/^(Freecells\: +)/)) {
            return make_ret(false, 'Wrong line prefix for freecells - should be "Freecells:"');
        }
        var ret = p.loop("\\-|(?:" + card_re + ')', function () {
            return make_ret(false, 'Wrong card format - should be [Rank][Suit]');
        });
        if (ret) {
            return ret;
        }
        while (p.cards.length < num_freecells) {
            p.cards.push(null);
        }
        if (p.cards.length !== num_freecells) {
            return make_ret(false, 'Too many cards specified in Freecells line.');
        }
        return make_ret(true, '');
    }
    exports.fcs_js__freecells_from_string = fcs_js__freecells_from_string;
    var Foundations = /** @class */ (function () {
        function Foundations() {
            this.ranks = [-1, -1, -1, -1];
        }
        Foundations.prototype.getByIdx = function (deck, suit) {
            this._validateDeckSuit(deck, suit);
            return this.ranks[suit];
        };
        Foundations.prototype.setByIdx = function (deck, suit, rank) {
            this._validateDeckSuit(deck, suit);
            if (!is_int(rank)) {
                throw "Rank must be an integer.";
            }
            if (!((rank >= 0) && (rank <= 13))) {
                throw "rank is out of range.";
            }
            if (this.ranks[suit] >= 0) {
                return false;
            }
            this.ranks[suit] = rank;
            return true;
        };
        Foundations.prototype.finalize = function () {
            var that = this;
            for (var i = 0; i < 4; i++) {
                if (that.getByIdx(0, i) < 0) {
                    that.setByIdx(0, i, 0);
                }
            }
            return;
        };
        Foundations.prototype._validateDeckSuit = function (deck, suit) {
            if (deck !== 0) {
                throw "multiple decks are not supported.";
            }
            if (!is_int(suit)) {
                throw "suit is not an integer.";
            }
            if (!((suit >= 0) && (suit < 4))) {
                throw "suit is out of range.";
            }
            return;
        };
        return Foundations;
    }());
    exports.Foundations = Foundations;
    var FoundationsParseResult = /** @class */ (function (_super) {
        __extends(FoundationsParseResult, _super);
        function FoundationsParseResult(is_correct, start_char_idx, num_consumed_chars, error, foundations) {
            var _this = _super.call(this, is_correct, start_char_idx, num_consumed_chars, error) || this;
            if (is_correct) {
                _this.foundations = foundations;
            }
            return _this;
        }
        return FoundationsParseResult;
    }(BaseResult));
    function fcs_js__foundations_from_string(num_decks, start_char_idx, orig_s) {
        if (num_decks !== 1) {
            throw "Can only handle 1 decks.";
        }
        var p = new StringParser(orig_s);
        var founds = new Foundations();
        function make_ret(verdict, err_str) {
            if (verdict) {
                founds.finalize();
            }
            return new FoundationsParseResult(verdict, start_char_idx, p.getConsumed(), err_str, founds);
        }
        if (!p.consume_match(/^(Foundations\:)/)) {
            return make_ret(false, 'Wrong line prefix for freecells - should be "Freecells:"');
        }
        while (p.isNotEmpty()) {
            if (p.consume_match(/^( *\n?)$/)) {
                break;
            }
            var m = p.consume_match("^( +(" + suit_re + ")-(" + rank_re + "))");
            if (!m) {
                return make_ret(false, "Could not match a foundation string [HCDS]-[A23456789TJQK]");
            }
            var suit = m[2];
            if (!founds.setByIdx(0, _suits__str_to_int[suit], _ranks__str_to_int[m[3]])) {
                return make_ret(false, "Suit \"" + suit + "\" was already set.");
            }
        }
        return make_ret(true, '');
    }
    exports.fcs_js__foundations_from_string = fcs_js__foundations_from_string;
    var ErrorLocationType;
    (function (ErrorLocationType) {
        ErrorLocationType[ErrorLocationType["ErrorLocationType_Foundations"] = 0] = "ErrorLocationType_Foundations";
        ErrorLocationType[ErrorLocationType["ErrorLocationType_Freecells"] = 1] = "ErrorLocationType_Freecells";
        ErrorLocationType[ErrorLocationType["ErrorLocationType_Column"] = 2] = "ErrorLocationType_Column";
    })(ErrorLocationType = exports.ErrorLocationType || (exports.ErrorLocationType = {}));
    var ErrorLocation = /** @class */ (function () {
        function ErrorLocation(t, idx, start, end) {
            this.type_ = t;
            this.idx = idx;
            this.start = start;
            this.end = end;
            return;
        }
        return ErrorLocation;
    }());
    var ParseErrorType;
    (function (ParseErrorType) {
        ParseErrorType[ParseErrorType["VALID"] = 0] = "VALID";
        ParseErrorType[ParseErrorType["TOO_MUCH_OF_CARD"] = 1] = "TOO_MUCH_OF_CARD";
        ParseErrorType[ParseErrorType["NOT_ENOUGH_OF_CARD"] = 2] = "NOT_ENOUGH_OF_CARD";
        ParseErrorType[ParseErrorType["FOUNDATIONS_NOT_AT_START"] = 3] = "FOUNDATIONS_NOT_AT_START";
        ParseErrorType[ParseErrorType["FREECELLS_NOT_AT_START"] = 4] = "FREECELLS_NOT_AT_START";
        ParseErrorType[ParseErrorType["LINE_PARSE_ERROR"] = 5] = "LINE_PARSE_ERROR";
    })(ParseErrorType = exports.ParseErrorType || (exports.ParseErrorType = {}));
    var ParseError = /** @class */ (function () {
        function ParseError(t, locs, c) {
            this.type_ = t;
            this.locs = locs;
            this.card = c;
            return;
        }
        return ParseError;
    }());
    var BoardParseResult = /** @class */ (function () {
        function BoardParseResult(num_stacks, num_freecells, orig_s) {
            var that = this;
            that.num_stacks = num_stacks;
            that.num_freecells = num_freecells;
            that.errors = [];
            that.columns = [];
            var p = new StringParser(orig_s);
            if (p.match(/^Foundations:/)) {
                var start_char_idx = p.getConsumed();
                var l = p.consume_match(/^([^\n]*(?:\n|$))/)[1];
                var fo = fcs_js__foundations_from_string(1, start_char_idx, l);
                that.foundations = fo;
                if (!fo.is_correct) {
                    that.errors.push(new ParseError(ParseErrorType.LINE_PARSE_ERROR, [new ErrorLocation(ErrorLocationType.ErrorLocationType_Foundations, 0, start_char_idx, p.getConsumed()),
                    ], fcs_js__card_from_string('AH')));
                    that.is_valid = false;
                    return;
                }
            }
            if (p.match(/^Freecells:/)) {
                var start_char_idx = p.getConsumed();
                var l = p.consume_match(/^([^\n]*(?:\n|$))/)[1];
                var fc = fcs_js__freecells_from_string(num_freecells, start_char_idx, l);
                that.freecells = fc;
                if (!fc.is_correct) {
                    that.errors.push(new ParseError(ParseErrorType.LINE_PARSE_ERROR, [new ErrorLocation(ErrorLocationType.ErrorLocationType_Freecells, 0, start_char_idx, p.getConsumed()),
                    ], fcs_js__card_from_string('AH')));
                    that.is_valid = false;
                    return;
                }
            }
            for (var i = 0; i < num_stacks; i++) {
                var start_char_idx = p.getConsumed();
                var l = p.consume_match(/^([^\n]*(?:\n|$))/)[1];
                var col = fcs_js__column_from_string(start_char_idx, l, true);
                if (!col.is_correct) {
                    that.errors.push(new ParseError(ParseErrorType.LINE_PARSE_ERROR, [new ErrorLocation(ErrorLocationType.ErrorLocationType_Column, i, start_char_idx, p.getConsumed()),
                    ], fcs_js__card_from_string('AH')));
                    that.is_valid = false;
                    return;
                }
                that.columns.push(col);
            }
            // TODO : Implement duplicate/missing cards.
            that.is_valid = true;
            return;
        }
        return BoardParseResult;
    }());
    exports.BoardParseResult = BoardParseResult;
});
