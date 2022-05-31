//  1st (before this page) making  'userModel'  and then that's controllers  "userController"  and then come to this page

const express = require("express");
const router = express.Router();
const {
  register,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  getAllUsers,
  getSingleUser,
  updateUser,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");

const { isAuthenticated, authorizedRoles } = require("../middleware/auth");

// register a user
router.route("/register").post(register);

// login to register user
router.route("/login").post(loginUser);

// forgot password
router.route("/password/forgot").post(forgotPassword);

// reset password
router.route("/password/reset/:token").put(resetPassword);

// update password
router.route("/password/update").put(isAuthenticated, updatePassword);

// update user profile
router.route("/me/update").put(isAuthenticated, updateUser);

// get login user's details
router.route("/me").get(isAuthenticated, getUserDetails); // http://localhost:4000/api/v1/me

// get all users details  --Admin access
router
  .route("/admin/users")
  .get(isAuthenticated, authorizedRoles("admin"), getAllUsers);

// get single / individual user details  --Admin
router
  .route("/admin/user/:id")
  .get(isAuthenticated, authorizedRoles("admin"), getSingleUser)
  .put(isAuthenticated, authorizedRoles("admin"), updateUserRole)
  .delete(isAuthenticated, authorizedRoles("admin"), deleteUser);

// user logout
router.route("/logout").get(logout);

module.exports = router;
