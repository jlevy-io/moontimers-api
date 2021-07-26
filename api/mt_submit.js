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
    const { body } = await req;
    const {
      id: reddit_id,
      author,
      created_utc,
      selftext,
      title,
      url,
      subreddit,
    } = await body;
    // Get a database connection, cached or otherwise,
    // using the connection string environment variable as the argument
    const db = await connectToDatabase(process.env.MONGODB_URI);
    const collection = await db.collection("data");
    const checkRedditID = await collection.find({ reddit_id }).toArray();

    if (checkRedditID[0]) {
      return res.status(409).json({
        message:
          "Conflict: a timer with the submitted Reddit post ID already exists in the database.",
      });
    }

    const checkRedditTitle = await collection.find({ title }).toArray();

    if (checkRedditTitle[0]) {
      return res.status(409).json({
        message:
          "Conflict: a timer with the submitted title already exists in the database.",
      });
    }

    const data = {
      category_id: 2,
      title,
      description: selftext,
      date: new Date(created_utc * 1000).toISOString(),
      url,
      reddit_id,
      author,
      subreddit,
    };
    await collection.insertOne(data);

    return res.status(200).json({ data });
  } catch (err) {
    console.log(err.stack);
    res.status(400).json({ message: "Error" });
  }
};
