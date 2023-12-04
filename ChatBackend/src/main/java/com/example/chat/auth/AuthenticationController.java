package com.example.chat.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.chat.config.JwtService;
import com.example.chat.dto.UsernameDto;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthenticationController {
	
	private final JwtService jwtService;
	private final AuthenticationService authService;
	
	@MessageMapping("register/user.addUser")
	@SendTo("/user/topic")
	public ResponseEntity<?> register(@Payload RegisterRequest request) {
		return ResponseEntity.ok(authService.register(request));
	}
	
	@MessageMapping("authenticate/user.addUser")
	@SendTo("/user/topic")
	public ResponseEntity<AuthenticationResponse> authenticate(
	           @Payload AuthenticationRequest request) {
		return ResponseEntity.ok(authService.authenticate(request));
	}
	
	@MessageMapping("/user.discnonnectUser")
	@SendTo("/user/topic")
	public void disconnect(@Payload UsernameDto usernameDto) {
		authService.disconnect(usernameDto);
	}

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestParam String token	) {
        boolean validToken = jwtService.isTokenExpired(token);
        return ResponseEntity.ok(!validToken);
    }

}
