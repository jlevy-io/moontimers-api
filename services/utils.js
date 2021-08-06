const noLinks = (text) => text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");

module.exports = { noLinks };
