// Import the Usage Model using ES6 import syntax
import Usage from "../models/UsageModel.js"; // Ensure the path is correct

// Define the controller
const usageController = (req, res) => {
    Usage.find({})
        .then((data) => {
            res.json(data);
        })
        .catch((error) => {
            console.log("Error: ", error.message);
            res.status(500).json({ message: "Error fetching usage data" });
        });
};

// Export the controller using ES6 export syntax
export default usageController;
