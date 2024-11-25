// Import mongoose using ES6 syntax
import mongoose from "mongoose";

// Define the schema for the usage model
const usageSchema = new mongoose.Schema({
    username: {
        type: String,
        // required: true, // Uncomment if username is required
    },
    userid: {
        type: Number,
        required: true,
    },
    time: {
        type: Date,
        default: Date.now,
    },
});

// Create the usage model
const Usage = mongoose.model("Usage", usageSchema);

// Export the usage model as the default export
export default Usage;
