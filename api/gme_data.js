// Import Dependencies
const connectToDatabase = require("../functions/connectToDatabase");
const getTickerData = require("../functions/getTickerData");

module.exports = async (req, res) => {
  try {
    const { headers } = await req;
    const ACTION_KEY = headers.authorization.split(" ")[1];
    const { GME_DATA_KEY } = process.env;

    if (ACTION_KEY === GME_DATA_KEY) {
      const db = await connectToDatabase(process.env.MONGODB_URI);
      const collection = await db.collection("gme_data");

      const yesterday = ((d) => new Date(d.setDate(d.getDate() - 1)))(
        new Date()
      );

      const parsed = `${yesterday.toISOString().substring(0, 10)} 12:00:00`;

      console.log("Parsed Date: ", parsed);

      const tickerData = await getTickerData("GME", parsed);

      if (tickerData) {
        const { date, open, high, low, close, volume } = tickerData;
        const shortDate = date && new Date(date).toISOString().substring(0, 10);

        const checkDate = await collection.find({ Date: shortDate }).toArray();

        if (checkDate[0]) {
          return res.status(409).json({
            message:
              "Conflict: an entry with that date already exists in the database.",
          });
        }

        await collection.insertOne({
          Date: shortDate,
          Open: open.toString(10),
          High: high.toString(10),
          Low: low.toString(10),
          Close: close.toString(10),
          Volume: volume.toString(10),
        });
        return res.status(200).json({
          message: `Success: an entry for ${shortDate} has been added to the database`,
        });
      }
    } else {
      return res
        .status(401)
        .json({ message: "Error: token did not match key" });
    }
  } catch (err) {
    console.log(err.stack);
    res.status(400).json({ message: "Error" });
  }
};
