require("dotenv").config();
const { safebrowsing } = require("@googleapis/safebrowsing");

const checkSafeURL = async (url) => {
  try {
    const client = safebrowsing({
      version: "v4",
      auth: process.env.GOOGLE_SAFE_BROWSING_API_KEY,
    });

    const res = await client.threatMatches.find({
      requestBody: {
        client: {
          clientId: "moontimers",
          clientVersion: "1.3",
        },
        threatInfo: {
          threatTypes: [
            "THREAT_TYPE_UNSPECIFIED",
            "MALWARE",
            "SOCIAL_ENGINEERING",
            "UNWANTED_SOFTWARE",
            "POTENTIALLY_HARMFUL_APPLICATION",
          ],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }],
        },
      },
    });

    return res.data;
  } catch (err) {
    throw err;
  }
};

module.exports = checkSafeURL;
