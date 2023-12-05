package com.example.chat.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.chat.domain.ChatRoom;
import com.example.chat.domain.User;
import com.example.chat.repository.ChatRoomRepository;
import com.example.chat.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

	private final ChatRoomRepository repository;
	private final UserRepository userRepository;
	
	public ChatRoom save(ChatRoom chatRoom) {
		return repository.save(chatRoom);
	}
	
	public ChatRoom getChatRoomForSenderAndReceiver(String sender, String receiver) {
		User userSender = userRepository.findByUsername(sender).get();
		List<ChatRoom> chatRooms = repository.findAllByUser(sender);
		for (ChatRoom chatRoom : chatRooms) {
			if (chatRoom.getUsers().stream().filter((user) -> user.getUsername().equals(receiver)).count() == 1) {
				return chatRoom;
			}
		}
		
		return null;
	}
	
	public List<ChatRoom> getChatRoomsForUser(String username) {
		return repository.findAllByUser(username);
	}

	public boolean checkIfRoomExists(User user, User userPrincipal) {
		List<ChatRoom> chatRooms = getChatRoomsForUser(user.getUsername());
		for (ChatRoom room : chatRooms) {
			if (room.getUsers().contains(user) && room.getUsers().contains(userPrincipal)) {
				return true;
			}
		}
 		
		return false;
	}

	public void deleteChatRoomForUsers(String firstUsername, String secondUsername) {
		repository.deleteChatRoomForUsers(firstUsername, secondUsername);
	}
}
