const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subTags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);