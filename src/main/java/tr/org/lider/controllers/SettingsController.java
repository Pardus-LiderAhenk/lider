package tr.org.lider.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.models.ConfigParams;
import tr.org.lider.services.ConfigurationService;

@RestController
@RequestMapping("settings")
public class SettingsController {
	
	@Autowired
	ConfigurationService configurationService;
	
	@RequestMapping(method=RequestMethod.GET, value = "/configurations", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public ConfigParams getConfigParams() {
		return configurationService.getConfigParams();
	}
	
//	//get agent detail by ID
//	@RequestMapping(method=RequestMethod.POST ,value = "/detail", produces = MediaType.APPLICATION_JSON_VALUE)
//	@ResponseBody
//	public AgentImpl findAgentByIDRest(@RequestParam (value = "agentID") Long agentID) {
//		Optional<AgentImpl> agent = agentService.findAgentByID(agentID);
//		if(agent.isPresent()) {
//			return agent.get();
//		}
//		else {
//			return null;
//		}
//	}
//	
//	//get agent detail by DN and ID
//		@RequestMapping(method=RequestMethod.POST ,value = "/agent", produces = MediaType.APPLICATION_JSON_VALUE)
//		@ResponseBody
//		public Optional<AgentImpl> findAgentByJIDRest(@RequestParam (value = "jid") String agentDn) {
//			List<AgentImpl> agent = agentService.findAgentByDn(agentDn);
//			Long agentId = agent.get(0).getId();
//			return agentService.findAgentByID(agentId);
//		}
//	
	
}