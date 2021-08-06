const url = require("url");
const MongoClient = require("mongodb").MongoClient;
const getTweet = require("../functions/getTweetV1");

const approvedTwitterUsers = [
  {
    id: "1146058067244486656",
    name: "Ryan Cohen",
    username: "ryancohen",
    category_id: 3,
  },
  {
    id: "2902349190",
    name: "Roaring Kitty",
    username: "TheRoaringKitty",
    category_id: 4,
  },
];

let cachedDb = null;

async function connectToDatabase(uri) {
  try {
    if (cachedDb) {
      return cachedDb;
    }

    const client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = await client.db(url.parse(uri).pathname.substr(1));

    cachedDb = db;
    return db;
  } catch (err) {
    console.log(err);
  }
}

const isApproved = (authorID) =>
  approvedTwitterUsers.map(({ id }) => id).includes(authorID);

async function handleTwitter(twitterURL) {
  try {
    const pathParts = twitterURL.pathname.split("/");
    const tweetID = pathParts[pathParts.length - 1];
    const tweetData = await getTweet(tweetID);
    console.log(JSON.stringify(tweetData, null, 2));
    return tweetData;
  } catch (err) {
    console.log(err);
    return null;
  }
}

module.exports = async (req, res) => {
  try {
    const { body } = await req;
    const parsed = new URL(body.url);
    // console.log("URL: ", parsed);
    if (parsed.hostname === "twitter.com") {
      const tweetData = await handleTwitter(parsed);

      return res.status(200).json({ data: tweetData });
    }

    /*
    const db = await connectToDatabase(process.env.MONGODB_URI);

    const collection = await db.collection("submitted");

    if (body) {
      await collection.insertOne(body);
      const data = await collection.find({}).toArray();
      return res.status(200).json({ data });
    }
    */

    return;
  } catch (err) {
    console.log(err.stack);
    return res.status(400).json({ message: "Error" });
  }
};
