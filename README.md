# DeversiFi Market Maker Bot Simulation

Run `npm install` and then `npm start` to run.

Unfortunately there wasn't enough time to write comprehensive tests though there
are a couple of test examples (Run `npm test`).

The `DvfTraderSim` class simulates the functions of an exchange using the real
orderbook and simulated user orders. The `MarketMaker` class provides a market
making algorithm to place orders within 5% of the best bid and asks. Since these
orders don't get filled quickly not much generally happens. The `SPREAD`
constant in `index.js` can be reduced to increase the chances of activity.

The `MarketMaker` class only places trades when there is an available balance
such that the number of orders can be less than 5 after orders become filled
with no additional balance. The algorithm could be changed to cancel orders and
replace them if there are less than 5.

In regards to performance it depends on what is required. The likely
requirements for a market maker bot is for it to be responsive to changes in the
market. Therefore the biggest improvements would come from using websockets to
obtain data as opposed to a 5 second poll, and the server which runs the bot can
be placed near to the API servers to reduce network latency.

The code uses array methods that can involve uncessary copies and
comparisons. These could be optimised but it is less important than the other
considerations.
