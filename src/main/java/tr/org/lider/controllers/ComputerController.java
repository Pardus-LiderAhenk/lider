package tr.org.lider.controllers;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.entities.AgentImpl;
import tr.org.lider.entities.AgentPropertyImpl;
import tr.org.lider.entities.PluginImpl;
import tr.org.lider.entities.PluginTask;
import tr.org.lider.ldap.DNType;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.ldap.LdapSearchFilterAttribute;
import tr.org.lider.ldap.SearchFilterEnum;
import tr.org.lider.messaging.messages.XMPPClientImpl;
import tr.org.lider.repositories.AgentRepository;
import tr.org.lider.services.AgentService;
import tr.org.lider.services.CommandService;
import tr.org.lider.services.ConfigurationService;
import tr.org.lider.services.PluginService;
import tr.org.lider.services.TaskService;
import tr.org.lider.utils.IRestResponse;


/**
 * Controller for computer url requests 
 */
@RestController()
@RequestMapping("/lider/computer")
public class ComputerController {

	Logger logger = LoggerFactory.getLogger(ComputerController.class);

	@Autowired
	private LDAPServiceImpl ldapService;

	@Autowired
	private ConfigurationService configurationService;

	@Autowired
	private XMPPClientImpl messagingService;

	@Autowired
	private AgentService agentService;

	@Autowired
	private CommandService commandService;

	@Autowired
	private PluginService pluginService;

	@Autowired
	private TaskService taskService;

	@Autowired
	private AgentRepository agentRepository;
	
	@Autowired
	private XMPPClientImpl xmppClient;

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
			subEntries = ldapService.findSubEntries(selectedEntry.getUid(), "(&(objectclass=organizationalUnit))",
					new String[] { "*" }, SearchScope.ONELEVEL);
		} catch (LdapException e) {
			e.printStackTrace();
		}
		Collections.sort(subEntries);
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


	/**
	 * 
	 * @param key
	 * @param value
	 * @return
	 */
	@RequestMapping(method=RequestMethod.POST ,value = "/searchOnlineEntries", produces = MediaType.APPLICATION_JSON_VALUE)
	public List<LdapEntry> searchOnlineEntries(
			@RequestParam(value="searchDn", required=true) String searchDn) {

		List<LdapEntry> results=null;
		try {
			if(searchDn.equals("")) {
				searchDn=configurationService.getLdapRootDn();
			}
			//			List<LdapSearchFilterAttribute> filterAttributes = new ArrayList<LdapSearchFilterAttribute>();
			//			filterAttributes.add(new LdapSearchFilterAttribute(key, value, SearchFilterEnum.EQ));
			List<LdapEntry> res = ldapService.findSubEntries(searchDn, "(objectclass=pardusDevice)",new String[] { "*" }, SearchScope.SUBTREE);
			results= new ArrayList<>();
			for (LdapEntry ldapEntry : res) {
				if(ldapEntry.isOnline()) {
					results.add(ldapEntry);
				}
			}
		} catch (LdapException e) {
			e.printStackTrace();
		}
		return results ;
	}

	@RequestMapping(value = "/getAgentList")
	public LdapEntry getAgentList(@RequestParam(value="searchDn") String searchDn) {
		LdapEntry returnLdapEntry=null;
		List<LdapEntry> retList = new ArrayList<LdapEntry>();
		List<LdapEntry> onlineRetList = new ArrayList<LdapEntry>();
		try {

			returnLdapEntry=new LdapEntry();
			retList=ldapService.findSubEntries(searchDn, "(objectclass=pardusDevice)", new String[] { "*" }, SearchScope.SUBTREE);

			for (LdapEntry ldapEntry : retList) {
				if(ldapEntry.isOnline()) {
					onlineRetList.add(ldapEntry);
				}
			}

			returnLdapEntry.setOnlineAgentList(onlineRetList);
			returnLdapEntry.setAgentListSize(retList.size());
		} catch (LdapException e) {
			e.printStackTrace();
		}
		return returnLdapEntry;
	}

	@RequestMapping(method=RequestMethod.POST ,value = "/move/agent", produces = MediaType.APPLICATION_JSON_VALUE)
	public Boolean moveEntry(@RequestParam(value="sourceDN", required=true) String sourceDN,
			@RequestParam(value="sourceCN", required=true) String sourceCN,
			@RequestParam(value="destinationDN", required=true) String destinationDN) {
		try {
			logger.info("Agent move request has been receieved. Agent will be moved from: " + sourceDN + " to: " + destinationDN);
			//check memberships and if membership exists in any group update DN info
			String newAgentDN = "cn=" + sourceCN + "," + destinationDN;
			ldapService.moveEntry(sourceDN, destinationDN);
			List<LdapEntry> subEntries = ldapService.search("member", sourceDN, new String[] {"*"});
			for (LdapEntry ldapEntry : subEntries) {

				ldapService.updateEntryAddAtribute(ldapEntry.getDistinguishedName(), "member", newAgentDN);
				ldapService.updateEntryRemoveAttributeWithValue(ldapEntry.getDistinguishedName(), "member", sourceDN);
			}
			List<AgentImpl> agent = agentService.findAgentByDn(sourceDN);
			//update C_AGENT table
			agentService.updateAgentDN(sourceDN, newAgentDN);

			//update C_COMMAND and C_COMMAND_EXECUTION table
			commandService.updateAgentDN(sourceDN, newAgentDN);
			
			String directoryType = agent.get(0).getUserDirectoryDomain();
			if (directoryType == "AD") {
				directoryType = "ACTIVE_DIRECTORY";
			}
			//send task to Ahenk to change DN with new DN
			Map<String, Object> parameterMap = new  HashMap<>();
			parameterMap.put("dn", sourceDN);
			parameterMap.put("new_parent_dn", destinationDN);
			parameterMap.put("directory_server", directoryType);
			List<String> dnList = new ArrayList<>();
			dnList.add(sourceCN);

			PluginImpl plugin = new PluginImpl();
			plugin = pluginService.findPluginIdByName("ldap");
			PluginTask requestBody = new PluginTask();
			requestBody.setCommandId("MOVE_AGENT");
			requestBody.setPlugin(plugin);

			requestBody.setParameterMap(parameterMap);
			requestBody.setDnType(DNType.AHENK);
			requestBody.setState(1);
			requestBody.setDnList(dnList);
			List<LdapEntry> entryList = new  ArrayList<LdapEntry>();
			LdapEntry ldapEntry = ldapService.getEntryDetail(newAgentDN);
			entryList.add(ldapEntry);

			requestBody.setEntryList(entryList);
			IRestResponse restResponse = taskService.execute(requestBody);
			logger.debug("Completed processing request, returning result: {}", restResponse.toJson());

		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
		return true;
	}

	@RequestMapping(method=RequestMethod.POST ,value = "/delete/agent", produces = MediaType.APPLICATION_JSON_VALUE)
	public Boolean deleteAgent(@RequestParam(value="agentDN", required=true) String agentDN,
			@RequestParam(value="agentUID", required=true) String agentUID) {
		logger.info("Agent delete request has been receieved. DN: " + agentDN);

		List<AgentImpl> agent = agentService.findAgentByDn(agentDN);
		String directoryType = agent.get(0).getUserDirectoryDomain();
		if (directoryType == "AD") {
			directoryType = "ACTIVE_DIRECTORY";
		}
		Boolean isAgentOnline = false;
		if(agent != null && agent.size() > 0) {
			isAgentOnline = messagingService.isRecipientOnline(agent.get(0).getJid());
		}
		
		//send task to Ahenk to change DN with new DN
		Map<String, Object> parameterMap = new  HashMap<>();
		parameterMap.put("dn", agentDN);
		parameterMap.put("directory_server", directoryType);
		List<String> dnList = new ArrayList<>();
		dnList.add(agentDN);
		//if only agent is online send delete task
		//if agent is offline just delete from database and ldap
		if(isAgentOnline) {
			PluginImpl plugin = new PluginImpl();
			plugin = pluginService.findPluginIdByName("ldap");
			PluginTask requestBody = new PluginTask();
			requestBody.setCommandId("DELETE_AGENT");
			requestBody.setPlugin(plugin);

			requestBody.setParameterMap(parameterMap);
			requestBody.setDnType(DNType.AHENK);
			requestBody.setState(1);
			requestBody.setDnList(dnList);
			List<LdapEntry> entryList = new  ArrayList<LdapEntry>();
			LdapEntry ldapEntry = ldapService.getEntryDetail(agentDN);
			entryList.add(ldapEntry);

			requestBody.setEntryList(entryList);
			IRestResponse restResponse = taskService.execute(requestBody);
			logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		}

		agentService.deleteAgent(agentDN);
		try {
			ldapService.deleteEntry(agentDN);
		} catch (LdapException e) {
			e.printStackTrace();
		}
		commandService.deleteAgentCommands(agentDN, agentUID);
		return true;
	}

	@RequestMapping(method=RequestMethod.POST ,value = "/rename/agent", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> renameAgent(
			@RequestParam(value="agentDN", required=true) String agentDN,
			@RequestParam(value="cn", required=true) String cn,
			@RequestParam(value="newHostname", required=true) String newHostname) {
		logger.info("Agent rename request has been receieved. DN: " + agentDN);
		
		List<AgentImpl> agent = agentService.findAgentByDn(agentDN);
		Boolean isAgentOnline = false;
		if(agent != null && agent.size() > 0) {
			isAgentOnline = messagingService.isRecipientOnline(agent.get(0).getJid());
		}
		
		String newAgentDN = agentDN.replace("cn=" + cn, "cn=" + newHostname);

		List<LdapEntry> entryList = new  ArrayList<LdapEntry>();
		LdapEntry ldapEntryForTask = ldapService.getEntryDetail(agentDN);
		entryList.add(ldapEntryForTask);

		if(agentService.findAgentByHostname(newHostname).size() > 0) {
			return new ResponseEntity<Boolean>(false, HttpStatus.CONFLICT);
		}
		try {
			//update uid attribute
			ldapService.renameHostname("uid", newHostname, agentDN);
			
			xmppClient.addClientToRoster(newHostname + "@"+configurationService.getXmppServiceName());

			//check memberships and if membership exists in any group update DN info
			ldapService.renameEntry(agentDN, "cn=" + newHostname);
			List<LdapEntry> subEntries = ldapService.search("member", agentDN, new String[] {"*"});
			for (LdapEntry ldapEntry : subEntries) {
				ldapService.updateEntryAddAtribute(ldapEntry.getDistinguishedName(), "member", newAgentDN);
				ldapService.updateEntryRemoveAttributeWithValue(ldapEntry.getDistinguishedName(), "member", agentDN);
			}
		} catch (LdapException e) {
			logger.error("Error occured while renaming the agent. Message: " + e.getMessage());
		}
		String directoryType = agent.get(0).getUserDirectoryDomain();
		if (directoryType == "AD") {
			directoryType = "ACTIVE_DIRECTORY";
		}

		//send task to Ahenk to change DN with new DN
		Map<String, Object> parameterMap = new  HashMap<>();
		parameterMap.put("dn", agentDN);
		parameterMap.put("old_cn", cn);
		parameterMap.put("new_cn", newHostname);
		parameterMap.put("directory_server", directoryType);
		List<String> dnList = new ArrayList<>();
		dnList.add(agentDN);
		
		if(isAgentOnline) {
			PluginImpl plugin = new PluginImpl();
			plugin = pluginService.findPluginIdByName("ldap");
			PluginTask requestBody = new PluginTask();
			requestBody.setCommandId("RENAME_ENTRY");
			requestBody.setPlugin(plugin);

			requestBody.setParameterMap(parameterMap);
			requestBody.setDnType(DNType.AHENK);
			requestBody.setState(1);
			requestBody.setDnList(dnList);

			requestBody.setEntryList(entryList);
			IRestResponse restResponse = taskService.execute(requestBody);
			logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		}
		//update C_AGENT table
		agentService.updateHostname(agentDN, newAgentDN, newHostname);

		//update C_COMMAND and C_COMMAND_EXECUTION table
		commandService.updateAgentHostname(agentDN, newAgentDN, cn, newHostname);
		return new ResponseEntity<Boolean>(true, HttpStatus.OK);
	}

	/**
	 * delete user ous
	 * @param selectedEntryArr
	 * @return
	 */

	@RequestMapping(method=RequestMethod.POST, value = "/deleteComputerOu")
	@ResponseBody
	public Boolean deleteComputerOu(@RequestBody LdapEntry[] selectedEntryArr) {
		try {
			for (LdapEntry ldapEntry : selectedEntryArr) {
				if(ldapEntry.getType().equals(DNType.ORGANIZATIONAL_UNIT)) {
					//					ldapService.updateOLCAccessRulesAfterEntryDelete(ldapEntry.getDistinguishedName());
					LdapEntry entry= ldapService.getOuAndOuSubTreeDetail(ldapEntry.getDistinguishedName());
					if(entry.getChildEntries().size()>0) {
						return false;
					}
					else {
						ldapService.deleteNodes(entry);
						return true;
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
		return null;
	}

	@RequestMapping(method=RequestMethod.POST ,value = "/get_agent_info", produces = MediaType.APPLICATION_JSON_VALUE)
	public Boolean getAgentInfo(@RequestParam(value="agentDN", required=true) String agentDN) {
		logger.info("Agent info request has been receieved. DN: " + agentDN);
		//send task to Ahenk to change DN with new DN
		Map<String, Object> parameterMap = new  HashMap<>();
		parameterMap.put("dn", agentDN);
		List<String> dnList = new ArrayList<>();
		dnList.add(agentDN);

		PluginImpl plugin = new PluginImpl();
		plugin = pluginService.findPluginIdByName("resource-usage");
		PluginTask requestBody = new PluginTask();
		requestBody.setCommandId("AGENT_INFO");
		requestBody.setPlugin(plugin);

		requestBody.setParameterMap(parameterMap);
		requestBody.setDnType(DNType.AHENK);
		requestBody.setState(1);
		requestBody.setDnList(dnList);
		List<LdapEntry> entryList = new  ArrayList<LdapEntry>();
		LdapEntry ldapEntry = ldapService.getEntryDetail(agentDN);
		entryList.add(ldapEntry);

		requestBody.setEntryList(entryList);
		IRestResponse restResponse = taskService.execute(requestBody);
		//		agentService.deleteAgent(agentDN);
		//		try {
		//			ldapService.deleteEntry(agentDN);
		//		} catch (LdapException e) {
		//			e.printStackTrace();
		//		}
		//		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		//
		//		commandService.deleteAgentCommands(agentDN, agentUID);
		return true;
	}

	@RequestMapping(method=RequestMethod.POST ,value = "/update_agent_info", produces = MediaType.APPLICATION_JSON_VALUE)
	public AgentImpl updateAgentInfo(@RequestParam(value="ipAddresses", required=true) String ipAddresses,
			@RequestParam(value="hostname", required=true) String hostname,
			@RequestParam(value="agentVersion", required=true) String agentVersion,
			@RequestParam(value="macAddresses", required=true) String macAddresses,
			@RequestParam(value="phase", required=true) String phase,
			@RequestParam(value="processor", required=true) String processor,
			@RequestParam(value="agentUid", required=true) String agentUid){

		System.out.println(ipAddresses);
		List<AgentImpl> agents =  agentService.findAgentByJid(agentUid);

		if (agents != null && agents.size() > 0) {
			AgentImpl agent = agents.get(0);
			for (AgentPropertyImpl prop : agent.getProperties()) {
				if (prop.getPropertyName().equals("hardware.network.ipAddresses")
						&& prop.getPropertyValue() != ipAddresses
						&& !agent.getIpAddresses().equals(ipAddresses)) {
					logger.info("IP Addresses of Agent with ID {} has been changed. Updating in DB", agent.getId());
					prop.setPropertyValue(ipAddresses);
					agent.setIpAddresses(ipAddresses);
				} else if (hostname != null && !agent.getHostname().equals(hostname)) {
					agent.setHostname(hostname);
				} else if (prop.getPropertyName().equals("macAddresses")
						&& prop.getPropertyValue() != macAddresses
						&& !agent.getMacAddresses().equals(macAddresses)) {
					prop.setPropertyValue(macAddresses);
					agent.setMacAddresses(macAddresses);
				} else if (prop.getPropertyName().equals("agentVersion")
						&& prop.getPropertyValue() != agentVersion) {
					prop.setPropertyValue(agentVersion);
				} else if (phase != null && phase != "" && prop.getPropertyName().equals("phase")
						&& prop.getPropertyValue() != phase) {
					prop.setPropertyValue(phase);
				} else if (processor != null && processor != "" && prop.getPropertyName().equals("processor")
						&& prop.getPropertyValue() != processor) {
					prop.setPropertyValue(processor);
				}
			}

			if (isPropertyName(agentUid, "agentVersion") == false) {
				agent.addProperty(new AgentPropertyImpl(null, agent, "agentVersion",
						agentVersion.toString(), new Date()));
			} 
			if (isPropertyName(agentUid, "phase") == false) {
				agent.addProperty(new AgentPropertyImpl(null, agent, "phase",
						phase.toString(), new Date()));
			} 
			agentRepository.save(agent);
			return agent;
		} else {
			return null;
		}
	}

	public Boolean isPropertyName(String agentUid, String propertyName) {
		Boolean isExist = false;
		List<AgentImpl> agents =  agentService.findAgentByJid(agentUid);
		if (agents != null && agents.size() > 0) {
			AgentImpl agent = agents.get(0);
			for (AgentPropertyImpl prop : agent.getProperties()) {
				if (prop.getPropertyName().equals(propertyName)) {
					isExist = true;
				}
			}
		}
		return isExist;
	}
}
