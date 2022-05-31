module.exports = (theFunc) => (req, res, next) => {
  //  'Promise' -> is ajs predefined class
  Promise.resolve(theFunc(req, res, next)).catch(next);
};
