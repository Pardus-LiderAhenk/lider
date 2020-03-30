package tr.org.lider;

import java.util.List;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.models.LiderUser;


@Service
public class LiderSecurityUserService implements UserDetailsService {
	
	@Autowired
	LDAPServiceImpl ldapService;
	
	@Override
	public UserDetails loadUserByUsername(String userName) throws UsernameNotFoundException {
		LiderUser user=null;
		
		LdapEntry ldapEntry=null;
		try {
			String filter= "(&(objectClass=pardusAccount)(objectClass=pardusLider)(liderPrivilege=ROLE_USER)(uid=$1))".replace("$1", userName);
			List<LdapEntry> ldapEntries  = ldapService.findSubEntries(filter,
					new String[] { "*" }, SearchScope.SUBTREE);
			
			if(ldapEntries.size()>0) {
				ldapEntry=ldapEntries.get(0);
			}
		} catch (LdapException e) {
			e.printStackTrace();
		}
		
		if(ldapEntry!=null) {
			user= new LiderUser();
			user.setName(ldapEntry.getUid());
			user.setPassword(ldapEntry.getUserPassword());
			user.setSurname(ldapEntry.getSn());
			user.setUid(ldapEntry.getDistinguishedName());
			user.setRoles(ldapEntry.getPriviliges());
		}
		else {
			throw new UsernameNotFoundException("USer Not Found . User :"+ userName);
		}
		
		return new LiderSecurityUserDetails(user);
	}
}
