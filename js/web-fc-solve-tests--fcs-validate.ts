import {
    BoardParseResult,
    ErrorLocationType,
    fcs_js__card_from_string,
    fcs_js__column_from_string,
    fcs_js__foundations_from_string,
    fcs_js__freecells_from_string,
    Foundations,
    ParseErrorType,
} from "./fcs-validate";

export function test_fcs_validate() {
    QUnit.module("FC_Solve.JavaScript.InputValidation");

    QUnit.test("verify_state Card class tests", (a: Assert) => {
        a.expect(9);

        {
            const c = fcs_js__card_from_string('TH');

            // TEST
            a.equal(c.getRank(), 10, "Card(TH).getRank() is fine.");

            // TEST
            a.equal(c.getSuit(), 0, "Card(TH).getSuit() is fine.");

            // TEST
            a.equal(c.toString(), 'TH', "Card(TH).toString() works.");
        }

        {
            const c = fcs_js__card_from_string('AH');

            // TEST
            a.equal(c.getRank(), 1, "Card(AH).getRank() is fine.");

            // TEST
            a.equal(c.getSuit(), 0, "Card(AH).getSuit() is fine.");

            // TEST
            a.equal(c.toString(), 'AH', "Card(AH).toString() works.");
        }

        {
            const c = fcs_js__card_from_string('AC');

            // TEST
            a.equal(c.getRank(), 1, "Card(AC).getRank() is fine.");

            // TEST
            a.equal(c.getSuit(), 1, "Card(AC).getSuit() is fine.");

            // TEST
            a.equal(c.toString(), 'AC', "Card(AC).toString() works.");
        }
    });
    QUnit.test("verify_state Column class tests", (a: Assert) => {
        a.expect(20);

        {
            const start_char_idx = 10;
            const col_str = 'KS QD';
            const result = fcs_js__column_from_string(start_char_idx, col_str, false);

            // TEST
            a.ok (result.is_correct, "Column was parsed correctly.");

            // TEST
            a.equal(result.start_char_idx, start_char_idx, "start_char_idx is correct.");

            // TEST
            a.equal(result.getEnd(), start_char_idx + col_str.length);

            const col = result.col;

            // TEST
            a.deepEqual(col.getArrOfStrs(), ['KS', 'QD'],
                        "col contents is fine.");

            // TEST
            a.equal(result.num_consumed_chars, 'KS QD'.length, "col.consumed is right on success.");
        }

        {
            const result = fcs_js__column_from_string(0, '3C AH 7D 6S', false);

            // TEST
            a.ok (result.is_correct, "Column was parsed correctly.");

            const col = result.col;

            // TEST
            a.deepEqual(col.getArrOfStrs(), ['3C', 'AH', '7D', '6S'], "col contents are fine.");
        }

        {
            const result = fcs_js__column_from_string(0, '3C HA', false);

            // TEST
            a.ok ((! result.is_correct), "Column is incorrectly formatted.");

            // TEST
            a.equal (result.num_consumed_chars, 3, 'Consumed 3 characters.');

            // TEST
            a.equal (result.error, 'Wrong card format - should be [Rank][Suit]', 'error is correct');
        }

        {
            const result = fcs_js__column_from_string(0, ': 3D AH KH', true);

            // TEST
            a.ok (result.is_correct, "Column was parsed correctly.");

            // TEST
            a.deepEqual(result.col.getArrOfStrs(), ['3D', 'AH', 'KH'], "col with leading colon contents");
        }

        {
            const input_str = ': 3C AH 7D 6S  # This is a comment.';
            const result = fcs_js__column_from_string(0, input_str, true);

            // TEST
            a.ok (result.is_correct, "Column was parsed correctly.");

            // TEST
            a.equal (result.num_consumed_chars, input_str.length, 'Consumed input_str.length characters.');

            // TEST
            a.deepEqual(result.col.getArrOfStrs(), ['3C', 'AH', '7D', '6S'],
                        "col contents w comment is fine.");
        }

        {
            const input_str = ": 3S AD 7D 6S  # This is a comment.\n";
            const result = fcs_js__column_from_string(0, input_str, true);

            // TEST
            a.ok (result.is_correct, "Newline terminated Column was parsed correctly.");

            // TEST
            a.equal (
                result.num_consumed_chars, input_str.length,
                'Newline terminated - Consumed input_str.length characters.');

            const col = result.col;

            // TEST
            a.deepEqual(col.getArrOfStrs(),
                ['3S', 'AD', '7D', '6S'],
                "Newline terminated - col contents are fine.",
            );
        }

        {
            const input_str = "3S AD 7D 6S  # This is a comment.\n";
            const result = fcs_js__column_from_string(0, input_str, true);

            // TEST
            a.ok (! result.is_correct, "strict mode does not match col wo colon.");

            // TEST
            a.equal (result.error, 'Columns must start with a ":" in strict mode.', 'Correct error');
        }
    });
    QUnit.test("verify_state Freecells class tests", (a: Assert) => {
        a.expect(43);

        {
            const start_char_idx = 10;
            const str = "Freecells: 5C 2H 3D 9H";
            const num_freecells = 4;

            const result = fcs_js__freecells_from_string(num_freecells, start_char_idx, str);

            // TEST
            a.ok (result.is_correct, "Column was parsed correctly.");

            // TEST
            a.equal(result.start_char_idx, start_char_idx, "start_char_idx is correct.");

            // TEST
            a.equal(result.getEnd(), start_char_idx + str.length);

            // TEST
            a.deepEqual(result.freecells.getArrOfStrs(), ['5C', '2H', '3D', '9H'],
                        "freecell contents is fine.");

            // TEST
            a.equal(result.num_consumed_chars, str.length, "fc.consumed is right on success.");
        }

        {
            const start_char_idx = 10;
            const str = "Freecells: 5C 2H";
            const num_freecells = 4;

            const result = fcs_js__freecells_from_string(num_freecells, start_char_idx, str);

            // TEST
            a.ok (result.is_correct, "Column was parsed correctly.");

            // TEST
            a.equal(result.start_char_idx, start_char_idx, "start_char_idx is correct.");

            // TEST
            a.equal(result.getEnd(), start_char_idx + str.length);

            // TEST
            a.deepEqual(result.freecells.getArrOfStrs(), ['5C', '2H', '-', '-'],
                        "freecell contents is fine.");

            // TEST
            a.equal(result.num_consumed_chars, str.length, "fc.consumed is right on success.");
        }

        {
            const start_char_idx = 39;
            const str = "Freecells: - TC - 9H";
            const num_freecells = 4;

            const result = fcs_js__freecells_from_string(num_freecells, start_char_idx, str);

            // TEST
            a.ok (result.is_correct, "Column was parsed correctly.");

            // TEST
            a.equal(result.start_char_idx, start_char_idx, "start_char_idx is correct.");

            // TEST
            a.equal(result.getEnd(), start_char_idx + str.length);

            // TEST
            a.deepEqual(result.freecells.getArrOfStrs(), ['-', 'TC', '-', '9H'],
                        "freecell contents is fine.");

            // TEST
            a.equal(result.num_consumed_chars, str.length, "fc.consumed is right on success.");
        }

        {
            const start_char_idx = 39;
            const str = "Freecells: - - 6D 9H";
            const num_freecells = 6;

            const result = fcs_js__freecells_from_string(num_freecells, start_char_idx, str);

            // TEST
            a.ok (result.is_correct, "Column was parsed correctly.");

            // TEST
            a.equal(result.start_char_idx, start_char_idx, "start_char_idx is correct.");

            // TEST
            a.equal(result.getEnd(), start_char_idx + str.length);

            // TEST
            a.deepEqual(result.freecells.getArrOfStrs(), ['-', '-', '6D', '9H', '-', '-'],
                        "freecell contents is fine.");

            // TEST
            a.equal(result.num_consumed_chars, str.length, "fc.consumed is right on success.");
        }

        {
            const start_char_idx = 39;
            const str = "Freecells: - - 6D 9H -";
            const num_freecells = 6;

            const result = fcs_js__freecells_from_string(num_freecells, start_char_idx, str);

            // TEST
            a.ok (result.is_correct, "Trailing Empty FC - Column was parsed correctly.");

            // TEST
            a.equal(result.start_char_idx, start_char_idx, "Trailing Empty FC -  start_char_idx is correct.");

            // TEST
            a.equal(result.getEnd(), start_char_idx + str.length);

            // TEST
            a.deepEqual(result.freecells.getArrOfStrs(), ['-', '-', '6D', '9H', '-', '-'],
                        "Trailing Empty FC - freecell contents is fine.");

            // TEST
            a.equal(result.num_consumed_chars, str.length, "Trailing Empty FC - fc.consumed is right on success.");
        }

        {
            const start_char_idx = 200;
            const str = "Freecells: - JC  - 9H\n";
            const num_freecells = 4;
            const test_name = "With trailing newline. ";

            const result = fcs_js__freecells_from_string(num_freecells, start_char_idx, str);

            // TEST
            a.ok (result.is_correct, test_name + "Column was parsed correctly.");

            // TEST
            a.equal(result.start_char_idx, start_char_idx, test_name + "start_char_idx is correct.");

            // TEST
            a.equal(result.getEnd(), start_char_idx + str.length);

            // TEST
            a.deepEqual(result.freecells.getArrOfStrs(), ['-', 'JC', '-', '9H'],
                        test_name + "freecell contents is fine.");

            // TEST
            a.equal(result.num_consumed_chars, str.length, test_name + "fc.consumed is right on success.");
        }

        {
            const start_char_idx = 200;
            const str = "Freecells: - JC  - 9H  # A comment";
            const num_freecells = 4;
            const test_name = "With comment. ";

            const result = fcs_js__freecells_from_string(num_freecells, start_char_idx, str);

            // TEST
            a.ok (result.is_correct, test_name + "Column was parsed correctly.");

            // TEST
            a.equal(result.start_char_idx, start_char_idx, test_name + "start_char_idx is correct.");

            // TEST
            a.equal(result.getEnd(), start_char_idx + str.length);

            // TEST
            a.deepEqual(result.freecells.getArrOfStrs(), ['-', 'JC', '-', '9H'],
                        test_name + "freecell contents is fine.");

            // TEST
            a.equal(result.num_consumed_chars, str.length, test_name + "fc.consumed is right on success.");
        }

        {
            const start_char_idx = 200;
            const str = "Freecells: - JC  - 9H  # A comment\n";
            const num_freecells = 5;
            const test_name = "With a comment and a newline - ";

            const result = fcs_js__freecells_from_string(num_freecells, start_char_idx, str);

            // TEST
            a.ok (result.is_correct, test_name + "Column was parsed correctly.");

            // TEST
            a.equal(result.start_char_idx, start_char_idx, test_name + "start_char_idx is correct.");

            // TEST
            a.equal(result.getEnd(), start_char_idx + str.length);

            // TEST
            a.deepEqual(result.freecells.getArrOfStrs(), ['-', 'JC', '-', '9H', '-'],
                        test_name + "freecell contents is fine.");

            // TEST
            a.equal(result.num_consumed_chars, str.length, test_name + "fc.consumed is right on success.");
        }

        {
            const start_char_idx = 10;
            const str = "F-Junk: 5C 2H 3D 9H";
            const num_freecells = 4;

            const result = fcs_js__freecells_from_string(num_freecells, start_char_idx, str);

            // TEST
            a.notOk (result.is_correct, "Freecells has wrong prefix.");

            // TEST
            a.equal(result.start_char_idx, start_char_idx, "start_char_idx is correct.");

            // TEST
            a.ok (result.error.match(/^Wrong line prefix/), "err-str");
        }

    });
    QUnit.test("verify_state Foundations class tests", (a: Assert) => {
        a.expect(22);
        {
            const f = new Foundations();

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
            const f = new Foundations();

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
            const start_char_idx = 10;
            const str = "Foundations: H-A\n";
            const result = fcs_js__foundations_from_string(1, start_char_idx, str);

            // TEST
            a.ok( result.is_correct, "is correct.");

            const HEARTS = 0;
            // TEST
            a.equal( result.foundations.getByIdx(0, HEARTS), 1, "foundations is correct.");
            // TEST
            a.equal( result.foundations.getByIdx(0, 1), 0, "foundations is correct.");
        }

        {
            const start_char_idx = 20;
            const str = "Foundations:    S-Q        H-A\n";
            const result = fcs_js__foundations_from_string(1, start_char_idx, str);

            // TEST
            a.ok( result.is_correct, "is correct.");

            const HEARTS = 0;
            const SPADES = 3;
            const QUEEN = 12;

            // TEST
            a.equal( result.foundations.getByIdx(0, HEARTS), 1, "foundations is correct.");
            // TEST
            a.equal( result.foundations.getByIdx(0, SPADES), QUEEN, "foundations is correct.");
            // TEST
            a.equal( result.foundations.getByIdx(0, 1), 0, "foundations is correct.");

        }

        {
            const start_char_idx = 17;
            const str = "Foundations: C-5 C-2\n";
            const result = fcs_js__foundations_from_string(1, start_char_idx, str);

            // TEST
            a.notOk( result.is_correct, "not correct.");

            // TEST
            a.equal( result.error, 'Suit "C" was already set.', "error string for dup suit.");

        }

        {
            const start_char_idx = 20;
            const str = "Foundations:    S-Q H-A";
            const result = fcs_js__foundations_from_string(1, start_char_idx, str);

            // TEST
            a.ok( result.is_correct, "is correct - no LF");

            const HEARTS = 0;
            const SPADES = 3;
            const QUEEN = 12;

            // TEST
            a.equal( result.foundations.getByIdx(0, HEARTS), 1, "foundations is correct.  - no LF");
            // TEST
            a.equal( result.foundations.getByIdx(0, SPADES), QUEEN, "foundations is correct. - no LF");
            // TEST
            a.equal( result.foundations.getByIdx(0, 1), 0, "foundations is correct. - no LF");

        }
    });
    QUnit.test("verify_state BoardParseResult tests #1", (a: Assert) => {
        a.expect(11);
        {
            const ms_deal_24 = ": 4C 2C 9C 8C QS 4S 2H\n" +
": 5H QH 3C AC 3H 4H QD\n" +
": QC 9S 6H 9H 3S KS 3D\n" +
": 5D 2S JC 5C JH 6D AS\n" +
": 2D KD TH TC TD 8D\n" +
": 7H JS KH TS KC 7C\n" +
": AH 5S 6S AD 8H JD\n" +
": 7S 6C 7D 4D 8S 9D\n" ;
            const result = new BoardParseResult(8, 4, ms_deal_24);

            // TEST
            a.ok( result.is_valid, "parsed correctly.");

            // TEST
            a.equal(result.columns.length, 8, 'There are 8 columns');

            // TEST
            a.deepEqual(result.columns[0].col.getArrOfStrs(),
                '4C 2C 9C 8C QS 4S 2H'.split(' '),
                'column 0 was parsed fine.');

            // TEST
            a.deepEqual(result.columns[1].col.getArrOfStrs(),
                '5H QH 3C AC 3H 4H QD'.split(' '),
                'column 1 was parsed fine.');

            // TEST
            a.deepEqual(result.columns[7].col.getArrOfStrs(),
                '7S 6C 7D 4D 8S 9D'.split(' '),
                'column 7 was parsed fine.');
        }

        {
            const col1_s = ": 4C 2C 9C 8C QS 4S 2H\n";
            const col2_s = "NONSENSE:: 5H QH 3C AC 3H 4H QD\n";

            const nonsense_deal_24 = col1_s + col2_s +
                ": QC 9S 6H 9H 3S KS 3D\n" +
": 5D 2S JC 5C JH 6D AS\n" +
": 2D KD TH TC TD 8D\n" +
": 7H JS KH TS KC 7C\n" +
": AH 5S 6S AD 8H JD\n" +
": 7S 6C 7D 4D 8S 9D\n" ;
            const result = new BoardParseResult(8, 4, nonsense_deal_24);

            // TEST
            a.ok( (!result.is_valid), "not validly parsed.");

            const error = result.errors[0];
            // TEST
            a.equal(
                error.type_,
                ParseErrorType.LINE_PARSE_ERROR,
                "Error of right type.",
            );
            const loc = error.locs[0];
            // TEST
            a.equal(
                loc.type_,
                ErrorLocationType.ErrorLocationType_Column,
                'Error location of right type.',
            );
            // TEST
            a.equal(loc.idx, 1, 'Column index #1');

            // TEST
            a.equal(loc.start, col1_s.length, 'Location start is sane.');

            // TEST
            a.equal(loc.end, col1_s.length + col2_s.length,
                'Location end is correct.');
        }
    });
    QUnit.test("verify_state BoardParseResult - Freecells", (a: Assert) => {
        a.expect(11);
        {
            const ms_deal_24_w_Freecells = "Freecells: 2H - 8D\n" +
                ": 4C 2C 9C 8C QS 4S\n" +
": 5H QH 3C AC 3H 4H QD\n" +
": QC 9S 6H 9H 3S KS 3D\n" +
": 5D 2S JC 5C JH 6D AS\n" +
": 2D KD TH TC TD\n" +
": 7H JS KH TS KC 7C\n" +
": AH 5S 6S AD 8H JD\n" +
": 7S 6C 7D 4D 8S 9D\n" ;
            const result = new BoardParseResult(8, 4, ms_deal_24_w_Freecells);

            // TEST
            a.ok( result.is_valid, "parsed correctly.");

            // TEST
            a.equal(result.columns.length, 8, 'There are 8 columns');

            // TEST
            a.deepEqual(result.columns[0].col.getArrOfStrs(),
                '4C 2C 9C 8C QS 4S'.split(' '),
                'column 0 was parsed fine.');

            // TEST
            a.deepEqual(result.freecells.freecells.getArrOfStrs(), ['2H', '-', '8D', '-'],
                        "freecell contents is fine.");
        }

        {
            const fc_s = "Freecells: 2H - 8D 6C 4H\n";
            const ms_deal_24_w_Freecells = fc_s +
                ": 4C 2C 9C 8C QS 4S\n" +
": 5H QH 3C AC 3H 4H QD\n" +
": QC 9S 6H 9H 3S KS 3D\n" +
": 5D 2S JC 5C JH 6D AS\n" +
": 2D KD TH TC TD\n" +
": 7H JS KH TS KC 7C\n" +
": AH 5S 6S AD 8H JD\n" +
": 7S 6C 7D 4D 8S 9D\n" ;
            const result = new BoardParseResult(8, 4, ms_deal_24_w_Freecells);

            // TEST
            a.ok( (!result.is_valid), "not validly parsed.");

            const error = result.errors[0];
            // TEST
            a.equal(
                error.type_,
                ParseErrorType.LINE_PARSE_ERROR,
                "Error of right type.",
            );
            const loc = error.locs[0];
            // TEST
            a.equal(
                loc.type_,
                ErrorLocationType.ErrorLocationType_Freecells,
                'Error location of right type.',
            );
            // TEST
            a.equal(loc.idx, 0, 'Column index #0');

            // TEST
            a.equal(loc.start, 0, 'Location start is sane.');

            // TEST
            a.equal(loc.end, fc_s.length, 'Location end is correct.');

            const fc_err = result.freecells;

            // TEST
            a.equal(fc_err.error, 'Too many cards specified in Freecells line.',
                'error is correct.');
        }

    });
}
