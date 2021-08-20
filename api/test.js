module.exports = async (req, res) => {
  try {
    const { body, headers } = await req;

    console.log("Body: ", body);
    console.log("Headers: ", headers);
    const token = headers.authorization.split(" ")[1];
    res.status(200).json({ message: token });
  } catch (err) {}
};
