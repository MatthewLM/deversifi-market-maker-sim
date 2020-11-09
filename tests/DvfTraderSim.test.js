// Copyright 2020 Matthew Mitchell

const DvfTraderSim = require("../src/DvfTraderSim.js");

const startingBalances = { ETH: 100, USD: 1000 };

let trader;

beforeEach(() => {
    // Fresh object for each test
    trader = new DvfTraderSim(startingBalances);
});

test("obtain default balance", () => {
    expect(trader.balances).toEqual(startingBalances);
});

test("placing and cancelling orders changes available balances", () => {

    const expectBalances = (eth, usd) => {
        expect(trader.availableBalances.ETH).toEqual(eth);
        expect(trader.availableBalances.USD).toEqual(usd);
    };

    const sellOrder = trader.placeOrder(false, 100, 10);
    expectBalances(90, 1000);
    const buyOrder = trader.placeOrder(true, 100, 1);
    expectBalances(90, 900);

    trader.cancelOrder(sellOrder);
    expectBalances(100, 900);
    trader.cancelOrder(buyOrder);
    expectBalances(100, 1000);

});

// TODO: Add tests for filling orders and fetching trading data. Should use a
// mock for the orderbook

