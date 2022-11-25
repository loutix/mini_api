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
      type: DataTypes.UUID,
      isUUID: {
        msg: "The serial number must be UUID format",
      },
      unique: {
        msg: "The serial number must unique",
      },
    },
  });
  return Product;
};
