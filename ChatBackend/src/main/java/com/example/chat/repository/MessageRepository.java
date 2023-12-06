package com.example.chat.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.chat.domain.ChatRoom;
import com.example.chat.domain.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

	@Query("SELECT m FROM Message m WHERE m.chatRoom.id = :id")
    List<Message> findMessagesBySenderAndReceiver(
            @Param("id") String id
    );

	@Transactional
	@Modifying
	@Query("DELETE FROM Message m WHERE m.chatRoom.id = :id")
	void deleteMessagesForUsers(String id);

	Message findByMessageIdentification(Date messageIdentification);

	Message findByMessageIdentificationAndChatRoom(Date messageIdentification, ChatRoom room);
}
