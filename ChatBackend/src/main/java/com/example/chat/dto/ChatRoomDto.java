package com.example.chat.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRoomDto {
	
	@JsonProperty("users")
	private List<UserDto> users;
	
	public ChatRoomDto() {}
}
