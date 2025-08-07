const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");

router.post("/add-user", controller.addUser);
router.post("/add-profile", controller.addProfile);
router.get("/profiles", controller.getAllProfiles);

module.exports = router;
