// import data from src
const { ValidationError } = require("sequelize");
const { ModelOrder, ModelUser } = require("../src/models/dbConfig");

//oneToMany
const adminIndex = (req, res) => {
  ModelUser.findAll({
    attributes: ["id", "username"],
    include: [{ model: ModelOrder }],
    where: { id: 1 },
  })
    .then((orderList) => {
      const message =
        "Success, the order's list has been successfully charged.";
      res.json({ message, data: orderList });
    })
    .catch((error) => {
      const message = "Error, the order's list has not been charged";
      res.status(500).json({ message, data: error });
    });
};

//index method
const orderIndex = (req, res) => {
  ModelOrder.findAll()
    .then((orderList) => {
      const message =
        "Success, the order's list has been successfully charged.";
      res.json({ message, data: orderList });
    })
    .catch((error) => {
      const message = "Error, the order's list has not been charged";
      res.status(500).json({ message, data: error });
    });
};

//show method
const oderShow = (req, res) => {
  ModelOrder.findByPk(req.params.id)
    .then((order) => {
      if (order === null) {
        return res.status(404).json({ message: "The order can not be null" });
      }
      const message = `Success, the order id n° ${order.id} has been successfully charged.`;
      res.json({ message, data: order });
    })
    .catch((error) => {
      const message = "Error, the order has not been charged";
      res.status(500).json({ message, data: error });
    });
};

//create method
const orderCreate = (req, res) => {
  //check if userId exist
  const { user_id } = req.body;
  ModelUser.findOne({ where: user_id }).then((user) => {
    if (user) {
      ModelOrder.create(req.body)
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
            if (order === null) {
              return res
                .status(404)
                .json({ message: "The order can not be null" });
            }
            const message = `The order ${order.name} has been modificated.`;
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
  adminIndex,
  orderIndex,
  oderShow,
  orderCreate,
  orderUpdate,
  orderDelete,
};
