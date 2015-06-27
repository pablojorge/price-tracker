
function isplainobject(o) {
    return (o instanceof Object &&
            Object.getPrototypeOf(o) == Object.prototype);
}

// Returns a new object by (recursively) copying all properties
// of the original object
function deepcopy(a) {
    if (!isplainobject(a))
        return a;

    var ret = {};

    for (var k in a) {
        ret[k] = deepcopy(a[k]);
    }

    return ret;
}

// Merges two objects recursively
// Example:
//   merge({a:1, b:2, c:3, d:{a:1, b:2, c:3}},
//         {     b:3,      d:{a:4,           g:8}})
//      => {a:1, b:3, c:3, d:{a:4, b:2, c:3, g:8}}
function merge(a, b) {
    if (!isplainobject(b))
        return b;

    a = deepcopy(a);

    for (var k in b) {
        if (a.hasOwnProperty(k) && isplainobject(a[k])) {
            a[k] = merge(a[k], b[k]);
        } else {
            a[k] = deepcopy(b[k]);
        }
    }

    return a;
}

/**
 */
try {
    module.exports.deepcopy = deepcopy;
    module.exports.merge = merge;
} catch(e) {
    console.log("Running outside node: " + e);
}

