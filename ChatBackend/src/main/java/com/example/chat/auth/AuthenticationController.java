package com.example.chat.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.chat.config.JwtService;
import com.example.chat.domain.UserActionNotification;
import com.example.chat.dto.UsernameDto;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthenticationController {
	
	private final JwtService jwtService;
	private final AuthenticationService authService;
	private final SimpMessagingTemplate messagingTemplate;
	
	@MessageMapping(value="register/user.addUser")
	@SendTo("/user/topic")
	public ResponseEntity<?> register(@Payload RegisterRequest request) {
		AuthenticationResponse response = authService.register(request);
		if (!response.getToken().equals("")) {
			messagingTemplate.convertAndSend("/user/public", 
					UserActionNotification.builder()
					.username(request.getUsername())
					.status("ONLINE")
					.build()
			);
		}
		
		return ResponseEntity.ok(response);
	}
	
	@PostMapping("/register/uploadProfileImage/{username}")
	public void uploadProfileImage(@RequestBody RegisterProfileImageRequest request) {
		authService.uploadProfileImage(request);
	}
	
	@MessageMapping("authenticate/user.addUser")
	@SendTo("/user/topic")
	public ResponseEntity<AuthenticationResponse> authenticate(
	           @Payload AuthenticationRequest request) {
		AuthenticationResponse response = authService.authenticate(request);
		if (!response.getToken().equals("")) {
			messagingTemplate.convertAndSend("/user/public", 
					UserActionNotification.builder()
					.username(request.getUsername())
					.status("ONLINE")
					.build()
			);
		}
		
		return ResponseEntity.ok(response);
	}
	
	@MessageMapping("/user.disconnectUser")
	public void disconnect(@Payload UsernameDto usernameDto) {
		authService.disconnect(usernameDto);
		messagingTemplate.convertAndSend("/user/public", 
				UserActionNotification.builder()
				.username(usernameDto.getUsername())
				.status("OFFLINE")
				.build()
		);
	}

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        boolean validToken = jwtService.isTokenExpired(token);
        return ResponseEntity.ok(!validToken);
    }

}
