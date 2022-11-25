const { ModelOrder, ModelProduct } = require("../../config/dbConfig");

//Etape 1: le order passe en production
// -> via la FK de order, table produit: créer un produit
// -> mettre à jout la table order avec un nuveau statut In_Production-voir la clé de liaison

//mise en application:
// -> récuper la table order filtre sur status (In_order)
// -> si In_order création de X produits avec (SN, statut, order_id )

//Etape 2: le produit est livrable
//-> l'usine passe le produit en livrable (récupérer la table produits et changer les statuts)
// puis récupérer la table or
//-> via la FK il modie le statut dans order en livrable

// mise en application:
// -> récuper la table order filtre sur status (In_production)
// -> si In_Production changer 2 fois le status dans orders et produits.
//récuper le tableau lié (faire un update dans 2 tableau)

//faire un fetch de order avec with staut In_order
//    => create dans products (SN, statut)
//    => update dans order (status,)
//    => update order
// faire un fetch de order avec with staut In_production
//    => update dans product (statut)
//    => update order (statut in_delivery)
// si statut = delivery rien
class ProductFactory {
  constructor() {}

  makeProduct(ordersList) {
    let arraysofAllProducts = [];
    ordersList.map((order) => {
      if (order.Products.length < 1) {
        let products = [];
        for (let index = 1; index <= order.quantity; index++) {
          products.push({
            statut: (order.statut = "In_Order"),
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

/// avec async await

/// all orders in API 2
function callOrdersInProduction() {
  const OrdersPromise = new Promise((resolve, reject) => {
    const list = ModelOrder.findAll({
      where: { status: "In_Production" },
    });
    if (typeof list === "object") {
      resolve(list);
    } else {
      reject(new Error("The factory class is not created"));
    }
  });
  return OrdersPromise;
}

function callOrdersInDelivery() {
  const OrdersPromise = new Promise((resolve, reject) => {
    const list = ModelOrder.findAll({
      where: { status: "In_Production" },
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

// changement des status
const OrderStatusDelivery2 = (ordersProduction) => {
  for (let index = 0; index < ordersProduction.length; index++) {
    ModelOrder.update(
      { status: "In_delivery" },
      { where: { status: "In_production" } }
    );
  }
  return;
};

const orderStatusDelivery = () => {
  ModelOrder.update(
    { statut: "In_delivery" },
    {
      where: {
        statut: ["In_Production"],
      },
    }
  );
};

const productStatusDelivery = () => {
  ModelProduct.update(
    { statut: "In_delivery" },
    {
      where: {
        statut: ["In_Production"],
      },
    }
  );
};

const callFactory = (req, res) => {
  // etape 1 changer les status
  orderStatusDelivery();
  productStatusDelivery();

  // 1- update statut in Model Product
  // return callOrdersInProduction().then((ordersProduction) => {
  //   const delivery = OrderStatusDelivery(ordersProduction);
  //   return res.json({ product_created: delivery });
  // });
};

//     // 2- update statut in Model Order
//     ModelProduct.update(
//       { statut: "In_delivery" },
//       {
//         where: {
//           statut: ["In_Production"],
//         },
//       }
//     );

//     // 3- create new product from order
//     return callOrdersList().then((OrderList) => {
//       const productList = initFactory(OrderList);
//       for (let index = 0; index < productList.length; index++) {
//         ModelProduct.bulkCreate(productList[index]);
//       }

//       return res.json({ product_created: productList });
//     });
//   });
// };

module.exports = { callFactory };
