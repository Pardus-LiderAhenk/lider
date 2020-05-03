package tr.org.lider.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.entities.ProfileImpl;
import tr.org.lider.services.ProfileService;

/**
 * 
 * Return the profiles, saved, edited and deleted profile
 * @author <a href="mailto:tuncay.colak@tubitak.gov.tr">Tuncay ÇOLAK</a>
 *
 */
@Secured({"ROLE_ADMIN", "ROLE_SCRIPT_DEFINITION" })
@RestController
@RequestMapping("/profile")
public class ProfileController {

	@Autowired
	private ProfileService profileService;
	
//	get script templates
	@RequestMapping(method=RequestMethod.POST ,value = "/list", produces = MediaType.APPLICATION_JSON_VALUE)
	public List<ProfileImpl> profileList() {
		
		return profileService.list();
	}

//	@RequestMapping(method=RequestMethod.POST ,value = "/add", produces = MediaType.APPLICATION_JSON_VALUE)
//	public ScriptTemplate scriptAdd(@RequestBody ScriptTemplate file){
//		return scriptService.add(file);
//	}
//	
//	@RequestMapping(method=RequestMethod.POST ,value = "/del", produces = MediaType.APPLICATION_JSON_VALUE)
//	public ScriptTemplate scriptDel(@RequestBody ScriptTemplate file){
//		return scriptService.del(file);
//	}
//	
//	@RequestMapping(method=RequestMethod.POST ,value = "/update", produces = MediaType.APPLICATION_JSON_VALUE)
//	public ScriptTemplate scriptUpdate(@RequestBody ScriptTemplate file){
//		return scriptService.update(file);
//	}
}
