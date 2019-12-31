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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
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
	public String getAgents() {
		return "agent_info";
	}
	
	@RequestMapping(method=RequestMethod.POST ,
			value = "/", 
			produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public Page<AgentImpl> findAllAgentsRest(@RequestParam (value = "pageNumber") int pageNumber,
			@RequestParam (value = "pageSize") int pageSize,
			@RequestParam (value = "status") String status,
			@RequestParam (value = "field") Optional<String> field,
			@RequestParam (value = "text") Optional<String> text) {
		
		List<String> listOfOnlineUsers = messagingService.getOnlineUsers();
		System.err.println("--------------------------------------- size:   " + listOfOnlineUsers.size());
		return agentService.findAllFiltered(pageNumber, pageSize, status, field, text);
	}
	
	//get agent detail by ID
	@RequestMapping(method=RequestMethod.POST ,value = "/detail", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public AgentImpl findAgentByIDRest(@RequestParam (value = "agentID") Long agentID) {
		Optional<AgentImpl> agent = agentService.findAgentByID(agentID);
		if(agent.isPresent()) {
			return agent.get();
		}
		else {
			return null;
		}
	}
}