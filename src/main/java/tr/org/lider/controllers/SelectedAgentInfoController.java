package tr.org.lider.controllers;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.entities.AgentImpl;
import tr.org.lider.services.AgentService;

@Secured({"ROLE_ADMIN", "ROLE_COMPUTERS" })
@RestController
@RequestMapping("select_agent_info")
public class SelectedAgentInfoController {

	@Autowired
	AgentService agentService;

	//get agent detail by agentJid
	@RequestMapping(method=RequestMethod.POST ,value = "/detail", produces = MediaType.APPLICATION_JSON_VALUE)
	public AgentImpl findAgentByJIDRest(@RequestParam (value = "agentJid") String agentJid) {
		List<AgentImpl> agent = agentService.findAgentByJid(agentJid);
		if (agent != null && agent.size() > 0) {
			return agent.get(0);
		} else {
			return null;
		}
	}
}