require("dotenv").config();
const { TwitterApi } = require("twitter-api-v2");
const { noLinks } = require("../services/utils");

const twitterClient = new TwitterApi(process.env.TWITTER_TOKEN);

const getTweetV1 = async (tweetID) => {
  try {
    console.log("Tweet ID: ", tweetID);
    const data = await twitterClient.v1.get("statuses/show.json", {
      id: tweetID,
      include_entities: true,
      tweet_mode: "extended",
    });
    // console.log(JSON.stringify(data, null, 2));

    const media =
      data && data.extended_entities && data.extended_entities.media
        ? getMediaURL(data.extended_entities.media)
        : {};

    return {
      tweet_id: data.id_str,
      date: new Date(data.created_at).toISOString(),
      text: noLinks(data.full_text),
      author: {
        id: data.user.id_str,
        name: data.user.name,
        username: data.user.screen_name,
      },
      url: `https://twitter.com/${data.user.screen_name}/status/${data.id_str}`,
      ...media,
    };
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getMediaURL = (media) => {
  const mediaTypes = media.map(({ type }) => type);

  if (mediaTypes.includes("video")) {
    return { media: { type: media[0].type, video_info: media[0].video_info } };
  }
  if (mediaTypes.includes("animated_gif")) {
    return { media: { type: media[0].type, video_info: media[0].video_info } };
  }
  return {
    media: [
      ...media.map(({ id, type, media_url_https, sizes }) => ({
        id,
        type,
        media_url_https,
        sizes,
      })),
    ],
  };
};
module.exports = getTweetV1;
