package tr.org.lider.controllers;

import java.util.Date;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.entities.AgentImpl;
import tr.org.lider.services.AgentService;

@Secured({"ROLE_ADMIN", "ROLE_AGENT_INFO" })
@RestController
@RequestMapping("lider/agent_info")
public class AgentInfoController {

	@Autowired
	AgentService agentService;

	@RequestMapping(value="/getInnerHtmlPage", method = {RequestMethod.POST })
	public String getInnerHtmlPage(@RequestParam (value = "innerPage", required = true) String innerPage) {
		return innerPage;
	}

	@RequestMapping(method=RequestMethod.POST, value = "/list", produces = MediaType.APPLICATION_JSON_VALUE)
	public Page<AgentImpl> findAllAgentsRest(@RequestParam (value = "pageNumber") int pageNumber,
			@RequestParam (value = "pageSize") int pageSize,
			@RequestParam (value = "status") String status,
			@RequestParam (value = "field") Optional<String> field,
			@RequestParam (value = "text") Optional<String> text,
			@RequestParam (value="registrationStartDate") @DateTimeFormat(pattern="dd/MM/yyyy HH:mm:ss") Optional<Date> registrationStartDate,
			@RequestParam (value="registrationEndDate") @DateTimeFormat(pattern="dd/MM/yyyy HH:mm:ss") Optional<Date> registrationEndDate) {
		Page<AgentImpl> listOfAgentsCB = agentService.findAllAgentsFiltered(pageNumber, pageSize, status, field, text, registrationStartDate, registrationEndDate);
		return listOfAgentsCB;
	}

	//get agent detail by ID
	@RequestMapping(method=RequestMethod.POST ,value = "/detail", produces = MediaType.APPLICATION_JSON_VALUE)
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