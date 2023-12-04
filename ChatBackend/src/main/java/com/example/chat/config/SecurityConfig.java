package com.example.chat.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
	
	 private final JwtAuthenticationFilter jwtAuthFilter;
	 private final AuthenticationProvider authenticationProvider;

	    @Bean
	    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
	        http
	                .csrf((csrf) -> csrf.disable())
	                .cors((cors) -> cors.disable())
	                .headers(headers -> headers
        					.frameOptions((frameOptions) -> frameOptions.disable()))
	                .authorizeHttpRequests((auth) ->
	                        auth
	                                .requestMatchers("/api/auth/**")
	                                .permitAll()
	                                .requestMatchers("/ws/**").permitAll()
	                                .anyRequest()
	                                .authenticated())
	                .sessionManagement((sessionManagement) ->
	                        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
	                .authenticationProvider(authenticationProvider)
	                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
	 
	        return http.build();
	    }
	    
	    @Bean
	    public CorsConfigurationSource corsConfigurationSource() {
	        CorsConfiguration configuration = new CorsConfiguration();
	        configuration.setAllowCredentials(true);
	        configuration.addAllowedOriginPattern("*");
	        configuration.addAllowedHeader("*");
	        configuration.addAllowedMethod("*");

	        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
	        source.registerCorsConfiguration("/**", configuration);
	        return source;
	    }
}
