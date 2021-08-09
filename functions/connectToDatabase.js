// Import Dependencies
const { URL } = require("url");
const { MongoClient } = require("mongodb");

async function connectToDatabase(uri) {
  const connectionURL = new URL(uri);
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    const db = client.db(connectionURL.pathname.substr(1));
    return db;
  } catch (err) {
    console.log(err);
    return null;
  }
}

module.exports = connectToDatabase;
