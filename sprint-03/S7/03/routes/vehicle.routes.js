const express = require("express");
const router = express.Router();
const controller = require("../controllers/vehicle.controller");

// Vehicle CRUD
router.post("/vehicle", controller.createVehicle);
router.get("/vehicle", controller.getAllVehicles);
router.put("/vehicle/:id", controller.updateVehicle);
router.delete("/vehicle/:id", controller.deleteVehicle);

// Trip operations
router.post("/vehicle/:id/trip", controller.addTrip);
router.put("/vehicle/:id/trip/:tripId", controller.updateTrip);
router.delete("/vehicle/:id/trip/:tripId", controller.deleteTrip);

// Advanced queries
router.get("/query/long-trips", controller.tripsOver200km);
router.get("/query/from-cities", controller.tripsFromCities);
router.get("/query/after-2024", controller.tripsAfterDate);
router.get("/query/car-or-truck", controller.getCarsOrTrucks);

// Bonus
router.get("/vehicle/:id/total-distance", controller.getTotalDistance);

module.exports = router;
