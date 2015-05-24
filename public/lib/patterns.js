/**
 */
function Subject(events) {
    var handlers = {};

    events.forEach(function(event) {
        handlers[event] = [];
    });

    this.handlers = handlers;
}

Subject.prototype.addHandler = function(event, handler) {
    if (!(event in this.handlers)) {
        throw ("Invalid event! " + event);
    }

    this.handlers[event].push(handler);
};

Subject.prototype.emit = function(event, args) {
    var self = this;

    this.handlers[event].forEach(function(handler) {
        handler.apply(self, args);
    });
};

/**
 */
function Factory() {
    this.constructors = {};
}

Factory.prototype.register = function (key, constructor) {
    this.constructors[key] = constructor;
};

Factory.prototype.keys = function () {
    var ret = [];
    for (var key in this.constructors) {
        ret.push(key);
    }
    return ret;
};

Factory.prototype.get = function (key) {
    return this.constructors[key];
};

Factory.prototype.create = function (key, args) {
    var constructor = this.get(key);
    
    if (constructor === undefined) {
        throw "Unknown key: " + key;
    }

    var object = Object.create(constructor.prototype);
    constructor.apply(object, args);
    
    return object;
};

/**
 */
try {
    module.exports.Subject = Subject;
    module.exports.Factory = Factory;
} catch(e) {
    console.log("Running outside node: " + e);
}