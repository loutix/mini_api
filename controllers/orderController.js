// import data from src
const { ValidationError } = require("sequelize");
const { ModelOrder, ModelUser, ModelProduct } = require("../config/dbConfig");

//index order method
const orderIndex = async (req, res, next) => {
  try {
    const orders = await ModelOrder.findAll();
    res.status(200).json({
      message: "Success, the order's list has been successfully charged",
      orders,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//show order method
const oderShow = async (req, res, next) => {
  const orderId = req.params.id;
  const order = await ModelOrder.findOne({
    where: { id: orderId },
    include: { model: ModelProduct },
  });
  try {
    if (!order) {
      const error = new Error("Could not find this order.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: `Success, the order id n° ${order.id} has been successfully charged.`,
      order,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//create method
const orderCreate = (req, res, next) => {
  //check if userId exist
  const { user_id } = req.auth;
  ModelUser.findOne({ where: user_id }).then((user) => {
    if (user) {
      ModelOrder.create({ ...req.body, user_id })
        .then((order) => {
          const message = `The order id n° ${order.id} has been created.`;
          res.json({ message, data: order });
        })
        .catch((error) => {
          if (error instanceof ValidationError) {
            return res
              .status(400)
              .json({ message: error.message, data: error });
          }
          const message = "The order has not been created";
          res.status(500).json({ message, data: error });
        });
    } else {
      const message = "The user Id does not exist";
      res.status(500).json({ message });
    }
  });
};

//update methode
const orderUpdate = (req, res) => {
  //check if userId exist
  const { user_id } = req.body;
  ModelUser.findOne({ where: user_id }).then((user) => {
    if (user) {
      const id = req.params.id;
      return ModelOrder.update(req.body, { where: { id: id } })
        .then((_) => {
          ModelOrder.findByPk(id).then((order) => {
            //console.log(order.status);
            if (order === null) {
              return res.status(404).json({
                message: "Sorry the product can't be null",
              });
            } else if (order.status !== "In_Order") {
              return res.status(404).json({
                message: "Sorry the product is already in production",
              });
            }
            const message = `The order ${order.id} has been modificated.`;
            res.json({ message, data: order });
          });
        })
        .catch((error) => {
          if (error instanceof ValidationError) {
            return res
              .status(400)
              .json({ message: error.message, data: error });
          }
          const message = "The order has not been modificated";
          res.status(500).json({ message, data: error });
        });
    } else {
      const message = "The user Id does not exist";
      res.status(500).json({ message });
    }
  });
};

//destroy methode
const orderDelete = (req, res) => {
  ModelOrder.findByPk(req.params.id)
    .then((order) => {
      if (order === null) {
        return res.status(404).json({ message: "The order can not be null" });
      } else if (order.status !== "In_Order") {
        return res.status(404).json({
          message: "Sorry the product is already in production or delivery",
        });
      }
      const orderDeleted = order;
      return ModelOrder.destroy({
        where: { id: order.id },
      }).then((_) => {
        const message = `The order n°${orderDeleted.id} has been deleted.`;
        res.json({ message, data: orderDeleted });
      });
    })
    .catch((error) => {
      const message = "The order has not been deleted";
      res.status(500).json({ message, data: error });
    });
};

module.exports = {
  orderIndex,
  oderShow,
  orderCreate,
  orderUpdate,
  orderDelete,
};
