const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("Upload request received");
    console.log("File:", req.file ? `${req.file.originalname} (${req.file.size} bytes)` : "NO FILE");

    if (!req.file) {
      return res.status(400).json({ error: "No image file received" });
    }

    console.log("Converting to base64...");
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    console.log("Uploading to Cloudinary...");
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "novamart-products",
      transformation: [
        { width: 600, height: 600, crop: "limit", quality: "auto" }
      ],
    });

    console.log("Upload success:", result.secure_url);
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("Upload error details:", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

module.exports = router;