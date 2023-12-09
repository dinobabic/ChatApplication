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
		System.out.println("I am storing userProfile image");
		System.out.println("============================================================================================================================================================================\n\n\n\n\n\n\n");
		System.out.println(userProfileImage.getProfileImage().length());
		return repository.save(userProfileImage);
	}
}
