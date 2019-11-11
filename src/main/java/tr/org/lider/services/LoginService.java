package tr.org.lider.services;

import java.util.ArrayList;
import java.util.List;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.Message;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.ldap.LdapSearchFilterAttribute;
import tr.org.lider.ldap.SearchFilterEnum;
import tr.org.lider.models.UserImpl;
import tr.org.lider.repositories.MessageRepository;

@Service
public class LoginService {
	
	@Autowired
	private LDAPServiceImpl ldapService;
	
	@Autowired
	private MessageRepository messageRepository;	
	
//	@Autowired
//	private PluginDaoImpl pluginDao;
//	

	public List<Message> getMessages(){
		return messageRepository.findAll();
	}

	public UserImpl getUser(String userName, String password) {
		
		List<LdapSearchFilterAttribute> filterAtt = new ArrayList<>();
		filterAtt.add(new LdapSearchFilterAttribute("cn", userName, SearchFilterEnum.EQ));
		filterAtt.add(new LdapSearchFilterAttribute("userPassword", password, SearchFilterEnum.EQ));
		UserImpl user=null;

		try {
			List<LdapEntry> ldapEntries = ldapService.search(filterAtt, new String[] { "*" });
			
			if(ldapEntries.size()>0) {
				
				LdapEntry ldapEntry=ldapEntries.get(0);
			
				user= new UserImpl();
				user.setName(ldapEntry.getName());
			}
			
			
		} catch (LdapException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return user;
	}

	
	
	
}
