package tr.org.lider.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.entities.ScriptTemplate;
import tr.org.lider.services.ScriptService;

/**
 * 
 * Return the script templates, saved, edited and deleted script
 * @author <a href="mailto:tuncay.colak@tubitak.gov.tr">Tuncay ÇOLAK</a>
 *
 */
@Secured({"ROLE_ADMIN", "ROLE_SCRIPT_DEFINITION" })
@RestController
@RequestMapping("/script")
public class ScriptController {

	@Autowired
	private ScriptService scriptService;
	
//	get script templates
	@RequestMapping(method=RequestMethod.POST ,value = "/list", produces = MediaType.APPLICATION_JSON_VALUE)
	public List<ScriptTemplate> scriptList() {
		return scriptService.list();
	}

	@RequestMapping(method=RequestMethod.POST ,value = "/add", produces = MediaType.APPLICATION_JSON_VALUE)
	public ScriptTemplate scriptAdd(@RequestBody ScriptTemplate file){
		return scriptService.add(file);
	}
	
	@RequestMapping(method=RequestMethod.POST ,value = "/del", produces = MediaType.APPLICATION_JSON_VALUE)
	public ScriptTemplate scriptDel(@RequestBody ScriptTemplate file){
		return scriptService.del(file);
	}
	
	@RequestMapping(method=RequestMethod.POST ,value = "/update", produces = MediaType.APPLICATION_JSON_VALUE)
	public ScriptTemplate scriptUpdate(@RequestBody ScriptTemplate file){
		return scriptService.update(file);
	}
}
