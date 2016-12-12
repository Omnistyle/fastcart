define(['sbl!app'], function (itcApp) {
  itcApp.service('localizeService', ['$q',  function($q) {
    var capitalize, hasDaySpace, hasMonthSpace, localizationResource, self, zhAddMonthDaySpace;
    self = {};
    self.paramDelimiter = '@@';
    self.screamer = '**';
    //self.STATIC = localizeStaticService.STATIC;
   // localizationResource = $resource('/analytics/api/v1/l10n');
    capitalize = function(s) {
      return s && s[0].toUpperCase() + s.slice(1);
    };
    hasDaySpace = function(date) {
      return date.date() < 10;
    };
    hasMonthSpace = function(date) {
      return date.month() < 9;
    };
    zhAddMonthDaySpace = function(format, date) {
      if (date != null) {
        if (hasMonthSpace(date)) {
          format = format.replace('年M', '年 M');
        }
        if (hasDaySpace(date)) {
          format = format.replace('月D', '月 D');
        }
      }
      return format;
    };
    self.getLangParams = function() {
      var params;
      params = {};
      params.formats = {};
      switch (moment.locale()) {
        case "de":
          params.formats = {
            'MM/DD/YYYY': ['DD.MM.YYYY'],
            'MMM': ['MMM'],
            'MMM D': ['D. MMM'],
            'MMM D-D': ['D. – ', 'D. MMM'],
            'MMM D - D': ['D. – ', 'D. MMM'],
            'MMM D-D, YYYY': ['D. – ', 'D. MMM YYYY'],
            'MMM D-MMM D': ['D. MMM – ', 'D. MMM'],
            'MMM D - MMM D': ['D. MMM – ', 'D. MMM'],
            'MMM D-MMM D, YYYY': ['D. MMM – ', 'D. MMM YYYY'],
            'MMM D, YYYY': ['D. MMM YYYY'],
            'MMM D, YYYY-MMM D, YYYY': ['D. MMM YYYY – ', 'D. MMM YYYY'],
            'MMM DD, YYYY': ['D. MMM YYYY'],
            'MMMM': ['MMMM'],
            'MMMM D, YYYY': ['D. MMMM YYYY'],
            'MMMM YYYY': ['MMMM YYYY'],
            'MMMM, YYYY': ['MMMM YYYY'],
            'YYYY': ['YYYY']
          };
          break;
        case "es":
          params.formats = {
            'MM/DD/YYYY': ['DD/MM/YYYY'],
            'MMM': {
              format: ['MMM'],
              post: function(s) {
                return capitalize(s);
              }
            },
            'MMM D': ['D MMM'],
            'MMM D-D': ['D - ', 'D MMM'],
            'MMM D - D': ['D - ', 'D MMM'],
            'MMM D-D, YYYY': ['D - ', 'D MMM YYYY'],
            'MMM D-MMM D': ['D MMM - ', 'D MMM'],
            'MMM D - MMM D': ['D MMM - ', 'D MMM'],
            'MMM D-MMM D, YYYY': ['D MMM - ', 'D MMM YYYY'],
            'MMM D, YYYY': ['D MMM YYYY'],
            'MMM D, YYYY-MMM D, YYYY': ['D MMM YYYY - ', 'D MMM YYYY'],
            'MMM DD, YYYY': ['D MMM YYYY'],
            'MMMM': {
              format: ['MMMM'],
              post: function(s) {
                return capitalize(s);
              }
            },
            'MMMM D, YYYY': ['D [de] MMMM [de] YYYY'],
            'MMMM YYYY': {
              format: ['MMMM YYYY'],
              post: function(s) {
                return capitalize(s);
              }
            },
            'MMMM, YYYY': {
              format: ['MMMM YYYY'],
              post: function(s) {
                return capitalize(s);
              }
            },
            'YYYY': ['YYYY']
          };
          break;
        case "fr":
          params.formats = {
            'MM/DD/YYYY': ['DD/MM/YYYY'],
            'MMM': {
              format: ['MMM'],
              post: function(s) {
                return capitalize(s);
              }
            },
            'MMM D': ['D MMM'],
            'MMM D-D': ['D - ', 'D MMM'],
            'MMM D - D': ['D - ', 'D MMM'],
            'MMM D-D, YYYY': ['D - ', 'D MMM 2014'],
            'MMM D-MMM D': ['D MMM - ', 'D MMM'],
            'MMM D - MMM D': ['D MMM - ', 'D MMM'],
            'MMM D-MMM D, YYYY': ['D MMM - ', 'D MMM YYYY'],
            'MMM D, YYYY': ['D MMM YYYY'],
            'MMM D, YYYY-MMM D, YYYY': ['D MMM YYYY - ', 'D MMM YYYY'],
            'MMM DD, YYYY': ['D MMM YYYY'],
            'MMMM': {
              format: ['MMMM'],
              post: function(s) {
                return capitalize(s);
              }
            },
            'MMMM D, YYYY': ['D MMMM YYYY'],
            'MMMM YYYY': {
              format: ['MMMM YYYY'],
              post: function(s) {
                return capitalize(s);
              }
            },
            'MMMM, YYYY': {
              format: ['MMMM YYYY'],
              post: function(s) {
                return capitalize(s);
              }
            },
            'YYYY': ['YYYY']
          };
          break;
        case "it":
          params.formats = {
            'MM/DD/YYYY': ['DD/MM/YYYY'],
            'MMM': ['MMM'],
            'MMM D': {
              format: ['D MMM'],
              post: function(s) {
                return s.toLowerCase();
              }
            },
            'MMM D-D': {
              format: ['D - ', 'D MMM'],
              post: function(s) {
                return s.toLowerCase();
              }
            },
            'MMM D - D': {
              format: ['D - ', 'D MMM'],
              post: function(s) {
                return s.toLowerCase();
              }
            },
            'MMM D-D, YYYY': {
              format: ['D - ', 'D MMM YYYY'],
              post: function(s) {
                return s.toLowerCase();
              }
            },
            'MMM D-MMM D': {
              format: ['D MMM - ', 'D MMM'],
              post: function(s) {
                return s.toLowerCase();
              }
            },
            'MMM D - MMM D': {
              format: ['D MMM - ', 'D MMM'],
              post: function(s) {
                return s.toLowerCase();
              }
            },
            'MMM D-MMM D, YYYY': {
              format: ['D MMM - ', 'D MMM YYYY'],
              post: function(s) {
                return s.toLowerCase();
              }
            },
            'MMM D, YYYY': {
              format: ['D MMM YYYY'],
              post: function(s) {
                return s.toLowerCase();
              }
            },
            'MMM D, YYYY-MMM D, YYYY': {
              format: ['D MMM YYYY - ', 'D MMM YYYY'],
              post: function(s) {
                return s.toLowerCase();
              }
            },
            'MMM DD, YYYY': {
              format: ['D MMM YYYY'],
              post: function(s) {
                return s.toLowerCase();
              }
            },
            'MMMM': ['MMMM'],
            'MMMM D, YYYY': {
              format: ['D MMMM YYYY'],
              post: function(s) {
                return s.toLowerCase();
              }
            },
            'MMMM YYYY': ['MMMM YYYY'],
            'MMMM, YYYY': ['MMMM YYYY'],
            'YYYY': ['YYYY']
          };
          break;
        case "ja":
          params.formats = {
            'MM/DD/YYYY': ['YYYY/MM/DD'],
            'MMM': ['MMM'],
            'MMM D': ['MMMD日'],
            'MMM D-D': ['MMMD日 - ', 'D日'],
            'MMM D - D': ['MMMD日 - ', 'D日'],
            'MMM D-D, YYYY': ['YYYY年MMMD日 - ', 'D日'],
            'MMM D-MMM D': ['MMMD日 - ', 'MMMD日'],
            'MMM D - MMM D': ['MMMD日 - ', 'MMMD日'],
            'MMM D-MMM D, YYYY': ['YYYY年MMMD日 - ', 'MMMD日'],
            'MMM D, YYYY': ['YYYY年MMMD日'],
            'MMM D, YYYY-MMM D, YYYY': ['YYYY年MMMD日 - ', 'YYYY年MMMD日'],
            'MMM DD, YYYY': ['YYYY年MMMD日'],
            'MMMM': ['MMMM'],
            'MMMM D, YYYY': ['YYYY年MMMMD日'],
            'MMMM YYYY': ['YYYY年MMMM'],
            'MMMM, YYYY': ['YYYY年MMMM'],
            'YYYY': ['YYYY年']
          };
          break;
        case "ko":
          params.formats = {
            'MM/DD/YYYY': ['YYYY. MM. D.'],
            'MMM': ['MMM'],
            'MMM D': ['MMM D일'],
            'MMM D-D': ['MMM D일~', 'D일'],
            'MMM D - D': ['MMM D일 ~ ', 'D일'],
            'MMM D-D, YYYY': ['YYYY년 MMM D일~', 'D일'],
            'MMM D-MMM D': ['MMM D일 ~ ', 'MMM D일'],
            'MMM D - MMM D': ['MMM D일 ~ ', 'MMM D일'],
            'MMM D-MMM D, YYYY': ['YYYY년 MMM D일 ~ ', 'MMM D일'],
            'MMM D, YYYY': ['YYYY년 MMM D일'],
            'MMM D, YYYY-MMM D, YYYY': ['YYYY년 MMM D일 ~ ', 'YYYY년 MMM D일'],
            'MMM DD, YYYY': ['YYYY년 MMM D일'],
            'MMMM': ['MMMM'],
            'MMMM D, YYYY': ['YYYY년 MMMM D일'],
            'MMMM YYYY': ['YYYY년 MMMM'],
            'MMMM, YYYY': ['YYYY년 MMMM'],
            'YYYY': ['YYYY년']
          };
          break;
        case "pt":
          params.formats = {
            'MM/DD/YYYY': ['DD/MM/YYYY'],
            'MMM': ['MMM'],
            'MMM D': ['D [de] MMM'],
            'MMM D-D': ['D - ', 'D [de] MMM'],
            'MMM D - D': ['D - ', 'D [de] MMM'],
            'MMM D-D, YYYY': ['D - ', 'D [de] MMM [de] 2014'],
            'MMM D-MMM D': ['D [de] MMM - ', 'D [de] MMM'],
            'MMM D - MMM D': ['D [de] MMM - ', 'D [de] MMM'],
            'MMM D-MMM D, YYYY': ['D [de] MMM - ', 'D [de] MMM [de] YYYY'],
            'MMM D, YYYY': ['D [de] MMM. [de] YYYY'],
            'MMM D, YYYY-MMM D, YYYY': ['D [de] MMM [de] YYYY - ', 'D [de] MMM [de] YYYY'],
            'MMM DD, YYYY': ['D [de] MMM. [de] YYYY'],
            'MMMM': ['MMMM'],
            'MMMM D, YYYY': ['D [de] MMMM [de] YYYY'],
            'MMMM YYYY': ['MMMM [de] YYYY'],
            'MMMM, YYYY': ['MMMM [de] YYYY'],
            'YYYY': ['YYYY']
          };
          break;
        case "pt-br":
          params.formats = {
            'MM/DD/YYYY': ['DD/MM/YYYY'],
            'MMM': ['MMM'],
            'MMM D': ['D [de] MMM'],
            'MMM D-D': ['D - ', 'D [de] MMM'],
            'MMM D - D': ['D - ', 'D [de] MMM'],
            'MMM D-D, YYYY': ['D - ', 'D [de] MMM [de] 2014'],
            'MMM D-MMM D': ['D [de] MMM - ', 'D [de] MMM'],
            'MMM D - MMM D': ['D [de] MMM - ', 'D [de] MMM'],
            'MMM D-MMM D, YYYY': ['D [de] MMM - ', 'D [de] MMM [de] YYYY'],
            'MMM D, YYYY': ['D [de] MMM [de] YYYY'],
            'MMM D, YYYY-MMM D, YYYY': ['D [de] MMM [de] YYYY - ', 'D [de] MMM [de] YYYY'],
            'MMM DD, YYYY': ['D [de] MMM [de] YYYY'],
            'MMMM': ['MMMM'],
            'MMMM D, YYYY': ['D [de] MMMM [de] YYYY'],
            'MMMM YYYY': ['MMMM [de] YYYY'],
            'MMMM, YYYY': ['MMMM [de] YYYY'],
            'YYYY': ['YYYY']
          };
          break;
        case "ru":
          params.formats = {
            'MM/DD/YYYY': ['DD.MM.YYYY'],
            'MMM': {
              format: ['MMM.'],
              post: function(s) {
                return capitalize(s);
              }
            },
            'MMM D': ['D MMM.'],
            'MMM D-D': ['D–', 'D MMM.'],
            'MMM D - D': ['D–', 'D MMM.'],
            'MMM D-D, YYYY': ['D–', 'D MMM. YYYY г.'],
            'MMM D-MMM D': ['D MMM. – ', 'D MMM.'],
            'MMM D - MMM D': ['D MMM. – ', 'D MMM.'],
            'MMM D-MMM D, YYYY': ['D MMM. – ', 'D MMM. YYYY г.'],
            'MMM D, YYYY': ['D MMM. YYYY г.'],
            'MMM D, YYYY-MMM D, YYYY': ['D MMM. YYYY г. – ', 'D MMM. YYYY г.'],
            'MMM DD, YYYY': ['D MMM. YYYY г.'],
            'MMMM': ['MMMM'],
            'MMMM D, YYYY': ['D MMMM YYYY г.'],
            'MMMM YYYY': {
              format: ['MMMM YYYY'],
              post: function(s) {
                return capitalize(s);
              }
            },
            'MMMM, YYYY': {
              format: ['MMMM YYYY'],
              post: function(s) {
                return capitalize(s);
              }
            },
            'YYYY': ['YYYY']
          };
          break;
        case "th":
          params.formats = {
            'MM/DD/YYYY': ['DD/MM/YYYY'],
            'MMM': ['MMM'],
            'MMM D': ['D MMM'],
            'MMM D-D': ['D-', 'D MMM'],
            'MMM D - D': ['D-', 'D MMM'],
            'MMM D-D, YYYY': ['D-', 'D MMM YYYY'],
            'MMM D-MMM D': ['D MMM - ', 'D MMM'],
            'MMM D - MMM D': ['D MMM - ', 'D MMM'],
            'MMM D-MMM D, YYYY': ['D MMM - ', 'D MMM YYYY'],
            'MMM D, YYYY': ['D MMM YYYY'],
            'MMM D, YYYY-MMM D, YYYY': ['D MMM YYYY - ', 'D MMM YYYY'],
            'MMM DD, YYYY': ['D MMM YYYY'],
            'MMMM': ['MMMM'],
            'MMMM D, YYYY': ['D MMMM YYYY'],
            'MMMM YYYY': ['MMMM YYYY'],
            'MMMM, YYYY': ['MMMM YYYY'],
            'YYYY': ['YYYY']
          };
          params.setTranslations = function() {
            return moment.locale('th', {
              months: "มกราคม_กุมภาพันธ์_มีนาคม_เมษายน_พฤษภาคม_มิถุนายน_กรกฎาคม_สิงหาคม_กันยายน_ตุลาคม_พฤศจิกายน_ธันวาคม".split("_"),
              monthsShort: "ม.ค._ก.พ._มี.ค._เม.ย._พ.ค._มิ.ย._ก.ค._ส.ค._ก.ย._ต.ค._พ.ย._ธ.ค.".split("_"),
              weekdays: "อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัสบดี_ศุกร์_เสาร์".split("_"),
              weekdaysShort: "อา._จ._อ._พ._พฤ._ศ._ส.".split("_"),
              weekdaysMin: "อา._จ._อ._พ._พฤ._ศ._ส.".split("_")
            });
          };
          break;
        case "zh-cn":
          params.formats = {
            'MM/DD/YYYY': ['YYYY-MM-DD'],
            'MMM': ['M月'],
            'MMM D': {
              format: ['M月D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st)];
              }
            },
            'MMM D-D': {
              format: ['M月D－', 'D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st), zhAddMonthDaySpace(format[1], end)];
              }
            },
            'MMM D - D': {
              format: ['M月D － ', 'D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st), zhAddMonthDaySpace(format[1], end)];
              }
            },
            'MMM D-D, YYYY': {
              format: ['YYYY年M月D－', 'D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st), zhAddMonthDaySpace(format[1], end)];
              }
            },
            'MMM D-MMM D': {
              format: ['M月D日－', 'M月D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st), zhAddMonthDaySpace(format[1], end)];
              }
            },
            'MMM D - MMM D': {
              format: ['M月D日 － ', 'M月D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st), zhAddMonthDaySpace(format[1], end)];
              }
            },
            'MMM D-MMM D, YYYY': {
              format: ['YYYY年M月D日－', 'M月D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st), zhAddMonthDaySpace(format[1], end)];
              }
            },
            'MMM D, YYYY': {
              format: ['YYYY年M月D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st)];
              }
            },
            'MMM D, YYYY-MMM D, YYYY': {
              format: ['YYYY年M月D日－', 'YYYY年M月D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st), zhAddMonthDaySpace(format[1], end)];
              }
            },
            'MMM DD, YYYY': {
              format: ['YYYY年M月D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st)];
              }
            },
            'MMMM': ['M月'],
            'MMMM D, YYYY': {
              format: ['YYYY年M月D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st)];
              }
            },
            'MMMM YYYY': {
              format: ['YYYY年M月'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st)];
              }
            },
            'MMMM, YYYY': {
              format: ['YYYY年M月'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st)];
              }
            },
            'YYYY': ['YYYY年']
          };
          break;
        case "zh-tw":
          params.formats = {
            'MM/DD/YYYY': ['YYYY-MM-DD'],
            'MMM': ['M月'],
            'MMM D': {
              format: ['M月D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st)];
              }
            },
            'MMM D-D': {
              format: ['M月D－', 'D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st), zhAddMonthDaySpace(format[1], end)];
              }
            },
            'MMM D - D': {
              format: ['M月D － ', 'D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st), zhAddMonthDaySpace(format[1], end)];
              }
            },
            'MMM D-D, YYYY': {
              format: ['YYYY年M月D－', 'D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st), zhAddMonthDaySpace(format[1], end)];
              }
            },
            'MMM D-MMM D': {
              format: ['M月D日－', 'M月D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st), zhAddMonthDaySpace(format[1], end)];
              }
            },
            'MMM D - MMM D': {
              format: ['M月D日 － ', 'M月D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st), zhAddMonthDaySpace(format[1], end)];
              }
            },
            'MMM D-MMM D, YYYY': {
              format: ['YYYY年M月D日－', 'M月D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st), zhAddMonthDaySpace(format[1], end)];
              }
            },
            'MMM D, YYYY': {
              format: ['YYYY年M月D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st)];
              }
            },
            'MMM D, YYYY-MMM D, YYYY': {
              format: ['YYYY年M月D日－', 'YYYY年M月D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st), zhAddMonthDaySpace(format[1], end)];
              }
            },
            'MMM DD, YYYY': {
              format: ['YYYY年M月D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st)];
              }
            },
            'MMMM': ['M月'],
            'MMMM D, YYYY': {
              format: ['YYYY年M月D日'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st)];
              }
            },
            'MMMM YYYY': {
              format: ['YYYY年M月'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st)];
              }
            },
            'MMMM, YYYY': {
              format: ['YYYY年M月'],
              pre: function(format, st, end) {
                return [zhAddMonthDaySpace(format[0], st)];
              }
            },
            'YYYY': ['YYYY年']
          };
          break;
        default:
          params.formats = {
            'MM/DD/YYYY': ['MM/DD/YYYY'],
            'MMM': ['MMM'],
            'MMM D': ['MMM D'],
            'MMM D-D': ['MMM D-', 'D'],
            'MMM D - D': ['MMM D - ', 'D'],
            'MMM D-D, YYYY': ['MMM D-', 'D, YYYY'],
            'MMM D-MMM D': ['MMM D-', 'MMM D'],
            'MMM D - MMM D': ['MMM D - ', 'MMM D'],
            'MMM D-MMM D, YYYY': ['MMM D-', 'MMM D, YYYY'],
            'MMM D, YYYY': ['MMM D, YYYY'],
            'MMM D, YYYY-MMM D, YYYY': ['MMM D, YYYY-', 'MMM D, YYYY'],
            'MMM DD, YYYY': ['MMM DD, YYYY'],
            'MMMM': ['MMMM'],
            'MMMM D, YYYY': ['MMMM D, YYYY'],
            'MMMM YYYY': ['MMMM YYYY'],
            'MMMM, YYYY': ['MMMM, YYYY'],
            'YYYY': ['YYYY']
          };
      }
      return params;
    };
    self.format = function(format, startTime, endTime) {
      var formats, localizeFormat, localizedOutput, post, pre, ref;
      if (endTime == null) {
        endTime = null;
      }
      pre = null;
      post = null;
      formats = self.getLangParams().formats;
      localizeFormat = [format];
      if (format in formats) {
        localizeFormat = formats[format];
        if (typeof localizeFormat === 'object' && !(localizeFormat instanceof Array)) {
          pre = localizeFormat.pre != null ? localizeFormat.pre : null;
          post = localizeFormat.post != null ? localizeFormat.post : null;
          localizeFormat = localizeFormat.format;
        }
      }
      if (pre != null) {
        localizeFormat = pre(localizeFormat, startTime, endTime);
      }
      if (localizeFormat.length === 2) {
        if (endTime != null) {
          localizedOutput = startTime.format(localizeFormat[0]) + endTime.format(localizeFormat[1]);
        } else {
          localizedOutput = '';
        }
      } else {
        localizedOutput = startTime.format(localizeFormat.join(""));
      }
      if (post != null) {
        localizedOutput = post(localizedOutput);
      }
      return localizedOutput;
    };
    self.toScreamer = function(key) {
      return self.screamer + key + self.screamer;
    };
    self.isValueAndDateOrder = function() {
      var pattern, valueAndDate;
      valueAndDate = 'valueanddate';
      pattern = /.*@@date@@.*@@value@@.*/g;
      return !pattern.test(valueAndDate);
    };
    self.get = function() {
      var deferred;
      deferred = $q.defer();
      /*if (!self.t) {
        localizationResource.get().$promise.then(function(response) {
          var params;
          self.t = response.data;
          moment.lang(response.language);
          params = self.getLangParams();
          if (params.setTranslations != null) {
            params.setTranslations();
          }
          return deferred.resolve(self.t);
        });
      } else { */
        deferred.resolve(self.t);
      //}
      return deferred.promise;
    };
    return self;

}

    ]);
});
