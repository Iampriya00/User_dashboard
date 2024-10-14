const express = require("express");
const mongoose = require("mongoose");
const path = require("path"); // Import the path module
const app = express();
const multer = require("multer");
const fs = require("fs");
const userModel = require("./models/user");
mongoose
  .connect("mongodb+srv://DB:admin123@clusterdb.5oifzk2.mongodb.net/users", {
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });
// Middleware setup
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });
// Route setup
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/read", async (req, res) => {
  let users = await userModel.find();
  res.render("read", { users });
});

app.post("/create", upload.single("image"), async (req, res, next) => {
  try {
    const obj = {
      name: req.body.name,
      email: req.body.email,
      image: {
        data: fs
          .readFileSync(path.join(__dirname + "/uploads/" + req.file.filename))
          .toString("base64"),
        contentType: req.file.mimetype,
      },
    };

    await userModel.create(obj);
    res.redirect("/read");
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/delete/:_id", async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.params._id);
    res.redirect("/read");
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/edit/:_id", async (req, res) => {
  try {
    let user = await userModel.findById(req.params._id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    res.render("edit", { user });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post("/update/:_id", upload.single("image"), async (req, res) => {
  try {
    let updateData = {
      name: req.body.name,
      email: req.body.email,
    };

    if (req.file) {
      updateData.image = {
        data: fs
          .readFileSync(path.join(__dirname + "/uploads/" + req.file.filename))
          .toString("base64"),
        contentType: req.file.mimetype,
      };
    }

    let user = await userModel.findByIdAndUpdate(req.params._id, updateData, {
      new: true,
    });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.redirect("/read");
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Start the server
const port = 3001;
app
  .listen(port, () => {
    console.log(`Server is running on port ${port}`);
  })
  .on("error", (err) => {
    console.error("Error starting the server", err);
  });
