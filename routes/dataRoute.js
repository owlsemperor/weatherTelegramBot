// Import and Initialize express router using ES6 syntax
import express from "express";
import userController from "../controllers/userController.js";
import subscriberGetController from "../controllers/subscriberGetController.js";
import statController from "../controllers/statController.js";
import usageController from "../controllers/usageController.js";
import adminGetController from "../controllers/adminGetController.js";
import adminPostController from "../controllers/adminPostController.js";
import botKeyController from "../controllers/botKeyController.js";
import blockedUsersGetController from "../controllers/blockedUsersGetController.js";
import blockedUsersPostController from "../controllers/blockedUsersPostController.js";
import blockedUsersDeleteController from "../controllers/blockedUsersDeleteController.js";
import subscriberDeleteController from "../controllers/subscribedDeleteController.js";

const router = express.Router();

// GET route for the homepage
router.get("/", (req, res) => {
    res.send("Hi from Rajesh!");
});

// GET route for the Users Data
router.get("/users", userController);

// Get route for the Subscribers Data
router.get("/subscribers", subscriberGetController);

// Delete route for the Subscribers Data
router.delete("/subscribers", subscriberDeleteController);

// Get route for the Stats Data
router.get("/stats", statController);

// Get route for the Usage Data
router.get("/usage", usageController);

// Get route for the Admin data
router.get("/admin/all", adminGetController);

// Post route for the Admin Authentication
router.post("/admin/auth", adminPostController);

// Put route for the BotKey Update
router.put("/admin/botkey", botKeyController);

// Get route for the Blocked Users Data
router.get("/admin/blocked", blockedUsersGetController);

// Post route for the Blocked Users Data
router.post("/admin/blocked", blockedUsersPostController);

// Delete route for the Blocked Users Data
router.delete("/admin/blocked", blockedUsersDeleteController);

// Export the router using ES6 export syntax
export default router;
