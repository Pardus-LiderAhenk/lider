package tr.org.lider.controllers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.ldap.DNType;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.services.ConfigurationService;

@RestController()
@RequestMapping("/lider/user")
public class UserController {
	
	Logger logger = LoggerFactory.getLogger(UserController.class);
	
	@Autowired
	private LDAPServiceImpl ldapService;
	
	@Autowired
	private ConfigurationService configurationService;
	
	
	@RequestMapping(value = "/getUsers")
	public List<LdapEntry> getUsers() {
		List<LdapEntry> retList = new ArrayList<LdapEntry>();
		retList.add(ldapService.getLdapUserTree());
		return retList;
	}
	
	
	@RequestMapping(method=RequestMethod.POST, value = "/addUser",produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public LdapEntry addUser(LdapEntry selectedEntry) {
		try {
			String gidNumber="6000";
			int randomInt = (int)(1000000.0 * Math.random());
			String uidNumber= Integer.toString(randomInt);
			String home="/home/"+selectedEntry.getUid();

			Map<String, String[]> attributes = new HashMap<String, String[]>();
			attributes.put("objectClass", new String[] { "top", "posixAccount",
					"person","pardusLider","pardusAccount","organizationalPerson","inetOrgPerson"});
			attributes.put("cn", new String[] { selectedEntry.getCn() });
			attributes.put("gidNumber", new String[] { gidNumber });
			attributes.put("homeDirectory", new String[] { home });
			attributes.put("sn", new String[] { selectedEntry.getSn() });
			attributes.put("uid", new String[] { selectedEntry.getUid() });
			attributes.put("uidNumber", new String[] { uidNumber });
			attributes.put("loginShell", new String[] { "/bin/bash" });
			attributes.put("userPassword", new String[] { selectedEntry.getUserPassword() });
			attributes.put("homePostalAddress", new String[] { selectedEntry.getHomePostalAddress() });
			attributes.put("telephoneNumber", new String[] { selectedEntry.getTelephoneNumber() });

			String rdn="uid="+selectedEntry.getUid()+","+selectedEntry.getParentName();

			ldapService.addEntry(rdn, attributes);

			logger.info("User created successfully RDN ="+rdn);
			return selectedEntry;
		} catch (LdapException e) {
			e.printStackTrace();
			return null;
		}
	}
	
	
	@RequestMapping(method=RequestMethod.POST, value = "/deleteUser")
	@ResponseBody
	public Boolean deleteUser(@RequestBody LdapEntry[] selectedEntryArr) {
		try {
			List<LdapEntry> ouList=new ArrayList<>();

			for (LdapEntry ldapEntry : selectedEntryArr) {
				if(ldapEntry.getType().equals(DNType.USER)) {
					ldapService.deleteEntry(ldapEntry.getDistinguishedName());
					logger.info("User deleted successfully RDN ="+ldapEntry.getDistinguishedName());
				}
				else if(ldapEntry.getType().equals(DNType.ORGANIZATIONAL_UNIT)) {
					ouList.add(ldapEntry);
				}
			}
			for (LdapEntry ldapEntry : ouList) {
				ldapService.deleteNodes(ldapService.getOuAndOuSubTreeDetail(ldapEntry.getDistinguishedName()));
			}
			return true;
		} catch (LdapException e) {
			e.printStackTrace();
			return null;
		}
	}
	
	/**
	 * edit only requeired user attributes
	 * @param selectedEntry
	 * @return
	 */
	@RequestMapping(method=RequestMethod.POST, value = "/editUser",produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public LdapEntry editUser(LdapEntry selectedEntry) {
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
			if(!"".equals(selectedEntry.getHomePostalAddress())){
				ldapService.updateEntry(selectedEntry.getDistinguishedName(), "homePostalAddress", selectedEntry.getHomePostalAddress());
			}
			
			return selectedEntry;
		} catch (LdapException e) {
			e.printStackTrace();
			return null;
		}
	}
	
	/**
	 * update user password
	 * @param selectedEntry
	 * @return
	 */
	@RequestMapping(method=RequestMethod.POST, value = "/updateUserPassword",produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public LdapEntry updateUserPassword(LdapEntry selectedEntry) {
		try {
		
			if(!"".equals(selectedEntry.getUserPassword())){
				ldapService.updateEntry(selectedEntry.getDistinguishedName(), "userPassword", selectedEntry.getUserPassword());
			}
			
			return selectedEntry;
		} catch (LdapException e) {
			e.printStackTrace();
			return null;
		}
	}
	/**
	 * getting password policy  
	 * @param selectedEntry
	 * @return
	 */
	@RequestMapping(method=RequestMethod.POST, value = "/getPasswordPolices",produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public List<LdapEntry> getPasswordPolices() {
		List<LdapEntry> passwordPolicies = null;
		try {
			passwordPolicies = ldapService.findSubEntries(configurationService.getLdapRootDn(), "(objectclass=pwdPolicy)",
					new String[] { "*" }, SearchScope.SUBTREE);

		} catch (LdapException e) {
			e.printStackTrace();
		}
		return passwordPolicies;
	}
	/**
	 * set password policy to user  
	 * @param passwordPolicy
	 * @return
	 */
	@RequestMapping(method=RequestMethod.POST, value = "/setPasswordPolicy",produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public Boolean setPasswordPolicy(@RequestParam(value = "dn", required=true) String dn,@RequestParam(value = "passwordPolicy", required=true) String passwordPolicy) {
		try {
			ldapService.updateEntry(dn, "pwdPolicySubentry", passwordPolicy);
			
		} catch (LdapException e) {
			e.printStackTrace();
			return null;
		}
		return true;
	}

}
