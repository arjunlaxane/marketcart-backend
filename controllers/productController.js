const Product = require('../models/productModel');
var cloudinary = require('cloudinary').v2;

//create product-----admin
exports.createProduct = async (req, res, next) => {
  let images = [];
  try {
    if (typeof req.body.images == 'string') {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.uploader.upload(images[i], {
        folder: 'products',
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
    req.body.user = req.user.id;
  } catch (err) {
    console.log('error>>>', err);
  }
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
};

//get all product----admin

exports.getAdminProducts = async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
};

// Get Product Details
exports.getProductDetails = async (req, res, next) => {
  let product;
  try {
    product = await Product.findById(req.params.id);
  } catch (err) {
    return console.log('Error', err);
  }
  if (!product) {
    return res.status(404).json({
      message: 'Product not found',
    });
  }

  res.status(200).json({
    success: true,
    product,
  });
};

// Update Product -- Admin

exports.updateProduct = async (req, res, next) => {
  let product;

  try {
    product = await Product.findById(req.params.id);
  } catch (err) {
    return console.log('error>>>', err);
  }

  if (!product) {
    return res.status(404).json({
      message: 'Product not found',
    });
  }

  // Images Start Here
  let images;
  try {
    images = [];

    if (typeof req.body.images === 'string') {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    if (images !== undefined) {
      // Deleting Images From Cloudinary
      for (let i = 0; i < product.images.length; i++) {
        await cloudinary.uploader.destroy(product.images[i].public_id);
      }

      const imagesLinks = [];

      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.uploader.upload(images[i], {
          folder: 'products',
        });

        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }

      req.body.images = imagesLinks;
    }
  } catch (err) {
    console.log('error>>>', err);
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
};

//delete product ----admin

exports.deleteProduct = async (req, res, next) => {
  let product;

  try {
    product = await Product.findById(req.params.id);
  } catch (err) {
    console.log('error>>>', err);
  }

  if (!product) {
    return res.status(404).json({
      message: 'Product not found',
    });
  }

  // Deleting Images From Cloudinary

  try {
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.uploader.destroy(product.images[i].public_id);
    }

    await product.remove();
  } catch (err) {
    console.log('error', err);
  }
  res.status(200).json({
    success: true,
    message: 'Product Delete Successfully',
  });
};

//create and update product

exports.createProductReview = async (req, res, next) => {
  try {
    const { rating, comment, productId } = req.body;

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    let product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
      rev => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
      product.reviews.forEach(rev => {
        if (rev.user.toString() === req.user._id.toString())
          (rev.rating = rating), (rev.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach(rev => {
      avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });
  } catch (err) {
    return console.log('Error>>>>', err);
  }
  res.status(200).json({
    success: true,
  });
};

//get all product review

exports.getAllReview = async (req, res, next) => {
  let product;
  try {
    product = await Product.findById(req.query.id);
  } catch (error) {
    res.status(400).send(error.message);
  }

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
};
