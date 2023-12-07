package com.example.chat.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.chat.domain.User;
import com.example.chat.dto.UsernameDto;
import com.example.chat.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
	
	private final UserRepository repository;
	
	public User findByUsername(String username) {
		try {
			return repository.findByUsername(username).orElseThrow(() -> new EntityNotFoundException());
		} catch (Exception e) {
			return null;
		}
	}
	
	public User save(User user) {
		user.addAuthority("ROLE_USER");
		return repository.save(user);
	}
	
	public List<User> findAll() {
		return repository.findAll();
	}

	public void disconnect(UsernameDto usernameDto) {
		User user = repository.findByUsername(usernameDto.getUsername()).get();
		user.setStatus("OFFLINE");
		repository.save(user);
	}

	public String getProfileImage(String username) {
		User user = repository.findByUsername(username).get();
		return user.getProfileImage().getProfileImage();
	}
	
}
