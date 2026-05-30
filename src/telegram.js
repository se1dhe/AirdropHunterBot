import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
let bot = null;
if (token && chatId) {
    bot = new TelegramBot(token, { polling: false });
}
export const sendNotification = async (message) => {
    if (bot && chatId) {
        try {
            await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        }
        catch (error) {
            console.error('Error sending Telegram notification:', error);
        }
    }
    else {
        console.log('Telegram not configured, skipping notification:', message);
    }
};
//# sourceMappingURL=telegram.js.map