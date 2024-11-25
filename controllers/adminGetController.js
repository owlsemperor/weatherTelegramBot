// Import Admin Model using ES6 import syntax
import Admin from "../models/AdminModel.js"; // Ensure the path is correct

// Define the controller
const adminController = (req, res) => {
    Admin.find({})
        .then((data) => {
            res.json(data);
        })
        .catch((error) => {
            console.log("Error: ", error.message);
            res.status(500).json({ message: "Error fetching data" });
        });
};

// Export the controller using ES6 export syntax
export default adminController;
