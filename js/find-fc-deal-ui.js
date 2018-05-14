"use strict";

// define(["fcs-base-ui", "web-fc-solve", "libfcs-wrap", 'dist/fc_solve_find_index_s2ints'], function (base_ui, w, Module, s2i) {
define(["fcs-base-ui", "web-fc-solve"], function (base_ui, w/*, Module, s2i*/) {
    // var _my_module = Module()({});
    // w.FC_Solve_init_wrappers_with_module(_my_module);

    function toggle_advanced() {
        var ctl = $("#fcs_advanced");
        ctl.toggleClass("disabled");

        function set_text(my_text) {
            $("#fcs_advanced_toggle").text(my_text);
        };

        set_text(ctl.hasClass("disabled") ? "Advanced ▼" : "Advanced ▲");

        return;
    }

    function _create_bmark_obj() {
        return new base_ui.FC_Solve_Bookmarking({
            bookmark_controls: ['stdin', 'deal_number'],
            show: []
        });
    }

    function on_bookmarking() {
        return _create_bmark_obj().on_bookmarking();
    }

    function restore_bookmark() {
        return _create_bmark_obj().restore_bookmark();
    }
    // Taken from https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    // thanks.
    var numberWithCommas = function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    function find_deal_ui() {
        var deal_str = $("#stdin").val().replace(/#[^\r\n]*\r?\n?/g, '').replace(/\r+\n/, "\n").replace(/([^\n])$/, "$1\n");
        var ints = [0]; // s2i.find_index__board_string_to_ints(deal_str);
        var ints_s = ints.map(function (i) {
            var ret = i.toString();
            return " ".repeat(10 - ret.length) + ret;
        }).join('');
        var df = new w.Freecell_Deal_Finder({});
        df.fill(ints_s);
        var ctl = $("#fc_solve_status");
        df.run(1, '8589934591', function (args) {
            ctl.html(base_ui.escapeHtml("Reached No. " + numberWithCommas(args.start)));
            return;
        });

        function resume() {
            var ret_Deal = df.cont();
            if (ret_Deal.found) {
                ctl.html("Found " + ret_Deal.result.toString());
            } else if (ret_Deal.cont) {
                setTimeout(function () {
                    resume();
                }, 1);
            } else {
                ctl.html("No such deal");
            }
        }

        resume();
    }

    function set_up_handlers() {
        $("#populate_input").click(base_ui.populate_input_with_numbered_deal);
        $("#run_do_solve").click(find_deal_ui);
    }

    function set_up() {
        restore_bookmark();
        set_up_handlers();
        $("#fc_solve_bookmark_button").click(on_bookmarking);
    }

    return {
        find_deal_ui: find_deal_ui,
        set_up: set_up,
        set_up_handlers: set_up_handlers
    };
});
