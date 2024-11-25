// Import mongoose using ES6 syntax
import mongoose from "mongoose";

// Define the Schema for the BotKey model
const BotKeySchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
    },
});

// Create the BotKey model
const BotKey = mongoose.model("BotKey", BotKeySchema);

// Export the BotKey model using ES6 export
export default BotKey;
