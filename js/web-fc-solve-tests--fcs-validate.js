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
define("web-fc-solve-tests--fcs-validate", ["require", "exports", "fcs-validate"], function (require, exports, fcs_validate_1) {
    "use strict";
    exports.__esModule = true;
    function test_fcs_validate() {
        QUnit.module("FC_Solve.JavaScript.InputValidation");
        QUnit.test("verify_state Card class tests", function (a) {
            a.expect(9);
            {
                var c = fcs_validate_1.fcs_js__card_from_string('TH');
                // TEST
                a.equal(c.getRank(), 10, "Card(TH).getRank() is fine.");
                // TEST
                a.equal(c.getSuit(), 0, "Card(TH).getSuit() is fine.");
                // TEST
                a.equal(c.toString(), 'TH', "Card(TH).toString() works.");
            }
            {
                var c = fcs_validate_1.fcs_js__card_from_string('AH');
                // TEST
                a.equal(c.getRank(), 1, "Card(AH).getRank() is fine.");
                // TEST
                a.equal(c.getSuit(), 0, "Card(AH).getSuit() is fine.");
                // TEST
                a.equal(c.toString(), 'AH', "Card(AH).toString() works.");
            }
            {
                var c = fcs_validate_1.fcs_js__card_from_string('AC');
                // TEST
                a.equal(c.getRank(), 1, "Card(AC).getRank() is fine.");
                // TEST
                a.equal(c.getSuit(), 1, "Card(AC).getSuit() is fine.");
                // TEST
                a.equal(c.toString(), 'AC', "Card(AC).toString() works.");
            }
        });
        QUnit.test("verify_state Column class tests", function (a) {
            a.expect(20);
            {
                var start_char_idx = 10;
                var col_str = 'KS QD';
                var result = fcs_validate_1.fcs_js__column_from_string(start_char_idx, col_str, false);
                // TEST
                a.ok(result.is_correct, "Column was parsed correctly.");
                // TEST
                a.equal(result.start_char_idx, start_char_idx, "start_char_idx is correct.");
                // TEST
                a.equal(result.getEnd(), start_char_idx + col_str.length);
                var col = result.col;
                // TEST
                a.deepEqual(col.getArrOfStrs(), ['KS', 'QD'], "col contents is fine.");
                // TEST
                a.equal(result.num_consumed_chars, 'KS QD'.length, "col.consumed is right on success.");
            }
            {
                var result = fcs_validate_1.fcs_js__column_from_string(0, '3C AH 7D 6S', false);
                // TEST
                a.ok(result.is_correct, "Column was parsed correctly.");
                var col = result.col;
                // TEST
                a.deepEqual(col.getArrOfStrs(), ['3C', 'AH', '7D', '6S'], "col contents are fine.");
            }
            {
                var result = fcs_validate_1.fcs_js__column_from_string(0, '3C HA', false);
                // TEST
                a.ok((!result.is_correct), "Column is incorrectly formatted.");
                // TEST
                a.equal(result.num_consumed_chars, 3, 'Consumed 3 characters.');
                // TEST
                a.equal(result.error, 'Wrong card format - should be [Rank][Suit]', 'error is correct');
            }
            {
                var result = fcs_validate_1.fcs_js__column_from_string(0, ': 3D AH KH', true);
                // TEST
                a.ok(result.is_correct, "Column was parsed correctly.");
                // TEST
                a.deepEqual(result.col.getArrOfStrs(), ['3D', 'AH', 'KH'], "col with leading colon contents");
            }
            {
                var input_str = ': 3C AH 7D 6S  # This is a comment.';
                var result = fcs_validate_1.fcs_js__column_from_string(0, input_str, true);
                // TEST
                a.ok(result.is_correct, "Column was parsed correctly.");
                // TEST
                a.equal(result.num_consumed_chars, input_str.length, 'Consumed input_str.length characters.');
                // TEST
                a.deepEqual(result.col.getArrOfStrs(), ['3C', 'AH', '7D', '6S'], "col contents w comment is fine.");
            }
            {
                var input_str = ": 3S AD 7D 6S  # This is a comment.\n";
                var result = fcs_validate_1.fcs_js__column_from_string(0, input_str, true);
                // TEST
                a.ok(result.is_correct, "Newline terminated Column was parsed correctly.");
                // TEST
                a.equal(result.num_consumed_chars, input_str.length, 'Newline terminated - Consumed input_str.length characters.');
                var col = result.col;
                // TEST
                a.deepEqual(col.getArrOfStrs(), ['3S', 'AD', '7D', '6S'], "Newline terminated - col contents are fine.");
            }
            {
                var input_str = "3S AD 7D 6S  # This is a comment.\n";
                var result = fcs_validate_1.fcs_js__column_from_string(0, input_str, true);
                // TEST
                a.ok(!result.is_correct, "strict mode does not match col wo colon.");
                // TEST
                a.equal(result.error, 'Columns must start with a ":" in strict mode.', 'Correct error');
            }
        });
        QUnit.test("verify_state Freecells class tests", function (a) {
            a.expect(43);
            {
                var start_char_idx = 10;
                var str = "Freecells: 5C 2H 3D 9H";
                var num_freecells = 4;
                var result = fcs_validate_1.fcs_js__freecells_from_string(num_freecells, start_char_idx, str);
                // TEST
                a.ok(result.is_correct, "Column was parsed correctly.");
                // TEST
                a.equal(result.start_char_idx, start_char_idx, "start_char_idx is correct.");
                // TEST
                a.equal(result.getEnd(), start_char_idx + str.length);
                // TEST
                a.deepEqual(result.freecells.getArrOfStrs(), ['5C', '2H', '3D', '9H'], "freecell contents is fine.");
                // TEST
                a.equal(result.num_consumed_chars, str.length, "fc.consumed is right on success.");
            }
            {
                var start_char_idx = 10;
                var str = "Freecells: 5C 2H";
                var num_freecells = 4;
                var result = fcs_validate_1.fcs_js__freecells_from_string(num_freecells, start_char_idx, str);
                // TEST
                a.ok(result.is_correct, "Column was parsed correctly.");
                // TEST
                a.equal(result.start_char_idx, start_char_idx, "start_char_idx is correct.");
                // TEST
                a.equal(result.getEnd(), start_char_idx + str.length);
                // TEST
                a.deepEqual(result.freecells.getArrOfStrs(), ['5C', '2H', '-', '-'], "freecell contents is fine.");
                // TEST
                a.equal(result.num_consumed_chars, str.length, "fc.consumed is right on success.");
            }
            {
                var start_char_idx = 39;
                var str = "Freecells: - TC - 9H";
                var num_freecells = 4;
                var result = fcs_validate_1.fcs_js__freecells_from_string(num_freecells, start_char_idx, str);
                // TEST
                a.ok(result.is_correct, "Column was parsed correctly.");
                // TEST
                a.equal(result.start_char_idx, start_char_idx, "start_char_idx is correct.");
                // TEST
                a.equal(result.getEnd(), start_char_idx + str.length);
                // TEST
                a.deepEqual(result.freecells.getArrOfStrs(), ['-', 'TC', '-', '9H'], "freecell contents is fine.");
                // TEST
                a.equal(result.num_consumed_chars, str.length, "fc.consumed is right on success.");
            }
            {
                var start_char_idx = 39;
                var str = "Freecells: - - 6D 9H";
                var num_freecells = 6;
                var result = fcs_validate_1.fcs_js__freecells_from_string(num_freecells, start_char_idx, str);
                // TEST
                a.ok(result.is_correct, "Column was parsed correctly.");
                // TEST
                a.equal(result.start_char_idx, start_char_idx, "start_char_idx is correct.");
                // TEST
                a.equal(result.getEnd(), start_char_idx + str.length);
                // TEST
                a.deepEqual(result.freecells.getArrOfStrs(), ['-', '-', '6D', '9H', '-', '-'], "freecell contents is fine.");
                // TEST
                a.equal(result.num_consumed_chars, str.length, "fc.consumed is right on success.");
            }
            {
                var start_char_idx = 39;
                var str = "Freecells: - - 6D 9H -";
                var num_freecells = 6;
                var result = fcs_validate_1.fcs_js__freecells_from_string(num_freecells, start_char_idx, str);
                // TEST
                a.ok(result.is_correct, "Trailing Empty FC - Column was parsed correctly.");
                // TEST
                a.equal(result.start_char_idx, start_char_idx, "Trailing Empty FC -  start_char_idx is correct.");
                // TEST
                a.equal(result.getEnd(), start_char_idx + str.length);
                // TEST
                a.deepEqual(result.freecells.getArrOfStrs(), ['-', '-', '6D', '9H', '-', '-'], "Trailing Empty FC - freecell contents is fine.");
                // TEST
                a.equal(result.num_consumed_chars, str.length, "Trailing Empty FC - fc.consumed is right on success.");
            }
            {
                var start_char_idx = 200;
                var str = "Freecells: - JC  - 9H\n";
                var num_freecells = 4;
                var test_name = "With trailing newline. ";
                var result = fcs_validate_1.fcs_js__freecells_from_string(num_freecells, start_char_idx, str);
                // TEST
                a.ok(result.is_correct, test_name + "Column was parsed correctly.");
                // TEST
                a.equal(result.start_char_idx, start_char_idx, test_name + "start_char_idx is correct.");
                // TEST
                a.equal(result.getEnd(), start_char_idx + str.length);
                // TEST
                a.deepEqual(result.freecells.getArrOfStrs(), ['-', 'JC', '-', '9H'], test_name + "freecell contents is fine.");
                // TEST
                a.equal(result.num_consumed_chars, str.length, test_name + "fc.consumed is right on success.");
            }
            {
                var start_char_idx = 200;
                var str = "Freecells: - JC  - 9H  # A comment";
                var num_freecells = 4;
                var test_name = "With comment. ";
                var result = fcs_validate_1.fcs_js__freecells_from_string(num_freecells, start_char_idx, str);
                // TEST
                a.ok(result.is_correct, test_name + "Column was parsed correctly.");
                // TEST
                a.equal(result.start_char_idx, start_char_idx, test_name + "start_char_idx is correct.");
                // TEST
                a.equal(result.getEnd(), start_char_idx + str.length);
                // TEST
                a.deepEqual(result.freecells.getArrOfStrs(), ['-', 'JC', '-', '9H'], test_name + "freecell contents is fine.");
                // TEST
                a.equal(result.num_consumed_chars, str.length, test_name + "fc.consumed is right on success.");
            }
            {
                var start_char_idx = 200;
                var str = "Freecells: - JC  - 9H  # A comment\n";
                var num_freecells = 5;
                var test_name = "With a comment and a newline - ";
                var result = fcs_validate_1.fcs_js__freecells_from_string(num_freecells, start_char_idx, str);
                // TEST
                a.ok(result.is_correct, test_name + "Column was parsed correctly.");
                // TEST
                a.equal(result.start_char_idx, start_char_idx, test_name + "start_char_idx is correct.");
                // TEST
                a.equal(result.getEnd(), start_char_idx + str.length);
                // TEST
                a.deepEqual(result.freecells.getArrOfStrs(), ['-', 'JC', '-', '9H', '-'], test_name + "freecell contents is fine.");
                // TEST
                a.equal(result.num_consumed_chars, str.length, test_name + "fc.consumed is right on success.");
            }
            {
                var start_char_idx = 10;
                var str = "F-Junk: 5C 2H 3D 9H";
                var num_freecells = 4;
                var result = fcs_validate_1.fcs_js__freecells_from_string(num_freecells, start_char_idx, str);
                // TEST
                a.notOk(result.is_correct, "Freecells has wrong prefix.");
                // TEST
                a.equal(result.start_char_idx, start_char_idx, "start_char_idx is correct.");
                // TEST
                a.ok(result.error.match(/^Wrong line prefix/), "err-str");
            }
        });
        QUnit.test("verify_state Foundations class tests", function (a) {
            a.expect(22);
            {
                var f = new fcs_validate_1.Foundations();
                // TEST
                a.equal(f.getByIdx(0, 0), (-1), "founds.getByIdx works.");
                // TEST
                a.equal(f.setByIdx(0, 0, 0), true, "founds.setByIdx works.");
                // TEST
                a.equal(f.getByIdx(0, 0), 0, "founds.getByIdx works after assignment.");
                // TEST
                a.equal(f.setByIdx(0, 0, 5), false, "founds.setByIdx does not assign again.");
                // TEST
                a.equal(f.getByIdx(0, 0), 0, "founds.getByIdx assigned only once.");
            }
            {
                var f = new fcs_validate_1.Foundations();
                // TEST
                a.equal(f.setByIdx(0, 2, 11), true, "founds.setByIdx #2.");
                // TEST
                a.equal(f.getByIdx(0, 0), -1, "founds.getByIdx works.");
                // TEST
                a.equal(f.getByIdx(0, 2), 11, "founds.getByIdx works after assignment.");
                // TEST
                a.equal(f.setByIdx(0, 2, 11), false, "founds.setByIdx does not assign again.");
            }
            {
                var start_char_idx = 10;
                var str = "Foundations: H-A\n";
                var result = fcs_validate_1.fcs_js__foundations_from_string(1, start_char_idx, str);
                // TEST
                a.ok(result.is_correct, "is correct.");
                var HEARTS = 0;
                // TEST
                a.equal(result.foundations.getByIdx(0, HEARTS), 1, "foundations is correct.");
                // TEST
                a.equal(result.foundations.getByIdx(0, 1), 0, "foundations is correct.");
            }
            {
                var start_char_idx = 20;
                var str = "Foundations:    S-Q        H-A\n";
                var result = fcs_validate_1.fcs_js__foundations_from_string(1, start_char_idx, str);
                // TEST
                a.ok(result.is_correct, "is correct.");
                var HEARTS = 0;
                var SPADES = 3;
                var QUEEN = 12;
                // TEST
                a.equal(result.foundations.getByIdx(0, HEARTS), 1, "foundations is correct.");
                // TEST
                a.equal(result.foundations.getByIdx(0, SPADES), QUEEN, "foundations is correct.");
                // TEST
                a.equal(result.foundations.getByIdx(0, 1), 0, "foundations is correct.");
            }
            {
                var start_char_idx = 17;
                var str = "Foundations: C-5 C-2\n";
                var result = fcs_validate_1.fcs_js__foundations_from_string(1, start_char_idx, str);
                // TEST
                a.notOk(result.is_correct, "not correct.");
                // TEST
                a.equal(result.error, 'Suit "C" was already set.', "error string for dup suit.");
            }
            {
                var start_char_idx = 20;
                var str = "Foundations:    S-Q H-A";
                var result = fcs_validate_1.fcs_js__foundations_from_string(1, start_char_idx, str);
                // TEST
                a.ok(result.is_correct, "is correct - no LF");
                var HEARTS = 0;
                var SPADES = 3;
                var QUEEN = 12;
                // TEST
                a.equal(result.foundations.getByIdx(0, HEARTS), 1, "foundations is correct.  - no LF");
                // TEST
                a.equal(result.foundations.getByIdx(0, SPADES), QUEEN, "foundations is correct. - no LF");
                // TEST
                a.equal(result.foundations.getByIdx(0, 1), 0, "foundations is correct. - no LF");
            }
        });
        QUnit.test("verify_state BoardParseResult tests #1", function (a) {
            a.expect(11);
            {
                var ms_deal_24 = ": 4C 2C 9C 8C QS 4S 2H\n" +
                    ": 5H QH 3C AC 3H 4H QD\n" +
                    ": QC 9S 6H 9H 3S KS 3D\n" +
                    ": 5D 2S JC 5C JH 6D AS\n" +
                    ": 2D KD TH TC TD 8D\n" +
                    ": 7H JS KH TS KC 7C\n" +
                    ": AH 5S 6S AD 8H JD\n" +
                    ": 7S 6C 7D 4D 8S 9D\n";
                var result = new fcs_validate_1.BoardParseResult(8, 4, ms_deal_24);
                // TEST
                a.ok(result.is_valid, "parsed correctly.");
                // TEST
                a.equal(result.columns.length, 8, 'There are 8 columns');
                // TEST
                a.deepEqual(result.columns[0].col.getArrOfStrs(), '4C 2C 9C 8C QS 4S 2H'.split(' '), 'column 0 was parsed fine.');
                // TEST
                a.deepEqual(result.columns[1].col.getArrOfStrs(), '5H QH 3C AC 3H 4H QD'.split(' '), 'column 1 was parsed fine.');
                // TEST
                a.deepEqual(result.columns[7].col.getArrOfStrs(), '7S 6C 7D 4D 8S 9D'.split(' '), 'column 7 was parsed fine.');
            }
            {
                var col1_s = ": 4C 2C 9C 8C QS 4S 2H\n";
                var col2_s = "NONSENSE:: 5H QH 3C AC 3H 4H QD\n";
                var nonsense_deal_24 = col1_s + col2_s +
                    ": QC 9S 6H 9H 3S KS 3D\n" +
                    ": 5D 2S JC 5C JH 6D AS\n" +
                    ": 2D KD TH TC TD 8D\n" +
                    ": 7H JS KH TS KC 7C\n" +
                    ": AH 5S 6S AD 8H JD\n" +
                    ": 7S 6C 7D 4D 8S 9D\n";
                var result = new fcs_validate_1.BoardParseResult(8, 4, nonsense_deal_24);
                // TEST
                a.ok((!result.is_valid), "not validly parsed.");
                var error = result.errors[0];
                // TEST
                a.equal(error.type_, fcs_validate_1.ParseErrorType.LINE_PARSE_ERROR, "Error of right type.");
                var loc = error.locs[0];
                // TEST
                a.equal(loc.type_, fcs_validate_1.ErrorLocationType.ErrorLocationType_Column, 'Error location of right type.');
                // TEST
                a.equal(loc.idx, 1, 'Column index #1');
                // TEST
                a.equal(loc.start, col1_s.length, 'Location start is sane.');
                // TEST
                a.equal(loc.end, col1_s.length + col2_s.length, 'Location end is correct.');
            }
        });
        QUnit.test("verify_state BoardParseResult - Freecells", function (a) {
            a.expect(11);
            {
                var ms_deal_24_w_Freecells = "Freecells: 2H - 8D\n" +
                    ": 4C 2C 9C 8C QS 4S\n" +
                    ": 5H QH 3C AC 3H 4H QD\n" +
                    ": QC 9S 6H 9H 3S KS 3D\n" +
                    ": 5D 2S JC 5C JH 6D AS\n" +
                    ": 2D KD TH TC TD\n" +
                    ": 7H JS KH TS KC 7C\n" +
                    ": AH 5S 6S AD 8H JD\n" +
                    ": 7S 6C 7D 4D 8S 9D\n";
                var result = new fcs_validate_1.BoardParseResult(8, 4, ms_deal_24_w_Freecells);
                // TEST
                a.ok(result.is_valid, "parsed correctly.");
                // TEST
                a.equal(result.columns.length, 8, 'There are 8 columns');
                // TEST
                a.deepEqual(result.columns[0].col.getArrOfStrs(), '4C 2C 9C 8C QS 4S'.split(' '), 'column 0 was parsed fine.');
                // TEST
                a.deepEqual(result.freecells.freecells.getArrOfStrs(), ['2H', '-', '8D', '-'], "freecell contents is fine.");
            }
            {
                var fc_s = "Freecells: 2H - 8D 6C 4H\n";
                var ms_deal_24_w_Freecells = fc_s +
                    ": 4C 2C 9C 8C QS 4S\n" +
                    ": 5H QH 3C AC 3H 4H QD\n" +
                    ": QC 9S 6H 9H 3S KS 3D\n" +
                    ": 5D 2S JC 5C JH 6D AS\n" +
                    ": 2D KD TH TC TD\n" +
                    ": 7H JS KH TS KC 7C\n" +
                    ": AH 5S 6S AD 8H JD\n" +
                    ": 7S 6C 7D 4D 8S 9D\n";
                var result = new fcs_validate_1.BoardParseResult(8, 4, ms_deal_24_w_Freecells);
                // TEST
                a.ok((!result.is_valid), "not validly parsed.");
                var error = result.errors[0];
                // TEST
                a.equal(error.type_, fcs_validate_1.ParseErrorType.LINE_PARSE_ERROR, "Error of right type.");
                var loc = error.locs[0];
                // TEST
                a.equal(loc.type_, fcs_validate_1.ErrorLocationType.ErrorLocationType_Freecells, 'Error location of right type.');
                // TEST
                a.equal(loc.idx, 0, 'Column index #0');
                // TEST
                a.equal(loc.start, 0, 'Location start is sane.');
                // TEST
                a.equal(loc.end, fc_s.length, 'Location end is correct.');
                var fc_err = result.freecells;
                // TEST
                a.equal(fc_err.error, 'Too many cards specified in Freecells line.', 'error is correct.');
            }
        });
    }
    exports.test_fcs_validate = test_fcs_validate;
});
