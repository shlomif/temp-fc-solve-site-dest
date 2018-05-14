"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(["web-fc-solve", "libfcs-wrap", 'dist/fc_solve_find_index_s2ints'], function (w, Module, s2i) {
    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    function escapeHtml(string) {
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    }

    // Thanks to Stefan Petrea ( http://garage-coding.com/ ) for inspiring this
    // feature.
    function populate_input_with_numbered_deal() {
        alert("vheese");
        var input_s = $('#deal_number').val();
        alert("blo," + input_s);
        if (!input_s.match(/^[1-9][0-9]*$/)) {
            alert("Wrong input - please enter a positive integer.");
            return;
        }

        var previous_deal_idx = parseInt(input_s);

        alert("rari");
        try {
        $("#stdin").val("# MS Freecell Deal #" + previous_deal_idx + "\n#\n" + w.deal_ms_fc_board(previous_deal_idx));
        } catch (e) {
            alert(e);
        }

        return;
    }

    var FC_Solve_Bookmarking = function () {
        function FC_Solve_Bookmarking(args) {
            _classCallCheck(this, FC_Solve_Bookmarking);

            var that = this;

            that.bookmark_controls = args.bookmark_controls;
            that.show = args.show;

            return;
        }

        _createClass(FC_Solve_Bookmarking, [{
            key: "_get_loc",
            value: function _get_loc() {
                return window.location;
            }
        }, {
            key: "_get_base_url",
            value: function _get_base_url() {
                var that = this;

                var loc = that._get_loc();
                return loc.protocol + '//' + loc.host + loc.pathname;
            }
        }, {
            key: "_each_control",
            value: function _each_control(cb) {
                var that = this;

                that.bookmark_controls.forEach(cb);

                return;
            }
        }, {
            key: "on_bookmarking",
            value: function on_bookmarking() {
                var that = this;

                function get_v(myid) {
                    var ctl = $('#' + myid);
                    return ctl.is(':checkbox') ? ctl.is(':checked') ? '1' : '0' : ctl.val();
                }

                var control_values = {};

                that._each_control(function (myid) {
                    control_values[myid] = get_v(myid);
                });

                var bookmark_string = that._get_base_url() + '?' + $.querystring(control_values);

                $("#fcs_bm_results_input").val(bookmark_string);

                var a_elem = $("#fcs_bm_results_a");
                // Too long to be effective.
                // a_elem.text(bookmark_string);
                a_elem.attr('href', bookmark_string);

                $("#fcs_bookmark_wrapper").removeClass("disabled");

                return;
            }
        }, {
            key: "restore_bookmark",
            value: function restore_bookmark() {
                var that = this;

                var qs = that._get_loc().search;

                if (!qs.length) {
                    return;
                }

                // Remove trailing 1.
                var params = $.querystring(qs.substr(1));

                that._each_control(function (myid) {
                    var ctl = $('#' + myid);
                    if (ctl.is(':checkbox')) {
                        ctl.prop('checked', params[myid] == "1" ? true : false);
                    } else {
                        ctl.val(params[myid]);
                    }
                });

                that.show.forEach(function (rec) {
                    var id = rec.id;
                    var deps = rec.deps;

                    var should_toggle = false;
                    deps.forEach(function (d) {
                        if ($("#" + d).val().length > 0) {
                            should_toggle = true;
                        }
                    });

                    if (should_toggle) {
                        if ($("#" + id).hasClass("disabled")) {
                            rec.callback();
                        }
                    }
                });

                return;
            }
        }]);

        return FC_Solve_Bookmarking;
    }();

    return {
        FC_Solve_Bookmarking: FC_Solve_Bookmarking,
        escapeHtml: escapeHtml,
        populate_input_with_numbered_deal: populate_input_with_numbered_deal
    };
});
