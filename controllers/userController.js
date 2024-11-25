// Import the User model using ES6 import syntax
import User from "../models/UserModel.js"; // Ensure the path is correct

// Define the controller
const userController = (req, res) => {
    User.find({})
        .then((data) => {
            res.json(data);
        })
        .catch((error) => {
            console.log("Error: ", error.message);
            res.status(500).json({ message: "Error fetching user data" });
        });
};

// Export the controller using ES6 export syntax
export default userController;
