package tr.org.lider.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.entities.CommandImpl;
import tr.org.lider.services.CommandService;

@RestController
@RequestMapping("/command")
public class CommandController {

	@Autowired
	CommandService commandService;
	
	//"cn=ahenkdev,ou=Ahenkler,dc=liderahenk,dc=org"
	//"DESKTOP-73VF7IF,ou=Ahenkler,dc=liderahenk,dc=org"
	//"cn=ahenkdev2,ou=Ahenkler,dc=liderahenk,dc=org"
	
	@RequestMapping(method=RequestMethod.POST)
	public List<CommandImpl> findAllCommandByDNList(@RequestParam(value ="dn") String dn) {
		return commandService.getExecutedTasks(dn);
	}
	
	@RequestMapping(method=RequestMethod.GET, value="test")
	public List<CommandImpl> test() {
		return commandService.getExecutedTasks("cn=ahenkdev,ou=Ahenkler,dc=liderahenk,dc=org");
	}
	
	
	@RequestMapping(method=RequestMethod.GET, value="ttt")
	public List<CommandImpl> ttt() {
		return commandService.getExecutedTasks("cn=ahenkdev,ou=Ahenkler,dc=liderahenk,dc=org");
	}
}
