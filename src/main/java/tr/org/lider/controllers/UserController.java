package tr.org.lider.controllers;

import java.util.ArrayList;
import java.util.Collections;
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

import tr.org.lider.entities.CommandImpl;
import tr.org.lider.entities.UserSessionImpl;
import tr.org.lider.ldap.DNType;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.ldap.LdapSearchFilterAttribute;
import tr.org.lider.ldap.SearchFilterEnum;
import tr.org.lider.models.UserSessionsModel;
import tr.org.lider.services.CommandService;
import tr.org.lider.services.ConfigurationService;
import tr.org.lider.services.UserService;

@RestController()
@RequestMapping("/lider/user")
public class UserController {
	
	Logger logger = LoggerFactory.getLogger(UserController.class);
	
	@Autowired
	private LDAPServiceImpl ldapService;
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private ConfigurationService configurationService;
	
	@Autowired
	private CommandService commandService;
	
	@RequestMapping(value = "/getOuDetails")
	public List<LdapEntry> task(LdapEntry selectedEntry) {
		List<LdapEntry> subEntries = null;
		try {
			subEntries = ldapService.findSubEntries(selectedEntry.getUid(), "(objectclass=*)",
					new String[] { "*" }, SearchScope.ONELEVEL);
		} catch (LdapException e) {
			e.printStackTrace();
		}
		Collections.sort(subEntries);
		selectedEntry.setChildEntries(subEntries);
		return subEntries;
	}
	
	@RequestMapping(value = "/getOu")
	public List<LdapEntry> getOu(LdapEntry selectedEntry) {
		List<LdapEntry> subEntries = null;
		try {
			subEntries = ldapService.findSubEntries(selectedEntry.getUid(), "(&(objectclass=organizationalUnit)(objectclass=pardusLider))",
					new String[] { "*" }, SearchScope.ONELEVEL);
		} catch (LdapException e) {
			e.printStackTrace();
		}
		selectedEntry.setChildEntries(subEntries);
		return subEntries;
	}
	
	@RequestMapping(value = "/getUsers")
	public List<LdapEntry> getUsers() {
		List<LdapEntry> retList = new ArrayList<LdapEntry>();
		retList.add(ldapService.getLdapUserTree());
		return retList;
	}
	
	@RequestMapping(method=RequestMethod.POST, value = "/addOu",produces = MediaType.APPLICATION_JSON_VALUE)
	public LdapEntry addOu(LdapEntry selectedEntry) {
		try {
			Map<String, String[]> attributes = new HashMap<String,String[]>();
			attributes.put("objectClass", new String[] {"organizationalUnit", "top", "pardusLider"} );
			attributes.put("ou", new String[] { selectedEntry.getOu() });

			String dn="ou="+selectedEntry.getOu()+","+selectedEntry.getParentName();
			
			ldapService.addEntry(dn, attributes);
			logger.info("OU created successfully RDN ="+dn);
			
			//get full of ou details after creation
			selectedEntry = ldapService.getEntryDetail(dn);
			
			return selectedEntry;
		} catch (LdapException e) {
			e.printStackTrace();
			return null;
		}
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
			attributes.put("mail", new String[] { selectedEntry.getMail() });
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

			if(selectedEntry.getParentName()==null || selectedEntry.getParentName().equals("")) {
				selectedEntry.setParentName(configurationService.getUserLdapBaseDn());
			}
			
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
					List<LdapEntry> subEntries = ldapService.search("member", ldapEntry.getDistinguishedName(), new String[] {"*"});
					for (LdapEntry groupEntry : subEntries) {
						if(groupEntry.getAttributesMultiValues().get("member").length > 1) {
							ldapService.updateEntryRemoveAttributeWithValue(groupEntry.getDistinguishedName(), "member", ldapEntry.getDistinguishedName());
						} else {
							ldapService.deleteNodes(ldapService.getOuAndOuSubTreeDetail(groupEntry.getDistinguishedName()));
							//if there is any policy assigned to that group mark command as deleted
							List<CommandImpl> commands = commandService.findAllByDN(groupEntry.getDistinguishedName());
							for (CommandImpl command : commands) {
								command.setDeleted(true);
								commandService.updateCommand(command);
							}
						}
					}
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
			if(!"".equals(selectedEntry.getMail())){
				ldapService.updateEntry(selectedEntry.getDistinguishedName(), "mail", selectedEntry.getMail());
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
				if(ldapEntry.getType().equals(DNType.ORGANIZATIONAL_UNIT)) {
					ldapService.updateOLCAccessRulesAfterEntryDelete(ldapEntry.getDistinguishedName());
					ldapService.deleteNodes(ldapService.getOuAndOuSubTreeDetail(ldapEntry.getDistinguishedName()));
				}
			}
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}
	
	/**
	 * delete user ous
	 * @param selectedEntryArr
	 * @return
	 */
	
	@RequestMapping(method=RequestMethod.POST, value = "/getLastUser")
	@ResponseBody
	public LdapEntry getLastUser() {
		String globalUserOu = configurationService.getUserLdapBaseDn();
		LdapEntry lastUser=null;
		try {
			
			String filter="(&(objectClass=inetOrgPerson)(createTimestamp>=20200301000000Z))";
			
			List<LdapEntry> usersEntrylist = ldapService.findSubEntries(globalUserOu, filter,new String[] { "*" }, SearchScope.SUBTREE);
			if(usersEntrylist.size()>0)
			lastUser= usersEntrylist.get(usersEntrylist.size()-1);
			
			logger.info("last user : "+lastUser);
		} catch (LdapException e) {
			e.printStackTrace();
		}
		return lastUser;
	}
	
	@RequestMapping(method=RequestMethod.POST, value = "/getUserSessions")
	@ResponseBody
	public List<UserSessionsModel> getUserSessions(@RequestParam(value = "uid", required=true) String uid) {
		List<UserSessionsModel> userSessions=null;
		try {
			List<UserSessionImpl> userSessionsDb=	userService.getUserSessions(uid);
			userSessions=new ArrayList<>();
			for (UserSessionImpl userSessionImpl : userSessionsDb) {
				UserSessionsModel model= new UserSessionsModel();
				model.setAgent(userSessionImpl.getAgent());
				model.setCreateDate(userSessionImpl.getCreateDate());
				model.setId(userSessionImpl.getId());
				model.setSessionEvent(userSessionImpl.getSessionEvent());
				model.setUserIp(userSessionImpl.getUserIp());
				model.setUsername(userSessionImpl.getUsername());
				userSessions.add(model);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return userSessions;
	}
	
	@RequestMapping(method=RequestMethod.POST ,value = "/move/entry", produces = MediaType.APPLICATION_JSON_VALUE)
	public Boolean moveEntry(@RequestParam(value="sourceDN", required=true) String sourceDN,
			@RequestParam(value="destinationDN", required=true) String destinationDN) {
		try {
			ldapService.moveEntry(sourceDN, destinationDN);
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
		return true;
	}
	
	/**
	 * 
	 * @param searchDn
	 * @param key
	 * @param value
	 * @return
	 */
	@RequestMapping(method=RequestMethod.POST ,value = "/removeAttributeWithValue", produces = MediaType.APPLICATION_JSON_VALUE)
	public LdapEntry removeAttributeWithValue(
			@RequestParam(value="dn", required=true) String dn,
			@RequestParam(value="attribute", required=true) String attribute, 
			@RequestParam(value="value", required=true) String value) {
		
		LdapEntry entry=null;
		try {
			ldapService.updateEntryRemoveAttributeWithValue(dn, attribute, value);
			entry = ldapService.findSubEntries(dn, "(objectclass=*)", new String[] {"*"}, SearchScope.OBJECT).get(0);
		} catch (LdapException e) {
			e.printStackTrace();
			return null;
		}
		return entry ;
	}
}
