// Copyright 2020 Matthew Mitchell
//
// Low-level API functions to DeversiFi

const fetch = require("node-fetch");

const API_URL = "https://api.deversifi.com/bfx/v2/";

async function apiCall(path) {

    const response = await fetch(
        API_URL + path,
        {
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
            }
        }
    );

    return response.json();

}

// precision R0 provides arrays with [ ORDER_ID, PRICE, AMOUNT ]
// See: https://docs.bitfinex.com/reference#rest-public-book
exports.orderbook = async (symbol, precision) => {
    return await apiCall(`book/${symbol}/${precision}`);
};

