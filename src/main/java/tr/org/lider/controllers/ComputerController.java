package tr.org.lider.controllers;

import java.util.ArrayList;
import java.util.Collections;
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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.ldap.LdapSearchFilterAttribute;
import tr.org.lider.ldap.SearchFilterEnum;
import tr.org.lider.messaging.messages.XMPPClientImpl;
import tr.org.lider.services.ConfigurationService;


/**
 * Controller for computer url requests 
 */
@RestController()
@RequestMapping("/lider/computer")
public class ComputerController {
	
	Logger logger = LoggerFactory.getLogger(UserController.class);
	
	@Autowired
	private LDAPServiceImpl ldapService;
	
	@Autowired
	private ConfigurationService configurationService;
	
	@Autowired
	private XMPPClientImpl messagingService;
	
	@RequestMapping(value = "/getComputers")
	public List<LdapEntry> getComputers() {
		List<LdapEntry> retList = new ArrayList<LdapEntry>();
		retList.add(ldapService.getLdapComputersTree());
		return retList;
	}
	
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
	
	@RequestMapping(value = "/getOnlineAhenks", method = { RequestMethod.POST })
	public String getOnlyOnlineAhenks(@RequestBody LdapEntry[] selectedEntryArr) {
		List<LdapEntry> ahenkList=new ArrayList<>();
		for (LdapEntry ldapEntry : selectedEntryArr) {
			List<LdapSearchFilterAttribute> filterAttributes = new ArrayList<LdapSearchFilterAttribute>();
			LdapSearchFilterAttribute fAttr = new LdapSearchFilterAttribute("objectClass", "pardusDevice",	SearchFilterEnum.EQ);
			filterAttributes.add(fAttr);
			try {
				List<LdapEntry> retList=ldapService.findSubEntries(ldapEntry.getDistinguishedName(), "(objectclass=pardusDevice)", new String[] { "*" }, SearchScope.SUBTREE);
				for (LdapEntry ldapEntry2 : retList) {
					boolean isExist=false;
					for (LdapEntry ldapEntryAhenk : ahenkList) {
						if(ldapEntry2.getEntryUUID().equals(ldapEntryAhenk.getEntryUUID())) {
							isExist=true;
							break;
						}
					}
					if(!isExist && messagingService.isRecipientOnline(ldapEntry2.getUid())) {
						ahenkList.add(ldapEntry2);
					}
				}
			} catch (LdapException e) {
				e.printStackTrace();
			}
		}
		ObjectMapper mapper = new ObjectMapper();
		String ret = null;
		try {
			ret = mapper.writeValueAsString(ahenkList);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		return ret;
	}
	
	//add new group and add selected agents
	@RequestMapping(method=RequestMethod.POST ,value = "/createNewAgentGroup", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public LdapEntry createNewAgentGroup(@RequestParam(value = "selectedOUDN", required=false) String selectedOUDN,
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
		attributes.put("liderGroupType", new String[] {"AHENK"} );
		try {
			//when single dn comes spring boot takes it as multiple arrays
			//so dn must be joined with comma
			//if member dn that will be added to group is cn=agent1,ou=Groups,dn=liderahenk,dc=org
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
	
	//add agents to existing group
	@RequestMapping(method=RequestMethod.POST ,value = "/group/existing", produces = MediaType.APPLICATION_JSON_VALUE)
	public LdapEntry addAgentsToExistingGroup(@RequestParam(value="groupDN") String groupDN,
			@RequestParam(value = "checkedList[]", required=true) String[] checkedList) {
		LdapEntry entry;
		try {
			//when single dn comes spring boot takes it as multiple arrays
			//so dn must be joined with comma
			//if member dn that will be added to group is cn=agent1,ou=Groups,dn=liderahenk,dc=org
			//spring boot gets this param as array which has size 4
			Boolean checkedArraySizeIsOne = true;
			for (int i = 0; i < checkedList.length; i++) {
				if(checkedList[i].contains(",")) {
					checkedArraySizeIsOne = false;
					break;
				}
			}
			if(checkedArraySizeIsOne ) {
				ldapService.updateEntryAddAtribute(groupDN, "member", String.join(",", checkedList));
			} else {
				for (int i = 0; i < checkedList.length; i++) {
					ldapService.updateEntryAddAtribute(groupDN, "member", checkedList[i]);
				}
			}
			entry = ldapService.getEntryDetail(groupDN);
		} catch (LdapException e) {
			System.out.println("Error occured while adding new group.");
			return null;
		}
		return entry;
	}

}
