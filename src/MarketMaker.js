// Copyright 2020 Matthew Mitchell

const random = require("random");

const ETH_MINIMUM = 0.01;

module.exports = class MarketMaker {
    #nOrders; #oneSideSpread; #traderInterface;

    constructor(nOrders, oneSideSpread, traderInterface) {
        this.#nOrders = nOrders;
        this.#oneSideSpread = oneSideSpread;
        this.#traderInterface = traderInterface;
    }

    async update() {

        const {
            orderbook, maxBuyPrice, minSellPrice
        } = await this.#traderInterface.fetchOrderbook();

        const lowBuy = maxBuyPrice*(1-this.#oneSideSpread);
        const highBuy = maxBuyPrice;
        const lowSell = minSellPrice;
        const highSell = minSellPrice*(1+this.#oneSideSpread);

        // Cancel orders outside of lowest buys and highest sells
        // TODO: If orders are filled so that there are less than 5 available,
        // cancel them all and replace. It perhaps would have been a lot easier
        // to just cancel and replace all orders each time.
        const cancelOrders = (from, pricePredicate) => {
            from.filter(o => pricePredicate(o.price)).forEach(
                o => this.#traderInterface.cancelOrder(o)
            );
        }
        let myOrders = this.#traderInterface.myOrders;
        cancelOrders(myOrders.buy, p => p < lowBuy);
        cancelOrders(myOrders.sell, p => p > highSell);

        // Add orders to ensure we have nOrders of orders

        const addOrders = (isBuy, low, high, n, total) => {

            let leftover = total;

            for (let i = 0; i < n; i++) {

                const price = random.float(low, high);

                let amount;

                if (i == n-1)
                    // Make the last order whatever is left over.
                    amount = leftover;
                else {
                    // This does mean that early orders will tend to be bigger
                    // as the leftover shrinks
                    amount = random.float(ETH_MINIMUM, leftover*0.5);
                    leftover -= amount;
                }

                // Convert USD amounts if buying and round down eth amounts to 4
                // decimal places
                let ethAmount = isBuy ? (amount / price) : amount;
                ethAmount = Math.floor(ethAmount * 10000) / 10000;

                if (ethAmount > ETH_MINIMUM)
                    this.#traderInterface.placeOrder(isBuy, price, ethAmount);

            }

        };

        // Ensure myOrders is updated with cancelled orders
        myOrders = this.#traderInterface.myOrders;
        const availableBalances = this.#traderInterface.availableBalances;

        addOrders(
            true, lowBuy, highBuy, this.#nOrders - myOrders.buy.length,
            availableBalances.USD
        );

        addOrders(
            false, lowSell, highSell, this.#nOrders - myOrders.sell.length,
            availableBalances.ETH
        );

    }

};

