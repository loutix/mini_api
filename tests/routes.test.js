const request = require("supertest");
const app = require("../app");
const { initDb } = require("../config/dbConfig");

let db;

beforeAll(async () => {
  db = await initDb();
});

// Tests user Login
describe("Create a user Paul", () => {
  it("should create a user", async () => {
    const response = await request(app)
      .post("/api/mini/user/signup")
      .set("Accept", "application/json")
      .send({ username: "Paul", password: "test" });
    expect(response.body.message).toEqual(
      "The new user with has been created."
    );
  });

  it("should create a user with the same unique name", async () => {
    const response = await request(app)
      .post("/api/mini/user/signup")
      .set("Accept", "application/json")
      .send({ username: "Paul", password: "test" });
    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual("The username already exist");
  });

  it("should login with Paul ", async () => {
    const response = await request(app)
      .post("/api/mini/user/login")
      .set("Accept", "application/json")
      .send({ username: "Paul", password: "test" });
    expect(response.body.message).toEqual("Succes the user is login");
    expect(response.body.data.id).toEqual(2);
  });
});

// Tests on the protected auth route
let token = "";
describe("Take the user fake John and keep his token", () => {
  it("should log with the first user test John ", async () => {
    const response = await request(app)
      .post("/api/mini/user/login")
      .set("Accept", "application/json")
      .send({ username: "John", password: "test" });
    expect(response.body.message).toEqual("Succes the user is login");
    expect(response.body.data.id).toEqual(1);
    token = response.body.token;
  });
});

describe("Test a protect route without token", () => {
  it("should to be reject by the protected route", async () => {
    const response = await request(app).get("/api/mini/order/index");
    expect(response.status).toEqual(401);
    expect(response.body.message).toEqual(
      "You must give a JWT authentification."
    );
  });
});

describe("Test a protect route with a bad token", () => {
  it("should to be reject by the protected route", async () => {
    const response = await request(app)
      .get("/api/mini/order/index")
      .set("Authorization", "Bearer eyJhbGciOi");
    expect(response.status).toEqual(401);
    expect(response.body.message).toEqual(
      "The user do not have the possibilty to acces at this page"
    );
  });
});

describe("Test a protect route", () => {
  it("should to be reject by the protected route", async () => {
    const response = await request(app)
      .get("/api/mini/order/index")
      .set("Authorization", "Bearer " + token);
    expect(response.status).toEqual(200);
    expect(response.body.message).toEqual(
      "Success, the order's list has been successfully charged"
    );
  });
});

// test crud order
describe("Create a new product with invalid input quantity", () => {
  it("check the validation rules for create product quantity > 100", async () => {
    const response = await request(app)
      .post("/api/mini/order/create")
      .set("Authorization", "Bearer " + token)
      .set("Accept", "application/json")
      .send({ quantity: 101, promotion: "true" });
    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual(
      "Validation error: The quantity cannot be superior to 100"
    );
  });
  //check the validation
  it("check the validation rules for create product promotion field empty", async () => {
    const response = await request(app)
      .post("/api/mini/order/create")
      .set("Authorization", "Bearer " + token)
      .set("Accept", "application/json")
      .send({ quantity: 1, promotion: "ok" });
    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual(
      "Validation error: Promotion is boolean , choose true or false"
    );
  });

  let newOrder = "";
  it("should create a new product", async () => {
    const response = await request(app)
      .post("/api/mini/order/create")
      .set("Authorization", "Bearer " + token)
      .set("Accept", "application/json")
      .send({ quantity: 1, promotion: "true", price: "" });
    expect(response.status).toEqual(200);
    newOrder = response.body.data;
  });

  it("should return the same object of the product created", async () => {
    const response = await request(app)
      .get(`/api/mini/order/${newOrder.id}`)
      .set("Authorization", "Bearer " + token);
    expect(response.status).toEqual(200);
    expect(response.body.order.id).toEqual(newOrder.id);
    expect(response.body.order.quantity).toEqual(newOrder.quantity);
    expect(response.body.order.price).toEqual(newOrder.price);
    expect(response.body.order.status).toEqual(newOrder.status);
    expect(response.body.order.user_id).toEqual(newOrder.user_id);
  });

  // testing the calcultion price setter
  let newOrderPrice = "";
  it("should return the price with + promotion family 20% + quantity discount 9€ by mini", async () => {
    const response = await request(app)
      .post("/api/mini/order/create")
      .set("Authorization", "Bearer " + token)
      .set("Accept", "application/json")
      .send({ quantity: 51, promotion: "true", price: "" });
    expect(response.status).toEqual(200);
    expect(response.body.data.price).toEqual(Math.round(51 * 9 * 0.8));
    newOrderPrice = response.body.data;
  });

  //update and test the price calculation
  it(" update the product and change the calculation price + No promotion family + quantity discount 9€ by mini", async () => {
    const response = await request(app)
      .put(`/api/mini/order/update/${newOrderPrice.id}`)
      .set("Authorization", "Bearer " + token)
      .set("Accept", "application/json")
      .send({ quantity: 51, promotion: "false", price: "" });
    expect(response.status).toEqual(200);
    expect(response.body.data.price).toEqual(Math.round(51 * 9));
  });

  it(" update the product and change the calculation price + No promotion family + No quantity discount 15€ by mini", async () => {
    const response = await request(app)
      .put(`/api/mini/order/update/${newOrderPrice.id}`)
      .set("Authorization", "Bearer " + token)
      .set("Accept", "application/json")
      .send({ quantity: 2, promotion: "false", price: "" });
    expect(response.status).toEqual(200);
    expect(response.body.data.price).toEqual(2 * 15);
  });

  //delete the product
  it("should delete the new product created", async () => {
    const response = await request(app)
      .delete(`/api/mini/order/delete/${newOrderPrice.id}`)
      .set("Authorization", "Bearer " + token);
    expect(response.status).toEqual(200);
    expect(response.body.message).toEqual(
      `The order n°${newOrderPrice.id} has been deleted.`
    );
  });
  //validate method ont the delete
  it("should impossible to delete a product already in production or in delivery", async () => {
    const response = await request(app)
      .delete(`/api/mini/order/delete/1`)
      .set("Authorization", "Bearer " + token);
    expect(response.status).toEqual(404);
    expect(response.body.message).toEqual(
      `Sorry the product is already in production or delivery`
    );
  });

  //test the process of fabrication
  //send mini orders in production by the factory
  newOrderFactory = "";
  it("should check the status of produc before send in production", async () => {
    const response = await request(app)
      .post("/api/mini/order/create")
      .set("Authorization", "Bearer " + token)
      .set("Accept", "application/json")
      .send({ quantity: 2, promotion: "true", price: "" });
    expect(response.status).toEqual(200);
    expect(response.body.data.status).toEqual("In_Order");
    newOrderFactory = response.body.data;
  });

  let serialNumber1 = "";
  let serialNumber2 = "";
  it("step 1: should informe the factory about  2 new orders", async () => {
    await request(app).get("/api/mini/factory");
    const response2 = await request(app)
      .get(`/api/mini/order/${newOrderFactory.id}`)
      .set("Authorization", "Bearer " + token);
    expect(response2.body.order.status).toEqual("In_Production");
    let step1ordersInProduction = response2.body.order.Products;
    serialNumber1 = step1ordersInProduction[0].serialNumber;
    serialNumber2 = step1ordersInProduction[1].serialNumber;
    expect(step1ordersInProduction.length).toEqual(2);
  });

  it("step 2: should alert the user about the delivery of his orders", async () => {
    await request(app).get("/api/mini/factory");
    const response = await request(app)
      .get(`/api/mini/order/${newOrderFactory.id}`)
      .set("Authorization", "Bearer " + token);
    expect(response.body.order.status).toEqual("In_Delivery");
    let step2ordersInProduction = response.body.order.Products;
    expect(step2ordersInProduction.length).toEqual(2);
    expect(step2ordersInProduction[0].serialNumber).toEqual(serialNumber1);
    expect(step2ordersInProduction[1].serialNumber).toEqual(serialNumber2);
    expect(step2ordersInProduction.length).toEqual(2);
  });
});
afterAll(async () => {
  await db.close();
});
