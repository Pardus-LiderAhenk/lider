package tr.org.lider.controllers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.ldap.DNType;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.ldap.LdapSearchFilterAttribute;
import tr.org.lider.ldap.SearchFilterEnum;
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
			if(selectedEntry.getTelephoneNumber()!=null && selectedEntry.getTelephoneNumber()!="")
				attributes.put("telephoneNumber", new String[] { selectedEntry.getTelephoneNumber() });

			String rdn="uid="+selectedEntry.getUid()+","+selectedEntry.getParentName();

			ldapService.addEntry(rdn, attributes);
			
			selectedEntry.setAttributesMultiValues(attributes);
			selectedEntry.setDistinguishedName(selectedEntry.getUid());

			logger.info("User created successfully RDN ="+rdn);
			selectedEntry = ldapService.findSubEntries(rdn, "(objectclass=*)", new String[] {"*"}, SearchScope.OBJECT).get(0);

			
			return selectedEntry;
		} catch (LdapException e) {
			e.printStackTrace();
			return null;
		}
	}
	/**
	 * delete selected user
	 * @param selectedEntryArr
	 * @return
	 */
	@RequestMapping(method=RequestMethod.POST, value = "/deleteUser")
	@ResponseBody
	public Boolean deleteUser(@RequestBody LdapEntry[] selectedEntryArr) {
		try {
			for (LdapEntry ldapEntry : selectedEntryArr) {
				if(ldapEntry.getType().equals(DNType.USER)) {
					ldapService.deleteEntry(ldapEntry.getDistinguishedName());
					logger.info("User deleted successfully RDN ="+ldapEntry.getDistinguishedName());
				}
			}
			return true;
		} catch (LdapException e) {
			e.printStackTrace();
			return null;
		}
	}
	
	/**
	 * edit only required user attributes
	 * return edited entry for update
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
			
			
			selectedEntry = ldapService.findSubEntries(selectedEntry.getDistinguishedName(), "(objectclass=*)", new String[] {"*"}, SearchScope.OBJECT).get(0);

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
			selectedEntry = ldapService.findSubEntries(selectedEntry.getDistinguishedName(), "(objectclass=*)", new String[] {"*"}, SearchScope.OBJECT).get(0);
			
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
	public LdapEntry setPasswordPolicy(@RequestParam(value = "dn", required=true) String dn,@RequestParam(value = "passwordPolicy", required=true) String passwordPolicy) {
		LdapEntry selectedEntry=null;
		try {
			ldapService.updateEntry(dn, "pwdPolicySubentry", passwordPolicy);
			
		selectedEntry = ldapService.findSubEntries(dn, "(objectclass=*)", new String[] {"*"}, SearchScope.OBJECT).get(0);

			
		} catch (LdapException e) {
			e.printStackTrace();
			return null;
		}
		return selectedEntry;
	}
	
	/**
	 * get users under sent ORGANIZATIONAL_UNIT 
	 * @param selectedEntryArr
	 * @return
	 */
	@RequestMapping(value = "/getUsersUnderOU", method = { RequestMethod.POST })
	public List<LdapEntry> getUsersUnderOU(HttpServletRequest request,Model model, @RequestBody LdapEntry[] selectedEntryArr) {
		List<LdapEntry> userList=new ArrayList<>();
		for (LdapEntry ldapEntry : selectedEntryArr) {
			List<LdapSearchFilterAttribute> filterAttributes = new ArrayList<LdapSearchFilterAttribute>();
			LdapSearchFilterAttribute fAttr = new LdapSearchFilterAttribute("objectClass", "pardusAccount",	SearchFilterEnum.EQ);
			filterAttributes.add(fAttr);
			try {
				List<LdapEntry> retList=ldapService.findSubEntries(ldapEntry.getDistinguishedName(), "(objectclass=pardusAccount)", new String[] { "*" }, SearchScope.SUBTREE);
				for (LdapEntry ldapEntry2 : retList) {
					boolean isExist=false;
					for (LdapEntry ldapEntryAhenk : userList) {
						if(ldapEntry2.getEntryUUID().equals(ldapEntryAhenk.getEntryUUID())) {
							isExist=true;
							break;
						}
					}
					if(!isExist) {
						userList.add(ldapEntry2);
					}
				}
			} catch (LdapException e) {
				e.printStackTrace();
			}
		}
		return userList;
	}

	//add new group and add selected agents
	@RequestMapping(method=RequestMethod.POST ,value = "/createNewGroup", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public LdapEntry createNewUserGroup(@RequestParam(value = "selectedOUDN", required=false) String selectedOUDN,
			@RequestParam(value = "groupName", required=true) String groupName,
			@RequestParam(value = "checkedList[]", required=true) String[] checkedList) {
		String newGroupDN = "";
		//to return newly added entry with its details
		LdapEntry entry;
		if(selectedOUDN == null || selectedOUDN.equals("")) {
			newGroupDN = "cn=" +  groupName +","+ configurationService.getAhenkGroupLdapBaseDn();
		} else {
			newGroupDN = "cn=" +  groupName +","+ selectedOUDN;
		}
		Map<String, String[]> attributes = new HashMap<String,String[]>();
		attributes.put("objectClass", new String[] {"groupOfNames", "top", "pardusLider"} );
		attributes.put("liderGroupType", new String[] {"USER"} );
		try {
			//when single dn comes spring boot takes it as multiple arrays
			//so dn must be joined with comma
			//if member dn that will be added to group is cn=user1,ou=Groups,dn=liderahenk,dc=org
			//spring boot gets this param as array which has size 4
			Boolean checkedArraySizeIsOne = true;
			for (int i = 0; i < checkedList.length; i++) {
				if(checkedList[i].contains(",")) {
					checkedArraySizeIsOne = false;
					break;
				}
			}
			if(checkedArraySizeIsOne ) {
				attributes.put("member", new String[] {String.join(",", checkedList)} );
			} else {
				attributes.put("member", checkedList );
			}
			ldapService.addEntry(newGroupDN , attributes);
			entry = ldapService.getEntryDetail(newGroupDN);
		} catch (LdapException e) {
			System.out.println("Error occured while adding new group.");
			return null;
		}
		return entry;
	}
	
	/**
	 * delete user ous
	 * @param selectedEntryArr
	 * @return
	 */
	
	@RequestMapping(method=RequestMethod.POST, value = "/deleteUserOu")
	@ResponseBody
	public Boolean deleteUserOu(@RequestBody LdapEntry[] selectedEntryArr) {
		try {
			for (LdapEntry ldapEntry : selectedEntryArr) {
				if(ldapEntry.getType().equals(DNType.ORGANIZATIONAL_UNIT))
				ldapService.deleteNodes(ldapService.getOuAndOuSubTreeDetail(ldapEntry.getDistinguishedName()));
			}
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}
}
