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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.ldap.LdapSearchFilterAttribute;
import tr.org.lider.ldap.SearchFilterEnum;
import tr.org.lider.messaging.messages.XMPPClientImpl;
import tr.org.lider.services.ConfigurationService;


/**
 * 
 * Getting ldap hierarchy for computers users groups and roles..
 * @author M. Edip YILDIZ
 *
 */
@RestController()
@RequestMapping("/lider/ldap")
public class LdapController {

	Logger logger = LoggerFactory.getLogger(LdapController.class);

	@Autowired
	private LDAPServiceImpl ldapService;

	@Autowired
	private ConfigurationService configurationService;

	@Autowired
	private XMPPClientImpl messagingService;

//	@RequestMapping(value = "/getOuDetails")
//	public List<LdapEntry> task(LdapEntry selectedEntry) {
//		List<LdapEntry> subEntries = null;
//		try {
//			subEntries = ldapService.findSubEntries(selectedEntry.getUid(), "(objectclass=*)",
//					new String[] { "*" }, SearchScope.ONELEVEL);
//		} catch (LdapException e) {
//			e.printStackTrace();
//		}
//		Collections.sort(subEntries);
//		selectedEntry.setChildEntries(subEntries);
//		return subEntries;
//	}
//
//	@RequestMapping(value = "/getOu")
//	public List<LdapEntry> getOu(LdapEntry selectedEntry) {
//		List<LdapEntry> subEntries = null;
//		try {
//			subEntries = ldapService.findSubEntries(selectedEntry.getUid(), "(&(objectclass=organizationalUnit)(objectclass=pardusLider))",
//					new String[] { "*" }, SearchScope.ONELEVEL);
//		} catch (LdapException e) {
//			e.printStackTrace();
//		}
//		selectedEntry.setChildEntries(subEntries);
//		return subEntries;
//	}

//	@RequestMapping(method=RequestMethod.POST, value = "/addOu",produces = MediaType.APPLICATION_JSON_VALUE)
//	public LdapEntry addOu(LdapEntry selectedEntry) {
//		try {
//			Map<String, String[]> attributes = new HashMap<String,String[]>();
//			attributes.put("objectClass", new String[] {"organizationalUnit", "top", "pardusLider"} );
//			attributes.put("ou", new String[] { selectedEntry.getOu() });
//
//			String dn="ou="+selectedEntry.getOu()+","+selectedEntry.getParentName();
//			
//			ldapService.addEntry(dn, attributes);
//			logger.info("OU created successfully RDN ="+dn);
//			
//			//get full of ou details after creation
//			selectedEntry = ldapService.getEntryDetail(dn);
//			
//			return selectedEntry;
//		} catch (LdapException e) {
//			e.printStackTrace();
//			return null;
//		}
//	}

//	@RequestMapping(value = "/getSudoGroups")
//	public List<LdapEntry> getSudoGroups() {
//		List<LdapEntry> retList = new ArrayList<LdapEntry>();
//		retList.add(ldapService.getLdapSudoGroupsTree());
//		return retList;
//	}

//	//gets tree of groups of names which just has agent members
//	@RequestMapping(value = "/agentGroups")
//	public List<LdapEntry> getAgentGroups() {
//		List<LdapEntry> result = new ArrayList<LdapEntry>();
//		result.add(ldapService.getLdapAgentsGroupTree());
//		return result;
//	}

//	//gets tree of groups of names which just has user members
//	@RequestMapping(value = "/userGroups")
//	public List<LdapEntry> getLdapUserGroupsTree() {
//		List<LdapEntry> result = new ArrayList<LdapEntry>();
//		result.add(ldapService.getLdapUsersGroupTree());
//		return result;
//	}

//	@RequestMapping(value = "/getGroups")
//	public List<LdapEntry> getGroups() {
//		List<LdapEntry> retList = new ArrayList<LdapEntry>();
//		retList.add(ldapService.getLdapGroupsTree());
//		return retList;
//	}

//	@RequestMapping(value = "/getComputers")
//	public List<LdapEntry> getComputers() {
//		List<LdapEntry> retList = new ArrayList<LdapEntry>();
//		retList.add(ldapService.getLdapComputersTree());
//		return retList;
//	}

//	@RequestMapping(value = "/getAhenks", method = { RequestMethod.POST })
//	public List<LdapEntry> getAhenks(HttpServletRequest request,Model model, @RequestBody LdapEntry[] selectedEntryArr) {
//		List<LdapEntry> ahenkList=new ArrayList<>();
//		for (LdapEntry ldapEntry : selectedEntryArr) {
//			List<LdapSearchFilterAttribute> filterAttributes = new ArrayList<LdapSearchFilterAttribute>();
//			LdapSearchFilterAttribute fAttr = new LdapSearchFilterAttribute("objectClass", "pardusDevice",	SearchFilterEnum.EQ);
//			filterAttributes.add(fAttr);
//			try {
//				List<LdapEntry> retList=ldapService.findSubEntries(ldapEntry.getDistinguishedName(), "(objectclass=pardusDevice)", new String[] { "*" }, SearchScope.SUBTREE);
//				for (LdapEntry ldapEntry2 : retList) {
//					boolean isExist=false;
//					for (LdapEntry ldapEntryAhenk : ahenkList) {
//						if(ldapEntry2.getEntryUUID().equals(ldapEntryAhenk.getEntryUUID())) {
//							isExist=true;
//							break;
//						}
//					}
//					if(!isExist) {
//						ahenkList.add(ldapEntry2);
//					}
//				}
//			} catch (LdapException e) {
//				e.printStackTrace();
//			}
//		}
//		return ahenkList;
//	}

//	@RequestMapping(value = "/getOnlineAhenks", method = { RequestMethod.POST })
//	public String getOnlyOnlineAhenks(@RequestBody LdapEntry[] selectedEntryArr) {
//		List<LdapEntry> ahenkList=new ArrayList<>();
//		for (LdapEntry ldapEntry : selectedEntryArr) {
//			List<LdapSearchFilterAttribute> filterAttributes = new ArrayList<LdapSearchFilterAttribute>();
//			LdapSearchFilterAttribute fAttr = new LdapSearchFilterAttribute("objectClass", "pardusDevice",	SearchFilterEnum.EQ);
//			filterAttributes.add(fAttr);
//			try {
//				List<LdapEntry> retList=ldapService.findSubEntries(ldapEntry.getDistinguishedName(), "(objectclass=pardusDevice)", new String[] { "*" }, SearchScope.SUBTREE);
//				for (LdapEntry ldapEntry2 : retList) {
//					boolean isExist=false;
//					for (LdapEntry ldapEntryAhenk : ahenkList) {
//						if(ldapEntry2.getEntryUUID().equals(ldapEntryAhenk.getEntryUUID())) {
//							isExist=true;
//							break;
//						}
//					}
//					if(!isExist && messagingService.isRecipientOnline(ldapEntry2.getUid())) {
//						ahenkList.add(ldapEntry2);
//					}
//				}
//			} catch (LdapException e) {
//				e.printStackTrace();
//			}
//		}
//		ObjectMapper mapper = new ObjectMapper();
//		String ret = null;
//		try {
//			ret = mapper.writeValueAsString(ahenkList);
//		} catch (JsonProcessingException e) {
//			e.printStackTrace();
//		}
//		return ret;
//	}

//	//add new group and add selected agents
//	@RequestMapping(method=RequestMethod.POST ,value = "/createNewAgentGroup", produces = MediaType.APPLICATION_JSON_VALUE)
//	@ResponseBody
//	public LdapEntry createNewAgentGroup(@RequestParam(value = "selectedOUDN", required=false) String selectedOUDN,
//			@RequestParam(value = "groupName", required=true) String groupName,
//			@RequestParam(value = "checkedList[]", required=true) String[] checkedList) {
//		String newGroupDN = "";
//		//to return newly added entry with its details
//		LdapEntry entry;
//		if(selectedOUDN == null || selectedOUDN.equals("")) {
//			newGroupDN = "cn=" +  groupName +","+ configurationService.getAhenkGroupLdapBaseDn();
//		} else {
//			newGroupDN = "cn=" +  groupName +","+ selectedOUDN;
//		}
//		Map<String, String[]> attributes = new HashMap<String,String[]>();
//		attributes.put("objectClass", new String[] {"groupOfNames", "top", "pardusLider"} );
//		attributes.put("liderGroupType", new String[] {"AHENK"} );
//		try {
//			//when single dn comes spring boot takes it as multiple arrays
//			//so dn must be joined with comma
//			//if member dn that will be added to group is cn=agent1,ou=Groups,dn=liderahenk,dc=org
//			//spring boot gets this param as array which has size 4
//			Boolean checkedArraySizeIsOne = true;
//			for (int i = 0; i < checkedList.length; i++) {
//				if(checkedList[i].contains(",")) {
//					checkedArraySizeIsOne = false;
//					break;
//				}
//			}
//			if(checkedArraySizeIsOne ) {
//				attributes.put("member", new String[] {String.join(",", checkedList)} );
//			} else {
//				attributes.put("member", checkedList );
//			}
//			ldapService.addEntry(newGroupDN , attributes);
//			entry = ldapService.getEntryDetail(newGroupDN);
//		} catch (LdapException e) {
//			System.out.println("Error occured while adding new group.");
//			return null;
//		}
//		return entry;
//	}


	
//	//get members of group
//	@RequestMapping(method=RequestMethod.POST ,value = "/group/members", produces = MediaType.APPLICATION_JSON_VALUE)
//	public List<LdapEntry> getMembersOfGroup(@RequestParam(value="dn", required=true) String dn) {
//		LdapEntry entry = ldapService.getEntryDetail(dn);
//		List<LdapEntry> listOfMembers = new ArrayList<>();
//
//		for(String memberDN: entry.getAttributesMultiValues().get("member")) {
//			listOfMembers.add(ldapService.getEntryDetail(memberDN));
//		}
//		return listOfMembers;
//	}

//	//get entry
//	@RequestMapping(method=RequestMethod.GET ,value = "/entry/", produces = MediaType.APPLICATION_JSON_VALUE)
//	public LdapEntry getEntry(@RequestParam(value="dn", required=true) String dn) {
//		return ldapService.getEntryDetail(dn);
//	}
	
//	//delete member from group
//	@RequestMapping(method=RequestMethod.POST ,value = "/delete/group/members", produces = MediaType.APPLICATION_JSON_VALUE)
//	@ResponseBody
//	public LdapEntry deleteMembersOfGroup(@RequestParam(value="dn", required=true) String dn, 
//			@RequestParam(value="dnList[]", required=true) List<String> dnList) {
//		//when single dn comes spring boot takes it as multiple arrays
//		//so dn must be joined with comma
//		//if member dn that will be added to group is cn=agent1,ou=Groups,dn=liderahenk,dc=org
//		//spring boot gets this param as array which has size 4
//		Boolean checkedArraySizeIsOne = true;
//		for (int i = 0; i < dnList.size(); i++) {
//			if(dnList.get(i).contains(",")) {
//				checkedArraySizeIsOne = false;
//				break;
//			}
//		}
//		if(checkedArraySizeIsOne) {
//			try {
//				ldapService.updateEntryRemoveAttributeWithValue(dn, "member", String.join(",", dnList));
//			} catch (LdapException e) {
//				e.printStackTrace();
//				return null;
//			}
//		} else {
//			for (int i = 0; i < dnList.size(); i++) {
//				try {
//					ldapService.updateEntryRemoveAttributeWithValue(dn, "member", dnList.get(i));
//				} catch (LdapException e) {
//					e.printStackTrace();
//					return null;
//				}
//			}
//		}
//		return ldapService.getEntryDetail(dn);
//	}
	
//	//returns root dn of agent group(groupOfNames)
//	@RequestMapping(method=RequestMethod.GET ,value = "/group/rootdnofagent", produces = MediaType.APPLICATION_JSON_VALUE)
//	@ResponseBody
//	public String getRootDNOfAgentGroup() {
//		return configurationService.getAhenkGroupLdapBaseDn();
//	}
//
//	//returns root dn of user group(groupOfNames)
//	@RequestMapping(method=RequestMethod.GET ,value = "/group/rootdnofuser", produces = MediaType.APPLICATION_JSON_VALUE)
//	@ResponseBody
//	public String getRootDNOfUserGroup() {
//		return configurationService.getUserGroupLdapBaseDn();
//	}
	
//	@RequestMapping(method=RequestMethod.POST, value = "/deleteEntry")
//	public Boolean deleteEntry(@RequestParam(value = "dn") String dn) {
//		try {
//			if(dn != configurationService.getAgentLdapBaseDn()) {
//				ldapService.deleteNodes(ldapService.getOuAndOuSubTreeDetail(dn));
//				return true;
//			} else {
//				return false;
//			}
//			
//		} catch (Exception e) {
//			e.printStackTrace();
//			return false;
//		}
//	}
	
//	@RequestMapping(method=RequestMethod.POST ,value = "/move/entry", produces = MediaType.APPLICATION_JSON_VALUE)
//	public Boolean moveEntry(@RequestParam(value="sourceDN", required=true) String sourceDN,
//			@RequestParam(value="destinationDN", required=true) String destinationDN) {
//		try {
//			ldapService.moveEntry(sourceDN, destinationDN);
//			
//		} catch (Exception e) {
//			e.printStackTrace();
//			return false;
//		}
//		return true;
//	}
	
	
//	@RequestMapping(method=RequestMethod.POST ,value = "/rename/entry", produces = MediaType.APPLICATION_JSON_VALUE)
//	public Boolean renameEntry(@RequestParam(value="oldDN", required=true) String oldDN,
//			@RequestParam(value="newName", required=true) String newName) {
//		try {
//			return ldapService.renameEntry(oldDN, newName);
//		} catch (Exception e) {
//			e.printStackTrace();
//			return null;
//		}
//	}
	
	/**
	 * 
	 * @param key
	 * @param value
	 * @return
	 */
	@RequestMapping(method=RequestMethod.POST ,value = "/searchEntry", produces = MediaType.APPLICATION_JSON_VALUE)
	public List<LdapEntry> searchEntry(
			@RequestParam(value="searchDn", required=true) String searchDn,
			@RequestParam(value="key", required=true) String key, 
			@RequestParam(value="value", required=true) String value) {
		
		List<LdapEntry> results=null;
		try {
			if(searchDn.equals("")) {
				searchDn=configurationService.getLdapRootDn();
			}
			List<LdapSearchFilterAttribute> filterAttributes = new ArrayList<LdapSearchFilterAttribute>();
			filterAttributes.add(new LdapSearchFilterAttribute(key, value, SearchFilterEnum.EQ));
			results = ldapService.search(searchDn,filterAttributes, new String[] {"*"});
		} catch (LdapException e) {
			e.printStackTrace();
		}
		return results ;
	}
	
//	//add new group and add selected attributes
//	@RequestMapping(method=RequestMethod.POST ,value = "/createSudoGroup", produces = MediaType.APPLICATION_JSON_VALUE)
//	@ResponseBody
//	public LdapEntry createSudoGroup(@RequestParam(value = "groupName", required=true) String groupName,
//			@RequestParam(value = "selectedOUDN", required=true) String selectedOUDN,
//			@RequestParam(value = "sudoHostList[]", required=false)  String[] sudoHostList,
//			@RequestParam(value = "sudoCommandList[]", required=false)  String[] sudoCommandList,
//			@RequestParam(value = "sudoUserList[]", required=false)  String[] sudoUserList) {
//		
//		String newGroupDN = "";
//		//to return newly added entry with its details
//		LdapEntry entry;
//		Map<String, String[]> attributes = new HashMap<String,String[]>();
//		attributes.put("objectClass", new String[] {"top", "sudoRole"} );
//		try {
//			//add sudoUser attributes 
//			if(sudoUserList != null) {
//				attributes.put("sudoUser", sudoUserList );
//			}
//			//add sudoHost attributes 
//			if(sudoHostList != null) {
//				attributes.put("sudoHost", sudoHostList );
//			}
//			//add sudoCommand attributes 
//			if(sudoCommandList != null) {
//				attributes.put("sudoCommand", sudoCommandList );
//			}
//			newGroupDN = "cn=" +  groupName +","+ selectedOUDN;
//			ldapService.addEntry(newGroupDN , attributes);
//			entry = ldapService.getEntryDetail(newGroupDN);
//		} catch (LdapException e) {
//			logger.error("Error occured while adding new group.");
//			return null;
//		}
//		return entry;
//	}
	
//	//edit sudo group
//	@RequestMapping(method=RequestMethod.POST ,value = "/editSudoGroup", produces = MediaType.APPLICATION_JSON_VALUE)
//	@ResponseBody
//	public LdapEntry editSudoGroup(@RequestParam(value = "selectedDN", required=true) String selectedDN,
//			@RequestParam(value = "sudoHostList[]", required=false)  String[] sudoHostList,
//			@RequestParam(value = "sudoCommandList[]", required=false)  String[] sudoCommandList,
//			@RequestParam(value = "sudoUserList[]", required=false)  String[] sudoUserList) {
//		LdapEntry entry;
//		try {
//			ldapService.updateEntryRemoveAttribute(selectedDN, "sudoCommand");
//			ldapService.updateEntryRemoveAttribute(selectedDN, "sudoHost");
//			ldapService.updateEntryRemoveAttribute(selectedDN, "sudoUser");
//			if(sudoHostList != null) {
//				for (String value : sudoHostList) {
//					ldapService.updateEntryAddAtribute(selectedDN, "sudoHost", value);
//				}
//			}
//			if(sudoCommandList != null) {
//				for (String value : sudoCommandList) {
//					ldapService.updateEntryAddAtribute(selectedDN, "sudoCommand", value);
//				}
//			}
//			if(sudoUserList != null) {
//				for (String value : sudoUserList) {
//					ldapService.updateEntryAddAtribute(selectedDN, "sudoUser", value);
//				}
//			}
//			entry = ldapService.getEntryDetail(selectedDN);
//		} catch (LdapException e) {
//			e.printStackTrace();
//			return null;
//		}
//		return entry;
//	}
	
//	//delete sudoUser from sudo groups
//	@RequestMapping(method=RequestMethod.POST ,value = "/delete/sudo/user", produces = MediaType.APPLICATION_JSON_VALUE)
//	@ResponseBody
//	public LdapEntry deleteUserOfSudoGroup(@RequestParam(value="dn", required=true) String dn, 
//			@RequestParam(value="uid", required=true) String uid) {
//		try {
//			ldapService.updateEntryRemoveAttributeWithValue(dn, "sudoUser", uid);
//		} catch (LdapException e) {
//			e.printStackTrace();
//			return null;
//		}
//		return ldapService.getEntryDetail(dn);
//	}
	
	
//	/**
//	 * 
//	 * @param searchDn
//	 * @param key
//	 * @param value
//	 * @return
//	 */
//	@RequestMapping(method=RequestMethod.POST ,value = "/removeAttributeWithValue", produces = MediaType.APPLICATION_JSON_VALUE)
//	public LdapEntry removeAttributeWithValue(
//			@RequestParam(value="dn", required=true) String dn,
//			@RequestParam(value="attribute", required=true) String attribute, 
//			@RequestParam(value="value", required=true) String value) {
//		
//		LdapEntry entry=null;
//		try {
//			ldapService.updateEntryRemoveAttributeWithValue(dn, attribute, value);
//			entry = ldapService.findSubEntries(dn, "(objectclass=*)", new String[] {"*"}, SearchScope.OBJECT).get(0);
//		} catch (LdapException e) {
//			e.printStackTrace();
//			return null;
//		}
//		return entry ;
//	}

}
