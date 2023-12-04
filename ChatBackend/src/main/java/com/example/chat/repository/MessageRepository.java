package com.example.chat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.chat.domain.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

	@Query("SELECT m FROM Message m WHERE (m.sender.username = :senderUsername AND m.receiver.username = :receiverUsername) OR (m.sender.username = :receiverUsername AND m.receiver.username = :senderUsername)")
    List<Message> findMessagesBySenderAndReceiver(
            @Param("senderUsername") String senderUsername,
            @Param("receiverUsername") String receiverUsername
    );
}
