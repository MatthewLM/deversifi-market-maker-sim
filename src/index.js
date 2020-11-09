// Copyright 2020 Matthew Mitchell

const DvfTraderSim = require("./DvfTraderSim.js");
const MarketMaker = require("./MarketMaker.js");
const log = require("./logger.js");

// TODO: Use precise Decimal number representation
// TODO: Replace constants with command line arguments
const STARTING_ETH = 10;
const STARTING_USD = 2000;
const N_ORDERS = 5;
const SPREAD = 0.05;
const UPDATE_INTERVAL = 5000;
const BALANCE_INTERVAL = 30000;

const trader = new DvfTraderSim({ ETH: STARTING_ETH, USD: STARTING_USD });
trader.on("filled", log.filledOrder);
trader.on("placed", log.newOrder);
trader.on("cancelled", log.cancelledOrder);

const marketMaker = new MarketMaker(N_ORDERS, SPREAD, trader);

setInterval(() => marketMaker.update(), UPDATE_INTERVAL);
setInterval(() => log.balances(trader.balances), BALANCE_INTERVAL);

// Start immediately
marketMaker.update();

