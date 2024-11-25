// Import the Blocked User Model using ES6 import syntax
import BlockedUser from "../models/BlockedUserModel.js"; // Adjust the path as necessary

// Define the controller
const blockedUserDeleteController = (req, res) => {
    const userid = req.body.userid;
    BlockedUser.findOneAndDelete({ userid: userid })
        .then((data) => {
            res.json({
                data: data,
                message: "User unblocked successfully",
            });
        })
        .catch((error) => {
            console.log("Error: ", error.message);
            res.status(401).json({
                message: "Error unblocking user",
            });
        });
};

// Export the controller using ES6 export syntax
export default blockedUserDeleteController;
