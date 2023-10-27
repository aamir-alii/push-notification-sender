const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

const multer = require("multer");
require("dotenv").config();
const admin = require("firebase-admin");

const multerStorage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, "server-config.json");
  },
  destination: (req, file, cb) => {
    let folderPath = path.join(__dirname);
    cb(null, folderPath);
  },
});

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

async function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) console.log(err);
  });
}

app.post("/send-token", upload, async (req, res) => {
  try {
    let tokens = req.body.tokens;

    if (!tokens?.length) {
      deleteFile(filePath);
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
    let appName = `app-${Date.now()}`;
    let filePath = path.join(__dirname) + "/" + req.file.filename;
    const serviceAccount = require(filePath);
    let customApp = admin.initializeApp(
      {
        credential: admin.credential.cert(serviceAccount),
      },
      appName
    );
    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
      console.log(token);
      if (!token?.length <= 0) continue;
      try {
        await customApp.messaging().send({
          token,
          data: {
            roomId: "1" ?? "",
            alarmId: "1" ?? "",
            alarmSound: "sound1" ?? "",
            severity: "1" ?? "",
            roomData: "",
          },
          notification: {
            title: "Dummy Title",
            body: "Dummy body",
          },
          android: {
            notification: {
              channel_id: `360alerts${"sound1"}${1}`,
            },
          },
          apns: {
            payload: {
              aps: {
                sound: "smsmedium.mp3", // Replace with your custom sound file name (iOS)
              },
            },
          },
        });
        console.log("Sent successfully");
        console.log("Sent successfully");
        console.log("Sent successfully");
        console.log("Sent successfully");
      } catch (error) {
        deleteFile(filePath);
        console.log("Got error while sending notification");
        console.log("Got error while sending notification");
        return res.status(500).json({
          status: false,
          message: error.message,
          error,
        });
        console.log(error);
      }
    }
    customApp.delete();
    deleteFile(filePath);
    res.status(200).json({
      status: true,
      message: "Notification send successfully",
    });
  } catch (err) {
    deleteFile(filePath);
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
