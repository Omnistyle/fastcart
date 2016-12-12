(function(){var a,b,c=function(a,b){return function(){return a.apply(b,arguments)}},d=[].indexOf||function(a){for(var b=0,c=this.length;b<c;b++){if(b in this&&this[b]===a)return b}return-1};a=function(){a.prototype.url=null;a.prototype.marks={};a.prototype.timed_marks=[];a.prototype.overwrite=true;a.prototype.metadata={};a.prototype.init=function(){this.checkMetadata();this.overwrite=true;this.marks={};return this.timed_marks=[]};a.prototype.setMetadata=function(a){this.metadata=a!=null?a:{};return this.checkMetadata()};a.prototype.checkUrl=function(){if(this.url==null){throw new Error("TimingMarker: URL is required for this library to operate correctly")}};a.prototype.checkMetadata=function(){if(!(typeof this.metadata==="object")){throw new Error("TimingMarker: metadata must be an object")}};function a(a,b){var d;this.url=a;this.metadata=b!=null?b:{};this.start=c(this.start,this);this.init();if(!((d=window.performance)!=null?d.timing:void 0)){try{sessionStorage.setItem("navigationStart",Date.now())}catch(a){}}}a.prototype.timing=function(){var a,b,c;try{c=window.performance.now()}catch(b){a=b;c=Date.now()}return c};a.prototype.start=function(a,b){var c;if(a==null){throw new Error("TimingMarker: ID is required to start a marker")}if(d.call(Object.keys(this.marks),a)>=0&&!this.overwrite){throw new Error("TimingMarker: Marker must be closed before creating a new instance with the same ID")}c={id:a,start:this.timing()};if(b!=null){c.metadata=b}this.marks[a]=c;return this};a.prototype.end=function(a,b,c){var d,e,f,g,h,i;if(a==null){throw new Error("TimingMarker: ID is required to end a marker")}e=this.marks[a];if(e==null){throw new Error("TimingMarker: ID `"+a+"` not found")}h=JSON.parse(JSON.stringify(e));h.end=c||this.timing();h.diff=h.end-h.start;if(b!=null){if(h.metadata==null){h.metadata={}}i=Object.keys(b);for(d=0,g=i.length;d<g;d++){f=i[d];h.metadata[f]=b[f]}}this.timed_marks.push(h);delete this.marks[a];return this};a.prototype.endAll=function(){var a,b,c,d,e;a=this.timing();e=Object.keys(this.marks);for(b=0,d=e.length;b<d;b++){c=e[b];this.end(c,null,a)}return this};a.prototype.finalizeData=function(a,b){return{hash:location.hash,host:location.host,url:location.href,metadata:this.metadata,type:b,data:a}};a.prototype.reset=function(){this.marks={};this.timed_marks=[];return this};a.prototype.clear=function(a){var b,c,d,e,f,g;if(a==null){throw new Error("TimingMarker: ID is required to clear a marker")}if(this.marks[a]!=null){delete this.marks[a]}c=0;f=this.timed_marks;g=[];for(b=0,d=f.length;b<d;b++){e=f[b];if(a===e.id){this.timed_marks.splice(c,1);break}g.push(c++)}return g};a.prototype.send=function(a){if(a==null){a=function(){}}if(this.timed_marks.length===0){a({size:0,items:[]});return false}return this.postJSON(this.finalizeData(this.timed_marks,"timing"),function(b){return function(c,d){a({size:b.timed_marks.length,items:b.timed_marks});return b.timed_marks=[]}}(this))};a.prototype.sendPerformanceTiming=function(a){var b;if(a==null){a=function(){}}b=window.onload;return window.onload=function(c){return function(){if(b){b()}return setTimeout(function(){var b;b=c.performanceTimingData();return c.postJSON(b,function(){return a(b)})},0)}}(this)};a.prototype.performanceTimingData=function(){var a,b,c,d,e,f,g;if(window.performance!=null){if(JSON.stringify(window.performance.timing)==="{}"&&window.PerformanceTiming!=null){g={};Object.keys(window.PerformanceTiming.prototype).forEach(function(a){return g[a]=window.performance.timing[a]})}else{g=window.performance.timing}}else{g={}}g["crossBrowserLoadEvent"]=Date.now();if(a=(d=window.chrome)!=null?typeof d.loadTimes==="function"?(e=d.loadTimes())!=null?e.firstPaintTime:void 0:void 0:void 0){g["chromeFirstPaintTime"]=Math.round(a*1e3)}if(!((f=window.performance)!=null?f.timing:void 0)){c=function(){try{return sessionStorage.getItem("navigationStart")}catch(a){}}();if(c){g["simulatedNavigationStart"]=parseInt(c,10)}}b=this.finalizeData(g,"performance");return b};a.prototype.postJSON=function(a,b){var c;if(b==null){b=function(){}}this.checkUrl();c=new XMLHttpRequest;c.open("POST",this.url);c.setRequestHeader("Content-Type","application/json");c.onreadystatechange=function(){if(c.readyState===4){return b(c.responseText,c.status)}};return c.send(JSON.stringify(a))};return a}();if(typeof angular==="object"&&angular.module){b=angular.module("itc-timings",["ngResource"]);b.service("TimingMarkerInstance",function(){var b;b=new a;return{marker:b}});b.service("TimingMarker",["$resource","$q","TimingMarkerInstance",function(b,c,d){var e;e=d.marker;e.send=function(){this.checkUrl();if(this.timed_marks.length===0){return c.when({size:0,items:[]})}return b(e.url).save(this.finalizeData(this.timed_marks,"timing")).$promise};return{TimingMarker:a,marker:e,setUrl:function(a){e.url=a;return e},sendPerformanceTiming:function(){e.checkUrl();return b(e.url).save(e.performanceTimingData()).$promise}}}]);b.config(["$httpProvider",function(a){return a.interceptors.push("TimingListenerService")}]);b.factory("TimingListenerService",["$rootScope","$q","$timeout",function(a,c,d){var e,f,g;g=0;f=function(a){var b;b=null;if(a.timing){b=a.url.replace(/^\//,"")}return b};e=function(){return d(function(){if(!g){return a.$broadcast("timers:send")}},1e3)};return{request:function(d){b=f(d);if(b){++g;a.$broadcast("timer:start",b)}return d||c.when(d)},response:function(d){b=f(d.config);if(b){--g;a.$broadcast("timer:end",b);e()}return d||c.when(d)},responseError:function(d){b=f(d.config);if(b){--g;a.$broadcast("timer:clear",b);e()}return c.reject(d)}}}])}else if(typeof window.define==="function"&&window.define.amd){window.define(function(){return a})}else{window.TimingMarker=a}}).call(this);
//# sourceMappingURL=itc-timings.js.map