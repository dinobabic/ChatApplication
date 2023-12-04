package com.example.chat.domain;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;

@Getter
@Entity
@Table
public class ChatRoom {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToMany(mappedBy = "chatRooms", fetch = FetchType.EAGER)
	private Set<User> users = new HashSet<>();
	
	@OneToMany(mappedBy = "chatRoom")
	private List<Message> messages = new ArrayList<>();
	
	public void addUser(User user) {
		users.add(user);
		user.addChatRoom(this);
	}
	
	public void addMessage(Message message) {
		messages.add(message);
	}
}
