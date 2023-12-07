package com.example.chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.chat.domain.UserProfileImage;

@Repository
public interface UserProfileImageRepository extends JpaRepository<UserProfileImage, Long>{

}
