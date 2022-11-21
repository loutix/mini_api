const express = require("express");
const router = express.Router();

const {
  adminIndex,
  orderIndex,
  oderShow,
  orderCreate,
  orderUpdate,
  orderDelete,
} = require("../controllers/orderController");
const { signUpUser, loginUser } = require("../controllers/userController");
const { callFactory } = require("../src/factory/productFactory");

const auth = require("../auth/auth");

// les routes orders
router.get("/", (req, res) => {
  res.send("root of Server express API-MINI api/order");
});

router.get("/order/admin", auth, adminIndex);
router.get("/order/index", auth, orderIndex);
router.get("/order/:id", auth, oderShow);
router.post("/order/create", auth, orderCreate);
router.put("/order/update/:id", auth, orderUpdate);
router.delete("/order/delete/:id", auth, orderDelete);

//user routes
router.post("/user/signup", signUpUser);
router.post("/user/login", loginUser);

//factory route
router.get("/factory", callFactory);

module.exports = router;
