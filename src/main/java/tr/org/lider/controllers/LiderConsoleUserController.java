package tr.org.lider.controllers;

import java.util.List;
import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.entities.OperationType;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.services.ConfigurationService;
import tr.org.lider.services.OperationLogService;

/**
 * 
 * Return lider console user profile, update profile and update password
 * @author <a href="mailto:tuncay.colak@tubitak.gov.tr">Tuncay ÇOLAK</a>
 *
 */

@RestController()
@RequestMapping("/liderConsole")
public class LiderConsoleUserController {
	
	Logger logger = LoggerFactory.getLogger(LiderConsoleUserController.class);
	
	@Autowired
	private LDAPServiceImpl ldapService;
	
	@Autowired
	private ConfigurationService configurationService;
	
	@Autowired
	private OperationLogService operationLogService; 
	
	
//	LIDER_CONSOLE USER
//	return lider console profile from ldap
	@RequestMapping(method=RequestMethod.POST, value = "/profile")
	@ResponseBody
	public LdapEntry getLiderConsoleUser(@RequestParam(value="uid", required=true) String uid) {
		String globalUserOu = configurationService.getUserLdapBaseDn();
		LdapEntry liderConsoleUser = null;
		try {
			String filter="(&(uid="+ uid +"))";
			List<LdapEntry> usersEntrylist = ldapService.findSubEntries(globalUserOu, filter,new String[] { "*" }, SearchScope.SUBTREE);
			if(usersEntrylist.size()>0)
			liderConsoleUser = usersEntrylist.get(usersEntrylist.size()-1);
		} catch (LdapException e) {
			e.printStackTrace();
		}
		return liderConsoleUser;
	}
	
	/**
	 * updated password of lider console
	 * @param selectedEntry
	 * @return
	 */
	@RequestMapping(method=RequestMethod.POST, value = "/updatePassword",produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public boolean updateLiderConsoleUserPassword(LdapEntry selectedEntry) {
		try {
		
			if(!"".equals(selectedEntry.getUserPassword())){
				ldapService.updateEntry(selectedEntry.getDistinguishedName(), "userPassword", selectedEntry.getUserPassword());
			}
			operationLogService.saveOperationLog(OperationType.CHANGE_PASSWORD,"Lider Arayüz kullanıcı parolası güncellendi.",null);
			return true;
		} catch (LdapException e) {
			e.printStackTrace();
			return false;
		}
	}
	
//	updated profile of lider console
	@RequestMapping(method=RequestMethod.POST, value = "/updateProfile",produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public LdapEntry updateLiderConsoleUser(LdapEntry selectedEntry) {
		try {
			if(!"".equals(selectedEntry.getCn())){
				ldapService.updateEntry(selectedEntry.getDistinguishedName(), "cn", selectedEntry.getCn());
			}
			if(!"".equals(selectedEntry.getSn())){
				ldapService.updateEntry(selectedEntry.getDistinguishedName(), "sn", selectedEntry.getSn());
			}
			if(!"".equals(selectedEntry.getTelephoneNumber())){
				ldapService.updateEntry(selectedEntry.getDistinguishedName(), "telephoneNumber", selectedEntry.getTelephoneNumber());
			}
			if(!"".equals(selectedEntry.getMail())){
				ldapService.updateEntry(selectedEntry.getDistinguishedName(), "mail", selectedEntry.getMail());
			}
			if(!"".equals(selectedEntry.getHomePostalAddress())){
				ldapService.updateEntry(selectedEntry.getDistinguishedName(), "homePostalAddress", selectedEntry.getHomePostalAddress());
			}
			selectedEntry = ldapService.findSubEntries(selectedEntry.getDistinguishedName(), "(objectclass=*)", new String[] {"*"}, SearchScope.OBJECT).get(0);
			operationLogService.saveOperationLog(OperationType.UPDATE,"Lider Arayüz kullanıcı bilgileri güncellendi.",null);

			return selectedEntry;
		} catch (LdapException e) {
			e.printStackTrace();
			return null;
		}
	}
}
