const express = require("express");
const router = express.Router();

const { isAuthenticated, authorizedRoles } = require("../middleware/auth");

const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");

// create a new order
router.route("/order/new").post(isAuthenticated, newOrder);

// get a single order  ->  only 'Admin'  can access any other user's order information
router.route("/order/:id").get(isAuthenticated, getSingleOrder);

// get my own orders  ->  'login' should compulsary to get his own order,  'Admin' is not need
router.route("/orders/me").get(isAuthenticated, myOrders);

// get all orders by  --Admin
router
  .route("/admin/orders")
  .get(isAuthenticated, authorizedRoles("admin"), getAllOrders);

// Update order-status by --Admin  &&  delete-order  --Admin
router
  .route("/admin/order/:id")
  .put(isAuthenticated, authorizedRoles("admin"), updateOrder)
  .delete(isAuthenticated, authorizedRoles("admin"), deleteOrder);

module.exports = router; // after exporting we need to configure in "app.js"
