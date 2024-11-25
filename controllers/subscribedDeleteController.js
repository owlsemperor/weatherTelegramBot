// Import the Subscriber Model using ES6 import syntax
import Subscriber from "../models/SubscriberModel.js"; // Ensure the path is correct

// Define the controller
const subscriberDeleteController = (req, res) => {
    const { userid } = req.body; // Destructure to get userid from request body

    Subscriber.findOneAndDelete({ userid: userid })
        .then((data) => {
            console.log(data);
            res.status(200).json({
                data: data,
                message: "User unsubscribed successfully",
            });
        })
        .catch((error) => {
            console.log("Error: ", error.message);
            res.status(401).json({
                message: "Error unsubscribing user",
            });
        });
};

// Export the controller using ES6 export syntax
export default subscriberDeleteController;
