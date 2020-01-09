package tr.org.lider.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.entities.CommandExecutionResultImpl;
import tr.org.lider.entities.CommandImpl;
import tr.org.lider.services.CommandService;

@RestController
@RequestMapping("/command")
public class CommandController {

	@Autowired
	CommandService commandService;
	
	@RequestMapping(method=RequestMethod.POST)
	public List<CommandImpl> findAllCommandByDNList(@RequestParam(value ="dn") String dn) {
		return commandService.getExecutedTasks(dn);
	}
	
	@RequestMapping(method=RequestMethod.POST, value="/commandexecutionresult")
	public CommandExecutionResultImpl getCommandExecutionResult(@RequestParam(value="id") Long id) {
		CommandExecutionResultImpl cer =  commandService.getCommandExecutionResultByID(id);
		if(cer.getResponseData() != null)
			cer.setResponseDataStr((new String(cer.getResponseData())));
		return commandService.getCommandExecutionResultByID(id);
	}

}