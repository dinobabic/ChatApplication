package com.example.chat.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageNotification {
	
	private Long chatId;
	private String senderUsername;
	private String receiverUsername;
	private String content;
}
