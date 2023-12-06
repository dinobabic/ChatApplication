package com.example.chat.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.chat.domain.ChatRoom;
import com.example.chat.domain.Message;
import com.example.chat.dto.DeleteMessageDto;
import com.example.chat.dto.MessageDto;
import com.example.chat.repository.MessageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageService {
	
	private final MessageRepository repository;
	private final ChatRoomService chatRoomService;
	
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
					.seenAt(message.getSeenAt())
					.messageIdentification(message.getMessageIdentification())
					.build());
		}
		return messageDtos;
	}

	public void deleteMessagesForUsers(String firstUsername, String secondUsername) {
		String id = firstUsername + "_" + secondUsername;
		repository.deleteMessagesForUsers(id);
	}

	public void updateMessagesSeened(List<MessageDto> messageDtos) {
		for (MessageDto messageDto : messageDtos) {
			ChatRoom room = chatRoomService.getChatRoomForSenderAndReceiver(messageDto.getSenderUsername(), messageDto.getReceiverUsername());
			Message message = repository.findByMessageIdentificationAndChatRoom(messageDto.getMessageIdentification(), room);
			if (message != null) {
				message.setSeenAt(messageDto.getSeenAt());
				repository.save(message);
			}
			
			room = chatRoomService.getChatRoomForSenderAndReceiver(messageDto.getReceiverUsername(), messageDto.getSenderUsername());
			message = repository.findByMessageIdentificationAndChatRoom(messageDto.getMessageIdentification(), room);
			if (message != null) {
				message.setSeenAt(messageDto.getSeenAt());
				repository.save(message);
			}
		}
	}

	public void deleteMessage(DeleteMessageDto deleteMessageDto) {
		ChatRoom room = chatRoomService.getChatRoomForSenderAndReceiver(deleteMessageDto.getSenderUsername(), deleteMessageDto.getReceiverUsername());
		Message message = repository.findByMessageIdentificationAndChatRoom(deleteMessageDto.getMessageIdentification(), room);
		repository.deleteById(message.getId());
	}

	public void deleteMessageForBothUsers(DeleteMessageDto deleteMessageDto) {
		deleteMessage(deleteMessageDto);
		
		ChatRoom room = chatRoomService.getChatRoomForSenderAndReceiver(deleteMessageDto.getReceiverUsername(), deleteMessageDto.getSenderUsername());
		Message message = repository.findByMessageIdentificationAndChatRoom(deleteMessageDto.getMessageIdentification(), room);
		repository.deleteById(message.getId());
	}


}
