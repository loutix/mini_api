const { ModelOrder, ModelProduct } = require("../../config/dbConfig");
const crypto = require("crypto");

const makeProduct = (ordersList) => {
  let arraysofAllProducts = [];
  ordersList.map((order) => {
    if (order.Products.length < 1) {
      let products = [];
      for (let index = 1; index <= order.quantity; index++) {
        products.push({
          status: (order.status = "In_Production"),
          serialNumber: crypto.randomUUID(),
          order_id: order.id,
        });
      }
      arraysofAllProducts.push(products);
    }
  });
  return arraysofAllProducts;
};

/// call all orders include product
const callOrders = () => {
  return ModelOrder.findAll({
    include: [{ model: ModelProduct }],
  });
};

/// call product with In_Production_status
const callProductWPS = () => {
  return ModelProduct.findAll({
    where: { status: "In_production" },
  });
};

/// call product with Delivery_status
function IdProductWDS(deliveryProduct) {
  let id = [];
  deliveryProduct.map((item) => {
    id.push(item.order_id);
  });
  let newArray = id.filter(
    (element, index, array) => array.indexOf(element) === index
  );
  return newArray;
}

// Methode callFactory, initialise the production.
// Step 1: the factory receive the orders and start the production
// Step 2 : the factory delivers the product

const callFactory = async (req, res, next) => {
  try {
    // 1- update the product and order with status In_Delivery
    const deliveryProduct = await callProductWPS();

    const idPWDS = IdProductWDS(deliveryProduct);

    await ModelProduct.update(
      { status: "In_Delivery" },
      { where: { status: ["In_Production"] } }
    );

    await ModelOrder.update(
      { status: "In_Delivery" },
      { where: { id: idPWDS } }
    );

    // 2- create new product from order
    const OrderList = await callOrders();
    const productList = makeProduct(OrderList);
    await ModelProduct.bulkCreate(productList.flat());

    //3-Change status in order
    await ModelOrder.update(
      { status: "In_Production" },
      { where: { status: ["In_Order"] } }
    );
    res.status(200).json({
      message: `Success, in the factory process.`,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

module.exports = { callFactory };
