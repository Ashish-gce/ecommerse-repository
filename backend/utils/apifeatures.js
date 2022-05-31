class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  //  🥇 here build  api ka search features
  search() {
    const keyword = this.queryStr.keyword
      ? {
          //   'name' -> what we want to search ?    '$regex'(regular experession) -> mongodb operator
          //   name -> provide what's keyword
          name: {
            $regex: this.queryStr.keyword,
            $options: "i", //  'i' -> case-insesitive
          },
        }
      : {};

    //   chinging this.query === 'product.find() -> sending keyword with product.find() method
    this.query = this.query.find({ ...keyword }); // ...keyword = above name i.e. made by $regex
    return this; // return this -> same class
  }

  //  🥇 here build  api ka 'filter' features
  filter() {
    const queryCopy = { ...this.queryStr }; //  make a copy of above this.queryStr

    //   Removing some fields for category

    const removeFields = ["keyword", "page", "limit"]; // these fields remove from 'this.query'
    removeFields.forEach((key) => delete queryCopy[key]); // this line delete 'removeFields' elements one-by-one

    //  //  Filter for Price and Rating

    let queryStr = JSON.stringify(queryCopy); // convert object to string
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
    this.query = this.query.find(JSON.parse(queryStr)); // again convert into 'object'

    //  'this.query' -> Product.find() -> 🚗 from URL
    // this.query = this.query.find(queryCopy);
    return this;
  }

  //  🥇 here build  api ka pagination features
  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1; // 'this.queryStr.page' -> fetch number of page from url if user provided,  otherwise default page: 1

    //  How many products we should to skeep to display result => Ex.- if we've 50 products and we display 10-products/page -> and users req. to display 5th product then we don't skeep any product and display result in 1st page
    //  but, if user's req. to display 16th product, then we''ve to skeep 10-product and result display from 11th product in 2nd page

    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip); // 'this.query' -> Product.find()

    return this;
  }
}

module.exports = ApiFeatures;
