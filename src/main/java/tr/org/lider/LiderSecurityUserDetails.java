package tr.org.lider;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import tr.org.lider.models.LiderUser;


@Service
public class LiderSecurityUserDetails implements UserDetails {

	private LiderUser liderUser;
	
	public LiderSecurityUserDetails(LiderUser liderUser) {
		this.liderUser=liderUser;
	}
	
	public LiderSecurityUserDetails() {
	}
	
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		
		List<GrantedAuthority> authorities= new ArrayList<GrantedAuthority>();
		for (String role : liderUser.getRoles()) {
			authorities.add(new SimpleGrantedAuthority(role));
		}
		return authorities;
	}

	@Override
	public String getPassword() {
		return liderUser.getPassword();
	}

	@Override
	public String getUsername() {
		return liderUser.getUsername();
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
	
	public LiderUser getLiderUser() {
		return liderUser;
	}

	public void setLiderUser(LiderUser liderUser) {
		this.liderUser = liderUser;
	}
	
	@Override
	public String toString() {
		
		return getUsername();
	}


}
