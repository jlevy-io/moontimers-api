const yahooFinance = require("yahoo-finance2").default;

const getTickerData = async (ticker, date) => {
  try {
    const res = await yahooFinance.historical(ticker, {
      period1: date,
      period2: date,
      includeAdjustedClose: false,
      interval: "1d",
    });
    return res && res[0] ? res[0] : null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

module.exports = getTickerData;
