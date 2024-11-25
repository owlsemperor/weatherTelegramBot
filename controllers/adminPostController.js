// Import Admin Model using ES6 import syntax
import Admin from "../models/AdminModel.js"; // Ensure the path is correct

// Define the controller
const adminController = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    Admin.find({ username: username })
        .then((data) => {
            if (data.length === 0 || data[0].password !== password) {
                res.status(401).json({ message: "Invalid" });
            } else {
                res.status(200).json({ message: "Success" });
            }
        })
        .catch((error) => {
            console.log("Error: ", error.message);
            res.status(500).json({ message: "Error" });
        });
};

// Export the controller using ES6 export syntax
export default adminController;
