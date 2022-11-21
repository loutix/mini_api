const { ModelOrder, ModelProduct } = require("../../src/models/dbConfig");

class ProductFactory {
  constructor() {}

  makeProduct(ordersList) {
    let arraysofAllProducts = [];
    ordersList.map((order) => {
      if (order.Products.length < 1) {
        let products = [];
        for (let index = 1; index <= order.quantity; index++) {
          products.push({
            statut: (order.statut = "In_Production"),
            serialNumber: Math.floor(5000 * Math.random()),
            order_id: order.id,
          });
        }
        arraysofAllProducts.push(products);
      }
    });
    return arraysofAllProducts;
  }
}

// method init the factory
function initFactory(ordersList) {
  const pdtFactory = new ProductFactory();
  return pdtFactory.makeProduct(ordersList);
}

/// all orders in API 1
function callOrdersList() {
  const OrdersPromise = new Promise((resolve, reject) => {
    const list = ModelOrder.findAll({ include: [{ model: ModelProduct }] });
    if (typeof list === "object") {
      resolve(list);
    } else {
      reject(new Error("The factory class is not created"));
    }
  });
  return OrdersPromise;
}

/// all orders in API 2
function callDeliveryList() {
  const OrdersPromise = new Promise((resolve, reject) => {
    const list = ModelProduct.findAll({
      where: { statut: "In_delivery" },
    });
    if (typeof list === "object") {
      resolve(list);
    } else {
      reject(new Error("The factory class is not created"));
    }
  });
  return OrdersPromise;
}

//change statut
function changeStatut(ordersList) {
  let deliveryProduct = [];
  ordersList.map((order) => {
    if (order.Products.length > 0) {
      let newOrder = order.Products;
      newOrder.map((item) => {
        item.statut = "In_Delivery";
      });
      deliveryProduct.push(newOrder);
    }
  });

  return deliveryProduct;
}

function IdStatut(deliveryProduct) {
  let id = [];
  deliveryProduct.map((item) => {
    id.push(item.order_id);
  });
  let newArray = id.filter(
    (element, index, array) => array.indexOf(element) === index
  );
  return newArray;
}

const callFactory = (req, res) => {
  // 1- update statut in Model Product
  return callDeliveryList().then((deliveryProduct) => {
    const IdSt = IdStatut(deliveryProduct);
    for (let index = 0; index < IdSt.length; index++) {
      ModelOrder.update(
        { statut: "In_delivery" },
        { where: { id: IdSt[index] } }
      );
    }

    // 2- update statut in Model Order
    ModelProduct.update(
      { statut: "In_delivery" },
      {
        where: {
          statut: ["In_Production"],
        },
      }
    );

    // 3- create new product from order
    return callOrdersList().then((OrderList) => {
      const productList = initFactory(OrderList);
      for (let index = 0; index < productList.length; index++) {
        ModelProduct.bulkCreate(productList[index]);
      }

      return res.json({ product_created: productList });
    });
  });
};

module.exports = { callFactory };
