package com.example.chat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.chat.domain.ChatRoom;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, String> {

	@Query("SELECT cr FROM ChatRoom cr WHERE cr.id LIKE CONCAT(:username, '%')")
    List<ChatRoom> findAllByUser(@Param("username") String username);

	@Transactional
    @Modifying
    @Query("UPDATE User u SET u.chatRooms = null WHERE :chatRoomId LIKE CONCAT(u.username, '_%')")
    void disassociateUsersFromChatRoom(@Param("chatRoomId") String chatRoomId);

    @Transactional
    @Modifying
    @Query("DELETE FROM ChatRoom cr WHERE cr.id = :chatRoomId")
    void deleteChatRoomById(@Param("chatRoomId") String chatRoomId);

}
