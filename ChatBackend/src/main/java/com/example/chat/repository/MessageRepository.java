package com.example.chat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.chat.domain.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

	@Query("SELECT m FROM Message m WHERE (m.sender.username = :senderUsername AND m.receiver.username = :receiverUsername) OR (m.sender.username = :receiverUsername AND m.receiver.username = :senderUsername)")
    List<Message> findMessagesBySenderAndReceiver(
            @Param("senderUsername") String senderUsername,
            @Param("receiverUsername") String receiverUsername
    );

	 @Transactional
	    @Modifying
	    @Query("DELETE FROM Message m WHERE (m.sender.username = :firstUsername AND m.receiver.username = :secondUsername) OR (m.sender.username = :secondUsername AND m.receiver.username = :firstUsername)")
	void deleteMessagesForUsers(String firstUsername, String secondUsername);
	 
	
	//void deleteMessageForUsers(String firstUsername, String secondUsername);
}
