define([], function() {
    return {
        load: function (name, req, onload, config) {
            if(name in config.paths) { name = config.paths[name] + '.js'; }
            req([_sb_getHashFilename(name)], function (value) { onload(value); });
        }
    };
});
