module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: {
        msg: "The username already exist",
      },
      validate: {
        len: {
          args: [4, 10],
          msg: "The username mut be contain between 4 and 10 characteres",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
    },
  });
  return User;
};
