package tr.org.lider.services;

import java.util.ArrayList;
import java.util.List;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.ldap.LdapSearchFilterAttribute;
import tr.org.lider.ldap.SearchFilterEnum;

@Service
public class LoginService {
	
	@Autowired
	private LDAPServiceImpl ldapService;
	

	public LdapEntry getUser(String userName, String password) {
		
		
//		try {
//			password= LDAPServiceImpl.generateSSHA(password.getBytes());
//		} catch (NoSuchAlgorithmException e1) {
//			// TODO Auto-generated catch block
//			e1.printStackTrace();
//		}
		
		List<LdapSearchFilterAttribute> filterAtt = new ArrayList<>();
		filterAtt.add(new LdapSearchFilterAttribute("cn", userName, SearchFilterEnum.EQ));
		filterAtt.add(new LdapSearchFilterAttribute("userPassword", password, SearchFilterEnum.EQ));
		
		LdapEntry ldapEntry=null;
		try {
//			List<LdapEntry> ldapEntries = ldapService.search(filterAtt, new String[] { "cn","userPassword","sn" });
			
			String filter= "(&(objectClass=pardusAccount)(objectClass=pardusLider)(cn=$1))".replace("$1", userName);
			List<LdapEntry> ldapEntries  = ldapService.findSubEntries(filter,
					new String[] { "*" }, SearchScope.SUBTREE);
			
			
			if(ldapEntries.size()>0) {
				
			ldapEntry=ldapEntries.get(0);
				
			}
			
			
		} catch (LdapException e) {
			e.printStackTrace();
		}
		
		return ldapEntry;
	}

	
	
	
}
