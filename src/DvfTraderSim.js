// Copyright 2020 Matthew Mitchell
//
// Provides a simulated trading model for DeversiFi

const { EventEmitter } = require("events");
const api = require("./dvfApi.js");

module.exports = class DvfTraderSim extends EventEmitter {
    #balances; #myOrders; #orderIdCounter;

    constructor(startingBalances) {
        super();
        // TODO: Ensure balances contains ETH and USD.
        this.#balances = startingBalances;
        this.#myOrders = { buy: [], sell: [] };
        this.#orderIdCounter = 0;
    }

    // TODO: Could be generalised for different trading pairs
    async fetchOrderbook() {

        const rawOrderbook = await api.orderbook("tETHUSD", "R0");

        // Fix orderbook into buys (bids) and sells (asks) and use an object for
        // each order

        const adaptOrderBook = (amountPredicate) => {
            return rawOrderbook
                .filter(e => amountPredicate(e[2]))
                .map(e => ({
                    id: e[0],
                    price: e[1],
                    amount: Math.abs(e[2])
                }))
        };

        const orderbook = {
            buy: adaptOrderBook(amt => amt > 0),
            sell: adaptOrderBook(amt => amt < 0),
        };

        // Use opportunity to determine if any orders have been filled according
        // to the orderbook data

        const ordersToPrices = (orders) => orders.map(order => order.price);
        const maxBuyPrice = Math.max(...ordersToPrices(orderbook.buy));
        const minSellPrice = Math.max(...ordersToPrices(orderbook.sell));

        const removeFilled = (from, pricePredicate, isBuy) => {

            const filled = from.filter(o => pricePredicate(o.price));
            const notFilled = from.filter(o => !pricePredicate(o.price));

            // Update balances
            for (const order of filled) {
                const negate = isBuy ? 1 : -1;
                this.#balances.ETH += order.amount * negate;
                this.#balances.USD -= order.price * order.amount * negate;
                this.emit("filled", isBuy, order);
            }

            return notFilled;

        };

        const myOrders = this.#myOrders;
        myOrders.buy = removeFilled(myOrders.buy, p => p > maxBuyPrice, true);
        myOrders.sell = removeFilled(myOrders.sell, p => p < minSellPrice, false);

        return { orderbook, maxBuyPrice, minSellPrice };

    }

    placeOrder(isBuy, price, amount) {
        const dest = isBuy ? this.#myOrders.buy : this.#myOrders.sell;
        const order = {
            price,
            amount,
            id: this.#orderIdCounter++
        };
        dest.push(order);
        this.emit("placed", isBuy, order);
        return order;
    }

    cancelOrder(order) {

        // Could be moved to another file for Array util functions.
        const removeFromArray = (arr) => {
            const idx = arr.findIndex(e => e.id == order.id);
            const found = idx != -1;
            if (found)
                arr.splice(idx, 1);
            return found;
        };

        const isBuy = removeFromArray(this.#myOrders.buy);
        if (!isBuy) removeFromArray(this.#myOrders.sell);

        this.emit("cancelled", isBuy, order);

    }

    get myOrders() {
        return this.#myOrders;
    }

    get balances() {
        return this.#balances;
    }

    get availableBalances() {
        // Calculate available balances
        return {
            ETH: this.#balances.ETH - this.#myOrders.sell.reduce(
                (acc, o) => acc + o.amount, 0
            ),
            USD: this.#balances.USD - this.#myOrders.buy.reduce(
                (acc, o) => acc + o.amount*o.price, 0
            )
        };
    }

};

