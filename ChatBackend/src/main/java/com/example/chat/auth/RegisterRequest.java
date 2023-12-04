package com.example.chat.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class RegisterRequest {

	private String username;
	private String firstName;
	private String lastName;
	private String email;
	private String password;
	private String userId;
}
