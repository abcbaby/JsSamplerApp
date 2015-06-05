package com.dragonzone.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
	@Autowired
	@Qualifier("environment")
	private Environment env;
	
	@Autowired
	public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
		auth.inMemoryAuthentication().withUser("admin").password(env.getProperty("account.admin.password")).roles("ADMIN");
		auth.inMemoryAuthentication().withUser("contributor").password(env.getProperty("account.contributor.password")).roles("CONTRIBUTOR");
		auth.inMemoryAuthentication().withUser("user").password(env.getProperty("account.user.password")).roles("USER");
	}

	@Override
	protected void configure(HttpSecurity http) throws Exception {

		http.csrf().disable()
			.authorizeRequests()
			.antMatchers("/terminal/*.jsf").access("hasRole('ROLE_ADMIN') or hasRole('ROLE_CONTRIBUTOR')")
			.antMatchers("/jsf/**").authenticated()
			.antMatchers("/backboneSample/**").authenticated()
			.antMatchers("/**").permitAll()
			.and().httpBasic();
		
	}
}