// Import Dependencies
const connectToDatabase = require("../functions/connectToDatabase");

module.exports = async (req, res) => {
  try {
    const { body } = await req;
    const db = await connectToDatabase(process.env.MONGODB_URI);
    const collection = await db.collection("gme_data");

    const { date, open, high, low, close, volume } = body || {};
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
  } catch (err) {
    console.log(err.stack);
    res.status(400).json({ message: "Error" });
  }
};
