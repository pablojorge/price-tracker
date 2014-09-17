var patterns = require('../../public/lib/patterns.js');

function Registry() {
    this.handlers = new patterns.Factory();
    this.requesters = new patterns.Factory();
    this.streamers = new patterns.Factory();
}

Registry.instance = null;

Registry.getInstance = function () {
    if (!Registry.instance) {
        Registry.instance = new Registry();
    }

    return Registry.instance;
};

Registry.deleteInstance = function () {
    if (Registry.instance) {
        Registry.instance = null;
    }
};

module.exports = Registry;