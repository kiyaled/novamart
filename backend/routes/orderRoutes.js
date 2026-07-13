const express = require("express");
const router = express.Router();
const axios = require("axios");
const https = require("https");
const Order = require("../models/Order");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Disable keep-alive so serverless cold/frozen connections don't cause
// "socket disconnected before secure TLS connection was established"
const noKeepAliveAgent = new https.Agent({ keepAlive: false });

async function sendTelegramNotification(order) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log("Telegram not configured — skipping notification.");
    return;
  }

  const itemsList = order.items
    .map(i => `  • ${i.name} ×${i.qty} — ETB ${(Number(i.price) * (i.qty || 1)).toLocaleString()}`)
    .join("\n");

  const message =
    `🛒 *New Order!*\n\n` +
    `👤 *Name:* ${order.customer.name}\n` +
    `📞 *Phone:* ${order.customer.phone}\n` +
    `🏘️ *Block:* ${order.customer.block}\n\n` +
    `📦 *Items:*\n${itemsList}\n\n` +
    `💰 *Total: ETB ${Number(order.totalPrice).toLocaleString()}*\n` +
    `🆔 Order ID: ${order._id}`;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: "Markdown",
  };

  // Try up to 2 times in case of a transient connection issue
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await axios.post(url, payload, {
        httpsAgent: noKeepAliveAgent,
        timeout: 8000,
      });
      console.log("Telegram notification sent.");
      return;
    } catch (err) {
      console.error(`Telegram notification failed (attempt ${attempt}):`, err.response?.data || err.message);
      if (attempt === 2) return;
    }
  }
}

// POST /api/orders — customer places an order
router.post("/", async (req, res) => {
  try {
    const { customer, items, totalPrice } = req.body;

    if (!customer?.name || !customer?.phone || !customer?.block) {
      return res.status(400).json({ error: "All customer fields are required." });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Order must have at least one item." });
    }

    const order = new Order({ customer, items, totalPrice });
    await order.save();

    // Wait for the Telegram send to finish — Vercel can freeze the function
    // right after res.json() runs, killing any unfinished background work.
    await sendTelegramNotification(order);

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
