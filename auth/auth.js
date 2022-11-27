const jwt = require("jsonwebtoken");
const privateKey = require("../auth/private_key");

module.exports = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    const message = `You must give a JWT authentification.`;
    return res.status(401).json({ message });
  }
  //split the bearer
  const token = authorizationHeader.split(" ")[1];
  // console.log(token);
  const decodedToken = jwt.verify(token, privateKey, (error, decodedToken) => {
    if (error) {
      const message = `The user do not have the possibilty to acces at this page`;
      return res.status(401).json({ message, data: error });
    }

    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      const message = `The user id is not valid`;
      res.status(401).json({ message });
    } else {
      req.auth = {
        user_id: userId,
      };
      next();
    }
  });
};
