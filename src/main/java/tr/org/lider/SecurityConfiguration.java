package tr.org.lider;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
	
	@Autowired
	UserDetailsService userDetailsService;

    private AuthenticationSuccessHandler authenticationSuccessHandler;
    
    @Autowired
    public void WebSecurityConfig( AuthenticationSuccessHandler authenticationSuccessHandler) {
        this.authenticationSuccessHandler = authenticationSuccessHandler;
    }
    
	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {
		auth.userDetailsService(userDetailsService);
	}
	
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		
		http.csrf().disable().authorizeRequests()
		.antMatchers("/").hasAnyRole("USER","ADMIN")
//		//.antMatchers("/getMainPage/").hasRole("USER") 
		.antMatchers("/lider/ldap/**").hasRole("LDAP")
		.antMatchers("/lider/pages/**").hasRole("USER") 
		//.antMatchers("/").permitAll()
		.and().formLogin()
		.loginPage("/login")
		.successHandler(authenticationSuccessHandler)
	//	.failureUrl("/login?error")
		.and()
		.logout()
//    	.logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
//    	.logoutSuccessUrl("/login?logout")
//    	.deleteCookies("my-remember-me-cookie")
        .permitAll()
        .and()
        .exceptionHandling();
	}
	
	@Bean
	public PasswordEncoder getPasswordEncoder() {
		return NoOpPasswordEncoder.getInstance(); 
	}
	
}
