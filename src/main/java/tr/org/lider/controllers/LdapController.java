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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.ldap.DNType;
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

	@RequestMapping(value = "/getOuDetails")
	public List<LdapEntry> task(LdapEntry selectedEntry) {

		List<LdapEntry> subEntries = null;
		try {

			subEntries = ldapService.findSubEntries(selectedEntry.getUid(), "(objectclass=*)",
					new String[] { "*" }, SearchScope.ONELEVEL);

		} catch (LdapException e) {
			e.printStackTrace();
		}
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
			selectedEntry = ldapService.getOuDetail(selectedEntry.getDistinguishedName());
			
			return selectedEntry;
		} catch (LdapException e) {
			e.printStackTrace();
			return null;
		}
	}

	@RequestMapping(value = "/getSudoGroups")
	public List<LdapEntry> getSudoGroups(HttpServletRequest request, Model model) {

		List<LdapEntry> retList = new ArrayList<LdapEntry>();
		retList.add(ldapService.getLdapSudoGroupsTree());

		return retList;
	}

	//gets tree of groups of names which just has agent members
	@RequestMapping(value = "/agentGroups")
	public List<LdapEntry> getAgentGroups() {
		List<LdapEntry> result = new ArrayList<LdapEntry>();
		result.add(ldapService.getLdapAgentsGroupTree());
		return result;
	}

	//gets tree of groups of names which just has user members
	@RequestMapping(value = "/userGroups")
	public List<LdapEntry> getLdapUserGroupsTree() {
		List<LdapEntry> result = new ArrayList<LdapEntry>();
		result.add(ldapService.getLdapUsersGroupTree());
		return result;
	}

	@RequestMapping(value = "/getGroups")
	public List<LdapEntry> getGroups(HttpServletRequest request, Model model) {

		List<LdapEntry> retList = new ArrayList<LdapEntry>();
		retList.add(ldapService.getLdapGroupsTree());


		return retList;
	}

	@RequestMapping(value = "/getUsers")
	public List<LdapEntry> getUsers(HttpServletRequest request, Model model) {

		List<LdapEntry> retList = new ArrayList<LdapEntry>();
		retList.add(ldapService.getLdapUserTree());
		return retList;
	}



	@RequestMapping(value = "/getComputers")
	public List<LdapEntry> getComputers(HttpServletRequest request, Model model) {
		List<LdapEntry> retList = new ArrayList<LdapEntry>();

		retList.add(ldapService.getLdapComputersTree());
		return retList;

	}

	@RequestMapping(value = "/getAhenks", method = { RequestMethod.POST })
	public List<LdapEntry> getAhenks(HttpServletRequest request,Model model, @RequestBody LdapEntry[] selectedEntryArr) {

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
					if(!isExist) {
						ahenkList.add(ldapEntry2);
					}
				}
			} catch (LdapException e) {
				e.printStackTrace();
			}
		}

		//		ObjectMapper mapper = new ObjectMapper();
		//		String ret = null;
		//		try {
		//			ret = mapper.writeValueAsString(ahenkList);
		//		} catch (JsonProcessingException e) {
		//			e.printStackTrace();
		//		}
		return ahenkList;
	}

	@RequestMapping(value = "/getOnlineAhenks", method = { RequestMethod.POST })
	public String getOnlyOnlineAhenks(HttpServletRequest request,Model model, @RequestBody LdapEntry[] selectedEntryArr) {

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
					//					boolean isOnline=false;
					//					for (String online : messagingService.getOnlineUsers()) {
					//						if(ldapEntry2.getUid().equals(online)) {
					//							isOnline=true;
					//							break;
					//						}
					//					}
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
	@RequestMapping(method=RequestMethod.POST ,value = "/group/new", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public Boolean addAgentsToNewGroup(@RequestParam(value = "groupName", required=true) String groupName,
			@RequestParam(value = "checkedList[]", required=true) String[] checkedList) {
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
			ldapService.addEntry("cn=" +  groupName +","+ configurationService.getGroupLdapBaseDn() , attributes);
		} catch (LdapException e) {
			System.out.println("Error occured while adding new group.");
			return null;
		}
		return true;
	}

	//add agents to existing group
	@RequestMapping(method=RequestMethod.POST ,value = "/group/existing", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public Boolean addAgentsToExistingGroup(@RequestParam(value="groupDN") String groupDN,
			@RequestParam(value = "checkedList[]", required=true) String[] checkedList) {
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
		} catch (LdapException e) {
			System.out.println("Error occured while adding new group.");
			return null;
		}
		return true;
	}

	//returns root dn of agent group(groupOfNames)
	@RequestMapping(method=RequestMethod.GET ,value = "/group/rootdnofagent", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public String getRootDNOfAgentGroup() {
		return configurationService.getAhenkGroupLdapBaseDn();
	}

	//returns root dn of user group(groupOfNames)
	@RequestMapping(method=RequestMethod.GET ,value = "/group/rootdnofuser", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public String getRootDNOfUserGroup() {
		return configurationService.getUserGroupLdapBaseDn();
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
				List<LdapEntry> subEntries = ldapService.findSubEntries(ldapEntry.getDistinguishedName(), "(&(objectclass=inetOrgPerson)(objectclass=pardusAccount))",	new String[] { "*" }, SearchScope.ONELEVEL);
				if(subEntries.size()==0) {
					ldapService.deleteEntry(ldapEntry.getDistinguishedName());
				}
			}

			return true;
		} catch (LdapException e) {
			e.printStackTrace();
			return null;
		}
	}
	
	@RequestMapping(method=RequestMethod.POST, value = "/deleteEntry")
	@ResponseBody
	public Boolean deleteEntry(@RequestParam(value = "dn") String dn) {
		try {
			if(dn != configurationService.getAgentLdapBaseDn()) {
				deleteNodes(ldapService.getOuAndOuSubTreeDetail(dn));
				return true;
			} else {
				return false;
			}
			
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}
	
	private Boolean deleteNodes(LdapEntry entry) {
		if(entry.getHasSubordinates().equals("FALSE")) {
			try {
				ldapService.deleteEntry(entry.getDistinguishedName());
				return true;
			} catch (LdapException e) {
				e.printStackTrace();
				return false;
			}
		}
		while(true) {
			for(LdapEntry child : entry.getChildEntries()){
				if(child.getHasSubordinates().equals("FALSE")) {
					try {
						ldapService.deleteEntry(child.getDistinguishedName());
					} catch (LdapException e) {
						e.printStackTrace();
						return false;
					}
				}
		    }
			entry = ldapService.getOuAndOuSubTreeDetail(entry.getDistinguishedName());
			if(entry.getChildEntries() == null || entry.getChildEntries().size() == 0) {
				try {
					ldapService.deleteEntry(entry.getDistinguishedName());
				} catch (LdapException e) {
					e.printStackTrace();
				}
				return true;
			}
		}
	}
}
