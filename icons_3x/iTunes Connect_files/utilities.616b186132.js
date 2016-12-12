// Global helper functions that aren't contained in Angular
(function() {

    function logger() {
        try { 
            return console.log.bind(console);
        } catch (e) { 
            return console.log;
        }
    }
    function errorconsole() {
        try { 
            return console.error.bind(console);
        } catch (e) { 
            return console.error;
        }
    }
    // Shorthand for logging data to console (on non-production hosts only)    
    window.log = (!/itunesconnect.apple.com/i.test(location.host)) ? 
        logger() :
        function(x) { return false; }
       
    window.err = (!/itunesconnect.apple.com/i.test(location.host)) ? 
        errorconsole() :
        function(x) { return false; }
        
    // Green log messages
    window.glog = function(msg) { log('%c' + msg, 'color: green'); }

    String.prototype.commafy = function () {
        return this.replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
            return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,");
        });
    };
    
    Number.prototype.commafy = function () {
        return String(this).commafy();
    };
    
    Function.prototype.method = function( name, fn ) {
        if (!this.prototype[name]) {
            this.prototype[name] = fn;
            return(this);
        }
    };
    
    Function.method( 'curry', function( ) {
        var slice = Array.prototype.slice,
             args = slice.apply(arguments), 
             that = this;
        return function() {
            return that.apply( null, args.concat( slice.apply(arguments) ));
        }
    });
    
    //  Utility for safely retrieving deeply-nested items.
    //  Avoids those pesky "Cannot read property X of undefined" errors...
    //  Returns the nested item (if found), otherwise returns undefined
    //
    //  Usage:
    //      deep( objectName, 'prop1', 'prop2', 'prop3' )
    //  OR
    //      deep( objectName, 'prop1.prop2.prop3' )
    //
    window.deep = function(obj) {
        
        if (!obj) {
            return undefined;
        }
        
        // Fetch our list of arguments
        var args = Array.prototype.slice.call(arguments),
            obj = args.shift();
        
        // If no arguments supplied, return the parent object
        if (args.length < 1) {
            return obj;
        }
        
        // If arguments are supplied as a single, period-delimited string -- split them into an array
        if (args.length === 1) {
            args = args[0].split('.');
        }
            
        var len = args.length, i = 0;
        
        // Work our way down the object tree -- exiting safely if any node is undefined
        for (; i < len; i++) {
            
            // Exit if the next child doesn't exist
            if (!obj || !obj.hasOwnProperty(args[i])) return undefined;
            
            // Set `obj` to be the current child
            obj = obj[args[i]];
            
            // If we're on the last value, return it
            if (i === len - 1) return obj;
        }
    };
    
    
    // Extensions to the Underscore core library
    if (_ !== undefined) {
        _.mixin({
            // Generate unique string ID (for DOM elements, directives and such - DU/correlationkey replacement)
            guid : function() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                    return v.toString(16);
                });
            },
            // Check for existence of multiple items within a collection
            // e.g. _(x).containsAll([1,2]) ... instead of ...  _(x).contains(1) && _(x).contains(2)
            containsAll: function(obj, items, fromIndex, guard) {
                if (typeof items === 'string' || typeof items === 'number') items = [items];
                if (!(obj instanceof Array)) obj = _.values(obj);
                if (typeof fromIndex != 'number' || guard) fromIndex = 0;
                return _.every( items, function( item ) {
                    return _.indexOf( obj, item, fromIndex ) >= 0;
                });
            }
        });
    }
    
    // Turns an object into a query string, for making requests
    // e.g. getify({ adamId: 12345, type: 'internal'}) --> '?adamId=12345&type=internal'
    window.getify = function(args) {
    
        if (!args || args.length < 1) return '';
        
        var query = [];
        
        for (var key in args) {
            query.push( key + '=' + args[key]);
        }
        
        return ( query.length > 0 ) ? '?' + query.join('&') : '';
      
    };

    // Converts the given string to it's unicode equivalent. 
    // For example: 晓高.png gets converted to &#26195;&#39640;.png
    // Does nothing to ascii English ascii chars.
    window.convertToUnicodeStr = function(str) {
        var ustr = '';
        for (var i=0; i<str.length; i++) {
            if (str.charCodeAt(i) > 127) {
                ustr += '&#' + str.charCodeAt(i) + ';';
            }
            else {
                ustr += str.charAt(i);
            }
        }
        return ustr;
    };
    
    
    // Douglas Crockford's interpolate function
    // Usage: 
    //  "Build {num}".supplant({ num: 103 }) --> "Build 103"
    String.prototype.supplant = function (o) {
        return this.replace(/{([^{}]*)}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };
    
    
    // Debounced resize wrapper (for preventing too many resize events)
    ( function($,sr) {

        var debounce = function (func, threshold, execAsap) {
            var timeout;

            return function debounced () {
                
                var obj = this, args = arguments;
                
                function delayed () {
                    if (!execAsap)
                    func.apply(obj, args);
                    timeout = null;
                };

                if (timeout)
                    clearTimeout(timeout);
                else if (execAsap)
                    func.apply(obj, args);

                timeout = setTimeout(delayed, threshold || 200);
            };
        }
        
        jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

    })( jQuery,'smartresize' );
    
    window.debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    //moves element in array from one position to another
    //[1, 2, 3].move(0, 1) becomes [2, 1, 3].
    Array.prototype.move = function (old_index, new_index) {
        while (old_index < 0) {
            old_index += this.length;
        }
        while (new_index < 0) {
            new_index += this.length;
        }
        if (new_index >= this.length) {
            var k = new_index - this.length;
            while ((k--) + 1) {
                this.push(undefined);
            }
        }
        this.splice(new_index, 0, this.splice(old_index, 1)[0]);
        return this;
    };

    //detect if localstorage functional
    window.hasStorage = (function() {
      try {
        localStorage.setItem(mod, mod);
        localStorage.removeItem(mod);
        return true;
      } catch (exception) {
        return false;
      }
    }());
    
})();
