package tr.org.lider.controllers;

import java.util.ArrayList;
import java.util.Arrays;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
import tr.org.lider.services.ConfigurationService;

/**
 * Controller for computer groups operations
 * 
 * @author <a href="mailto:hasan.kara@pardus.org.tr">Hasan Kara</a>
 * 
 */
@RestController
@RequestMapping("/lider/computer_groups")
public class ComputerGroupsController {

	Logger logger = LoggerFactory.getLogger(ComputerGroupsController.class);

	@Autowired
	private LDAPServiceImpl ldapService;
	
	@Autowired
	private ConfigurationService configurationService;
	
	//gets tree of groups of names which just has agent members
	@RequestMapping(value = "/getGroups")
	public List<LdapEntry> getAgentGroups() {
		List<LdapEntry> result = new ArrayList<LdapEntry>();
		result.add(ldapService.getLdapAgentsGroupTree());
		return result;
	}
	
	@RequestMapping(value = "/getOuDetails")
	public List<LdapEntry> getOuDetails(LdapEntry selectedEntry) {
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
	
	@RequestMapping(method=RequestMethod.POST, value = "/deleteEntry")
	public Boolean deleteEntry(@RequestParam(value = "dn") String dn) {
		try {
			if(dn != configurationService.getAgentLdapBaseDn()) {
				ldapService.updateOLCAccessRulesAfterEntryDelete(dn);
				ldapService.deleteNodes(ldapService.getOuAndOuSubTreeDetail(dn));
				return true;
			} else {
				return false;
			}
			
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}
	
	@RequestMapping(value = "/getComputers")
	public List<LdapEntry> getComputers() {
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
		return ahenkList;
	}
	
	//add new group and add selected agents
	@RequestMapping(method=RequestMethod.POST ,value = "/createNewAgentGroup", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public ResponseEntity<?> createNewAgentGroup(@RequestBody Map<String, String> params) {
		String newGroupDN = "";
		//to return newly added entry with its details
		LdapEntry entry;
		if(params.containsKey("selectedOUDN") && !params.get("selectedOUDN").equals("")) {
			newGroupDN = "cn=" +  params.get("groupName") +","+ params.get("selectedOUDN");
		} else {
			newGroupDN = "cn=" +  params.get("groupName") +","+ configurationService.getAhenkGroupLdapBaseDn();
		}
		ObjectMapper mapper = new ObjectMapper();
		List<LdapEntry> entries = new ArrayList<>();
		try {
			entries = Arrays.asList(mapper.readValue(params.get("checkedEntries"), LdapEntry[].class));
		} catch (JsonProcessingException e) {
			logger.error("Error occured while mapping checked entry list to object");
		}
		List<LdapEntry> agents = new ArrayList<>();
		List<LdapEntry> directories = new ArrayList<>();
		
		for (LdapEntry ldapEntry : entries) {
			if(ldapEntry.getType().equals(DNType.AHENK)) {
				agents.add(ldapEntry);
			}
		}
		
		for (LdapEntry ldapEntry : entries) {
			Boolean hasParentChecked = false;
			for (LdapEntry entryTemp : entries) {
				if(ldapEntry.getType().equals(DNType.ORGANIZATIONAL_UNIT) && entryTemp.getType().equals(DNType.ORGANIZATIONAL_UNIT)) {
					if(!ldapEntry.getDistinguishedName().equals(entryTemp.getDistinguishedName()) 
							&& ldapEntry.getDistinguishedName().contains(entryTemp.getDistinguishedName())) {
						hasParentChecked = true;
						break;
					}
				}
			}
			if(ldapEntry.getType().equals(DNType.ORGANIZATIONAL_UNIT)  && !hasParentChecked) {
				directories.add(ldapEntry);
			}
		}

		List<LdapEntry> allAgents = getAhenksUnderOUs(directories, agents);
		if(allAgents.size() == 0) {
			return new ResponseEntity<String>("Seçili klasörlerde istemci bulunamadı. Lütfen en az bir istemci seçiniz.", HttpStatus.NOT_ACCEPTABLE);
		}
		Map<String, String[]> attributes = new HashMap<String,String[]>();
		attributes.put("objectClass", new String[] {"groupOfNames", "top", "pardusLider"} );
		attributes.put("liderGroupType", new String[] {"AHENK"} );
		try {
			String [] allAgentDNs = allAgents.stream().map(LdapEntry::getDistinguishedName).toArray(String[]::new);
			attributes.put("member", allAgentDNs);
			ldapService.addEntry(newGroupDN , attributes);
			entry = ldapService.getEntryDetail(newGroupDN);
		} catch (LdapException e) {
			logger.error("Error occured while adding new group.");
			return null;
		}
		return new ResponseEntity<LdapEntry>(entry, HttpStatus.OK);
	}
	
	//add agents to existing group from agent info page
		@RequestMapping(method=RequestMethod.POST ,value = "/group/existing", produces = MediaType.APPLICATION_JSON_VALUE)
		public ResponseEntity<?> addAgentsToExistingGroup(@RequestBody Map<String, String> params) {
			LdapEntry entry;
			ObjectMapper mapper = new ObjectMapper();
			List<LdapEntry> entries = new ArrayList<>();
			try {
				entries = Arrays.asList(mapper.readValue(params.get("checkedEntries"), LdapEntry[].class));
			} catch (JsonProcessingException e) {
				logger.error("Error occured while mapping checked entry list to object");
			}
			List<LdapEntry> agents = new ArrayList<>();
			List<LdapEntry> directories = new ArrayList<>();
			
			for (LdapEntry ldapEntry : entries) {
				if(ldapEntry.getType().equals(DNType.AHENK)) {
					agents.add(ldapEntry);
				}
			}
			
			for (LdapEntry ldapEntry : entries) {
				Boolean hasParentChecked = false;
				for (LdapEntry entryTemp : entries) {
					if(ldapEntry.getType().equals(DNType.ORGANIZATIONAL_UNIT) && entryTemp.getType().equals(DNType.ORGANIZATIONAL_UNIT)) {
						if(!ldapEntry.getDistinguishedName().equals(entryTemp.getDistinguishedName()) 
								&& ldapEntry.getDistinguishedName().contains(entryTemp.getDistinguishedName())) {
							hasParentChecked = true;
							break;
						}
					}
				}
				if(ldapEntry.getType().equals(DNType.ORGANIZATIONAL_UNIT)  && !hasParentChecked) {
					directories.add(ldapEntry);
				}
			}

			List<LdapEntry> allAgents = getAhenksUnderOUs(directories, agents);
			if(allAgents.size() == 0) {
				return new ResponseEntity<String>("Seçili klasörlerde istemci bulunamadı. Lütfen en az bir istemci seçiniz.", HttpStatus.NOT_ACCEPTABLE);
			}
			try {
				String [] allAgentDNs = allAgents.stream().map(LdapEntry::getDistinguishedName).toArray(String[]::new);
				for (int i = 0; i < allAgentDNs.length; i++) {
					ldapService.updateEntryAddAtribute(params.get("groupDN"), "member", allAgentDNs[i]);
				}
				entry = ldapService.getEntryDetail(params.get("groupDN"));
			} catch (LdapException e) {
				logger.error("Error occured while adding new group.");
				return null;
			}
			return new ResponseEntity<LdapEntry>(entry, HttpStatus.OK);
		}
	
	//get members of group
	@RequestMapping(method=RequestMethod.POST ,value = "/group/members", produces = MediaType.APPLICATION_JSON_VALUE)
	public List<LdapEntry> getMembersOfGroup(@RequestParam(value="dn", required=true) String dn) {
		LdapEntry entry = ldapService.getEntryDetail(dn);
		List<LdapEntry> listOfMembers = new ArrayList<>();

		for(String memberDN: entry.getAttributesMultiValues().get("member")) {
			listOfMembers.add(ldapService.getEntryDetail(memberDN));
		}
		return listOfMembers;
	}
	
	//delete member from group
	@RequestMapping(method=RequestMethod.POST ,value = "/delete/group/members", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public LdapEntry deleteMembersOfGroup(@RequestParam(value="dn", required=true) String dn, 
			@RequestParam(value="dnList[]", required=true) List<String> dnList) {
		//when single dn comes spring boot takes it as multiple arrays
		//so dn must be joined with comma
		//if member dn that will be added to group is cn=agent1,ou=Groups,dn=liderahenk,dc=org
		//spring boot gets this param as array which has size 4
		Boolean checkedArraySizeIsOne = true;
		for (int i = 0; i < dnList.size(); i++) {
			if(dnList.get(i).contains(",")) {
				checkedArraySizeIsOne = false;
				break;
			}
		}
		if(checkedArraySizeIsOne) {
			try {
				ldapService.updateEntryRemoveAttributeWithValue(dn, "member", String.join(",", dnList));
			} catch (LdapException e) {
				e.printStackTrace();
				return null;
			}
		} else {
			for (int i = 0; i < dnList.size(); i++) {
				try {
					ldapService.updateEntryRemoveAttributeWithValue(dn, "member", dnList.get(i));
				} catch (LdapException e) {
					e.printStackTrace();
					return null;
				}
			}
		}
		return ldapService.getEntryDetail(dn);
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
	
	
	@RequestMapping(method=RequestMethod.POST ,value = "/rename/entry", produces = MediaType.APPLICATION_JSON_VALUE)
	public Boolean renameEntry(@RequestParam(value="oldDN", required=true) String oldDN,
			@RequestParam(value="newName", required=true) String newName) {
		try {
			return ldapService.renameEntry(oldDN, newName);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}
	
	public List<LdapEntry> getAhenksUnderOUs(List<LdapEntry> directories, List<LdapEntry> ahenks) {
		for (LdapEntry ldapEntry : directories) {
			try {
				List<LdapEntry> retList = ldapService.findSubEntries(ldapEntry.getDistinguishedName(), "(objectclass=pardusDevice)", new String[] { "*" }, SearchScope.SUBTREE);
				for (LdapEntry ldapEntry2 : retList) {
					boolean isExist=false;
					for (LdapEntry ldapEntryAhenk : ahenks) {
						if(ldapEntry2.getEntryUUID().equals(ldapEntryAhenk.getEntryUUID())) {
							isExist=true;
							break;
						}
					}
					if(!isExist) {
						ahenks.add(ldapEntry2);
					}
				}
			} catch (LdapException e) {
				e.printStackTrace();
			}
		}
		return ahenks;
	}
	
}
