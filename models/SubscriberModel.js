// Import mongoose using ES6 syntax
import mongoose from "mongoose";

// Define the schema for the subscriber model
const subscriberSchema = new mongoose.Schema({
    username: {
        type: String,
        // required: true,
    },
    userid: {
        type: Number,
        required: true,
        unique: [true, "User already exists"],
    },
    city: {
        type: String,
        // required: true,
    },
    time: {
        type: Date,
        default: Date.now,
    },
});

// Create the subscriber model
const Subscriber = mongoose.model("Subscriber", subscriberSchema);

// Export the subscriber model as the default export
export default Subscriber;
