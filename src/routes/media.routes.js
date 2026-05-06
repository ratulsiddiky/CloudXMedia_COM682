import express from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import { uploadToBlob, deleteFromBlob } from "../azure/blob.js";
import { getCosmosContainer } from "../azure/cosmos.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || "student-123";

function getUserId(req) {
  return req.body.userId || req.query.userId || DEFAULT_USER_ID;
}

// CREATE: upload file -> blob -> cosmos metadata
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const title = (req.body.title || "").trim();
    const userId = getUserId(req);
    const file = req.file;

    if (!title) return res.status(400).json({ ok: false, error: "title is required" });
    if (!file) return res.status(400).json({ ok: false, error: "file is required" });

    const id = nanoid();
    const safeName = file.originalname.replace(/[^\w.\-]/g, "_");
    const blobName = `${userId}/${id}-${safeName}`;

    const { blobUrl } = await uploadToBlob({
      buffer: file.buffer,
      blobName,
      contentType: file.mimetype
    });

    const doc = {
      id,
      userId,               // partition key
      title,
      blobUrl,
      blobName,
      fileName: file.originalname,
      contentType: file.mimetype,
      size: file.size,
      createdAt: new Date().toISOString()
    };

    const container = getCosmosContainer();
    await container.items.create(doc);

    res.json({ ok: true, item: doc });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// READ ALL (by userId)
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId || DEFAULT_USER_ID;
    const container = getCosmosContainer();

    const querySpec = {
      query: "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC",
      parameters: [{ name: "@userId", value: userId }]
    };

    const { resources } = await container.items.query(querySpec).fetchAll();
    res.json({ ok: true, items: resources });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// READ ONE
router.get("/:id", async (req, res) => {
  try {
    const userId = req.query.userId || DEFAULT_USER_ID;
    const { id } = req.params;

    const container = getCosmosContainer();
    const { resource } = await container.item(id, userId).read();
    if (!resource) return res.status(404).json({ ok: false, error: "Not found" });

    res.json({ ok: true, item: resource });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// DELETE (good for top marks)
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.query.userId || DEFAULT_USER_ID;
    const { id } = req.params;

    const container = getCosmosContainer();
    const { resource } = await container.item(id, userId).read();
    if (!resource) return res.status(404).json({ ok: false, error: "Not found" });

    await container.item(id, userId).delete();
    if (resource.blobName) await deleteFromBlob(resource.blobName);

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;