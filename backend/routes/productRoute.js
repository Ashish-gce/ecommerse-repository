const express = require("express");

// => 👍 bY THE HELP OF "router" -> we're setting 'route' of products -> by which (url) we get the products

//  importing functions from 'productController.js' files
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetail,
  createProductReview,
  getAllProductReviews,
  deleteReview,
} = require("../controllers/productController");

const { isAuthenticated, authorizedRoles } = require("../middleware/auth");

const router = express.Router(); // Router() -> pre-defined method inside "express"

//  below are the root's of "URL"    //  and main-function (controller) -> export from productComntroller

//  create a new product     //  "isAuthenticated" -> auth.js -> and access only authorized person
//  // 🚧🚧🚧 'isAuthenticated' -> tells only user is login or not  => 🚧🚧🚧 But it doesn't tells @ user is "Admin" or not.
router
  .route("/product/new")
  .post(isAuthenticated, authorizedRoles("admin"), createProduct);

//  get all products
router.route("/products").get(getAllProducts); // 'get' -> is a request  &&  'getAllProducts()' -> which gives result

//  ❤️ 💟 Since, both -> update and delete product by product_id  ->  both url same
// router.route("/product/:id").put(updateProduct);
// router.route("/product/:id").put(updateProduct).delete(deleteProduct);
router
  .route("/product/:id")
  .put(isAuthenticated, authorizedRoles("admin"), updateProduct)
  .delete(isAuthenticated, authorizedRoles("admin"), deleteProduct);

router.route("/product/:id").get(getProductDetail); // anyone can access this

//  getting review and ratings
router.route("/review").put(isAuthenticated, createProductReview);

//  Delete reviews of a product
router
  .route("/reviews")
  .get(getAllProductReviews)
  .delete(isAuthenticated, deleteReview);

module.exports = router;
