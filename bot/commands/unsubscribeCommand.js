import Subscriber from "../../models/SubscriberModel.js";
import Stat from "../../models/StatModel.js";

export const unsubscribeCommand = (bot) => {
    bot.command("unsubscribe", (ctx) => {
        const userId = ctx.from.id;

        Subscriber.findOne({ userid: userId }).then((subscriber) => {
            if (!subscriber) {
                ctx.reply(
                    "You are not a subscriber yet! Use /subscribe to subscribe to the bot."
                );
                return;
            } else {
                Subscriber.findOneAndDelete({ userid: userId })
                    .then(() => {
                        console.log("Subscriber deleted from database!");
                        ctx.reply(
                            "You have unsubscribed from weather updates!"
                        );
                    })
                    .catch((error) => {
                        console.log(
                            "Error deleting subscriber from database:",
                            error.message
                        );
                        ctx.reply(
                            "Sorry, Unable to Unsubscribe at the Moment."
                        );
                    });

                Stat.findOneAndDelete({ userid: userId })
                    .then(() => console.log("User Stat deleted from database!"))
                    .catch((error) =>
                        console.log(
                            "Error deleting user stat from database:",
                            error.message
                        )
                    );
            }
        });
    });
};
