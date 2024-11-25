// Import mongoose using ES6 syntax
import mongoose from "mongoose";

// Define the schema for the Admin model
const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: [true, "User already exists"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
});

// Create the Admin model
const Admin = mongoose.model("Admin", adminSchema);

// Export the Admin model using ES6 export
export default Admin;
