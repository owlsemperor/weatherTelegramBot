// StatModel.js (ES6 Module Syntax)
import mongoose from "mongoose";

// Define the schema for the Stat model
const statSchema = new mongoose.Schema({
    username: {
        type: String,
        // required: true,  // Uncomment if username is required
    },
    userid: {
        type: Number,
        required: true,
        unique: [true, "User already exists"],
    },
    count: {
        type: Number,
        required: true,
        default: 0,
    },
});

// Create the Stat model
const Stat = mongoose.model("Stat", statSchema);

// Export the Stat model using default export
export default Stat;
