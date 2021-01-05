package tr.org.lider.controllers;

import java.util.Date;
import java.util.List;
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

import tr.org.lider.entities.CommandExecutionImpl;
import tr.org.lider.entities.CommandExecutionResultImpl;
import tr.org.lider.entities.CommandImpl;
import tr.org.lider.entities.PluginTask;
import tr.org.lider.services.ExecutedTaskReportService;
import tr.org.lider.services.PluginTaskService;

@Secured({"ROLE_ADMIN", "ROLE_EXECUTED_TASK" })
@RestController
@RequestMapping("lider/executedTaskReport")
public class ExecutedTaskReportController {

	@Autowired
	private ExecutedTaskReportService executedTaskService;

	@Autowired
	private PluginTaskService pluginTaskService;
	
	@RequestMapping(value="/getInnerHtmlPage", method = {RequestMethod.POST })
	public String getInnerHtmlPage(@RequestParam (value = "innerPage", required = true) String innerPage) {
		return innerPage;
	}

	@RequestMapping(method=RequestMethod.POST, value = "/list", produces = MediaType.APPLICATION_JSON_VALUE)
	public Page<CommandImpl> findAllCommandsRest(@RequestParam (value = "pageNumber") int pageNumber,
			@RequestParam (value = "pageSize") int pageSize,
			@RequestParam (value = "taskCommand") Optional<String> taskCommand,
			@RequestParam (value="startDate") @DateTimeFormat(pattern="dd/MM/yyyy HH:mm:ss") Optional<Date> startDate,
			@RequestParam (value="endDate") @DateTimeFormat(pattern="dd/MM/yyyy HH:mm:ss") Optional<Date> endDate) {
		Page<CommandImpl> commands = executedTaskService.findAllCommandsFiltered(pageNumber, pageSize, taskCommand, startDate, endDate);
		for (CommandImpl command : commands.getContent()) {
			for (CommandExecutionImpl commandExecution : command.getCommandExecutions()) {
				for (CommandExecutionResultImpl commandExecutionResult : commandExecution.getCommandExecutionResults()) {
					if(commandExecutionResult.getResponseData() != null) {
						commandExecutionResult.setResponseDataStr((new String(commandExecutionResult.getResponseData())));
					}
				}
			}
		}
		return commands;
	}

	@RequestMapping(method=RequestMethod.POST, value = "/plugins", produces = MediaType.APPLICATION_JSON_VALUE)
	public List<PluginTask> getPlugins() {
		return pluginTaskService.findAll();
	}
//	//get agent detail by ID
//	@RequestMapping(method=RequestMethod.POST ,value = "/detail", produces = MediaType.APPLICATION_JSON_VALUE)
//	public AgentImpl findAgentByIDRest(@RequestParam (value = "agentID") Long agentID) {
//		Optional<AgentImpl> agent = agentService.findAgentByID(agentID);
//		if(agent.isPresent()) {
//			return agent.get();
//		}
//		else {
//			return null;
//		}
//	}

}