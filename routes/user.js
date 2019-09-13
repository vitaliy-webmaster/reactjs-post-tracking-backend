const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = mongoose.model("users");

router.get("/", (req, res, next) => {
  res.json({ message: "Main Page Response" });
});

router.get("/profile", (req, res, next) => {
  res.json({
    userProfile: {
      userType: req.user.userType,
      email: req.user.email,
      googleEmail: req.user.googleEmail,
      facebookEmail: req.user.facebookEmail,
      twitterEmail: req.user.twitterEmail,
      name: req.user.name,
      favouritesSaveTimestamp: req.user.favouritesSaveTimestamp
    }
  });
});

router.post("/save_favourites_list", (req, res) => {
  const userID = req.user.id;
  User.findByIdAndUpdate(userID, {
    favouritesList: req.body.favList,
    favouritesSaveTimestamp: req.body.favouritesSaveTimestamp
  })
    .then(user => {
      console.log(user);
      return res.status(200).json({
        type: "success",
        message: "Your Favourites successfully stored in account!"
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(400).json({
        type: "error",
        errorType: "server",
        message: "Server: Internal Error"
      });
    });
});

router.get("/get_favourites_list", (req, res) => {
  const userID = req.user.id;
  User.findById(userID)
    .then(user => {
      return res.status(200).json({
        type: "success",
        favList: user.favouritesList
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(400).json({
        type: "error",
        errorType: "server",
        message: "Server: Internal Error"
      });
    });
});

module.exports = router;
