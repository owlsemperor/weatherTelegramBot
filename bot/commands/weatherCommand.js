import axios from "axios";
import { weatherAPIKey } from "../../config"; // Make sure to import the API key if it's in a separate config file

let isListening = false;

export const weatherCommand = (bot, Subscriber, BlockedUser, Usage, Stat) => {
    bot.command("weather", (ctx) => {
        isListening = true;

        // Check if the user is blocked
        BlockedUser.findOne({ userid: ctx.from.id })
            .then((blockedUser) => {
                if (blockedUser) {
                    ctx.reply(
                        "You have been blocked from using this bot!\nContact the bot owner to unblock you."
                    );
                    return;
                } else {
                    // Check if the user is subscribed
                    Subscriber.findOne({ userid: ctx.from.id }).then(
                        async (subscriber) => {
                            if (!subscriber) {
                                ctx.reply(
                                    "You have not subscribed to get Weather Updates!\nUse /subscribe to subscribe to the bot."
                                );
                                return;
                            } else {
                                try {
                                    const userId = ctx.from.id;
                                    const username = ctx.from.username;

                                    // Update the usage data in the database
                                    const usage = new Usage({
                                        username: username,
                                        userid: userId,
                                    });
                                    await usage.save();

                                    // Update the stats data
                                    await Stat.updateOne(
                                        { userid: userId },
                                        { $inc: { count: 1 } },
                                        { upsert: true }
                                    );

                                    // Ask user for city name
                                    ctx.reply(
                                        "Enter city to get weather data:"
                                    );

                                    // Handle user input (city name)
                                    bot.hears(/.*/, (ctx) => {
                                        if (!isListening) {
                                            ctx.reply(
                                                "No command specified..."
                                            );
                                            return;
                                        } else {
                                            const city = ctx.message.text;
                                            const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?APPID=${weatherAPIKey}&q=${city}`;

                                            // Fetch weather data from OpenWeatherMap API
                                            axios
                                                .get(apiUrl)
                                                .then((response) => {
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

                                                    // Extract other weather details
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

                                                    const message = `Weather update for ${cityName}, ${country}:\n\nDate: ${date}\nCondition: ${condition}\nTemp: ${temperatureC}°C\nWind Speed: ${windSpeed} m/s\nHumidity: ${humidity}%\nTime: ${time}`;
                                                    ctx.reply(message);
                                                    isListening = false;
                                                })
                                                .catch((error) => {
                                                    console.log(
                                                        "Error fetching weather data:",
                                                        error.message
                                                    );
                                                    ctx.reply(
                                                        "City not found! Please enter a valid city name."
                                                    );
                                                });
                                        }
                                    });
                                } catch (error) {
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
                console.log(
                    "Error fetching blocked user from database:",
                    error.message
                );
                ctx.reply(
                    "Sorry, You may seem unable to access the weather data at the moment."
                );
            });
    });
};
