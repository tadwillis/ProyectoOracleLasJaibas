package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.config.BotProps;
import com.springboot.MyTodoList.service.TelegramAIService;
import com.springboot.MyTodoList.util.BotHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.client.okhttp.OkHttpTelegramClient;
import org.telegram.telegrambots.longpolling.BotSession;
import org.telegram.telegrambots.longpolling.interfaces.LongPollingUpdateConsumer;
import org.telegram.telegrambots.longpolling.starter.AfterBotRegistration;
import org.telegram.telegrambots.longpolling.starter.SpringLongPollingBot;
import org.telegram.telegrambots.longpolling.util.LongPollingSingleThreadUpdateConsumer;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.generics.TelegramClient;

@Component
public class ToDoItemBotController implements SpringLongPollingBot, LongPollingSingleThreadUpdateConsumer {

	private static final Logger logger = LoggerFactory.getLogger(ToDoItemBotController.class);
	private final TelegramAIService telegramAIService;
	private final TelegramClient telegramClient;
	private final BotProps botProps;

	@Value("${telegram.bot.token}")
	private String telegramBotToken;

	@Override
	public String getBotToken() {
		if (telegramBotToken != null && !telegramBotToken.trim().isEmpty()) {
			return telegramBotToken;
		} else {
			return botProps.getToken();
		}
	}

	public ToDoItemBotController(BotProps bp, TelegramAIService telegramAIService) {
		this.botProps = bp;
		this.telegramAIService = telegramAIService;
		telegramClient = new OkHttpTelegramClient(getBotToken());
	}

	@Override
    public LongPollingUpdateConsumer getUpdatesConsumer() {
        return this;
    }

	@Override
	public void consume(Update update) {
		if (!update.hasMessage() || !update.getMessage().hasText()) return;

		String messageText = update.getMessage().getText();
		long chatId = update.getMessage().getChatId();

		logger.info("Mensaje recibido de chatId {}: {}", chatId, messageText);

		// Procesar el mensaje con el servicio de IA
		String response = telegramAIService.processMessage(chatId, messageText);

		// Enviar la respuesta al usuario
		BotHelper.sendMessageToTelegram(chatId, response, telegramClient);
	}

	@AfterBotRegistration
    public void afterRegistration(BotSession botSession) {
        System.out.println("Registered bot running state is: " + botSession.isRunning());
    }

}