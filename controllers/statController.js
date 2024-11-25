// Import Stat Model using ES6 syntax
import Stat from "../models/StatModel.js"; // Ensure the path is correct

// Define the controller
const statController = (req, res) => {
    Stat.find({})
        .then((data) => {
            res.json(data);
        })
        .catch((error) => {
            console.log("Error: ", error.message);
            res.status(500).json({ message: "Error fetching data" });
        });
};

// Export the controller using ES6 export syntax
export default statController;
