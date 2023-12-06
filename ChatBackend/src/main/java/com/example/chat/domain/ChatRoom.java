package com.example.chat.domain;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table
public class ChatRoom {

	@Id
	private String id;
	
	@ManyToMany(mappedBy = "chatRooms", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
	private Set<User> users = new HashSet<>();
	
	@OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private List<Message> messages = new ArrayList<>();
	
	public void addUser(User user) {
		users.add(user);
		user.addChatRoom(this);
	}
	
	public void addMessage(Message message) {
		messages.add(message);
	}
}
