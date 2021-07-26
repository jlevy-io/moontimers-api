// Import Dependencies
const url = require("url");
const MongoClient = require("mongodb").MongoClient;

// Create cached connection variable
let cachedDb = null;

// A function for connecting to MongoDB,
// taking a single parameter of the connection string
async function connectToDatabase(uri) {
  // If the database connection is cached,
  // use it instead of creating a new connection
  if (cachedDb) {
    return cachedDb;
  }

  // If no connection is cached, create a new one
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Select the database through the connection,
  // using the database path of the connection string
  const db = await client.db(url.parse(uri).pathname.substr(1));

  // Cache the database connection and return the connection
  cachedDb = db;
  return db;
}

// The main, exported, function of the endpoint,
// dealing with the request and subsequent response
module.exports = async (req, res) => {
  try {
    const { query, body } = await req;
    const { category, filter, limit, skip, sort } = await query;

    // Get a database connection, cached or otherwise,
    // using the connection string environment variable as the argument
    const db = await connectToDatabase(process.env.MONGODB_URI);

    const categoriesDB = await db.collection("categories");
    const categories = await categoriesDB
      .find({})
      .sort({ id: 1 })
      .project({ _id: 0, id: 1, short_name: 1 })
      .toArray();

    const categoryFilter = categories.find(
      ({ short_name }) => short_name === category
    ).id;

    const timerTypesDB = await db.collection("timer_types");
    const timerTypes = await timerTypesDB
      .find({})
      .sort({ id: 1 })
      .project({ _id: 0, id: 1, short_name: 1 })
      .toArray();

    const timerTypeFilter = timerTypes.find(
      ({ short_name }) => short_name === filter
    ).id;

    // Select the "data" collection from the database
    const Data = await db.collection("data");

    // Select the data collection from the database
    // const data = await dataCollection.find({}).toArray();
    const total = await Data.aggregate([
      {
        $match: {
          category_id: categoryFilter ? categoryFilter : { $gt: 0 },
          date: timerTypeFilter
            ? timerTypeFilter === 1
              ? { $gt: new Date().toISOString() }
              : { $lte: new Date().toISOString() }
            : { $ne: null },
        },
      },
      {
        $count: "total",
      },
    ]).toArray();

    const data = await Data.aggregate([
      {
        $match: {
          category_id: categoryFilter ? categoryFilter : { $gt: 0 },
          date: timerTypeFilter
            ? timerTypeFilter === 1
              ? { $gt: new Date().toISOString() }
              : { $lte: new Date().toISOString() }
            : { $ne: null },
        },
      },
      {
        $sort: {
          date: sort ? parseInt(sort) : -1,
        },
      },
      {
        $skip: parseInt(skip),
      },
      {
        $limit: parseInt(limit),
      },
      {
        $set: {
          dataDate: {
            $toDate: "$date",
          },
        },
      },
      {
        $set: {
          shortDate: {
            $dateToString: {
              date: "$dataDate",
              format: "%Y-%m-%d",
              timezone: "America/New_York",
            },
          },
        },
      },
      {
        $lookup: {
          from: "gme_data",
          localField: "shortDate",
          foreignField: "Date",
          as: "temp",
        },
      },
      {
        $match: {
          same: {
            $ne: [],
          },
        },
      },
      {
        $unwind: {
          path: "$temp",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $set: {
          ticker: {
            open: {
              $toString: { $round: [{ $toDecimal: "$temp.Open" }, 2] },
            },
            close: {
              $toString: { $round: [{ $toDecimal: "$temp.Close" }, 2] },
            },
            high: {
              $toString: { $round: [{ $toDecimal: "$temp.High" }, 2] },
            },
            low: { $toString: { $round: [{ $toDecimal: "$temp.Low" }, 2] } },
            volume: "$temp.Volume",
          },
        },
      },
      {
        $project: {
          _id: 0,
          category_id: 1,
          title: 1,
          description: 1,
          date: 1,
          url: 1,
          author: 1,
          subreddit: 1,
          ticker: { $cond: [{ $not: ["$temp"] }, null, "$ticker"] },
        },
      },
    ]).toArray();

    // Respond with a JSON string of all data in the collection
    res.status(200).json({ data, total: total[0] ? total[0].total : 0 });
  } catch (err) {
    console.log(err.stack);
    res.status(400).message("");
  }
};
