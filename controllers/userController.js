const { ValidationError } = require("sequelize");
const { ModelUser } = require("../config/dbConfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const privateKey = require("../auth/private_key");

//sign up user
const signUpUser = (req, res) => {
  const { username, password } = req.body;
  bcrypt
    .hash(password, 5)
    .then((hash) => ModelUser.create({ username: username, password: hash }))
    .then((user) => {
      const message = `The new user with has been created.`;
      res.json({ message, data: user });
    })
    .catch((error) => {
      if (error instanceof ValidationError) {
        return res.status(400).json({ message: error.message });
      }
      console.error(error);
      const message = "The user has not been created";
      res.status(500).json({ message });
    });
};

//login user
const loginUser = (req, res) => {
  ModelUser.findOne({ where: { username: req.body.username } })
    .then((user) => {
      if (!user) {
        const message = "The username does not exist";
        return res.status(404).json({ message });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((isPasswordValid) => {
          if (!isPasswordValid) {
            const message = "The password is not corrected";
            return res.json({ message, data: user });
          }
          // create the JWT
          const token = jwt.sign({ userId: user.id }, privateKey, {
            expiresIn: "240h",
          });

          const message = "Succes the user is login";
          return res.json({ message, data: user, token });
        });
    })
    .catch((e) => {
      const message = "Error: the user is not login";
      return res.json({ message, data: user });
    });
};

module.exports = { signUpUser, loginUser };
