import Subscriber from "../../models/SubscriberModel.js";
import Stat from "../../models/StatModel.js";

export const subscribeCommand = (bot) => {
    bot.command("subscribe", (ctx) => {
        const userId = ctx.from.id;
        const username = ctx.from.username;

        Subscriber.findOne({ userid: userId }).then((subscriber) => {
            if (subscriber) {
                ctx.reply(
                    "Already Subscribed!\n\n Send your current location to get notified of weather updates in your area."
                );
                return;
            } else {
                const subscriber = new Subscriber({
                    username: username,
                    userid: userId,
                });
                subscriber
                    .save()
                    .then(() => {
                        console.log("Subscriber saved to database!");
                        ctx.reply(
                            `You are now a subscriber! \nYou can access weather updates using /weather command.\nTo unsubscribe use the /unsubscribe command.`
                        );
                    })
                    .catch((error) => {
                        console.log(
                            "Error saving subscriber to database:",
                            error.message
                        );
                        ctx.reply("Sorry, Unable to Subscribe at the Moment.");
                    });

                const stat = new Stat({ username: username, userid: userId });
                stat.save()
                    .then(() => console.log("New User Stat saved to database!"))
                    .catch((error) =>
                        console.log(
                            "Error saving new user stat to database:",
                            error.message
                        )
                    );
            }
        });
    });
};
