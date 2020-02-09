package tr.org.lider.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.entities.ScriptFile;
import tr.org.lider.services.ScriptService;

/**
 * 
 * Return the script list, saved, edited and deleted script
 * @author <a href="mailto:tuncay.colak@tubitak.gov.tr">Tuncay ÇOLAK</a>
 *
 */
@RestController
@RequestMapping("/script")
public class ScriptController {

	@Autowired
	private ScriptService scriptService;
	
//	get script list
	@RequestMapping(method=RequestMethod.POST ,value = "/list", produces = MediaType.APPLICATION_JSON_VALUE)
	public List<ScriptFile> scriptList() {
		return scriptService.list();
	}

	@RequestMapping(method=RequestMethod.POST ,value = "/add", produces = MediaType.APPLICATION_JSON_VALUE)
	public ScriptFile scriptAdd(@RequestBody ScriptFile file){
		scriptService.add(file);
		return scriptService.add(file);
	}
}
