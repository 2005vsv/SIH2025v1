import TelegramBot from 'node-telegram-bot-api';
import { logger } from '../config/logger';

class TelegramBotService {
  private bot: TelegramBot;
  private readonly token: string;

  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN || '';
    if (!this.token) {
      logger.error('TELEGRAM_BOT_TOKEN is not defined');
      throw new Error('TELEGRAM_BOT_TOKEN is not defined');
    }

    try {
      this.bot = new TelegramBot(this.token, { polling: true });
      this.initializeCommands();
      logger.info('Telegram bot initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Telegram bot:', error);
      throw error;
    }
  }

  private initializeCommands(): void {
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, 
        'Welcome to SIH2025 Student Portal Bot! 🎓\n\n' +
        'Available commands:\n' +
        '/help - Show this message\n' +
        '/fees - Check your fees status\n' +
        '/certificates - View your certificates'
      );
    });

    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, 
        'How to use this bot:\n\n' +
        '1. Use /fees to check your fees\n' +
        '2. Use /certificates to view your certificates\n' +
        '3. Just type any question to ask me!'
      );
    });

    // Handle all other messages
    this.bot.on('message', (msg) => {
      if (msg.text?.startsWith('/')) return; // Skip commands
      
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, 'I received your message. This feature is coming soon!');
    });

    this.bot.on('error', (error) => {
      logger.error('Telegram bot error:', error);
    });
  }
}

// Initialize and export a single instance
const telegramBotService = new TelegramBotService();
export default telegramBotService;
