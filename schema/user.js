"use strict";

const mongoose = require("mongoose");

//Define the Mongoose Schema for a User Favorite.
const favoriteSchema = new mongoose.Schema({
  file_name: { type: String },
  date_time: { type: Date, default: Date.now },
});

/**
 * Define the Mongoose Schema for a user.
 */
const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  location: String,
  description: String,
  occupation: String,
  login_name: String,
  password: String,
  favorites: [favoriteSchema],
});

/**
 * Create a Mongoose Model for a User using the userSchema.
 */
const User = mongoose.model("User", userSchema);

/**
 * Make this available to our application.
 */
module.exports = User;
