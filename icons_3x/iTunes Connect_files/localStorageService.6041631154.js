define(['sbl!app'], function(itcApp) {
  
    itcApp.service('localStorageService', [ function() {
      
        var self;
        self = this;
        self.providerId = "";
        
        this.Instance = (function() {
            
            Instance.prototype.useLocalstorage = true;

            function Instance(scope, nameSpace) {
                var e;
                this.scope = scope;
                this.nameSpace = nameSpace;
                try {
                    localStorage.setItem("test_localstorage", 1);
                } catch (_error) {
                    e = _error;
                    this.useLocalstorage = false;
                }
                if (this.useLocalstorage !== false) {
                    localStorage.removeItem("test_localstorage");
                }
            }

            Instance.prototype.set = function(key, val) {
                if (this.useLocalstorage) {
                    return localStorage[ self.providerId + "_" + this.nameSpace + "_" + key ] = val;
                } else {
                    return val;
                }
            };

            Instance.prototype.get = function(key, default_val) {
                var val;
                if (this.useLocalstorage) {
                    val = localStorage[self.providerId + "_" + this.nameSpace + "_" + key];
                    if (val == null) {
                        val = default_val;
                    }
                    if ((this.scope != null) && default_val) {
                        this.set(key, val);
                    }
                } else {
                    val = default_val;
                }
                return val;
            };

            Instance.prototype.bind = function(key, default_val, object_key) {
                this.scope[key] = this.get(key, default_val);
                return this.scope.$watch(key, (function(_this) {
                    return function(new_val, old_val) {
                        if (object_key != null) {
                            return _this.set(key, new_val[object_key]);
                        } else {
                            return _this.set(key, new_val);
                        }
                    };
                })(this));
            };

            return Instance;

        })();
    }]);
});
