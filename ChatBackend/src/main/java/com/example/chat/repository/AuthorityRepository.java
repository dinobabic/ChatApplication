package com.example.chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.chat.domain.Authority;

@Repository
public interface AuthorityRepository extends JpaRepository<Authority, Long>{

}
