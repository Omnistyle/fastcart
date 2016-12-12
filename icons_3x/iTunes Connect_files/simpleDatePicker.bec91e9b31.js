/*
Usage example:

  <date-picker class="listview withsearchinput"
      interval="intervalStart"                   
      date-sel="tempPageContent.dateSelStart"    
      showing="showPriceChangeModal" 
      l10n="l10n"
      display-selected-date="tempPageContent.showSelectedDate"           
      user-clicked="tempPageContent.dateStartClicked"
      restrict-start-date="tempPageContent.restrictStartDateStart"
      restrict-end-date="tempPageContent.restrictEndDateStart">
  </date-picker>

Notes:

    button-text - (optional if you want a button at bottom of date picker) a string if you want a button with that text at the bottom of the date picker.

    button-action - (optional if you want a button at bottom of date picker) a function to call when the button at the bottom of the date picker is clicked.

    interval - should be "d" - for "day" - just go with it. Chances are you want a daily calendar.
    
    date-sel - The currently selected date. You might want to initially set this to today (use moment.js's moment()). Its the date that is currently selected. That's how I get the current month to show up. As the user selects different dates, this is what changes.
    
    showing - When this value is *set* to true, the date is cleared and the previously set restrictions are cleared.
    
    user-clicked - will be set to true once the user clicks on this calendar. I used it to know when to enable the "Done" button on a modal (since a date was already selected).
    
    restrict-start-date - I set this value to moment().subtract(1, 'days') - it's the date that is grayed out and all dates before it are grayed out.
    
    restrict-end-date - I initially set this to null, meaning I don't restrict the end date. If you want certain days past a certain date to be grayed out, set it to that day.

    localized-text - an object with fields ".day" = translated/localized text for "Day" - and ".month" = translated/localized text for "Month"

    display-selected-date - use to display a selected date on load (instead of MMDDYYY). Set to (an object that ===) true to do that.
*/
define(['sbl!app'], function (itcApp) {
  //itcApp.directive('datePicker', ['$location', 'simpleDateService', Directive]);

  itcApp.directive('datePicker',['$location', 'simpleDateService', 'ITC', function ($location, simpleDateService, ITC) {
    var link;
    link = function(scope, el, attrs) {
      var dateSelectorBox, dateselectors, daySelectorShow, prevInterval, selDateOverride, startDateRestriction, endDateRestriction;
      //startDateRestriction = simpleDateService.momentFromApi(metadataService.metadata.configuration.dataStartDate);
      startDateRestriction = moment().subtract(1, 'days'); 
      endDateRestriction = null; //moment().add(1, 'years');

      if (!scope.rightPosition) {
        scope.rightPos = "-70px"; // default
      }
      else {
        scope.rightPos = scope.rightPosition;
      }

      if (!scope.arrowRightPosition) {
        scope.arrowRightPos = "55px"; // default
      }
      else {
        scope.arrowRightPos = scope.arrowRightPosition;
      }

      //if (new simpleDateService.DateBox === undefined) {
      //  console.log("simpleDateService is not as expected.");
        //return;
      //}
      //console.log("box: " + simpleDateService.DateBox);
      dateSelectorBox = new simpleDateService.DateBox({
        scope: scope,
        el: el,
        attrs: attrs,
        isMetrics: scope.isMetrics,
        startDateRestriction: startDateRestriction,
        onSel: function() {
          scope.showContent = false;
          scope.interval = this.interval;
          scope.dateSel = this.dateSelFormatted;
          return scope.$apply();
        }
      });
      scope.$watch("dateSel", function(new_val) {
        if (!scope.dontUpdateDate && new_val) {
          
          if (scope.dayClicked || scope.displaySelectedDate) {    
            dateSelectorBox.update(scope.interval, scope.dateSel);    
            if (scope.displaySelectedDate) {
              var lbl = el.find('.label');
              var date = moment(new_val);

              // sometimes get 'invalid date' here if new val is a string like "YYYYMMDD"
              var isAMomentObj = new_val._isAMomentObject;
              var m;
              if (isAMomentObj) {
                  m = new_val;
              }
              else {
                  m = moment(new_val, "YYYYMMDD");
              }

              //lbl.text(m.format('LL'));
              lbl.text(scope.getFormattedDate(m));
              scope.displaySelectedDate = false; // only do this once.
            }    
            scope.dayClicked = false;
          }
          else {
            scope.clearDate();
          }
        }

      });

      scope.getFormattedDate = function(mmnt) {
        var timestamp = mmnt.valueOf();
        var formatted = ITC.time.showAbbreviatedDate( timestamp );
        return formatted;
      }

      scope.$watch("displayTextInsteadOfDate", function(new_val) {
        if (new_val && new_val.length > 0) {
          var lbl = el.find('.label');
          lbl.text(new_val);
          scope.displaySelectedDate = false; // important
        }
      });

      scope.showButton = function() {
        if (scope.buttonText && scope.buttonAction) {
          return true;
        }
      }

      scope.buttonClicked = function() {
        scope.buttonAction();
        scope.showContent = false;
      }

      scope.clearDate = function() {
          var lbl = el.find('.label');
          lbl.text(scope.l10n.interpolate("ITC.datepicker.label.initialText"));
      };

      // clear date on hide
      scope.$watch("showing", function(new_val) {
        if (new_val === false) {  
          scope.clearDate(); // clear date

          // clear date sel
          scope.dateSel = moment();

          // reset restrictions
          startDateRestriction = moment().subtract(1, 'days'); 
          endDateRestriction = null;
        }
      });

      scope.$watch("restrictStartDate", function(new_val) {
        if (new_val) {
          startDateRestriction = scope.restrictStartDate;
        }
      });

      scope.$watch("restrictEndDate", function(new_val) {
        if (new_val) {
          endDateRestriction = scope.restrictEndDate;
        }
      });

      scope.showContent = scope.showContent || false;
      scope.toggle = function() {
        return scope.showContent = !scope.showContent;
      };
      scope.close = function() { 
        if (scope.showContent) {
          return scope.$apply(function() {
            return scope.showContent = false;
          });
        }
      };
      selDateOverride = null;
      dateselectors = null;
      prevInterval = null;
      daySelectorShow = function(interval) {
        scope.daySelector = new simpleDateService.DaySelector({
          parent_el: el,
          scope: scope,
          interval: interval,
          selDateOverride: selDateOverride,
          dateselcontainer: el.find(".dateselcontainer"),
          prevInterval: prevInterval,
          isMetrics: scope.isMetrics,
          search: $location.search(),
          simpleDateService: simpleDateService,
          startDateRestriction: startDateRestriction,
          endDateRestriction: endDateRestriction,
          onSelect: function() {
            scope.dontUpdateDate = false;
            if (interval === "d") {
              scope.dateSel = moment(this.date_sel).format("YYYYMMDD");
              scope.userClicked = true;
              var lbl = el.find('.label');
              //lbl.text(moment(this.date_sel).format('LL'));
              lbl.text(scope.getFormattedDate(moment(this.date_sel)));
              scope.dayClicked = true;
              if (scope.displayTextInsteadOfDate) {
                scope.displayTextInsteadOfDate = false;
              }
            }
            if (interval === "w") {
              scope.dateSel = this.week_sel;
            }
            if (interval === "m") {
              scope.dontUpdateDate = true;
              scope.dateSel = this.month_sel;
            }
            if (interval === "r") {
              scope.dateSel = this.rel_sel;
            }
            if (interval === "m") {
              scope.interval = "d";
              scope.changeInterval("d"); 
            }
            else {
              scope.interval = interval;
              scope.showContent = false;
            }
            return scope.$apply();
          },
          onChangeMonth: function() {
            return selDateOverride = this.selDate;
          },
          onChangeRelative: function() {}
        });
        return prevInterval = interval;
      };
      scope.changeInterval = function(interval, e) {
        if (interval === prevInterval) {
          return false;
        }
        el.find(".segment").removeClass("sel");
        el.find(".segment." + interval).addClass("sel");
        //if (e) {
        //  $(e.currentTarget).parent().addClass("sel");
        //}
        return daySelectorShow(interval);
      };
     
      return scope.$watch("showContent", function(new_val) {
        el.find(".dateselector").empty().removeClass("displayed frompos left right zero");
        selDateOverride = null;
        prevInterval = null;
        dateselectors = null;
        if (new_val === true) {
          scope.$emit('closepopups',true); // close any other open popups
          return daySelectorShow(scope.interval);
        } else {
          el.find(".segment").removeClass("sel");
          return el.find(".segment." + scope.interval).addClass("sel");
        }
      });
    };
    return {
      link: link,
      restrict: 'E',
      replace: true,
      transclude: true,
      templateUrl: getGlobalPath('/itc/views/directives/date-picker.html'),
      scope: {
        buttonText: '@', // optional
        buttonAction: '&', // optional
        displayTextInsteadOfDate: '=', // optional
        interval: '=',
        dateSel: '=',
        isMetrics: '=',
        restrictStartDate: '=',
        restrictEndDate: '=',
        userClicked: '=',
        showing: '=',
        localizedText: '=',
        displaySelectedDate: "=",
        disabled: "=",
        additionalPopupClass: '@',
        rightPosition: "@", // optional
        arrowRightPosition: "@", // optional
        l10n: "=",
        isHighlightable: '=?'
      }
    };
  }]);

});