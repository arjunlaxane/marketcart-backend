const Order = require('../models/orderModel.js');
const Product = require('../models/productModel.js');

// Create new Order
exports.newOrder = async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  let order;
  try {
    order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: req.user._id,
    });
  } catch (err) {
    return console.log('error', err);
  }
  res.status(201).json({
    success: true,
    order,
  });
};

// get Single Order
exports.getSingleOrder = async (req, res, next) => {
  let order;
  try {
    order = await Order.findById(req.params.id).populate('user', 'name email');
  } catch (err) {
    return console.log('error>>>', err);
  }

  if (!order) {
    return res.status(404).json({ message: 'Order not found with this Id' });
  }

  res.status(200).json({
    success: true,
    order,
  });
};

// get logged in user Orders
exports.myOrders = async (req, res, next) => {
  let orders;
  try {
    orders = await Order.find({ user: req.user._id });
  } catch (err) {
    return console.log('error', err);
  }

  res.status(200).json({
    success: true,
    orders,
  });
};

// get all Orders -- Admin
exports.getAllOrders = async (req, res, next) => {
  let orders;
  let totalAmount;

  try {
    orders = await Order.find();
    totalAmount = 0;

    orders.forEach(order => {
      totalAmount += order.totalPrice;
    });
  } catch (err) {
    return console.log('error', err);
  }
  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
};

// update Order Status -- Admin
exports.updateOrder = async (req, res, next) => {
  let order;
  try {
    order = await Order.findById(req.params.id);
  } catch (err) {
    return console.log('error>>>', err);
  }
  if (!order) {
    return res.status(404).json({ message: 'Order not found with this Id' });
  }

  try {
    if (order.orderStatus === 'Delivered') {
      return res
        .status(400)
        .json({ message: 'You have already delivered this order' });
    }

    if (req.body.status === 'Shipped') {
      order.orderItems.forEach(async ord => {
        await updateStock(ord.product, ord.quantity);
      });
    }
    order.orderStatus = req.body.status;

    if (req.body.status === 'Delivered') {
      order.deliveredAt = Date.now();
    }
  } catch (err) {
    return console.log('error>>>', err);
  }
  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
};

async function updateStock(id, quantity) {
  try {
    const product = await Product.findById(id);

    product.Stock -= quantity;

    await product.save({ validateBeforeSave: false });
  } catch (err) {
    return console.log('error>>>', err);
  }
}
// delete Order -- Admin
exports.deleteOrder = async (req, res, next) => {
  let order;

  try {
    order = await Order.findById(req.params.id);
  } catch (err) {
    return console.log('error>>>', err);
  }
  if (!order) {
    return res.status(404).json({ message: 'Order not found with this Id' });
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
};
