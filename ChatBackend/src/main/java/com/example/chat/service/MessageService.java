package com.example.chat.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.chat.domain.Message;
import com.example.chat.dto.MessageDto;
import com.example.chat.repository.MessageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageService {
	
	private final MessageRepository repository;
	
	public Message save(Message message) {
		return repository.save(message);
	}
	
	public Message updateMessage(Message message) {
		return repository.save(message);
	}

	public List<MessageDto> findMessagesForSenderAndReceiver(String sender, String receiver) {
		List<MessageDto> messageDtos = new ArrayList<>();
		String id = sender + "_" + receiver;
		List<Message> messages = repository.findMessagesBySenderAndReceiver(id);
		for (Message message : messages) {
			messageDtos.add(MessageDto.builder()
					.senderUsername(message.getSender().getUsername().equals(sender) ? sender : receiver)
					.receiverUsername(message.getSender().getUsername().equals(sender) ? receiver : sender)
					.content(message.getContent())
					.sentAt(message.getSentAt())
					.build());
		}
		return messageDtos;
	}

	public void deleteMessagesForUsers(String firstUsername, String secondUsername) {
		String id = firstUsername + "_" + secondUsername;
		repository.deleteMessagesForUsers(id);
	}

	public void deleteMessageForUsers(String firstUsername, String secondUsername) {
		//repository.deleteMessageForUsers(firstUsername, secondUsername);
	}

}
