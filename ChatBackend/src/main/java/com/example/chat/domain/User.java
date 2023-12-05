package com.example.chat.domain;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode
public class User implements UserDetails {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(unique = true)
	private String username;
	
	private String firstName;
	
	private String lastName;
	
	@Column(unique = true)
	private String email;
	
	private String password;
	
	private Date lastTimeActive;
	
	private String status;
	
	@OneToMany(fetch = FetchType.EAGER, mappedBy = "user", cascade = CascadeType.ALL)
	private Set<Authority> authorities = new HashSet<>();
	
	@ManyToMany
	@JoinTable(
		name = "user_chatroom",
		joinColumns = @JoinColumn(name = "user_id"),
		inverseJoinColumns = @JoinColumn(referencedColumnName = "id")
	)
	private Set<ChatRoom> chatRooms = new HashSet<>();
	
	@OneToMany(mappedBy = "sender")
	private List<Message> sentMessages = new ArrayList<>();
	
	@OneToMany(mappedBy = "receiver")
	private List<Message> receivedMessages = new ArrayList<>();
	
	public void addAuthority(String authority) {
		if (authorities == null) {
			authorities = new HashSet<>();
		}
		Authority newAuthority = new Authority();
		newAuthority.setAuthority(authority);
		newAuthority.setUser(this);	
		authorities.add(newAuthority);
	}
	
	public void addChatRoom(ChatRoom chatRoom) {
		if (chatRooms == null) {
			chatRooms = new HashSet<>();
		}
		chatRooms.add(chatRoom);
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}
	
	@Override
	public int hashCode() {
		return Objects.hash(getUsername());
	}
	
	@Override
	public boolean equals(Object other) {
		if (other instanceof User) {
			User otherUser = (User)other;
			if (otherUser.getUsername().equals(this.getUsername())) {
				return true;
			}
		}
		
		return false;
	}
}
