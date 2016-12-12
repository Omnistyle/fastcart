define(['sbl!app'], function (itcApp) {
  itcApp.service('simpleDateService', ['$location', '$rootScope', 'localStorageService', 'localizeService', '$filter', function($location, $rootScope, localStorageService, localizeService, $filter) {
    var CalUtils, CustomRangeUtils, relative_items, self;
    self = {};
    
    $rootScope.$watch('l10n',function(val, oldVal) {
      if (val) {
          self.l10n = val; // save loc info
      }
    });

    self.filterDate = function(format, startDate, endDate) {
        if (endDate == null) {
          endDate = null;
        }
        return localizeService.format(format, startDate, endDate);
    };
    
    self.create = function(args) {
      var SimpleDateObject;
      if (args == null) {
        args = {};
      }
      args = _.defaults(args, {
        scope: null,
        isMetrics: false
      });
      return new (SimpleDateObject = (function() {
        SimpleDateObject.prototype.service = null;

        SimpleDateObject.prototype.default_interval = "r";

        SimpleDateObject.prototype.default_datesel = "d30";

        function SimpleDateObject() {
          this.service = new localStorageService.Instance(args.scope, 'simpleDate');
        }

        SimpleDateObject.prototype.getInterval = function() {
          return this.service.get("state.interval", this.default_interval);
        };

        SimpleDateObject.prototype.getDateSel = function() {
          return this.service.get("state.dateSel", this.default_datesel);
        };

        SimpleDateObject.prototype.bind = function(callback) {
          this.service.bind('state.interval', this.default_interval);
          this.service.bind('state.dateSel', this.default_datesel);
          return args.scope.$watch("state.dateSel", function(new_val, old_val) {
            var search;
            search = $location.search();
            search.interval = args.scope.state.interval;
            search.datesel = args.scope.state.dateSel;
            $location.search(search);
            return callback != null ? callback.call(null, search.interval, search.datesel) : void 0;
          });
        };

        return SimpleDateObject;

      })())();
    };
    self.getStartEndDates = function(date, interval) {
      var dateStuff, dates, momentDate, orig_date;
      if (date == null) {
        date = this.getDateSel();
      }
      if (interval == null) {
        interval = this.getInterval();
      }
      dates = {
        startTime: null,
        endTime: null
      };
      switch (interval) {
        case 'd':
          momentDate = moment(date, "YYYYMMDD");
          dates.startTime = moment(momentDate).subtract(0, "days").toDate();
          dates.endTime = momentDate.toDate();
          break;
        case 'w':
          momentDate = moment(date, "YYYYMMDD[w]");
          dates.startTime = momentDate.toDate();
          dates.endTime = moment(momentDate).add(6, 'days').toDate();
          break;
        case 'm':
          momentDate = moment(date, "YYYYMM");
          dates.startTime = moment(momentDate).startOf('month').toDate();
          dates.endTime = moment(momentDate).endOf('month').toDate();
          break;
        case 'r':
          dateStuff = self.queryFormat(interval, date);
          orig_date = moment(dateStuff.date, "YYYY-MM-DDT00:00:00[Z]");
          switch (date) {
            case 'y':
              dates.startTime = moment(orig_date).toDate();
              dates.endTime = moment(orig_date).toDate();
              break;
            case 'd7':
              dates.startTime = moment(orig_date).toDate();
              dates.endTime = moment(orig_date).add(6, "days").toDate();
              break;
            case "d30":
              dates.startTime = moment(orig_date).toDate();
              dates.endTime = moment(orig_date).add(29, "days").toDate();
              break;
            case "d90":
              dates.startTime = moment(orig_date).toDate();
              dates.endTime = moment(orig_date).add(89, "days").toDate();
              break;
            case "lw":
              dates.startTime = moment(orig_date).toDate();
              dates.endTime = moment(orig_date).add(6, "days").toDate();
              break;
            case "lm":
              dates.startTime = moment(orig_date).toDate();
              dates.endTime = moment(orig_date).endOf('month').toDate();
              break;
            default:
              if (CustomRangeUtils.isDateSelCustomRange(date)) {
                dates = date.split(":");
              } else {
                dates = $location.search().datesel.split(":");
              }
              dates.startTime = moment(dates[0], "YYYYMMDD").toDate();
              dates.endTime = moment(dates[1], "YYYYMMDD").toDate();
          }
          break;
        default:
          throw Error('Unsupported interval detected a-ha');
      }
      return dates;
    };
    self.queryFormat = function(freq, date) {
      var day, result;
      result = {};
      if (freq === "r") {
        switch (date) {
          case "y":
            result.freq = "DAY";
            result.date = moment().subtract(1, "days").format("YYYY-MM-DDT00:00:00[Z]");
            break;
          case "d7":
            result.freq = "DAY";
            result.date = moment().subtract(7, "days").format("YYYY-MM-DDT00:00:00[Z]");
            break;
          case "d30":
            result.freq = "DAY";
            result.date = moment().subtract(30, "days").format("YYYY-MM-DDT00:00:00[Z]");
            break;
          case "d90":
            result.freq = "DAY";
            result.date = moment().subtract(90, "days").format("YYYY-MM-DDT00:00:00[Z]");
            break;
          case "lw":
            day = moment().day();
            if (day === 0) {
              day = 7;
            }
            result.freq = "WEEK";
            result.date = moment().subtract(day + 6, "days").format("YYYY-MM-DDT00:00:00[Z]");
            break;
          case "lm":
            result.freq = "MONTH";
            result.date = moment().subtract(1, "months").date(1).format("YYYY-MM-DDT00:00:00[Z]");
            break;
          default:
            result.freq = "DAY";
            result.date = date;
        }
      } else {
        result.freq = {
          d: "DAY",
          w: "WEEK",
          m: "MONTH"
        }[freq];
        result.date = {
          d: moment(date, "YYYYMMDD").format("YYYY-MM-DDT00:00:00[Z]"),
          w: moment(date, "YYYYMMDD[w]").format("YYYY-MM-DDT00:00:00[Z]"),
          m: moment(date, "YYYYMM").format("YYYY-MM-DDT00:00:00[Z]")
        }[freq];
      }
      return result;
    };
    self.getOptionalStartTimeQueryDates = function(interval, dateSel) {
      var dates, q;
      q = self.queryFormat(interval, dateSel);
      if ((interval === "r" && (dateSel === "d7" || dateSel === "d30" || dateSel === "d90")) || (interval === "r" && CustomRangeUtils.isDateSelCustomRange(dateSel))) {
        dates = self.getStartEndDates(dateSel, interval);
        return {
          startTime: moment(dates.startTime).format("YYYY-MM-DDT00:00:00[Z]"),
          endTime: moment(dates.endTime).format("YYYY-MM-DDT00:00:00[Z]"),
          freq: q.freq
        };
      } else {
        return {
          startTime: null,
          endTime: q.date,
          freq: q.freq
        };
      }
    };
    self.metricsLimiter = function(dateSel, interval) {
      if ((!(dateSel === "y" || dateSel === "lw" || dateSel === "lm" || dateSel === "d30")) && interval === "r") {
        return "d30";
      } else {
        return dateSel;
      }
    };
    Date.prototype.getWeek = function() {
      var onejan;
      onejan = new Date(this.getFullYear(), 0, 1);
      return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    };
    CalUtils = {
      ce: function(class_name, attach_to) {
        var el;
        el = $(document.createElement("div"));
        if (class_name != null) {
          el.addClass(class_name);
        }
        if (attach_to != null) {
          attach_to.append(el);
        }
        return el;
      },
      cd: function(year, month, first_day) {
        if (first_day == null) {
          first_day = true;
        }
        if (first_day) {
          return new Date(year, month, 1, 0, 0, 0);
        } else {
          return new Date(year, month + 1, 0, 0, 0, 0);
        }
      },
      weekStartDay: function(date, start_on) {
        var day;
        if (start_on == null) {
          start_on = 1;
        }
        day = moment(date).day();
        day = day - start_on;
        if (day < 0) {
          day = 7 + day;
        }
        return day;
      },
      weekPrevNext: function(date, next) {
        if (next == null) {
          next = true;
        }
        return date = next ? moment(date).add(7, "days") : moment(date).subtract(7, "days");
      }
    };
    CustomRangeUtils = {
      stringFormat: "YYYYMMDD",
      isDateSelCustomRange: function(dateSel) {
        return /[\d]{8}:[\d]{8}/.test(dateSel);
      },
      getDaysDiff: function(startTime, endTime) {
        return endTime.diff(startTime, 'days');
      },
      getNextRange: function(startTime, endTime) {
        var offset;
        offset = CustomRangeUtils.getDaysDiff(startTime, endTime);
        return {
          startTime: endTime.clone().add(1, 'days'),
          endTime: endTime.clone().add(offset + 1, 'days')
        };
      },
      getPrevRange: function(startTime, endTime) {
        var offset;
        offset = CustomRangeUtils.getDaysDiff(startTime, endTime);
        return {
          startTime: startTime.clone().subtract(offset + 1, 'days'),
          endTime: startTime.clone().subtract(1, 'days')
        };
      },
      getDateSelFromStartEnd: function(startTime, endTime) {
        return CustomRangeUtils.momentToString(startTime) + ':' + CustomRangeUtils.momentToString(endTime);
      },
      momentToString: function(date) {
        return date.format(CustomRangeUtils.stringFormat);
      }
    };
    self.momentFromApi = function(date) {
      return moment(date, "YYYY-MM-DDT00:00:00[Z]");
    };
    self.dateDisplay = { 
      day: function(date, full_format) {
        if (full_format == null) {
          full_format = false;
        }
        if (date.year() === moment().year() && !full_format) {
          //return $filter('localizeDate')("MMM D", date);
          return self.filterDate("MMM D", date);
        } else {
          //return $filter('localizeDate')("MMM D, YYYY", date);
          return self.filterDate("MMM D, YYYY", date);
        }
      },
      range: function(fromDate, toDate, full_format) {
        if (full_format == null) {
          full_format = false;
        }
        if (full_format) {
          //return $filter('localizeDate')("MMM D, YYYY-MMM D, YYYY", fromDate, toDate);
          return self.filterDate("MMM D, YYYY-MMM D, YYYY", fromDate, toDate);
        } else if (fromDate.isSame(toDate)) {
          if (fromDate.year() === moment().year()) {
            //return $filter('localizeDate')("MMM D", fromDate);
            return self.filterDate
          } else {
            //return $filter('localizeDate')("MMM D, YYYY", fromDate);
            return self.filterDate
          }
        } else if (fromDate.month() === toDate.month()) {
          if (toDate.year() === moment().year()) {
            //return $filter('localizeDate')("MMM D-D", fromDate, toDate);
            return self.filterDate("MMM D-D", fromDate, toDate);
          } else {
            //return $filter('localizeDate')("MMM D-D, YYYY", fromDate, toDate);
            return self.filterDate("MMM D-D, YYYY", fromDate, toDate);
          }
        } else if (fromDate.year() !== toDate.year()) {
          //return $filter('localizeDate')("MMM D, YYYY-MMM D, YYYY", fromDate, toDate);
          return self.filterDate("MMM D, YYYY-MMM D, YYYY", fromDate, toDate);
        } else {
          if (toDate.year() === moment().year()) {
            //return $filter('localizeDate')("MMM D-MMM D", fromDate, toDate);
            return self.filterDate("MMM D-MMM D", fromDate, toDate);
          } else {
            //return $filter('localizeDate')("MMM D-MMM D, YYYY", fromDate, toDate);
            return self.filterDate("MMM D-MMM D, YYYY", fromDate, toDate);
          }
        }
      },
      month: function(date, full_format) {
        if (full_format == null) {
          full_format = false;
        }
        if (date.year() !== moment().year() || full_format) {
          //return $filter('localizeDate')("MMMM, YYYY", date);
          return self.filterDate("MMMM, YYYY", date);
        } else {
          //return $filter('localizeDate')("MMMM", date);
          return self.filterDate("MMMM", date);
        }
      },
      auto: function(date, interval, rel_type, full_format) {
        var dateDiff, dates;
        if (full_format == null) {
          full_format = false;
        }
        if (interval === "m") {
          return self.dateDisplay.month(date, full_format);
        }
        if (interval === "w") {
          return self.dateDisplay.range(date, date.clone().add(6, "days"), full_format);
        }
        if (interval === "d") {
          return self.dateDisplay.day(date, full_format);
        }
        if (interval === "r") {
          if (rel_type === "y") {
            return self.dateDisplay.day(date, full_format);
          }
          if (rel_type === "lw") {
            return self.dateDisplay.range(date, date.clone().add(6, "days"), full_format);
          }
          if (rel_type === "lm") {
            return self.dateDisplay.month(date, full_format);
          }
          if (rel_type === "d7") {
            return self.dateDisplay.range(date, date.clone().add(6, "days"), full_format);
          }
          if (rel_type === "d30") {
            return self.dateDisplay.range(date, date.clone().add(29, "days"), full_format);
          }
          if (rel_type === "d90") {
            return self.dateDisplay.range(date, date.clone().add(89, "days"), full_format);
          }
          if (CustomRangeUtils.isDateSelCustomRange(rel_type)) {
            dates = rel_type.split(":");
            dateDiff = moment(dates[1], "YYYYMMDD").diff(moment(dates[0], "YYYYMMDD"), 'days');
            return self.dateDisplay.range(date, date.clone().add(dateDiff, "days"), full_format);
          }
        }
      }
    };
    relative_items = {
      reg: {
        d30: 'lastthirtydays',
        y: 'Crossfire.datepicker.yesterday',
        lw: 'Crossfire.datepicker.lastweek',
        lm: 'Crossfire.datepicker.lastmonth'
      },
      metrics: {
        d7: 'Crossfire.datepicker.lastsevendays',
        d30: 'Crossfire.datepicker.lastthirtydays',
        d90: 'Crossfire.datepicker.lastninetydays',
        y: 'Crossfire.datepicker.yesterday',
        lw: 'Crossfire.datepicker.lastweek',
        lm: 'Crossfire.datepicker.lastmonth'
      }
    };
    self.DateBox = (function() {
      DateBox.prototype.prevBtn = null;

      DateBox.prototype.nextBtn = null;

      DateBox.prototype.mainDisplay = null;

      DateBox.prototype.label = null;

      DateBox.prototype.interval = "m";

      DateBox.prototype.intervaltypes = ["r", "d", "w", "m"];

      DateBox.prototype.isMetrics = false;

      DateBox.prototype.curdate = null;

      DateBox.prototype.dateSel = null;

      DateBox.prototype.dateSelFormatted = null;

      DateBox.prototype.startDateRestriction = null;

      DateBox.prototype.endDateRestriction = null;

      function DateBox(args) {
        args = _.defaults(args, {
          scope: this.scope,
          el: this.el,
          attrs: this.attrs,
          onSel: this.onSel,
          isMetrics: this.isMetrics
        });
        this.scope = args.scope;
        this.el = args.el;
        this.attrs = args.attrs;
        this.onSel = args.onSel;
        this.isMetrics = args.isMetrics;
        this.startDateRestriction = args.startDateRestriction;
        this.endDateRestriction = args.endDateRestriction;
        this.relative_items = this.isMetrics ? relative_items.metrics : relative_items.reg;
        this.assignEls();
        this.prevBtn.click((function(_this) {
          return function() {
            return _this.buttonAction("prev");
          };
        })(this));
        this.nextBtn.click((function(_this) {
          return function() {
            return _this.buttonAction("next");
          };
        })(this));
        this.curdate = moment();
      }

      DateBox.prototype.assignEls = function() {
        this.prevBtn = this.el.find(".prev.button");
        this.nextBtn = this.el.find(".next.button");
        this.label = this.el.find(".label");
        return this.mainDisplay = this.el.find(".innerinfo");
      };

      DateBox.prototype.buttonAction = function(dir) {
        return {
          m: _.bind(this.monthAction, this),
          d: _.bind(this.dayAction, this),
          w: _.bind(this.weekAction, this),
          r: _.bind(this.rangeAction, this)
        }[this.interval](dir);
      };

      DateBox.prototype.update = function(interval1, datesel) {
        this.interval = interval1;
        return {
          m: _.bind(this.monthUpdate, this),
          d: _.bind(this.dayUpdate, this),
          w: _.bind(this.weekUpdate, this),
          r: _.bind(this.rangeUpdate, this)
        }[this.interval](datesel);
      };

      DateBox.prototype.daySel = function() {
        this.interval = "d";
        this.dateSelFormatted = this.dateSel.format("YYYYMMDD");
        this.onSel();
        return this.dayDisp();
      };

      DateBox.prototype.weekSel = function() {
        this.interval = "w";
        this.dateSelFormatted = this.dateSel.format("YYYYMMDD[w]");
        this.onSel();
        return this.weekDisp();
      };

      DateBox.prototype.monthSel = function() {
        this.interval = "m";
        this.dateSelFormatted = this.dateSel.format("YYYYMM");
        this.onSel();
        return this.monthDisp();
      };

      DateBox.prototype.rangeSel = function() {
        if (CustomRangeUtils.isDateSelCustomRange(this.dateSel)) {
          this.interval = "r";
          this.dateSelFormatted = this.dateSel;
          this.onSel();
          return this.rangeDisp();
        }
      };

      DateBox.prototype.dayAction = function(dir) {
        var valid;
        valid = false;
        if (dir === "next" && this.dayTest().next) {
          this.dateSel.add(1, 'days');
          valid = true;
        }
        if (dir === "prev" && this.dayTest().prev) {
          this.dateSel.subtract(1, 'days');
          valid = true;
        }
        if (valid) {
          return this.daySel();
        }
      };

      DateBox.prototype.weekAction = function(dir) {
        var valid;
        valid = false;
        if (dir === "next" && this.weekTest().next) {
          this.dateSel.add(7, 'days');
          valid = true;
        }
        if (dir === "prev" && this.weekTest().prev) {
          this.dateSel.subtract(1, 'weeks');
          valid = true;
        }
        if (valid) {
          return this.weekSel();
        }
      };

      DateBox.prototype.monthAction = function(dir) {
        var valid;
        valid = false;
        if (dir === "next" && this.monthTest().next) {
          this.dateSel.add(1, 'months');
          valid = true;
        }
        if (dir === "prev" && this.monthTest().prev) {
          this.dateSel.subtract(1, 'months');
          valid = true;
        }
        if (valid) {
          return this.monthSel();
        }
      };

      DateBox.prototype.rangeAction = function(dir) {
        var dates, nextDates, prevDates, ref, ref1;
        if (dir === "next" && this.rangeTest().next) {
          if (this.dateSel === "lw") {
            this.dateSel = moment().subtract(CalUtils.weekStartDay(moment()), "days");
            this.weekSel();
          }
          if (this.dateSel === "lm") {
            this.dateSel = moment();
            this.monthSel();
          }
          if (CustomRangeUtils.isDateSelCustomRange(this.dateSel) || ((ref = this.dateSel) === "d7" || ref === "d30" || ref === "d90")) {
            dates = self.getStartEndDates(this.dateSel, this.interval);
            dates.startTime = moment(dates.startTime);
            dates.endTime = moment(dates.endTime);
            nextDates = CustomRangeUtils.getNextRange(dates.startTime, dates.endTime);
            this.dateSel = CustomRangeUtils.getDateSelFromStartEnd(nextDates.startTime, nextDates.endTime);
            return this.rangeSel();
          }
        } else if (this.rangeTest().prev) {
          if (this.dateSel === "y") {
            this.dateSel = moment().subtract(2, "days");
            this.daySel();
          }
          if (this.dateSel === "lw") {
            this.dateSel = moment().subtract(CalUtils.weekStartDay(moment()) + 14, "days");
            this.weekSel();
          }
          if (this.dateSel === "lm") {
            this.dateSel = moment().subtract(2, "months");
            this.monthSel();
          }
          if (CustomRangeUtils.isDateSelCustomRange(this.dateSel) || ((ref1 = this.dateSel) === "d7" || ref1 === "d30" || ref1 === "d90")) {
            dates = self.getStartEndDates(this.dateSel, this.interval);
            dates.startTime = moment(dates.startTime);
            dates.endTime = moment(dates.endTime);
            prevDates = CustomRangeUtils.getPrevRange(dates.startTime, dates.endTime);
            this.dateSel = CustomRangeUtils.getDateSelFromStartEnd(prevDates.startTime, prevDates.endTime);
            return this.rangeSel();
          }
        }
      };

      DateBox.prototype.dayDisp = function() {
        if (!this.dayTest().next) {
          this.nextBtn.addClass("disabled");
        } else {
          this.nextBtn.removeClass("disabled");
        }
        if (!this.dayTest().prev) {
          this.prevBtn.addClass("disabled");
        } else {
          this.prevBtn.removeClass("disabled");
        }
        //return this.label.text(self.dateDisplay.day(this.dateSel)); // karen moving this to the directive
      };

      DateBox.prototype.weekDisp = function() {
        if (!this.weekTest().next) {
          this.nextBtn.addClass("disabled");
        } else {
          this.nextBtn.removeClass("disabled");
        }
        if (!this.weekTest().prev) {
          this.prevBtn.addClass("disabled");
        } else {
          this.prevBtn.removeClass("disabled");
        }
        return this.label.text(self.dateDisplay.range(this.dateSel, this.dateSel.clone().add(6, "days")));
      };

      DateBox.prototype.monthDisp = function() {
        if (!this.monthTest().next) {
          this.nextBtn.addClass("disabled");
        } else {
          this.nextBtn.removeClass("disabled");
        }
        if (!this.monthTest().prev) {
          this.prevBtn.addClass("disabled");
        } else {
          this.prevBtn.removeClass("disabled");
        }
        return this.label.text(self.dateDisplay.month(this.dateSel));
      };

      DateBox.prototype.rangeDisp = function() {
        var rangeTest;
        this.rangedates = this.dateSel.split(":");
        rangeTest = this.rangeTest();
        if (rangeTest.next) {
          this.nextBtn.removeClass("disabled");
        } else {
          this.nextBtn.addClass("disabled");
        }
        if (rangeTest.prev) {
          this.prevBtn.removeClass("disabled");
        } else {
          this.prevBtn.addClass("disabled");
        }
        if (CustomRangeUtils.isDateSelCustomRange(this.dateSel)) {
          return this.label.text(self.dateDisplay.range(moment(this.rangedates[0], "YYYYMMDD"), moment(this.rangedates[1], "YYYYMMDD")));
        } else {
          return this.label.text(this.relative_items[this.dateSel]);
        }
      };

      // controls the prev/next buttons that surround the selected date (not in the popover)
      DateBox.prototype.dayTest = function() {
        return {
          prev: false, //this.dateSel.isAfter(this.startDateRestriction),
          next: false //this.dateSel.isBefore(moment().subtract("days", 2))
        };
      };

      DateBox.prototype.weekTest = function() {
        var dateMonth, restMonth, startRestWeek, start_day;
        restMonth = Number(this.startDateRestriction.format("YYYYMM"));
        dateMonth = Number(this.dateSel.format("YYYYMM"));
        start_day = CalUtils.weekStartDay(this.startDateRestriction);
        if (start_day !== 0) {
          start_day = 7 - start_day;
        }
        startRestWeek = this.startDateRestriction.clone().add(start_day, "days");
        return {
          prev: true, //Number(this.dateSel.format("YYYYMMDD")) > Number(startRestWeek.format("YYYYMMDD")),
          next: true //CalUtils.weekStartDay(this.curdate) === 0 ? Number(this.curdate.clone().subtract(1, 'week').format("YYYYWW")) > Number(this.dateSel.format("YYYYWW")) : Number(this.curdate.format("YYYYWW")) > Number(this.dateSel.format("YYYYWW"))
        };
      };

      DateBox.prototype.monthTest = function() {
        return {
          prev: true, //this.startDateRestriction.date() > 1 ? Number(this.dateSel.format("YYYYWW")) > Number(this.startDateRestriction.clone().add('month', 1).format("YYYYWW")) : Number(this.dateSel.format("YYYYWW")) > Number(this.startDateRestriction.format("YYYYWW")),
          next: true //Number(this.curdate.clone().subtract("days", 1).format("YYYYMM")) > Number(this.dateSel.format("YYYYMM"))
        };
      };

      DateBox.prototype.rangeTest = function() {
        var dates, nextDates, nextvalid, prevDates, prevvalid, ref, ref1, ref2;
        nextvalid = true;
        prevvalid = true;
        if (!((ref = this.dateSel) === "lm" || ref === "lw")) {
          nextvalid = false;
        } else if (this.dateSel === "lw" && CalUtils.weekStartDay(this.curdate) === 0) {
          nextvalid = false;
        }
        if (!((ref1 = this.dateSel) === "y" || ref1 === "lm" || ref1 === "lw")) {
          prevvalid = false;
        }
        if (CustomRangeUtils.isDateSelCustomRange(this.dateSel) || ((ref2 = this.dateSel) === "d7" || ref2 === "d30" || ref2 === "d90") && this.isMetrics) {
          dates = self.getStartEndDates(this.dateSel, this.interval);
          dates.startTime = moment(dates.startTime);
          dates.endTime = moment(dates.endTime);
          prevDates = CustomRangeUtils.getPrevRange(dates.startTime, dates.endTime);
          nextDates = CustomRangeUtils.getNextRange(dates.startTime, dates.endTime);
          prevvalid = Number(CustomRangeUtils.momentToString(prevDates.startTime)) >= Number(CustomRangeUtils.momentToString(this.startDateRestriction));
          nextvalid = Number(CustomRangeUtils.momentToString(nextDates.endTime)) < Number(CustomRangeUtils.momentToString(moment()));
        }
        return {
          next: true, //nextvalid,
          prev: true //prevvalid
        };
      };

      DateBox.prototype.dayUpdate = function(datesel) {
        this.dateSel = moment(datesel, "YYYYMMDD");
        return this.dayDisp();
      };

      DateBox.prototype.weekUpdate = function(datesel) {
        this.dateSel = moment(datesel, "YYYYMMDD[w]");
        return this.weekDisp();
      };

      DateBox.prototype.monthUpdate = function(datesel) {
        this.dateSel = moment(datesel, "YYYYMM");
        return this.monthDisp();
      };

      DateBox.prototype.rangeUpdate = function(relsel) {
        this.dateSel = relsel;
        return this.rangeDisp();
      };

      return DateBox;

    })();
    self.DaySelector = (function() {
      DaySelector.prototype.el = null;

      DaySelector.prototype.parent_el = null;

      DaySelector.prototype.scope = null;

      DaySelector.prototype.interval = null;

      DaySelector.prototype.order = ["r", "d", "w", "m"];

      DaySelector.prototype.first_sel = true;

      DaySelector.prototype.leftSwitch = null;

      DaySelector.prototype.rightSwitch = null;

      DaySelector.prototype.onSelect = null;

      DaySelector.prototype.onChangeMonth = null;

      DaySelector.prototype.onChangeRelative = null;

      DaySelector.prototype.selDateOverride = null;

      DaySelector.prototype.dateselcontainer = null;

      DaySelector.prototype.prevInterval = null;

      DaySelector.prototype.daily = false;

      DaySelector.prototype.isMetrics = false;

      DaySelector.prototype.startDateRestriction = null;

      DaySelector.prototype.endDateRestriction = null;

      DaySelector.prototype.restrictionFrom = null;

      function DaySelector(args) {
        var start_restriction;
        if (args == null) {
          args = {};
        }
        args = _.defaults(args, {
          parent_el: null,
          dateselcontainer: null,
          scope: null,
          interval: "d",
          selDateOverride: null,
          prevInterval: null,
          isMetrics: false,
          search: null,
          simpleDateService: null,
          startDateRestriction: null,
          endDateRestriction: null,
          restrictionFrom: null,
          onSelect: function() {},
          onChangeMonth: function() {},
          onChangeRelative: function() {}
        });
        this.selDateOverride = args.selDateOverride;
        this.parent_el = args.parent_el;
        this.scope = args.scope;
        this.onSelect = args.onSelect;
        this.onChangeMonth = args.onChangeMonth;
        this.onChangeRelative = args.onChangeRelative;
        this.dateselcontainer = args.dateselcontainer;
        this.isMetrics = args.isMetrics;
        this.search = args.search;
        this.simpleDateService = args.simpleDateService;
        this.startDateRestriction = args.startDateRestriction;
        this.endDateRestriction = args.endDateRestriction;
        this.restrictionFrom = args.restrictionFrom;
        this.relative_items = this.isMetrics ? relative_items.metrics : relative_items.reg;
        this.interval = args.interval;
        this.prevInterval = args.prevInterval;
        if (this.restrictionFrom != null) {
          start_restriction = (function() {
            switch (this.interval) {
              case "d":
                return moment().subtract(this.restrictionFrom.days, "days").minute(0).hour(0).second(0);
              case "w":
                return moment().subtract(this.restrictionFrom.weeks, "weeks").minute(0).hour(0).second(0);
              case "m":
                return moment().subtract(this.restrictionFrom.months, "months").minute(0).hour(0).second(0);
            }
          }).call(this);
          if (!this.startDateRestriction.isAfter(start_restriction)) {
            this.startDateRestriction = start_restriction;
          }
        }
        this.setInterval();
        this.current_date = new Date();
        this.el = this.selectEl(this.interval);
        this.getSelDate();
        if (this.monthly) {
          this.makeMonthCalendar(this.selDate.year());
        } else if (this.range) {
          this.makeRangeDisplay();
        } else {
          this.makeCalendar(this.selDate.year(), this.selDate.month());
        }
        this.drawParentHeight();
        this.drawElementTransition();
      }

      DaySelector.prototype.setInterval = function() {
        this.range = this.interval === "r";
        this.daily = this.interval === "d";
        this.weekly = this.interval === "w";
        return this.monthly = this.interval === "m";
      };

      DaySelector.prototype.drawElementTransition = function() {
        if ((this.prevInterval != null) && this.prevInterval !== this.interval) {
          return _.defer((function(_this) {
            return function() {
              var currentIndex, oldel, prevIndex;
              prevIndex = _.indexOf(_this.order, _this.prevInterval);
              currentIndex = _.indexOf(_this.order, _this.interval);
              oldel = _this.selectEl(_this.prevInterval);
              if (currentIndex > prevIndex) {
                _this.el.addClass("frompos right");
                oldel.removeClass("zero").addClass("left");
              } else {
                _this.el.addClass("frompos left");
                oldel.removeClass("zero").addClass("right");
              }
              _.delay(function() {
                return _this.el.removeClass("left right").addClass("zero");
              }, 50);
              return _.delay(function() {
                return oldel.removeClass("frompos right left zero").empty();
              }, 350);
            };
          })(this));
        } else {
          return this.el.addClass("frompos zero");
        }
      };

      DaySelector.prototype.drawParentHeight = function() {
        return _.defer((function(_this) {
          return function() {
            return _this.dateselcontainer.css("height", _this.el.height());
          };
        })(this));
      };

      DaySelector.prototype.selectEl = function(interval) {
        var el, intervalEl;
        intervalEl = {
          r: ".range",
          d: ".daily",
          w: ".weekly",
          m: ".monthly"
        };
        el = this.parent_el.find(intervalEl[interval]);
        el.addClass("displayed");
        return el;
      };

      DaySelector.prototype.getSelDate = function() {
        return this.selDate = this.selDateOverride != null ? this.selDateOverride : {
          d: moment(this.scope.dateSel, "YYYYMMDD"),
          w: moment(this.scope.dateSel, "YYYYMMDD[w]"),
          m: moment(this.scope.dateSel, "YYYYMM"),
          r: moment()
        }[this.scope.interval];
      };

      DaySelector.prototype.makeCalendar = function(year, month, el) {
        if (el == null) {
          el = this.el;
        }
        this.cal = CalUtils.ce("month", el);
        this.makeMonthHeader(this.cal, year, month);
        this.makeDaysHeader(this.cal);
        return this.makeDays(this.cal, year, month);
      };

      DaySelector.prototype.makeMonthCalendar = function(year) {
        this.cal = CalUtils.ce("month", this.el);
        this.makeYearHeader(this.cal, year);
        return this.makeMonths(this.cal, year);
      };

      DaySelector.prototype.makeMonthHeader = function(el, year, month) {
        var header, localizedDate;
        header = CalUtils.ce("monthheader", el);
        this.leftSwitch = CalUtils.ce("switch left cicon-left", header);
        if (month === 12) {
          month = 0;
          year++;
        }
        //localizedDate = $filter('localizeDate')('MMMM YYYY', moment([year, month]));
        //localizedDate = self.filterDate('MMMM YYYY', moment([year, month]));

        var m = moment([year, month]);
        var timestamp = m.valueOf();
        var monthStr = $filter('date')( timestamp, 'MMMM' ); // gets month in Genitive case. Should get month in Nominative case.
        var yearStr = $filter('date')( timestamp, 'yyyy' );        
        CalUtils.ce("monthtitle", header).html(self.l10n.interpolate("ITC.datepicker.monthYear." + month, {'year': yearStr}));

        this.checkIfAfter = function () {
          if (this.endDateRestriction !== null) {
            return +moment(this.selDate).add(1, 'month').format('YYYYMM') > +this.endDateRestriction.format('YYYYMM');
          } else {
            return false;
          }
        }
        this.checkIfBefore = function () {
          if (this.startDateRestriction !== null) {
            return +moment(this.selDate).subtract(1, 'month').format('YYYYMM') < +this.startDateRestriction.format('YYYYMM');
          } else {
            return false;
          }
        }

        this.rightSwitch = CalUtils.ce("switch right cicon-right", header);
        this.leftSwitch.click((function(_this) {
          return function(e) {
            e.stopPropagation();
            return _this.changeMonth("prev");
          };
        })(this));
        this.rightSwitch.click((function(_this) {
          return function(e) {
            e.stopPropagation();
            return _this.changeMonth("next");
          };
        })(this));
        return this.monthSwitchDisplay();
      };

      DaySelector.prototype.makeYearHeader = function(el, year) {
        var header, localizedDate;
        header = CalUtils.ce("monthheader", el);
        this.leftSwitch = CalUtils.ce("switch left cicon-left", header);
        //localizedDate = $filter('localizeDate')('YYYY', moment([year]));
        //localizedDate = self.filterDate('YYYY', moment([year]));

        var m = moment([year]);
        var timestamp = m.valueOf();
        var yearStr = $filter('date')( timestamp, 'yyyy' );
        CalUtils.ce("monthtitle", header).html(self.l10n.interpolate("ITC.datepicker.year", {'year': yearStr}));

        this.checkIfAfter = function () {
          if (this.endDateRestriction !== null) {
            return +moment(this.selDate).add(1, 'year').format('YYYYMM') > +this.endDateRestriction.format('YYYYMM');
          } else {
            return false;
          }
        }
        this.checkIfBefore = function () {
          if (this.startDateRestriction !== null) {
            //fix for if seldate is 3/17 - current date is 9/16 (3/17 minus 1 year (3/16)is not an allowed date but 2016 year should be.. so normalizing month so it's not taken into consideration for year being valid or not)
            return (+moment(this.selDate).subtract(1, 'year').format('YYYY')+"12") < +this.startDateRestriction.format('YYYYMM');
          } else {
            return false;
          }
        }

        this.rightSwitch = CalUtils.ce("switch right cicon-right", header);
        this.leftSwitch.click((function(_this) {
          return function(e) {
            e.stopPropagation();
            return _this.changeYear("prev");
          };
        })(this));
        this.rightSwitch.click((function(_this) {
          return function(e) {
            e.stopPropagation();
            return _this.changeYear("next");
          };
        })(this));
        return this.yearSwitchDisplay();
      };

      DaySelector.prototype.makeDaysHeader = function(el) {
        var header, weekdays;
        header = CalUtils.ce("daysheader", el);
        weekdays = moment.weekdaysMin().slice(1);
        weekdays.push(moment.weekdaysMin()[0]);
        return _.each(weekdays, function(day, i) {
          var x;
          x = CalUtils.ce("dow cell", header).html(self.l10n.interpolate("ITC.datepicker.shortDay." + day));
          if (i >= 5) {
            return x.addClass("weekend");
          }
        });
      };

      DaySelector.prototype.makeDays = function(el, year, month) {
        var body, iterDateData, matrix, postFill, weeks;
        matrix = this.monthMatrix(year, month);
        body = CalUtils.ce("body", el);
        weeks = [];
        _(matrix.weeks + 1).times(function(i) {
          var weekitem;
          weekitem = CalUtils.ce("week", body);
          return weeks.push(weekitem);
        });
        iterDateData = null;
        _.each(matrix.matrix, (function(_this) {
          return function(dateData) {
            var day, daycell, dow;
            day = dateData.date.getDate();
            if (day === 1 && dateData.day !== 0) {
              dow = dateData.day;
              _(dow).times(function(i) {
                var fillday, predate, preday, prefill, subdays;
                subdays = dow - i;
                predate = moment(dateData.date).subtract(subdays, "days");
                fillday = predate.format("D");
                preday = CalUtils.weekStartDay(predate);
                prefill = CalUtils.ce("prefill cell", weeks[0]).html(fillday);
                if (preday >= 5) {
                  prefill.addClass("weekend");
                }
                _this.dateHighlight({
                  date: predate,
                  week: dateData.week
                }, prefill, weeks);
                if (_this.daily || _this.range) {
                  if (!_this.dayTest(predate.format())) {  
                    prefill.addClass('disableditem');
                  } else {
                    prefill.click(function() {
                      return _this.dateClick(predate.format());
                    });
                  }
                }
                if (_this.weekly) {
                  if (!_this.weekTest(dateData.date)) {
                    return prefill.addClass('disableditem');
                  } else {
                    return prefill.click(function() {
                      return _this.weekClick({
                        date: predate,
                        day: preday
                      });
                    });
                  }
                }
              });
            }
            daycell = CalUtils.ce("date cell", weeks[dateData.week]).html(day);
            daycell.date = dateData;
            if (dateData.day >= 5) {
              daycell.addClass("weekend");
            }
            _this.dateHighlight(dateData, daycell, weeks);
            if (_this.daily || _this.range) {
              if (!_this.dayTest(dateData.date)) {
                daycell.addClass('disableditem');
              } else {
                daycell.click(function() {
                  return _this.dateClick(dateData.date);
                });
              }
            }
            if (_this.weekly) {
              if (!_this.weekTest(dateData.date)) {
                daycell.addClass('disableditem');
              } else {
                daycell.click(function() {
                  return _this.weekClick(dateData);
                });
              }
            }
            return iterDateData = dateData;
          };
        })(this));
        if (iterDateData.day !== 6) {
          postFill = 6 - iterDateData.day;
          _(postFill).times((function(_this) {
            return function(i) {
              var date, day, postday, prefill;
              day = ++i;
              date = moment(iterDateData.date).add(day, "days");
              prefill = CalUtils.ce("prefill cell", weeks[iterDateData.week]).html(day);
              postday = CalUtils.weekStartDay(date);
              if (postday >= 5) {
                prefill.addClass("weekend");
              }
              if (_this.daily || _this.range) {
                if (!_this.dayTest(date.format())) {
                  prefill.addClass('disableditem');
                } else {
                  prefill.click(function() {
                    return _this.dateClick(date.format());
                  });
                }
              }
              if (_this.weekly) {
                if (!_this.weekTest(date)) {
                  prefill.addClass('disableditem');
                } else {
                  prefill.click(function() {
                    return _this.weekClick({
                      date: date,
                      day: postday
                    });
                  });
                }
              }
              return _this.dateHighlight({
                date: date,
                week: iterDateData.week
              }, prefill, weeks);
            };
          })(this));
        }
        if (this.weekly) {
          return body.find(".week").each(function(i, item) {
            var weekitem;
            weekitem = $(item);
            if (weekitem.find(".disableditem").length !== 7) {
              return weekitem.addClass("weeksel");
            }
          });
        }
      };

      DaySelector.prototype.makeMonths = function(el, year) {
        var monthData, monthscomtainer;
        monthData = _.map(_.range(12), (function(_this) {
          return function(i) {
            return _this.monthMatrix(year, i);
          };
        })(this));
        monthscomtainer = CalUtils.ce("monthscomtainer", el);
        return _.each(monthData, (function(_this) {
          return function(data, i) {
            return _this.makeTinyMonth(monthscomtainer, data, i, year);
          };
        })(this));
      };

      DaySelector.prototype.makeTinyMonth = function(el, matrix, month, year) {
        var body, container, iterDateData, postFill, weeks;
        container = CalUtils.ce("tinymonth", el);
        if (this.disableTinyMonth(year, month)) {
          container.addClass("disabled");
        } else if (this.scope.dateSel === moment([year, month]).format("YYYYMM")) {
          container.addClass("active");
        } else {
          container.click((function(_this) {
            return function() {
              return _this.monthClick(moment([year, month]).format("YYYYMM"));
            };
          })(this));
        }

        var m = moment([year, month]);
        var timestamp = m.valueOf();
        var monthStr = $filter('date')( timestamp, 'MMMM' ); // gets month in Genitive case. Should get month in Nominative case.
        CalUtils.ce("mtitle", container).html(self.l10n.interpolate("ITC.datepicker.month." + month)); 

        body = CalUtils.ce("body", container);
        weeks = [];
        _(matrix.weeks + 1).times((function(_this) {
          return function(i) {
            var weekitem;
            weekitem = CalUtils.ce("week", body);
            if (_this.interval === "w") {
              weekitem.addClass("weeksel");
            }
            return weeks.push(weekitem);
          };
        })(this));
        if ((matrix.weeks + 1 === 5) || matrix.matrix[0].day === 0) {
          body.addClass("fiveweeks");
        }
        if (matrix.weeks + 1 === 6 && matrix.matrix[0].day !== 0) {
          body.addClass("sixweeks");
        }
        iterDateData = null;
        _.each(matrix.matrix, function(dateData) {
          var day, daycell, dow, endLastMonthWeek;
          day = dateData.date.getDate();
          if (day === 1 && dateData.day !== 0) {
            endLastMonthWeek = moment(CalUtils.cd(year, month, false)).add(1, "days").format("YYYYWW");
            dow = dateData.day;
            _(dow).times(function(i) {
              var fillday, predate, prefill, subdays;
              subdays = dow - i;
              predate = moment(dateData.date).subtract(subdays, "days");
              fillday = predate.format("D");
              return prefill = CalUtils.ce("prefill cell", weeks[0]).html(fillday);
            });
          }
          daycell = CalUtils.ce("date cell", weeks[dateData.week]).html(day);
          return iterDateData = dateData;
        });
        if (iterDateData.day !== 6) {
          postFill = 6 - iterDateData.day;
          return _(postFill).times(function(i) {
            var date, day, prefill;
            day = ++i;
            date = moment(iterDateData.date).add(day, "days");
            return prefill = CalUtils.ce("prefill cell", weeks[iterDateData.week]).html(day);
          });
        }
      };

      DaySelector.prototype.disableTinyMonth = function(year, month) {
        var numMonth, startRest;
        numMonth = Number(moment([year, month]).format("YYYYMM"));
        startRest = this.startDateRestriction.date() > 1 ? Number(this.startDateRestriction.clone().add(1, "months").format("YYYYMM")) : Number(this.startDateRestriction.format("YYYYMM"));
        //return numMonth > Number(moment().subtract("days", 1).format("YYYYMM")) || numMonth < startRest;
        return false;
      };

      DaySelector.prototype.dateHighlight = function(dateData, daycell, weeks) {
        if (this.scope.isHighlightable !== undefined && this.scope.isHighlightable === false) return;
        if (this.range) {
          if (this.range_sel_type === "from" && this.from_date.isSame(dateData.date)) {
            _.delay(function() {
              return daycell.addClass('active');
            }, 50);
          }
          if (this.range_sel_type === "to" && this.to_date.isSame(dateData.date)) {
            return _.delay(function() {
              return daycell.addClass('active');
            }, 50);
          }
        } else if (this.scope.interval === this.interval) {
          if (this.daily && moment(this.scope.dateSel, "YYYYMMDD").isSame(dateData.date)) {
            _.delay(function() {
              return daycell.addClass('active');
            }, 50);
          }
          if (this.weekly && moment(this.scope.dateSel, "YYYYMMDD[w]").isSame(dateData.date)) {
            return _.delay(function() {
              return weeks[dateData.week].addClass("active");
            }, 50);
          }
        }
      };

      DaySelector.prototype.monthMatrix = function(year, month) {
        var endMonth, matrix, startMonth, weeks;
        startMonth = CalUtils.cd(year, month);
        endMonth = CalUtils.cd(year, month, false);
        matrix = [];
        weeks = 0;
        _(endMonth.getDate()).times(function(i) {
          var date, day;
          date = new Date(year, month, i + 1, 0, 0, 0);
          day = CalUtils.weekStartDay(date);
          if (day === 0) {
            weeks++;
          }
          return matrix.push({
            date: date,
            day: day,
            week: weeks
          });
        });
        return {
          matrix: matrix,
          weeks: weeks
        };
      };

      DaySelector.prototype.changeMonth = function(type) {
        if ((!this.monthTest().next && type === "next") || (!this.monthTest().prev && type === "prev")) {
          return false;
        }
        if (this.range) {
          this.range_date_picker.empty();
          this.selDate.add((type === "next" ? 1 : -1), "months");
          this.makeCalendar(this.selDate.year(), this.selDate.month(), this.range_date_picker);
        } else {
          this.el.empty();
          this.selDate.add((type === "next" ? 1 : -1), "months");
          this.makeCalendar(this.selDate.year(), this.selDate.month());
        }
        this.onChangeMonth();
        return this.drawParentHeight();
      };

      DaySelector.prototype.changeYear = function(type) {
        if ((!this.yearTest().next && type === "next") || (!this.yearTest().prev && type === "prev")) {
          return false;
        }
        this.el.empty();
        this.selDate.add((type === "next" ? 1 : -1), "years");
        this.makeMonthCalendar(this.selDate.year());
        this.onChangeMonth();
        return this.drawParentHeight();
      };

      DaySelector.prototype.monthSwitchDisplay = function() {
        if (!this.monthTest().next) {
          this.rightSwitch.addClass("disableditem");
        } else {
          this.rightSwitch.removeClass("disableditem");
        }
        if (!this.monthTest().prev) {
          return this.leftSwitch.addClass("disableditem");
        } else {
          return this.leftSwitch.removeClass("disableditem");
        }
      };

      DaySelector.prototype.yearSwitchDisplay = function() {
        if (!this.yearTest().next) {
          this.rightSwitch.addClass("disableditem");
        } else {
          this.rightSwitch.removeClass("disableditem");
        }
        if (!this.yearTest().prev) {
          return this.leftSwitch.addClass("disableditem");
        } else {
          return this.leftSwitch.removeClass("disableditem");
        }
      };

      DaySelector.prototype.dateClick = function(date) {
        var dateDiff, yesterdayDate;
        if (this.range) {
          dateDiff = CustomRangeUtils.getDaysDiff(this.from_date, this.to_date);
          if (this.range_sel_type === "from") {
            this.from_date = moment(date);
          }
          if (this.range_sel_type === "to") {
            this.to_date = moment(date);
          }
          if (this.range_sel_type === "from" && Number(CustomRangeUtils.momentToString(this.from_date)) > Number(CustomRangeUtils.momentToString(this.to_date))) {
            this.to_date = this.from_date.clone().add(dateDiff, 'days');
          } else if (this.range_sel_type === "to" && Number(CustomRangeUtils.momentToString(this.from_date)) > Number(CustomRangeUtils.momentToString(this.to_date))) {
            this.from_date = this.to_date.clone().subtract(dateDiff, 'days');
          }
          yesterdayDate = moment().subtract(1, 'days');
          if (Number(CustomRangeUtils.momentToString(this.to_date)) > Number(CustomRangeUtils.momentToString(yesterdayDate))) {
            this.to_date = yesterdayDate;
          }
          if (this.from_date.isBefore(this.startDateRestriction)) {
            this.from_date = this.startDateRestriction;
          }
          return this.removeRangeCalendar();
        } else {
          this.date_sel = date;
          return this.onSelect();
        }
      };

      DaySelector.prototype.weekClick = function(dateData) {
        this.week_sel = moment(dateData.date).subtract(dateData.day, "days").format("YYYYMMDD[w]");
        return this.onSelect();
      };

      DaySelector.prototype.monthClick = function(monthsel) {
        this.month_sel = monthsel;
        return this.onSelect();
      };

      // This controls enabling the month prev next buttons.
      DaySelector.prototype.monthTest = function() {
        return {
          prev: !this.checkIfBefore(), //true, //Number(this.selDate.format("YYYYMM")) > Number(this.startDateRestriction.format("YYYYMM")),
          next: !this.checkIfAfter() //true //Number(moment(this.current_date).subtract("days", 1).format("YYYYMM")) > Number(this.selDate.format("YYYYMM"))
        };
      };

      // This controls enabling the year prev next buttons
      DaySelector.prototype.yearTest = function() {
        return {
          prev: !this.checkIfBefore(), //true, //Number(this.selDate.format("YYYY")) > Number(this.startDateRestriction.format("YYYY")),
          next: !this.checkIfAfter() //true //Number(moment(this.current_date).format("YYYY")) > Number(this.selDate.format("YYYY"))
        };
      };

      // this controls day clickability.
      DaySelector.prototype.dayTest = function(date) {
        if (moment(date).isBefore(this.startDateRestriction)) {
          return false;
        }
        else if (moment(date).isAfter(this.endDateRestriction)) {
          return false;
        }
        else {
          return true;
        }
        //return moment(date).isBefore(moment().subtract("days", 1));
      };

      // controls week selectability. (if interval is "w")
      DaySelector.prototype.weekTest = function(date) {
        var dateMonth, mdate, restMonth, restriction, start_day, valid_day;
        mdate = moment(date);
        valid_day = true;
        restriction = this.startDateRestriction;
        restMonth = Number(this.startDateRestriction.format("YYYYMM"));
        dateMonth = Number(mdate.format("YYYYMM"));
        if (restMonth > dateMonth) {
          valid_day = false;
        } else if (restMonth === dateMonth) {
          start_day = CalUtils.weekStartDay(restriction);
          console.log(start_day);
          if (start_day !== 0) {
            start_day = 7 - start_day;
          }
          valid_day = !mdate.isBefore(restriction.clone().add(start_day, "days"));
        } else if (Number(moment().format("YYYYMM")) === dateMonth) {
          valid_day = !mdate.isAfter(moment().add(6 - CalUtils.weekStartDay(moment()), "days"));
          if (CalUtils.weekStartDay(moment()) === 0) {
            if (moment().isSame(mdate, 'day') || mdate.isAfter(moment())) {
              valid_day = false;
            }
          }
        } else if (Number(moment().format("YYYYMM")) < dateMonth) {
          valid_day = false;
        }
        return valid_day;
        //return true;
      };

      DaySelector.prototype.makeRangeDisplay = function() {
        this.rangeSelection = CalUtils.ce("range-selection presets", this.el);
        _.each(this.relative_items, (function(_this) {
          return function(l, k) {
            var item;
            item = CalUtils.ce("range-item", _this.rangeSelection);
            item.html("<div class='rellabel'>" + l + "</div>");
            if (_this.scope.dateSel === k) {
              CalUtils.ce("selected cicon-checkmark", item);
              item.addClass("selstate");
            }
            return item.click(function() {
              return _this.relativeItemAction(k);
            });
          };
        })(this));
        if (this.isMetrics) {
          return this.drawCustomRange();
        }
      };

      DaySelector.prototype.drawCustomRange = function() {
        var checked, date_area, dates, input_area, item;
        dates = this.scope.dateSel.split(":");
        this.customArea = CalUtils.ce("custom-area", this.el);
        input_area = CalUtils.ce("range-selection custom-range", this.customArea);
        item = CalUtils.ce("range-item", input_area);
        //item.html("<div class='rellabel'>" + ($filter('localize')('Crossfire.datepicker.customrange')) + "</div>");
        item.html("<div class='rellabel'>" + 'Crossfire.datepicker.customrange'+ "</div>");
        checked = CalUtils.ce("selected cicon-checkmark range-checked", item);
        if (dates.length === 1) {
          checked.hide();
        }
        item.click((function(_this) {
          return function() {
            if (!_this.testCustomRangeChange()) {
              return _this.customRangeConfirmAction();
            }
          };
        })(this));
        date_area = CalUtils.ce("date-area", input_area);
        this.from_date_display = CalUtils.ce("date-box from", date_area);
        this.to_date_display = CalUtils.ce("date-box to", date_area);
        this.createRangeDates(dates);
        //this.from_date_display.html($filter('localizeDate')("MM/DD/YYYY", this.from_date));
        //this.to_date_display.html($filter('localizeDate')("MM/DD/YYYY", this.to_date));
        this.from_date_display.html(self.filterDate("MM/DD/YYYY", this.from_date));
        this.to_date_display.html(self.filterDate("MM/DD/YYYY", this.to_date));
        this.range_date_picker = CalUtils.ce("rangepicker-area", this.el);
        this.range_sel_type = null;
        this.from_date_display.click((function(_this) {
          return function() {
            _this.range_date_picker.empty();
            _this.to_date_display.removeClass("active");
            if (_this.range_sel_type === "from") {
              return _this.removeRangeCalendar();
            } else {
              _this.from_date_display.addClass("active");
              _this.range_sel_type = "from";
              _this.selDate = _this.from_date.clone();
              return _this.makeRangeCalendar(_this.from_date);
            }
          };
        })(this));
        return this.to_date_display.click((function(_this) {
          return function() {
            _this.from_date_display.removeClass("active");
            if (_this.range_sel_type === "to") {
              return _this.removeRangeCalendar();
            } else {
              _this.to_date_display.addClass("active");
              _this.range_sel_type = "to";
              _this.selDate = _this.to_date.clone();
              return _this.makeRangeCalendar(_this.to_date);
            }
          };
        })(this));
      };

      DaySelector.prototype.makeRangeCalendar = function(date) {
        this.range_date_picker.empty();
        this.range_date_picker.addClass("month_displayed");
        this.makeCalendar(date.year(), date.month(), this.range_date_picker);
        return this.drawParentHeight();
      };

      DaySelector.prototype.makeRangeConfirmButton = function() {
        var button;
        this.range_date_picker.empty();
        this.range_date_picker.addClass("month_displayed");
        button = CalUtils.ce("confirm_button", this.range_date_picker);
        button.html('Crossfire.datepicker.apply');
        this.el.find(".range-selection.presets .selected.cicon-checkmark").hide();
        this.el.find(".range-checked").show();
        return button.click((function(_this) {
          return function() {
            return _this.customRangeConfirmAction();
          };
        })(this));
      };

      DaySelector.prototype.customRangeConfirmAction = function() {
        this.rel_sel = [this.from_date.format("YYYYMMDD"), ":", this.to_date.format("YYYYMMDD")].join("");
        return this.onSelect();
      };

      DaySelector.prototype.testCustomRangeChange = function() {
        return !this.from_date_orig.isSame(this.from_date) || !this.to_date_orig.isSame(this.to_date);
      };

      DaySelector.prototype.removeRangeCalendar = function() {
        this.range_date_picker.empty();
        this.range_sel_type = null;
        this.from_date_display.removeClass("active");
        this.to_date_display.removeClass("active");
        this.range_date_picker.removeClass("month_displayed");
        //this.from_date_display.html($filter('localizeDate')("MM/DD/YYYY", this.from_date));
        //this.to_date_display.html($filter('localizeDate')("MM/DD/YYYY", this.to_date));
        this.from_date_display.html(self.filterDate("MM/DD/YYYY", this.from_date));
        this.to_date_display.html(self.filterDate("MM/DD/YYYY", this.to_date));
        if (this.testCustomRangeChange()) {
          this.makeRangeConfirmButton();
        } else {
          this.el.find(".range-selection.presets .selected.cicon-checkmark").show();
          this.el.find(".range-checked").hide();
        }
        return this.drawParentHeight();
      };

      DaySelector.prototype.createRangeDates = function(dates) {
        var startEndDates;
        if (dates.length > 1) {
          this.from_date = moment(dates[0], "YYYYMMDD");
          this.to_date = moment(dates[1], "YYYYMMDD");
        } else {
          startEndDates = this.simpleDateService.getStartEndDates(this.scope.dateSel, this.scope.interval);
          this.from_date = moment(startEndDates.startTime);
          this.to_date = moment(startEndDates.endTime);
        }
        this.from_date_orig = this.from_date.clone();
        return this.to_date_orig = this.to_date.clone();
      };

      DaySelector.prototype.relativeItemAction = function(rel_type) {
        this.rel_sel = rel_type;
        return this.onSelect();
      };

      return DaySelector;

    })();
    return self;
  }

    ]);
});
