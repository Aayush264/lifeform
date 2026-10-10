const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const { Ollama } = require("ollama");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;

// ==============================
// MONGODB
// ==============================

const mongoClient = new MongoClient(
  "mongodb://localhost:27017"
);

let db;
let playersCollection;

// ==============================
// OLLAMA
// ==============================

const ollama = new Ollama({
  host: "http://127.0.0.1:11434"
});

// ==============================
// MIDDLEWARE
// ==============================

app.use(express.json());

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

// ==============================
// UPLOADS
// ==============================

const uploadFolder = path.join(
  __dirname,
  "uploads"
);

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const uniqueName =
      `${Date.now()}-${crypto.randomUUID()}${extension}`;

    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    if (
      file.mimetype &&
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only image files are allowed."
        )
      );
    }
  }
});

app.use(
  "/uploads",
  express.static(uploadFolder)
);

// ==============================
// PLAYER API
// ==============================

app.get(
  "/api/player/:playerId",
  async (req, res) => {
    try {
      const playerId =
        String(req.params.playerId).trim();

      if (!playerId) {
        return res.status(400).json({
          error: "Player ID is required."
        });
      }

      const player =
        await playersCollection.findOne({
          playerId
        });

      if (!player) {
        return res.json({
          exists: false,
          player: null
        });
      }

      res.json({
        exists: true,

        player: {
          playerId: player.playerId,
          xp: player.xp || 0,

          collection:
            Array.isArray(player.collection)
              ? player.collection
              : [],

          streak: player.streak || 0,

          lastDiscoveryDate:
            player.lastDiscoveryDate || "",

          mission:
            player.mission || {
              date: null,
              index: 0,
              completed: false
            },

          createdAt:
            player.createdAt || null,

          updatedAt:
            player.updatedAt || null
        }
      });

    } catch (error) {
      console.error(
        "MongoDB player load error:",
        error
      );

      res.status(500).json({
        error:
          "Could not load player data.",
        details: error.message
      });
    }
  }
);

app.put(
  "/api/player/:playerId",
  async (req, res) => {
    try {
      const playerId =
        String(req.params.playerId).trim();

      if (!playerId) {
        return res.status(400).json({
          error: "Player ID is required."
        });
      }

      const body = req.body || {};

      const xp =
        Number.isFinite(Number(body.xp))
          ? Number(body.xp)
          : 0;

      const collection =
        Array.isArray(body.collection)
          ? body.collection
          : [];

      const streak =
        Number.isFinite(Number(body.streak))
          ? Number(body.streak)
          : 0;

      const lastDiscoveryDate =
        typeof body.lastDiscoveryDate === "string"
          ? body.lastDiscoveryDate
          : "";

      const mission =
        body.mission &&
        typeof body.mission === "object"
          ? {
              date:
                body.mission.date || null,

              index:
                Number.isInteger(
                  Number(body.mission.index)
                )
                  ? Number(body.mission.index)
                  : 0,

              completed:
                body.mission.completed === true
            }
          : {
              date: null,
              index: 0,
              completed: false
            };

      const now = new Date();

      await playersCollection.updateOne(
        { playerId },

        {
          $set: {
            playerId,
            xp,
            collection,
            streak,
            lastDiscoveryDate,
            mission,
            updatedAt: now
          },

          $setOnInsert: {
            createdAt: now
          }
        },

        {
          upsert: true
        }
      );

      res.json({
        success: true,

        player: {
          playerId,
          xp,
          collection,
          streak,
          lastDiscoveryDate,
          mission,
          updatedAt: now
        }
      });

    } catch (error) {
      console.error(
        "MongoDB player save error:",
        error
      );

      res.status(500).json({
        error:
          "Could not save player data.",
        details: error.message
      });
    }
  }
);

// ==============================
// TEST AI
// ==============================

app.get(
  "/api/test-ai",
  async (req, res) => {
    try {
      const response =
        await ollama.chat({
          model: "gemma3:4b",

          messages: [
            {
              role: "user",
              content:
                "Say hello to Lifeform in one short sentence."
            }
          ]
        });

      res.json({
        result:
          response.message.content
      });

    } catch (error) {
      console.error(
        "Ollama error:",
        error
      );

      res.status(500).json({
        error:
          "Could not connect to Ollama.",
        details: error.message
      });
    }
  }
);

// ==============================
// ANALYZE IMAGE
// ==============================

app.post(
  "/api/analyze",
  upload.single("image"),

  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error:
            "No image was uploaded."
        });
      }

      console.log(
        "Image received:",
        req.file.filename
      );

      const response =
        await ollama.chat({
          model: "gemma3:4b",

          messages: [
            {
              role: "user",

              content: `
You are the AI naturalist for a game called Lifeform.

Look carefully at the uploaded image and identify the lifeform if possible.

Return your answer in exactly this format:

Name: [common name]
Type: [plant, bird, insect, fungus, animal, or other]
Confidence: [high, medium, or low]

Description:
[2-3 simple sentences about what is visible and interesting about it]

Do not invent details that cannot be seen in the image.
              `,

              images: [
                req.file.path
              ]
            }
          ]
        });

      const imageUrl =
        `/uploads/${req.file.filename}`;

      res.json({
        result:
          response.message.content,

        imageUrl
      });

    } catch (error) {
      console.error(
        "Image analysis error:",
        error
      );

      if (req.file) {
        fs.unlink(
          req.file.path,
          () => {}
        );
      }

      res.status(500).json({
        error:
          "Could not analyze the image.",
        details: error.message
      });
    }
  }
);

// ==============================
// ERROR HANDLER
// ==============================

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      return res.status(400).json({
        error: error.message
      });
    }

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    next();
  }
);

// ==============================
// START SERVER
// ==============================

async function startServer() {
  try {
    await mongoClient.connect();

    db =
      mongoClient.db("lifeform");

    playersCollection =
      db.collection("players");

    await playersCollection.createIndex(
      { playerId: 1 },
      { unique: true }
    );

    console.log(
      "MongoDB connected successfully."
    );

    console.log(
      "Database: lifeform"
    );

    console.log(
      "Collection: players"
    );

    app.listen(
      PORT,
      () => {
        console.log(
          `Lifeform is running at http://localhost:${PORT}`
        );
      }
    );

  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error
    );

    process.exit(1);
  }
}

startServer();