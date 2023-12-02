package com.example.chat.service;

import org.springframework.stereotype.Service;

import com.example.chat.domain.Message;
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

}
