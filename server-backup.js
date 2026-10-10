const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const { Ollama } = require("ollama");

const app = express();
const PORT = 3000;

/* -----------------------------------------
   OLLAMA
----------------------------------------- */

const ollama = new Ollama({
  host: "http://127.0.0.1:11434"
});


/* -----------------------------------------
   FOLDERS
----------------------------------------- */

const uploadFolder =
  path.join(__dirname, "uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}


/* -----------------------------------------
   MULTER IMAGE UPLOAD
----------------------------------------- */

const storage =
  multer.diskStorage({

    destination: (
      req,
      file,
      cb
    ) => {

      cb(
        null,
        uploadFolder
      );

    },

    filename: (
      req,
      file,
      cb
    ) => {

      const extension =
        path.extname(
          file.originalname
        ).toLowerCase();

      const uniqueName =
        `${Date.now()}-${crypto.randomUUID()}${extension}`;

      cb(
        null,
        uniqueName
      );

    }

  });


const upload =
  multer({

    storage: storage,

    limits: {
      fileSize: 10 * 1024 * 1024
    },

    fileFilter: (
      req,
      file,
      cb
    ) => {

      if (
        file.mimetype &&
        file.mimetype.startsWith("image/")
      ) {

        cb(
          null,
          true
        );

      } else {

        cb(
          new Error(
            "Only image files are allowed."
          )
        );

      }

    }

  });


/* -----------------------------------------
   SERVE WEBSITE
----------------------------------------- */

app.use(
  express.static(
    path.join(
      __dirname,
      "public"
    )
  )
);


/* -----------------------------------------
   SERVE SAVED DISCOVERY PHOTOS
----------------------------------------- */

app.use(
  "/uploads",
  express.static(
    uploadFolder
  )
);


/* -----------------------------------------
   TEST AI
----------------------------------------- */

app.get(
  "/api/test-ai",
  async (
    req,
    res
  ) => {

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

    }

    catch (error) {

      console.error(
        "Ollama error:",
        error
      );

      res.status(500).json({

        error:
          "Could not connect to Ollama.",

        details:
          error.message

      });

    }

  }
);


/* -----------------------------------------
   ANALYZE LIFEFORM
----------------------------------------- */

app.post(
  "/api/analyze",
  upload.single("image"),
  async (
    req,
    res
  ) => {

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


      /*
      IMPORTANT:
      We keep the file so the photo
      can appear in the collection.
      */

      const imageUrl =
        `/uploads/${req.file.filename}`;


      res.json({

        result:
          response.message.content,

        imageUrl:
          imageUrl

      });

    }

    catch (error) {

      console.error(
        "Image analysis error:",
        error
      );


      /*
      If something fails after upload,
      remove the unused image.
      */

      if (req.file) {

        fs.unlink(
          req.file.path,
          () => {}
        );

      }


      res.status(500).json({

        error:
          "Could not analyze the image.",

        details:
          error.message

      });

    }

  }
);


/* -----------------------------------------
   UPLOAD ERROR HANDLER
----------------------------------------- */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {

    if (
      error instanceof multer.MulterError
    ) {

      return res.status(400).json({

        error:
          error.message

      });

    }


    if (error) {

      return res.status(400).json({

        error:
          error.message

      });

    }


    next();

  }
);


/* -----------------------------------------
   START SERVER
----------------------------------------- */

app.listen(
  PORT,
  () => {

    console.log(
      `Lifeform is running at http://localhost:${PORT}`
    );

  }
);