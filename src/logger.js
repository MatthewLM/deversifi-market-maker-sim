// Copyright 2020 Matthew Mitchell

function getOrderText(what, isBuy, order) {
    return `${what} ${isBuy ? "BID" : "ASK"} @ ${order.price.toFixed(4)} ${order.amount}`;
}

exports.newOrder = (isBuy, order) => {
    console.log(getOrderText("PLACE", isBuy, order));
};

exports.filledOrder = (isBuy, order) => {
    const usdAmount = order.amount * order.price;
    const ethSign = isBuy ? "+" : "-";
    const usdSign = isBuy ? "-" : "+";
    const fillAmountStr
        = ` (ETH ${ethSign} ${order.amount.toFixed(3)} USD ${usdSign} ${usdAmount.toFixed()})`;
    console.log(getOrderText("FILLED", isBuy, order) + fillAmountStr);
};


exports.cancelledOrder = (isBuy, order) => {
    console.log(getOrderText("CANCELLED", isBuy, order));
};

exports.balances = (balances) => {
    for (const key of Object.keys(balances))
        console.log(`${key} BAL = ${balances[key].toFixed(4)}`);
};

