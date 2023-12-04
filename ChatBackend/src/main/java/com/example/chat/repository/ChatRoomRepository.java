package com.example.chat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.chat.domain.ChatRoom;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

	@Query("SELECT cr FROM ChatRoom cr JOIN cr.users u WHERE u.username = :sender")
    List<ChatRoom> findAllByUser(@Param("sender") String sender);

}
