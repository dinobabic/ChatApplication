package com.example.chat.service;

import org.springframework.stereotype.Service;

import com.example.chat.domain.UserProfileImage;
import com.example.chat.repository.UserProfileImageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserProfileImageService {

	private final UserProfileImageRepository repository;
	
	public UserProfileImage save(UserProfileImage userProfileImage) {
		return repository.save(userProfileImage);
	}
}
