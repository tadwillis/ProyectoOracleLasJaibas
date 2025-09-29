package com.springboot.MyTodoList.controller;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.PropertySource;

import org.telegram.telegrambots.longpolling.starter.AfterBotRegistration;
import org.telegram.telegrambots.longpolling.BotSession;
import org.telegram.telegrambots.longpolling.interfaces.LongPollingUpdateConsumer;
import org.telegram.telegrambots.longpolling.starter.SpringLongPollingBot;
import org.telegram.telegrambots.longpolling.util.LongPollingSingleThreadUpdateConsumer;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardRemove;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import org.telegram.telegrambots.meta.generics.TelegramClient;
import org.telegram.telegrambots.client.okhttp.OkHttpTelegramClient;


import com.springboot.MyTodoList.model.ToDoItem;
import com.springboot.MyTodoList.service.ToDoItemService;
import com.springboot.MyTodoList.util.BotCommands;
import com.springboot.MyTodoList.util.BotHelper;
import com.springboot.MyTodoList.util.BotLabels;
import com.springboot.MyTodoList.util.BotMessages;
import com.springboot.MyTodoList.util.BotActions;
import com.springboot.MyTodoList.config.BotProps;

@Component
public class ToDoItemBotController  implements SpringLongPollingBot, LongPollingSingleThreadUpdateConsumer {

	private static final Logger logger = LoggerFactory.getLogger(ToDoItemBotController.class);
	private ToDoItemService toDoItemService;
	private final TelegramClient telegramClient;
	
	private final BotProps botProps;

	@Value("${telegram.bot.token}")
	private String telegramBotToken;


	@Override
    public String getBotToken() {
		if(telegramBotToken != null && !telegramBotToken.trim().isEmpty()){
        	return telegramBotToken;
		}else{
			return botProps.getToken();
		}
    }


	public ToDoItemBotController( BotProps bp, ToDoItemService tsvc) {
		this.botProps = bp;
		telegramClient = new OkHttpTelegramClient(getBotToken());
		toDoItemService = tsvc;
	}

	@Override
    public LongPollingUpdateConsumer getUpdatesConsumer() {
        return this;
    }

	@Override
	public void consume(Update update) {

		if (!update.hasMessage() || !update.getMessage().hasText()) return;

		

		String messageTextFromTelegram = update.getMessage().getText();
		long chatId = update.getMessage().getChatId();

		BotActions actions =  new BotActions(telegramClient,toDoItemService);
		actions.setRequestText(messageTextFromTelegram);
		actions.setChatId(chatId);
		if(actions.getTodoService()==null){
			logger.info("todosvc error");
			actions.setTodoService(toDoItemService);
		}


		actions.fnStart();
		actions.fnDone();
		actions.fnUndo();
		actions.fnDelete();
		actions.fnHide();
		actions.fnListAll();
		actions.fnAddItem();

	}

	// GET /todolist
	public List<ToDoItem> getAllToDoItems() { 
		return toDoItemService.findAll();
	}



	@AfterBotRegistration
    public void afterRegistration(BotSession botSession) {
        System.out.println("Registered bot running state is: " + botSession.isRunning());
    }

}


