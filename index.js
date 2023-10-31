const express = require("express");
const app = express();

const multer = require("multer");
require("dotenv").config();
const admin = require("firebase-admin");

const multerStorage = multer.memoryStorage();

const multerUpload = multer({
  storage: multerStorage,
  fileFilter: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    if (ext === "json") {
      return cb(null, true);
    }
    cb("file must be of type json", false);
  },
});

const upload = multerUpload.single("file");

app.post("/send-token", upload, async (req, res) => {
  try {
    let { tokens, data } = req.body;
    if (!tokens?.length) {
      return res.status(400).json({
        status: false,
        messsage: "Please provide tokens",
      });
    }
    if (!req.file) {
      return res.status(400).json({
        status: false,
        messsage: "Please provide serviceAccountKey file",
      });
    }
    let file = req.file;
    let appName = `app-${Date.now()}`;
    const serviceAccount = JSON.parse(file.buffer.toString("utf-8"));

    let customApp = admin.initializeApp(
      {
        credential: admin.credential.cert(serviceAccount),
      },
      appName
    );
    data = JSON.parse(data);
    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
      if (token?.length <= 0) {
        continue;
      }
      try {
        data.token = token;
        console.log(data);
        await customApp.messaging().send(data);
        console.log("Sent successfully");
        console.log("Sent successfully");
        console.log("Sent successfully");
        console.log("Sent successfully");
      } catch (error) {
        console.log("error token", tokens);
        console.log("Got error while sending notification");
        console.log("Got error while sending notification");
        console.log(error);
        return res.status(400).json({
          status: false,
          message: error.message,
          error,
        });
      }
    }
    customApp.delete();
    res.status(200).json({
      status: true,
      message: "Notification send successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message,
      error: err,
    });
  }
});

app.use("/", (req, res) => {
  res.send("Api Running...");
});
app.listen(process.env.PORT, () => {
  console.log("Server listening on port " + process.env.PORT);
});
