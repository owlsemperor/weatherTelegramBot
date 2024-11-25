export const helpCommand = (bot) => {
    bot.command("help", (ctx) => {
        const commandList = `
Here are the available commands:

1️⃣ \\*\\*/subscribe\\*\\* \\- Subscribe to the bot to start receiving updates\\.  
2️⃣ \\*\\*/weather\\*\\* \\- Get current weather data of your preferred city\\.  
3️⃣ \\*\\*/unsubscribe\\*\\* \\- Stop receiving updates\\.  
4️⃣ \\*\\*/help\\*\\* \\- Help menu\\.  

📌 Use these commands to interact with the bot effectively\\!  
    `;

        ctx.reply(commandList, { parse_mode: "MarkdownV2" });
    });
};
