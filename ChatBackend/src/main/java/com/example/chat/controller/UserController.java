package com.example.chat.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.chat.domain.ChatRoom;
import com.example.chat.domain.Message;
import com.example.chat.domain.MessageNotification;
import com.example.chat.domain.User;
import com.example.chat.dto.ChatRoomDto;
import com.example.chat.dto.MessageDto;
import com.example.chat.dto.UserDto;
import com.example.chat.dto.UsernameDto;
import com.example.chat.service.ChatRoomService;
import com.example.chat.service.MessageService;
import com.example.chat.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin
public class UserController {

	private final UserService userService;
	private final ChatRoomService chatRoomService;
	private final SimpMessagingTemplate messagingTemplate;
	private final MessageService messageService;
	
	@GetMapping
	public List<UserDto> getUsers() {
		List<User> users = userService.findAll();
		List<UserDto> userDtos = new ArrayList<>();
		
		for (User user : users) {
			userDtos.add(UserDto.builder()
					.username(user.getUsername())
					.firstName(user.getFirstName())
					.lastName(user.getLastName())
					.build());
		}
		
		return userDtos;
	}
	
	@GetMapping("/createChatRoom/{username}")
	public ResponseEntity<ChatRoomDto> createChatRoom(@PathVariable String username, @AuthenticationPrincipal User principal) {
		User user = userService.findByUsername(username);
		ChatRoom chatRoom = new ChatRoom();
		chatRoom.addUser(user);
		User userPrincipal = userService.findByUsername(principal.getUsername());
		chatRoom.addUser(userPrincipal);
		chatRoom = chatRoomService.save(chatRoom);
		
		ChatRoomDto chatRoomDto = new ChatRoomDto();
		chatRoomDto.setUsers(chatRoom.getUsers().stream().map((userFromRoom) -> UserDto.builder()
				.username(userFromRoom.getUsername())
				.firstName(userFromRoom.getFirstName())
				.lastName(userFromRoom.getLastName())
				.build()).collect(Collectors.toList()));
		return ResponseEntity.ok(chatRoomDto);
	}
	
	@GetMapping("/getChatRooms")
	public List<ChatRoomDto> getChatRooms(@AuthenticationPrincipal User user) {
		user = userService.findByUsername(user.getUsername());
		List<ChatRoom> chatRooms = chatRoomService.getChatRoomsForUser(user.getUsername());
		List<ChatRoomDto> chatRoomDtos = new ArrayList<>();
		
		for (ChatRoom room : chatRooms) {
			ChatRoomDto chatRoomDto = new ChatRoomDto();
			chatRoomDto.setUsers(room.getUsers().stream().map((userFromRoom) -> UserDto.builder()
					.username(userFromRoom.getUsername())
					.firstName(userFromRoom.getFirstName())
					.lastName(userFromRoom.getLastName())
					.build()).collect(Collectors.toList()));
			chatRoomDtos.add(chatRoomDto);
		}
		
		return chatRoomDtos;
	}
	
	@MessageMapping("/chat")
	public void processMessage(@Payload MessageDto messageDto) {	
		ChatRoom chatRoom = chatRoomService.getChatRoomForSenderAndReceiver(messageDto.getSenderUsername(), messageDto.getReceiverUsername());
		Message message = Message.builder()
				.receiver(userService.findByUsername(messageDto.getReceiverUsername()))
				.sender(userService.findByUsername(messageDto.getSenderUsername()))
				.content(messageDto.getContent())
				.sentAt(messageDto.getSentAt())
				.chatRoom(chatRoom)
				.build();
		message = messageService.save(message);
		messagingTemplate.convertAndSendToUser(
			message.getReceiver().getUsername(),
			"/queue/messages",
			MessageNotification.builder()
				.senderUsername(message.getSender().getUsername())
				.receiverUsername(message.getReceiver().getUsername())
				.content(message.getContent())
				.chatId(message.getChatRoom().getId())
				.build());	
	}
	
	@GetMapping("/messages/{sender}/{receiver}")
    public ResponseEntity<List<MessageDto>> findChatMessages(
            @PathVariable("sender") String sender,
            @PathVariable("receiver") String receiver
    ) {
        return ResponseEntity.ok(messageService.findMessagesForSenderAndReceiver(sender, receiver));
    }
	
	@MessageMapping("/user.disconnectUser")
    @SendTo("/user/topic")
    public void disconnect(@Payload UsernameDto usernameDto) {
        userService.disconnect(usernameDto);
    }
}
