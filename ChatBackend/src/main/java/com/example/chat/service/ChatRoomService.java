package com.example.chat.service;

import org.springframework.stereotype.Service;

import com.example.chat.domain.ChatRoom;
import com.example.chat.repository.ChatRoomRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

	private final ChatRoomRepository repository;
	
	public ChatRoom save(ChatRoom chatRoom) {
		return repository.save(chatRoom);
	}
}
