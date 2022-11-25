const { Sequelize, DataTypes } = require("sequelize");
const OrderModel = require("../src/models/orderModel");
const UserModel = require("../src/models/userModel");
const ProductModel = require("../src/models/productModel");
const ordersList = require("../src/db/data-orders");
const bcrypt = require("bcrypt");
var emoji = require("node-emoji");
const crypto = require("crypto");
require("dotenv").config();

let uuid = crypto.randomUUID();

const { DATABASE_NAME, USER_DATABASE, PASSWORD_DATABASE } = process.env;

const sequelize = new Sequelize(
  DATABASE_NAME,
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

sequelize
  .authenticate()
  .then((success) =>
    console.log(`success connexion mini_database ${emoji.get("heart")}`)
  )
  .catch((error) => console.log(`error database connexion : ${error}`));

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

//DB initialization
const initDb = () => {
  return sequelize.sync({ force: true }).then((_) => {
    //create a user
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
            price: order.price,
            user_id: `${user.dataValues.id}`,
          });
        });
      })
      .then((ordersPromises) => {
        return Promise.all(ordersPromises).then((orders) => {
          // boucler sur les ordres
          orders.map((order) => {
            let products = [];
            for (let index = 1; index < order.quantity; index++) {
              products.push({
                statut: "In_Production",
                serialNumber: crypto.randomUUID(),
                order_id: order.id,
              });
            }
            ModelProduct.bulkCreate(products);
          });
        });
      });

    console.log(
      `success the database has been ini with examples ${emoji.get("coffee")}`
    );
  });
};

module.exports = { initDb, ModelOrder, ModelUser, ModelProduct };