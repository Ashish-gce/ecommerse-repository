const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  //  product delivery info

  shippingInfo: {
    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    pinCode: {
      type: Number,
      required: true,
    },

    phoneNo: {
      type: Number,
      required: true,
    },
  },

  //   creating order items is an array of objects
  orderItems: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },

      //  creating reference(id) of product order -> to know which product is ordered by user
      product: {
        type: mongoose.Schema.ObjectId, // helps to create product_id
        ref: "Product",
        required: true,
      },
    },
  ],

  //    create reference of user, who order's the product
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
    required: true,
  },

  //   Instance of paymentInfo
  paymentInfo: {
    id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },

  paidAt: {
    type: Date,
    required: true,
  },

  itemsPrice: {
    type: Number,
    required: true,
    default: 0,
  },

  //   tax -> on product item
  taxPrice: {
    type: Number,
    required: true,
    default: 0,
  },

  //   product delivery price
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
  },

  //   total price: itemPrice + taxPrice + shippingPrice
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },

  //   order status
  orderStatus: {
    type: String,
    required: true,
    default: "processing",
  },

  deliveredAt: Date,

  // default product order date and time
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
