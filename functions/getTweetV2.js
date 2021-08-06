require("dotenv").config();
const { TwitterApi } = require("twitter-api-v2");

const twitterClient = new TwitterApi(process.env.TWITTER_TOKEN);

const roClient = twitterClient.readOnly;

const getTweet = async (tweetID) => {
  try {
    const data = await roClient.v2.singleTweet(tweetID, {
      expansions: ["author_id", "attachments.media_keys"],
      "tweet.fields": ["created_at", "public_metrics", "attachments"],
      "media.fields": ["type", "url", "height", "width", "preview_image_url"],
    });
    // console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.log(err);
  }
};

module.exports = getTweet;
