package com.example.chat.auth;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.chat.config.JwtService;
import com.example.chat.domain.User;
import com.example.chat.domain.UserProfileImage;
import com.example.chat.dto.UsernameDto;
import com.example.chat.service.UserProfileImageService;
import com.example.chat.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
	
	private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserProfileImageService userProfileImageService;
	
	public AuthenticationResponse register(RegisterRequest request) {
		User user = User.builder()
				.username(request.getUsername())
				.firstName(request.getFirstName())
				.lastName(request.getLastName())
				.email(request.getEmail())
				.password(passwordEncoder.encode(request.getPassword()))
				.status("ONLINE")
				.build();
		try {
			user = userService.save(user);
		} catch (Exception e) {
			return AuthenticationResponse.builder().token("").build();
		}
		var token = jwtService.generateToken(user);
		return AuthenticationResponse.builder()
				.token(token)
				.build();
	}
	
	public AuthenticationResponse authenticate(AuthenticationRequest request) {
		try {
			authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()
			));
		} catch (AuthenticationException e) {
			return AuthenticationResponse.builder()
					.token("")
					.build();
		}
		var user = userService.findByUsername(request.getUsername());
		if (user== null) {
			return AuthenticationResponse.builder()
					.token("")
					.build();
		}
		user.setStatus("ONLINE");
		userService.save(user);
		var token = jwtService.generateToken(user);
		return AuthenticationResponse.builder()
				.token(token)
				.build();
	}
	
	public void disconnect(UsernameDto usernameDto) {
		User user = userService.findByUsername(usernameDto.getUsername());
		user.setStatus("OFFLINE");
		userService.save(user);
	}

	public void uploadProfileImage(RegisterProfileImageRequest request) {
		UserProfileImage userProfileImage = UserProfileImage.builder()
				.profileImage(request.getProfileImage())
				.build();
		
		userProfileImage = userProfileImageService.save(userProfileImage);
		
		User user = userService.findByUsername(request.getUsername());
		user.setProfileImage(userProfileImage);
		userService.save(user);
	}

}
