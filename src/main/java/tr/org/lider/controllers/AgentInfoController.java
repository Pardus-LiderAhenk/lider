package tr.org.lider.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;

/**
* Agent Info Controller for LiderAhenk Web application
* Lists all agents with paging.
*
* @author  Hasan Kara
* @version 2.0
*/


import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import tr.org.lider.entities.AgentImpl;
import tr.org.lider.messaging.messages.XMPPClientImpl;
import tr.org.lider.services.AgentService;

@Controller
@RequestMapping("agents")
public class AgentInfoController {
	
	@Autowired
	AgentService agentService;
	
	@Autowired
	private XMPPClientImpl messagingService;
	
	@RequestMapping(method=RequestMethod.GET)
	public String getAgents(Model model) {
		return "agent_info";
	}
	
	@RequestMapping(method=RequestMethod.GET ,
			value = {"/{pageNumber}/{pageSize}", "/{pageNumber}/{pageSize}/{field}/{text}"}, 
			produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public Page<AgentImpl> findAllAgentsRest(@PathVariable (value = "pageNumber") int pageNumber,
			@PathVariable (value = "pageSize") int pageSize,
			@PathVariable (value = "field") Optional<String> field,
			@PathVariable (value = "text") Optional<String> text) {
		Page<AgentImpl> agents = null;
		//if filter area is not empty
		if(field.isPresent() && text.isPresent()) {
			if(field.get().equals("jid")) {
				agents = agentService.findByJID(pageNumber, pageSize, text.get());
			} else if(field.get().equals("hostname")) {
				agents = agentService.findByHostname(pageNumber, pageSize, text.get());
			} else if(field.get().equals("ipAddresses")) {
				agents = agentService.findByIpAddresses(pageNumber, pageSize, text.get());
			} else if(field.get().equals("macAddresses")) {
				agents = agentService.findByMacAddresses(pageNumber, pageSize, text.get());
			} else if(field.get().equals("dn")) {
				agents = agentService.findByDN(pageNumber, pageSize, text.get());
			} else {
				//if agent property will be filtered
				agents = agentService.findByAgentProperty(pageNumber, pageSize, field.get(), text.get());
			}
		} else {
			agents = agentService.findAll(pageNumber, pageSize);
		}
		List<String> listOfOnlineUsers = messagingService.getOnlineUsers();
		System.err.println("--------------------------------------- size:   " + listOfOnlineUsers.size());
		for (int i = 0; i < agents.getContent().size(); i++) {
			if(messagingService.isRecipientOnline(agents.getContent().get(i).getJid())) {
				agents.getContent().get(i).setIsOnline(true);
			}
			else {
				agents.getContent().get(i).setIsOnline(false);
			}
		}
		return agents;
	}
	
	//get agent detail by ID
	@RequestMapping(method=RequestMethod.GET ,value = "/{agentID}", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public AgentImpl findAgentByIDRest(@PathVariable (value = "agentID") Long agentID) {
		Optional<AgentImpl> agent = agentService.findAgentByID(agentID);
		if(agent.isPresent()) {
			return agent.get();
		}
		else {
			return null;
		}
	}
}