module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define("Product", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    statut: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "In_Order",
    },
    serialNumber: {
      type: DataTypes.INTEGER,
      unique: {
        msg: "The username already exist",
      },
    },
  });
  return Product;
};
