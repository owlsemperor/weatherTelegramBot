import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

// Load environment variables from .env file
dotenv.config();

// Set up Express app
const app = express();

// Set up middleware
app.use(cors());
app.use(bodyParser.json());

// Function to connect to MongoDB
const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB successfully!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1); // Exit process on failure to connect
    }
};

// Function to configure Express server
const configureServer = (port) => {
    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
};

// Export the configured functions
export { app, connectToDatabase, configureServer };
