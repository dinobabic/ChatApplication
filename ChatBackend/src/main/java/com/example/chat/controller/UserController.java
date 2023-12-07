package com.example.chat.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.chat.domain.ChatRoom;
import com.example.chat.domain.Message;
import com.example.chat.domain.MessageNotification;
import com.example.chat.domain.MessageSeenNotification;
import com.example.chat.domain.User;
import com.example.chat.dto.ChatRoomDto;
import com.example.chat.dto.DeleteMessageDto;
import com.example.chat.dto.MessageDto;
import com.example.chat.dto.StatusDto;
import com.example.chat.dto.UserDto;
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
	
	@GetMapping("/profileImage/{username}")
	public ResponseEntity<?> getUserProfileImage(@PathVariable String username) {
		System.out.println("Getting profile image.");
		return ResponseEntity.ok(userService.getProfileImage(username));
	}
	
	@GetMapping("/status/{username}")
	public ResponseEntity<?> getUserSatatusByUsername(@PathVariable String username) {
		return ResponseEntity.ok(StatusDto.builder()
				.status(userService.findByUsername(username).getStatus())
				.build());
	}
	
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
		User userPrincipal = userService.findByUsername(principal.getUsername());
		if (chatRoomService.checkIfRoomExists(user, userPrincipal)) {
			return null;
		}
		ChatRoom chatRoom = new ChatRoom();
		chatRoom.addUser(user);
		chatRoom.addUser(userPrincipal);
		chatRoom.setId(userPrincipal.getUsername() + "_" + username);
		chatRoom = chatRoomService.save(chatRoom);
		
		chatRoom = new ChatRoom();
		chatRoom.addUser(user);
		chatRoom.addUser(userPrincipal);
		chatRoom.setId(username + "_" + userPrincipal.getUsername());
		chatRoomService.save(chatRoom);

		ChatRoomDto chatRoomDto = new ChatRoomDto();
		chatRoomDto.setUsers(chatRoom.getUsers().stream().map((userFromRoom) -> UserDto.builder()
				.username(userFromRoom.getUsername())
				.firstName(userFromRoom.getFirstName())
				.lastName(userFromRoom.getLastName())
				.build()).collect(Collectors.toList()));
		messagingTemplate.convertAndSend(
				"/user/" + username + "/queue/chatRoom", chatRoomDto);
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
		ChatRoom chatRoom1 = chatRoomService.getChatRoomForSenderAndReceiver(messageDto.getSenderUsername(), messageDto.getReceiverUsername());
		ChatRoom chatRoom2 = chatRoomService.getChatRoomForSenderAndReceiver(messageDto.getReceiverUsername(), messageDto.getSenderUsername());
		if (chatRoom2 == null) {
			chatRoom2 = new ChatRoom();
			chatRoom2.addUser(userService.findByUsername(messageDto.getSenderUsername()));
			chatRoom2.addUser(userService.findByUsername(messageDto.getReceiverUsername()));
			chatRoom2.setId(messageDto.getReceiverUsername() + "_" + messageDto.getSenderUsername());
			chatRoomService.save(chatRoom2);
			ChatRoomDto chatRoomDto = new ChatRoomDto();
			chatRoomDto.setUsers(chatRoom2.getUsers().stream().map((userFromRoom) -> UserDto.builder()
					.username(userFromRoom.getUsername())
					.firstName(userFromRoom.getFirstName())
					.lastName(userFromRoom.getLastName())
					.build()).collect(Collectors.toList()));
			messagingTemplate.convertAndSend(
					"/user/" + messageDto.getReceiverUsername() + "/queue/chatRoom", chatRoomDto);
		}
		Message message = Message.builder()
				.receiver(userService.findByUsername(messageDto.getReceiverUsername()))
				.sender(userService.findByUsername(messageDto.getSenderUsername()))
				.content(messageDto.getContent())
				.sentAt(messageDto.getSentAt())
				.chatRoom(chatRoom1)
				.messageIdentification(messageDto.getSentAt())
				.image(messageDto.getImage())
				.build();
		message = messageService.save(message);
		
		message = Message.builder()
				.receiver(userService.findByUsername(messageDto.getReceiverUsername()))
				.sender(userService.findByUsername(messageDto.getSenderUsername()))
				.content(messageDto.getContent())
				.sentAt(messageDto.getSentAt())
				.chatRoom(chatRoom2)
				.messageIdentification(messageDto.getSentAt())
				.image(messageDto.getImage())
				.build();
		message = messageService.save(message);
		
		messagingTemplate.convertAndSend(
				"/user/" + messageDto.getReceiverUsername() + "/queue/messages",
				MessageNotification.builder()
					.senderUsername(message.getSender().getUsername())
					.receiverUsername(message.getReceiver().getUsername())
					.content(message.getContent())
					.sentAt(messageDto.getSentAt())
					.image(messageDto.getImage())
					.messageIdentification(message.getMessageIdentification())
					.build());
	}
	
	@GetMapping("/messages/{sender}/{receiver}")
    public ResponseEntity<List<MessageDto>> findChatMessages(
            @PathVariable("sender") String sender,
            @PathVariable("receiver") String receiver
    ) {
        return ResponseEntity.ok(messageService.findMessagesForSenderAndReceiver(sender, receiver));
    }
	
	@PutMapping("/updateMessages")
	public void updateMessagesSeened(@RequestBody List<MessageDto> messageDtos) {
		messageService.updateMessagesSeened(messageDtos);
		messagingTemplate.convertAndSend(
			"/user/" + messageDtos.get(0).getSenderUsername() + "/queue/messages",
			MessageSeenNotification.builder().messageSeen("Messages were seen.").build()
		);
	}
	
	@DeleteMapping("/delete/messages/{firstUsername}/{secondUsername}")
	public void deleteMessages(@PathVariable String firstUsername, @PathVariable String secondUsername) {
		messageService.deleteMessagesForUsers(firstUsername, secondUsername);
	}
	
	@DeleteMapping("/delete/chatRoom/{firstUsername}/{secondUsername}")
	public void deleteChatRoom(@PathVariable String firstUsername, @PathVariable String secondUsername) {
		messageService.deleteMessagesForUsers(firstUsername, secondUsername);
		chatRoomService.deleteChatRoomForUsers(firstUsername, secondUsername);
	}
	
	@PutMapping("/delete/message")
	public ResponseEntity<?> deleteMessageForOneUser(@RequestBody DeleteMessageDto deleteMessageDto) {
		messageService.deleteMessage(deleteMessageDto);
		return ResponseEntity.ok(deleteMessageDto);
	}
	
	@PutMapping("/deleteForEveryone/message")
	public ResponseEntity<?> deleteMessageForBothUsers(@RequestBody DeleteMessageDto deleteMessageDto) {
		messageService.deleteMessageForBothUsers(deleteMessageDto);
		return ResponseEntity.ok(deleteMessageDto);
	}
}
