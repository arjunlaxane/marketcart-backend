const mongoose = require('mongoose');

//here we need to put inside productschema, what we want in product

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Enter Product Name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please Enter product description'],
  },
  price: {
    type: Number,
    required: [true, 'Please Enter product price'],
    maxLength: [8, 'Price cannot exceed 8 characters'],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, 'Please enter product category'],
  },

  Stock: {
    type: Number,
    required: [true, 'Please Enter product stock'],
    maxLength: [4, 'Stock cannot exceed 4 character'],
    default: 1,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },

  createAt: {
    type: Date,
    default: Date.now,
  },
});

//exporting product model

module.exports = mongoose.model('Product', productSchema);
