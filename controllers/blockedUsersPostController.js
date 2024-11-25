// Import the Blocked User and Subscriber Models using ES6 import syntax
import BlockedUser from "../models/BlockedUserModel.js"; // Adjust the path as necessary
import Subscriber from "../models/SubscriberModel.js"; // Adjust the path as necessary

// Define the controller
const blockedUsersPostController = (req, res) => {
    const { userid, username } = req.body; // Destructure to get userid and username

    Subscriber.findOneAndDelete({ userid: userid })
        .then((data) => {
            const Blocked = new BlockedUser({
                userid: userid,
                username: username,
            });

            Blocked.save()
                .then((data) => {
                    res.status(200).json({
                        data: data, // Fixed typo from "dsta" to "data"
                        message: "User blocked successfully",
                    });
                })
                .catch((error) => {
                    console.log("Error: ", error.message);
                    res.status(401).json({
                        message: "Error blocking user",
                    });
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
export default blockedUsersPostController;
