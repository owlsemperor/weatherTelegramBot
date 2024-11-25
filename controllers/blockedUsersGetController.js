// Import the Blocked User Model using ES6 import syntax
import BlockedUser from "../models/BlockedUserModel.js"; // Make sure the path is correct

// Define the controller
const blockedUsersGetController = (req, res) => {
    BlockedUser.find({})
        .then((data) => {
            res.json(data);
        })
        .catch((error) => {
            console.log("Error: ", error.message);
            res.status(500).json({ message: "Error fetching blocked users" });
        });
};

// Export the controller using ES6 export syntax
export default blockedUsersGetController;
