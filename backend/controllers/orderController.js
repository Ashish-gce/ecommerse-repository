const Order = require("../models/orderModel");
const Product = require("../models/productModel"); // fetching 'productModel' for reference
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");

//  🥇🥇 create new order
exports.newOrder = catchAsyncError(async (req, res, next) => {
  //  to create order do 'object' distructuring and get data from form (body)
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    // "Order" -> comes from DB to create order
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,

    //  when user paid then that's order deliver
    paidAt: Date.now(),

    user: req.user._id, // user should loggedin -> to order place
  });

  res.status(201).json({
    success: true,
    order,
  });
});

//  🥇🥇 get Single Order  ->  only 'Admin'  can access any other user's order information
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
  //  Note:- ♻️♻️♻️ Since, we already use "user.Schema" in  'orderModel.js'(req.params.id)  that fetch 'user._id' from  'userModel.js'
  //  'req.params.id' -> this fetch all details from 'orderModel.js' this also contains  "user_id" -> from this id we can also fetch  user info.
  const order = await Order.findById(req.params.id).populate(
    // 'populate' -> from "user" table fetch user info.
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHandler("Order is not found with this Id", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

//  🥇🥇 Get logged-in user order  (loggedIn people only can access their own order)
exports.myOrders = catchAsyncError(async (req, res, next) => {
  //  👽👽 ⚓⚓⚓ below we use "find()" Not -> 'findById()' or 'findOne()' -> b'z one person can multiple items and we need to fetch all that ordered products from 'DB'
  const orders = await Order.find({ user: req.user._id }); // 'req.user._id'(loggedIn user id) -> getting user's id  from  'userModel'  in  'orderModel.js' and we can access user's info
  //  // .find({ user: req.user._id }) -> this works upon user's login-Id

  res.status(200).json({
    success: true,
    orders,
  });
});

//  🥇🥇 Get All Orders  --Admin (acessed by Admin only.)
exports.getAllOrders = catchAsyncError(async (req, res, next) => {
  //  👽👽 ⚓⚓⚓ below we use "find()" Not -> 'findById()' or 'findOne()' -> b'z one person can multiple items and we need to fetch all that ordered products from 'DB'
  const orders = await Order.find(); // 'req.user._id'(loggedIn user id) -> getting user's id  from  'userModel'  in  'orderModel.js' and we can access user's info

  //   Admin can see 'Total price' of all ordered product by particular user
  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

//  🥇🥇 Update specific(id) Order Status  --Admin
exports.updateOrder = catchAsyncError(async (req, res, next) => {
  //  👽👽 ⚓⚓⚓ below we use "find()" Not -> 'findById()' or 'findOne()' -> b'z one person can multiple items and we need to fetch all that ordered products from 'DB'
  const order = await Order.findById(req.params.id); // 'req.user._id'(loggedIn user id) -> getting user's id  from  'userModel'  in  'orderModel.js' and we can access user's info

  if (!order) {
    return next(new ErrorHandler("Order not found with this id", 404));
  }

  //  if order id already delivered
  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already delivered this order", 404));
  }

  //  if order is "delivered" then we -(subtract) / decrease product from quantity(order) - b'z user they can 'cancle' the order
  //  //  'order' -> Object  'orderItems' -> Array inside  'order'  So, we apply 'forEach' method on  orderItems[]
  order.orderItems.forEach(async (order) => {
    await updateStock(order.product, order.quantity); // sending order -> product and quantity with function
  });

  order.orderStatus = req.body.status; // sending order status from form / body

  if (req.body.status === "Delivered") {
    // here checking 'order' status
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    order,
  });
});

//  🥇 'id, quantity' -> sending with updateStock() function
async function updateStock(id, quantity) {
  const product = await Product.findById(id); // here we get product a/c to 'id'

  product.Stock -= quantity;

  await product.save({ validateBeforeSave: false }); // 👿 "await" is necessary
}

//  🥇🥇 delete order  --Admin
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order is not found with this id", 404));
  }

  await order.remove();

  res.status(200).json({
    success: true,
    order,
  });
});
