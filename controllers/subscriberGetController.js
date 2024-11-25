// Import the Subscriber Model using ES6 import syntax
import Subscriber from "../models/SubscriberModel.js"; // Ensure the path is correct

// Define the controller
const subscriberController = (req, res) => {
    Subscriber.find({})
        .then((data) => {
            res.json(data);
        })
        .catch((error) => {
            console.log("Error: ", error.message);
            res.status(500).json({ message: "Error fetching subscribers" });
        });
};

// Export the controller using ES6 export syntax
export default subscriberController;
