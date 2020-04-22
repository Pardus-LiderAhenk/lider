package tr.org.lider;

import java.util.ArrayList;
import java.util.List;

import org.apache.directory.api.ldap.model.message.SearchScope;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.models.LiderUser;
import tr.org.lider.services.ConfigurationService;


@Service
public class LiderSecurityUserService implements UserDetailsService {
	
	@Autowired
	LDAPServiceImpl ldapService;
	
	@Autowired
	private ConfigurationService configurationService;
	
	@Override
	public UserDetails loadUserByUsername(String userName) throws UsernameNotFoundException {
		LiderUser user=null;
		
		LdapEntry ldapEntry=null;
		try {
			configurationService.destroyConfigParams();
			String filter= "(&(objectClass=pardusAccount)(objectClass=pardusLider)(liderPrivilege=ROLE_USER)(uid=$1))".replace("$1", userName);
			List<LdapEntry> ldapEntries  = ldapService.findSubEntries(filter,
					new String[] { "*" }, SearchScope.SUBTREE);
			
			if(ldapEntries.size()>0) {
				ldapEntry=ldapEntries.get(0);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		if(ldapEntry!=null) {
			user= new LiderUser();
			user.setName(ldapEntry.getUid());
			user.setPassword(ldapEntry.getUserPassword());
			user.setSurname(ldapEntry.getSn());
			user.setDn(ldapEntry.getDistinguishedName());
			String[] priviliges = ldapEntry.getAttributesMultiValues().get("liderPrivilege");
			List<String> roles = new ArrayList<String>();
			for (int i = 0; i < priviliges.length; i++) {
				if(priviliges[i].startsWith("ROLE_")) {
					roles.add(priviliges[i]);
				}
			}
			user.setRoles(roles);
		}
		else {
			throw new UsernameNotFoundException("User Not Found . User :"+ userName);
		}
		
		return new LiderSecurityUserDetails(user);
	}
}
