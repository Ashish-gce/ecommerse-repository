//  here 1st we've to import 'product-schema'
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apifeatures");

// Create Product  📔📔 🧥🧥  --  Admin

exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id; // 'req.body.user' -> accessing all user's info,  'req.body.id' -> fetch and insert id into them.

  const product = await Product.create(req.body); // 'Product.create()' -> Product ->require(models/productModels)

  res.status(201).json({
    success: true,
    product, // sending 'created-product' as a response
  });
});

//  Get All Products
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
  //  how many results show on each page

  const resultPerPage = 4;
  const productCount = await Product.countDocuments();

  //  new "apiFeature" -> creating new object of  "ApiFeatures" class
  // 'Product.find()' -> query  'req.query.keyword' -> keyword that gives result
  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

  const products = await apiFeature.query;

  res.status(200).json({
    // message: "Route is working fine"
    success: true,
    products,
    productCount,
  });
});

//  Get product details
exports.getProductDetail = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    //   return res.status(500).json({
    //     success: false,
    //     message: "Product is not found",
    //   });

    return next(new ErrorHandler("Product not Found chutiya", 404)); // next() => callback function
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// Update Product  --Admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  //  'let' -> b'z in future this variable may changes(reAssign) in same variable
  let product = await Product.findById(req.params.id);

  if (!product) {
    //  ErrorHandler(-,-) -> takes 2-arg  1. message  2. statusCode
    return next(new ErrorHandler("Product not Found in Updation Goriye", 404)); // next() => callback function
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    // 'req.body' -> getting updated value by body
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product, //  sending updated product
  });
});

//  Delete Product
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not Found", 404));
  }

  await product.remove();
  res.status(200).json({
    success: true,
    message: "Product Deleted Successfuly",
  });
});

//  🥇🥇 Create New Review or Update the review  ->  here creating both function in same => 💡💡💡  b'z if user till now not give review then when user's making 'review' then review is created and  that's  also  "updated"
//  💡💡💡  But, if user's already gives 'review' on particular product and again gives review then over all  reviews  goes "updated"
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  //  object distructuring
  const { rating, comment, productId } = req.body;

  // now, adding this 'review' object to  "reviews"[] array by "push" method.
  const review = {
    // an object of review
    user: req.user._id, // comes from DB  ->  at login time we store user's info in this - 'req.user' || jisne review diya h uska 'id' save kr lenge
    name: req.user.name,
    rating: Number(rating), // wrapping into Number -> any one type rating in 'string' that's convert into Number => 'review' specific rating
    comment,
  };

  //  🥇 find product that's 'review' is generated  ->  by product_id
  const product = await Product.findById(productId); //  'productId' -> getting from object-dustructuring (req.body)

  //  if 'review' is already made
  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  ); // 'rev.user.toString()' -> review user id  &&  'req.user._id.toString()' -> review create krne wale ki id (login user id)
  // 💯💯 if user is already reviewe to any product -> it's only updated
  if (isReviewed) {
    product.reviews.forEach((rev) => {
      // 'forEach' loop is run for each review
      if (rev.user.toString() === req.user.id.toString())
        // jis review ki 'id' match ho jaega 'login' user id se then we know that's review 'rating' & 'comment' should changed

        //  🥇 this 'rating' is for review based 'rating'  ->  Not overall rating
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    // 💯💯 if user's generate completely new reviewe (till now review is not generated) || review is not given bt user
    //  since, in 'Product' -> we've an ar  ray of 'reviewe'
    product.reviews.push(review); // 'review' -> new object comes from above

    // 🥇  📶📶  Total number of reviews on each product (reviews length)
    product.numberOfReviews = product.reviews.length;
  }

  //  🥇 update product ratings (overall ratings => avg. of rating) of any product => 😕😕😕  reviews[] m jitni bhi ratings h uska average lenge
  //  4,5,5,2 = 16/4 = avg=4
  let avg = 0;

  product.reviews.forEach((rev) => {
    //  foreach review ke lie average m add kr denge
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    review,
  });
});

//  🥇🥇 Get all reviews of a single products
exports.getAllProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id); // find product by id through -> 'query: product -> id' providing

  if (!product) {
    return next(new ErrorHandler("Product not found", 400));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

//  🥇🥇 Delete specific reviews of a product
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId); // find out product from 'url'

  if (!product) {
    return next(new ErrorHandler("Product is not found", 400));
  }

  //  'rev._id.toString()' -> _id of specific review  &&  'req.query.id' -> normal review(id) that we want to delete
  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString() // filter out all reviews that we don't want to delete and save them in local constant (review)
  );

  //  🥇 Since, we get new 'review' So, we need to => change the  "ratings"  also
  let avg = 0;

  // calculate product k andar k review k ratings
  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  // update reviews
  const ratings = avg / reviews.length;

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});
