const express = require("express");
const router = express.Router();
const authJwt = require("../middlewares/authMiddleware");
const { Users, Boats } = require("../models");

// 1.
