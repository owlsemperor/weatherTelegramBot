import User from "../../models/UserModel.js";

export const startCommand = (bot) => {
    bot.start((ctx) => {
        const userId = ctx.from.id;
        const username = ctx.from.username;
        const user = new User({ username: username, userid: userId });

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
};
