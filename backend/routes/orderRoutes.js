const express = require("express");
const router = express.Router();
const Order = require("../models/order");

// POST /api/orders — customer places an order
router.post("/", async (req, res) => {
  try {
    const { customer, items, totalPrice } = req.body;

    if (!customer?.name || !customer?.phone || !customer?.block || !customer?.houseNumber) {
      return res.status(400).json({ error: "All customer fields are required." });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Order must have at least one item." });
    }

    const order = new Order({ customer, items, totalPrice });
    await order.save();
    res.status(201).json({ success: true, orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders — admin sees all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/status — admin updates order status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;