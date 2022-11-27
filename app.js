const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const orderRoutes = require("./routes/routes");

const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({
    routes: "/api/mini",
    factory: "/factory",
    orders: "/order/index",
    user: "/user/signup",
  });
});

app
  .use(morgan("dev"))
  .use("/api/mini", orderRoutes)
  .use(({ res }) => {
    res.status(404).json({ message: "Sorry the page does not exist!" });
  });

//sequelize.initDb();
module.exports = app;

// const init = sequelize.initDb();
// module.exports = { app, init };
