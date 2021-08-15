const connectToDatabase = require("../functions/connectToDatabase");
const checkSafeURL = require("../functions/checkSafeURL");
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
  {
    id: "22258315",
    name: "GameStop",
    username: "GameStop",
    category_id: 5,
  },
];

const isApproved = (authorID) =>
  approvedTwitterUsers.map(({ id }) => id).includes(authorID);

const handleTwitter = async (twitterURL) => {
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
};

const addTwitterTimer = async (data, approved) => {
  try {
    const db = await connectToDatabase(process.env.MONGODB_URI);
    const collection = await db.collection(
      approved
        ? process.env.VERCEL_ENV === "development"
          ? "dev_data"
          : "data"
        : "submitted"
    );

    if (approved) {
      const checkTweetID = await collection
        .find({ tweet_id: data.tweet_id })
        .toArray();

      if (checkTweetID[0]) {
        return {
          status: 409,
          message:
            "Conflict: a timer with the submitted Tweet ID already exists in the database.",
        };
      }
      const user = approvedTwitterUsers.find(({ id }) => id === data.author.id);
      await collection.insertOne({ ...data, category_id: user.category_id });
      return { status: 200, message: `A tweet by ${user.name} has been added` };
    }

    return { status: 200, data };
  } catch (err) {
    console.log(err);
    return { status: 500, message: err, data };
  }
};

module.exports = async (req, res) => {
  try {
    const { body } = await req;
    const parsed = new URL(body.url);

    // check if URL is safe with Google Safe Browsing API
    const isSafe = await checkSafeURL(parsed.href);
    if (isSafe && isSafe.hasOwnProperty("matches")) {
      return res.status(400).json({
        message: `Error: URL with threat type ${isSafe.matches[0].threatType} detected`,
      });
    }

    // handle Twitter URL
    if (parsed.hostname === "twitter.com") {
      const tweetData = await handleTwitter(parsed);
      if (tweetData) {
        const dbResponse = await addTwitterTimer(
          tweetData,
          isApproved(tweetData.author.id)
        );
        return res.status(dbResponse.status).json({ ...dbResponse });
      }

      return res.status(200).json({ data: tweetData });
    }

    return res.status(200).json({ message: "Nothing happened" });
  } catch (err) {
    console.log(err.stack);
    return res.status(400).json({ message: "Error" });
  }
};
