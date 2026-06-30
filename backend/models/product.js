const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String
  },
  description: {
    type: String
  },
  stock: {
    type: Number,
    default: 0
  },
  image: {
    type: String
  },
  discount: {
    type: Number,
    default: 0, // percentage, e.g. 20 means 20% off
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Product", productSchema);