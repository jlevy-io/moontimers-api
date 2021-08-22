const yahooFinance = require("yahoo-finance");

const getTickerData = async (ticker, date) => {
  try {
    const res = await yahooFinance.historical({
      symbol: ticker,
      from: date,
      to: date,
    });
    return res && res[0] ? res[0] : null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

module.exports = getTickerData;
