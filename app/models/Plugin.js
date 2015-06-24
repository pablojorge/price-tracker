var Registry = require('../models/Registry.js'),
    PriceStore = require('../models/PriceStore.js');

module.exports = {
    register: function(requester_cls, streamer_cls) {
        var registry = Registry.getInstance(),
            store = PriceStore.getInstance();

        registry.requesters.register(requester_cls.config.exchange,
                                     requester_cls);

        registry.streamers.register(streamer_cls.config.exchange,
                                    streamer_cls);

        for (var symbol in requester_cls.config.symbol_map) {
            registry.streamers.create(
                requester_cls.config.exchange, [
                    symbol,
                    store.listener.bind(store)
                ]
            );
        }
    }
};

