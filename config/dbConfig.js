const { Sequelize, DataTypes } = require("sequelize");
const OrderModel = require("../src/models/orderModel");
const UserModel = require("../src/models/userModel");
const ProductModel = require("../src/models/productModel");
const ordersList = require("../src/db/data-orders");
const bcrypt = require("bcrypt");
var emoji = require("node-emoji");
const crypto = require("crypto");
require("dotenv").config();

const { DATABASE_NAME_TEST, DATABASE_NAME, USER_DATABASE, PASSWORD_DATABASE } =
  process.env;

let sequelize;
if (process.env.NODE_ENV === "test") {
  sequelize = new Sequelize(
    DATABASE_NAME_TEST,
    USER_DATABASE,
    PASSWORD_DATABASE,
    {
      host: "localhost",
      dialect: "mariadb",
      dialectOptions: {
        timezone: "Etc/GMT-2",
      },
      logging: false,
    }
  );
} else {
  sequelize = new Sequelize(DATABASE_NAME, USER_DATABASE, PASSWORD_DATABASE, {
    host: "localhost",
    dialect: "mariadb",
    dialectOptions: {
      timezone: "Etc/GMT-2",
    },
    logging: false,
  });
}

//import models
const ModelUser = UserModel(sequelize, DataTypes);
const ModelOrder = OrderModel(sequelize, DataTypes);
const ModelProduct = ProductModel(sequelize, DataTypes);

//relation one to many user -> order
ModelUser.hasMany(ModelOrder, { foreignKey: "user_id" });
ModelOrder.belongsTo(ModelUser, { foreignKey: "user_id" });
//relation one to many order -> product
ModelOrder.hasMany(ModelProduct, { foreignKey: "order_id" });
ModelProduct.belongsTo(ModelOrder, { foreignKey: "order_id" });

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}
//DB initialization
const initDb = () => {
  return sequelize.sync({ force: true }).then((_) => {
    //create a user
    return (
      bcrypt
        .hash("test", 5)
        .then((hash) => {
          return ModelUser.create({ username: "John", password: hash });
        })
        //create an order list
        .then((user) => {
          return ordersList.map((order) => {
            return ModelOrder.create({
              promotion: order.promotion,
              quantity: order.quantity,
              status: "In_Production",
              price: order.price,
              user_id: `${user.dataValues.id}`,
            });
          });
        })
        .then((ordersPromises) => {
          return Promise.all(ordersPromises).then((orders) => {
            orders.map((order) => {
              let products = [];
              for (let index = 1; index <= order.quantity; index++) {
                products.push({
                  status: "In_Production",
                  serialNumber: crypto.randomUUID(),
                  order_id: order.id,
                });
              }
              ModelProduct.bulkCreate(products);
            });
          });
        })
        .then(() => _)
    );
  });
};

module.exports = { initDb, ModelOrder, ModelUser, ModelProduct, sequelize };
