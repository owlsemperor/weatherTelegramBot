import axios from "axios";
import Subscriber from "../../models/SubscriberModel.js";

export const sendWeatherUpdates = async () => {
    const subscribers = await Subscriber.find();
    subscribers.forEach((item) => {
        if (item.city) {
            const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?APPID=${process.env.WEATHER_API_KEY}&q=${item.city}`;
            axios
                .get(apiUrl)
                .then((response) => {
                    const weatherData = response.data;
                    const cityName = weatherData.city.name;
                    const condition =
                        weatherData.list[0].weather[0].description;
                    const temperature = weatherData.list[0].main.temp;
                    const windSpeed = weatherData.list[0].wind.speed;
                    const time = new Date().toLocaleTimeString();

                    bot.telegram.sendMessage(
                        item.userid,
                        `Hey, here is your weather update for ${cityName} at ${time}:
Condition: ${condition}
Temperature: ${temperature}°C
Wind Speed: ${windSpeed}m/s`
                    );
                })
                .catch((error) => {
                    console.log("Error fetching weather data:", error.message);
                });
        }
    });
};
