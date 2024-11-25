// Import the BotKey Model using ES6 import syntax
import BotKey from "../models/BotKeyModel.js"; // Ensure the path is correct

// Define the controller
const botKeyController = (req, res) => {
    const { botkey } = req.body; // Destructure to get the botkey from the request body

    BotKey.findOneAndUpdate(
        {},
        { $set: { key: botkey } },
        { upsert: true, new: true }
    )
        .then((data) => {
            res.status(200).json({
                message: "Bot key updated successfully",
                data: data,
            });
        })
        .catch((error) => {
            console.log("Error: ", error.message);
            res.status(500).json({ message: "Error updating bot key" });
        });
};

// Export the controller using ES6 export syntax
export default botKeyController;
