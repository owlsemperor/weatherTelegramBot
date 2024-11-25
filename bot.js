import express from "express"; // Express.js for creating the server
import { Telegraf } from "telegraf"; // Telegraf for Telegram bot functionality
import axios from "axios"; // Axios for making HTTP requests
import mongoose from "mongoose"; // Mongoose for MongoDB interaction
import dotenv from "dotenv"; // Dotenv for loading environment variables
import cors from "cors"; // CORS middleware to enable cross-origin requests
import bodyParser from "body-parser"; // Body-parser for parsing JSON request bodies
import User from "./models/UserModel.js"; // User model for MongoDB user data
import Subscriber from "./models/SubscriberModel.js"; // Subscriber model (not used yet)
import Usage from "./models/UsageModel.js"; // Usage model (not used yet)
import Stat from "./models/StatModel.js"; // Stat model (not used yet)
import BlockedUser from "./models/BlockedUserModel.js"; // Blocked user model (not used yet)

import router from "./routes/dataRoute.js"; // Router for API routes
import cron from "node-cron"; // Cron for scheduling tasks

// Declare a flag to check if the server is listening
let isListening = false;

// Configure dotenv to load environment variables
dotenv.config();

// Load environment variables for bot token, weather API key, MongoDB URI, and server port
const BOT_TOKEN = process.env.BOT_TOKEN;
const weatherAPIKey = process.env.WEATHER_API_KEY;
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

// Establish connection to MongoDB
mongoose
    .connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to db!");
    })
    .catch((error) => {
        console.log("Error connecting to Database: ", error.message);
    });

// Initialize the Express application
const app = express();

// Configure CORS to allow cross-origin requests
app.use(cors());

// Configure body-parser to parse JSON request bodies
app.use(bodyParser.json());

// Enable Express to handle JSON data in request bodies
app.use(express.json());

// Set up the routes for the server using the imported router
app.use("/", router);

// Start the Express server on the specified port
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

// Create and configure the Telegram bot instance
const bot = new Telegraf(BOT_TOKEN);

// Handler for when a user starts the bot
bot.start((ctx) => {
    // Extract user details from the context
    const userId = ctx.from.id;
    const username = ctx.from.username;

    // Create a new user object and save it to the database
    const user = new User({
        username: username,
        userid: userId,
    });

    // Save the user and send a welcome message
    user.save()
        .then(() => {
            console.log("User saved to database!");
            ctx.reply(
                "Welcome to the Weather Update Bot! \nThis bot provides real-time weather information for any city of your choice. \n\nTo get started, tap /help to view the available commands."
            );
        })
        .catch((error) => {
            console.log("Error saving user to database:", error);
            ctx.reply(
                "Sorry, there was an error while saving your information."
            );
        });
});

// Handler for when the bot receives a location from the user
bot.hears(/location/i, async (ctx) => {
    const location = ctx.message.location; // Get the user's location from the message

    if (location) {
        try {
            // Use reverse geocoding to get the city name based on latitude and longitude
            const reverseRes = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}`
            );
            const city =
                reverseRes.data.address.city ||
                reverseRes.data.address.town ||
                reverseRes.data.address.village;

            if (city) {
                // Fetch weather data for the identified city
                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=your_api_key&units=metric`;
                const weatherRes = await axios.get(weatherUrl);
                const weatherData = weatherRes.data;

                // Send weather details to the user
                ctx.reply(
                    `The weather in ${city} is ${weatherData.weather[0].description} with a temperature of ${weatherData.main.temp}°C.`
                );
            }
        } catch (error) {
            console.error("Error fetching location or weather:", error);
            ctx.reply("Error retrieving weather data.");
        }
    }
});

// Handling "/subscribe" command
// Handle the "/subscribe" command for users to subscribe to weather updates
// bot.command("subscribe", (ctx) => {
//     // Extract user information from the context (userId and username)
//     const userId = ctx.from.id;
//     const username = ctx.from.username;

//     // Check if the user is already subscribed by searching for their userId in the Subscriber collection
//     Subscriber.findOne({ userid: userId }).then((subscriber) => {
//         // If the user is already subscribed, notify them
//         if (subscriber) {
//             ctx.reply(
//                 "Already Subscribed!\n\n Send your current location to get notified of weather updates in your area."
//             );
//             return;
//         } else {
//             // If not subscribed, create a new Subscriber document and save the user's info
//             const subscriber = new Subscriber({
//                 username: username,
//                 userid: userId,
//             });

//             subscriber
//                 .save()
//                 .then(() => {
//                     console.log("Subscriber saved to database!");
//                     // Notify the user about successful subscription and available features
//                     ctx.reply(
//                         `You are now a subscriber! \nYou can access weather updates using /weather command.\nTo unsubscribe use the /unsubscribe command.\nSend your location for the weather update.`
//                     );
//                 })
//                 .catch((error) => {
//                     // Error handling for saving the subscriber data
//                     console.log(
//                         "Error saving subscriber to database:",
//                         error.message
//                     );
//                     ctx.reply("Sorry, Unable to Subscribe at the Moment.");
//                 });

//             // Add the user to the Stat collection to track their usage stats
//             const stat = new Stat({
//                 username: username,
//                 userid: userId,
//             });

//             stat.save()
//                 .then(() => {
//                     console.log("New User Stat saved to database!");
//                 })
//                 .catch((error) => {
//                     // Error handling for saving user stats
//                     console.log(
//                         "Error saving new user stat to database:",
//                         error.message
//                     );
//                 });
//         }
//     });
// });
bot.command("subscribe", async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username;

    try {
        const subscriber = await Subscriber.findOne({ userid: userId });

        if (subscriber) {
            if (!subscriber.city) {
                ctx.reply(
                    "You are already subscribed! Please send your city name."
                );
            } else {
                ctx.reply("You are already subscribed and have set your city.");
            }
            return;
        }

        const newSubscriber = new Subscriber({ username, userid: userId });
        await newSubscriber.save();

        // Ask for the city after successful subscription
        ctx.reply("You are now subscribed! Please send your city name.");

        // Dynamically listen for the city name
        const cityListener = async (cityCtx) => {
            if (cityCtx.from.id !== userId) return; // Ensure only the same user is processed

            const city = cityCtx.message.text;
            try {
                const subscriberToUpdate = await Subscriber.findOne({
                    userid: userId,
                });
                subscriberToUpdate.city = city;
                await subscriberToUpdate.save();

                // Send confirmation message
                cityCtx.reply(
                    `You are now subscribed to weather updates for ${city}.`
                );

                // Remove this listener
                bot.removeListener("text", cityListener);
            } catch (error) {
                console.error("Error saving city:", error);
                cityCtx.reply(
                    "Sorry, there was an error saving your city. Please try again."
                );
            }
        };

        bot.on("text", cityListener); // Attach the listener dynamically
    } catch (error) {
        console.error("Error during subscription:", error);
        ctx.reply(
            "Sorry, there was an error processing your subscription. Please try again."
        );
    }
});

// Save city when user replies with a city name

// Handle the "/unsubscribe" command for users to unsubscribe from weather updates
bot.command("unsubscribe", (ctx) => {
    // Extract userId from context to identify the user
    const userId = ctx.from.id;

    // Search for the user in the Subscriber collection
    Subscriber.findOne({ userid: userId }).then((subscriber) => {
        // If the user is not found in the Subscriber collection, inform them they are not subscribed
        if (!subscriber) {
            ctx.reply(
                "You are not a subscriber yet! Use /subscribe to subscribe to the bot."
            );
            return;
        } else {
            // If the user is found, remove them from the Subscriber collection (unsubscribe them)
            Subscriber.findOneAndDelete({ userid: userId })
                .then(() => {
                    console.log("Subscriber deleted from database!");
                    ctx.reply("You have unsubscribed from weather updates!");
                })
                .catch((error) => {
                    // Error handling for deleting the subscriber
                    console.log(
                        "Error deleting subscriber from database:",
                        error.message
                    );
                    ctx.reply(
                        "Sorry, Unable to Unsubscribe at the Moment.\nTry again later."
                    );
                });

            // Remove the user's statistics from the Stat collection
            Stat.findOneAndDelete({ userid: userId })
                .then(() => {
                    console.log("User Stat deleted from database!");
                })
                .catch((error) => {
                    // Error handling for deleting user stats
                    console.log(
                        "Error deleting user stat from database:",
                        error.message
                    );
                });
        }
    });
});

// Handling "/weather" command
// Handle the "/weather" command for users to get weather updates
bot.command("weather", (ctx) => {
    // Set flag to indicate that the bot is listening for the user's city input
    isListening = true;

    // Check if the user is blocked from using the bot by searching for their userId in the BlockedUser collection
    BlockedUser.findOne({ userid: ctx.from.id })
        .then((blockedUser) => {
            // If the user is blocked, notify them and stop further processing
            if (blockedUser) {
                ctx.reply(
                    "You have been blocked from using this bot!\nContact the bot owner to unblock you."
                );
                return;
            } else {
                // If not blocked, proceed with the subscription check
                Subscriber.findOne({ userid: ctx.from.id }).then(
                    async (subscriber) => {
                        // If the user is not subscribed, notify them and stop processing
                        if (!subscriber) {
                            ctx.reply(
                                "You have not subscribed to get Weather Updates!\nUse /subscribe to subscribe to the bot."
                            );
                            return;
                        } else {
                            try {
                                // Extract userId and username for logging purposes
                                const userId = ctx.from.id;
                                const username = ctx.from.username;

                                // Log the usage of the weather update service by saving to the Usage collection
                                const usage = new Usage({
                                    username: username,
                                    userid: userId,
                                });
                                usage
                                    .save()
                                    .then(() => {
                                        console.log("Usage saved to database!");
                                    })
                                    .catch((error) => {
                                        console.log(
                                            "Error saving usage to database:",
                                            error.message
                                        );
                                    });

                                // Increment the user's usage count in the Stat collection
                                Stat.updateOne(
                                    { userid: userId },
                                    { $inc: { count: 1 } },
                                    { upsert: true }
                                )
                                    .then(() => {
                                        console.log(
                                            "Stat updated in database!"
                                        );
                                    })
                                    .catch((error) => {
                                        console.log(
                                            "Error updating stat in database:",
                                            error.message
                                        );
                                    });

                                // Ask the user for the city name to get weather data
                                ctx.reply("Enter city to get weather data: ");

                                // Listen for the user's city input and process the response
                                bot.hears(/.*/, (ctx) => {
                                    if (!isListening) {
                                        ctx.reply("No command Specified...");
                                        return;
                                    } else {
                                        const messageText = ctx.message.text;
                                        const city = messageText;

                                        // Construct the API URL for fetching weather data from OpenWeatherMap
                                        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?APPID=${weatherAPIKey}&q=${city}`;

                                        // Fetch weather data from OpenWeatherMap API
                                        try {
                                            axios
                                                .get(apiUrl)
                                                .then((response) => {
                                                    // Extract relevant weather information from the API response
                                                    const weatherData =
                                                        response.data;
                                                    const cityName =
                                                        weatherData.city.name;
                                                    const country =
                                                        weatherData.city
                                                            .country;
                                                    const date_txt =
                                                        weatherData.list[0]
                                                            .dt_txt;
                                                    const date =
                                                        date_txt.split(" ")[0];

                                                    // Convert temperature from Kelvin to Celsius
                                                    const temperatureK =
                                                        weatherData.list[0].main
                                                            .temp;
                                                    const temperatureC = (
                                                        temperatureK - 273.15
                                                    ).toFixed(2);

                                                    // Extract other weather data
                                                    const condition =
                                                        weatherData.list[0]
                                                            .weather[0]
                                                            .description;
                                                    const windSpeed =
                                                        weatherData.list[0].wind
                                                            .speed;
                                                    const humidity =
                                                        weatherData.list[0].main
                                                            .humidity;
                                                    const time =
                                                        new Date().toLocaleTimeString();

                                                    // Send the weather update to the user
                                                    ctx.reply(
                                                        `Weather update for ${cityName}, ${country}:\n\nDate: ${date}\nCondition: ${condition}\nTemp: ${temperatureC}°C\nWind Speed: ${windSpeed}m/s\nHumidity: ${humidity}%\nTime: ${time}`
                                                    );
                                                    // Reset listening flag after sending the update
                                                    isListening = false;
                                                })
                                                .catch((error) => {
                                                    // Handle error if city data is not found
                                                    console.log(
                                                        "Error fetching weather data:",
                                                        error.message
                                                    );
                                                    ctx.reply(
                                                        "City not found!\nPlease enter a valid city name..."
                                                    );
                                                    return;
                                                });
                                        } catch (error) {
                                            // Handle error during API request
                                            console.log(
                                                "Error fetching weather data:",
                                                error.message
                                            );
                                            ctx.reply(
                                                "City not found!\nPlease enter a valid city name..."
                                            );
                                            return;
                                        }
                                    }
                                });
                            } catch (error) {
                                // Handle any errors during the process
                                console.log(
                                    "Error fetching weather data:",
                                    error.message
                                );
                                ctx.reply(
                                    "Sorry, unable to fetch weather data at the moment."
                                );
                            }
                        }
                    }
                );
            }
        })
        .catch((error) => {
            // Handle error fetching blocked user status
            console.log(
                "Error fetching blocked user from database:",
                error.message
            );
            ctx.reply(
                "Sorry, You may seem to be unable to access the weather data at the moment."
            );
        });
});

// Handling "/help" command
bot.command("hello", (ctx) => {
    ctx.reply("Hello World"); // for testing purpose(remove before sending)
});
// Handling "/help" command

bot.command("help", (ctx) => {
    const commandList = `
Here are the available commands:

1️⃣ **/subscribe** \\- Subscribe to the bot to start receiving updates\\.
2️⃣ **/weather** \\- Get current weather data of your preferred city\\.
3️⃣ **/unsubscribe** \\- Stop receiving updates\\.
4️⃣ **/hello** \\- Get hello world as reply testing purpose\\!
4️⃣ **/help** \\- Help menu\\!

📌 Use these commands to interact with the bot effectively\\!
    `;
    ctx.reply(commandList, { parse_mode: "MarkdownV2" });
});
bot.on("text", async (ctx) => {
    const userId = ctx.from.id;
    const city = ctx.message.text;

    Subscriber.findOne({ userid: userId }).then(async (subscriber) => {
        if (subscriber) {
            subscriber.city = city;
            await subscriber.save();
            ctx.reply(`Subscribed to weather updates for ${city}!`);
        } else {
            ctx.reply("Please subscribe first using /subscribe.");
        }
    });
});

async function sendWeatherUpdates() {
    console.log("sendWeatherUpdates function called");

    try {
        // Fetch all subscribers from the database
        const subscribers = await Subscriber.find();

        subscribers.forEach((item) => {
            if (item.city) {
                // Construct the API URL
                const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?APPID=${weatherAPIKey}&q=${item.city}`;

                // Fetch weather data from the API
                axios
                    .get(apiUrl)
                    .then((response) => {
                        const weatherData = response.data;

                        // Extract relevant weather information
                        const cityName = weatherData.city.name;
                        const country = weatherData.city.country;
                        const date_txt = weatherData.list[0].dt_txt;
                        const date = date_txt.split(" ")[0];

                        // Convert temperature from Kelvin to Celsius
                        const temperatureK = weatherData.list[0].main.temp;
                        const temperatureC = (temperatureK - 273.15).toFixed(2);

                        // Extract other weather data
                        const condition =
                            weatherData.list[0].weather[0].description;
                        const windSpeed = weatherData.list[0].wind.speed;
                        const humidity = weatherData.list[0].main.humidity;
                        const time = new Date().toLocaleTimeString();

                        // Send the weather update to the user
                        bot.telegram.sendMessage(
                            item.userid,
                            `🌤 **Today's Weather Update**:\n\n` +
                                `📍 Location: ${cityName}, ${country}\n` +
                                `📅 Date: ${date}\n` +
                                `🌡 Temperature: ${temperatureC}°C\n` +
                                `☁ Condition: ${condition}\n` +
                                `💨 Wind Speed: ${windSpeed} m/s\n` +
                                `💧 Humidity: ${humidity}%\n` +
                                `🕒 Time: ${time}`
                        );
                    })
                    .catch((error) => {
                        console.error(
                            `Error fetching weather data for ${item.city}:`,
                            error.message
                        );
                    });
            }
        });
    } catch (error) {
        console.error("Error in sendWeatherUpdates:", error.message);
    }
}

cron.schedule("* * * * *", sendWeatherUpdates); // every 1 minute

// Start the bot
bot.launch();

// Handle errors
bot.catch((error) => {
    console.log("Error:", error);
});

console.log("Bot is running!");
