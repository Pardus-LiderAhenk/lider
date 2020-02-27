package tr.org.lider.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

/**
* Registration Template Controller for LiderAhenk Web application
* add, delete, edit operations for registration templates.
*
* @author <a href="mailto:hasan.kara@pardus.org.tr">Hasan Kara</a>
* @version 2.0
*/


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import tr.org.lider.entities.RegistrationTemplateImpl;
import tr.org.lider.services.RegistrationTemplateService;

@Controller
@RequestMapping("registration/template")
public class RegistrationTemplateController {
	
	@Autowired
	RegistrationTemplateService registrationTemplateService;
	
	@RequestMapping(method=RequestMethod.POST, value = "/", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public List<RegistrationTemplateImpl> findAll() {
		return registrationTemplateService.findAll();
	}

	//add new registration template
	@RequestMapping(method=RequestMethod.POST ,value = "/create", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public RegistrationTemplateImpl createTemplate(@RequestParam(value = "templateText", required=true) String templateText,
			@RequestParam(value = "authorizedUserGroupDN", required=true) String authorizedUserGroupDN,
			@RequestParam(value = "agentCreationDN", required=true) String agentCreationDN) {
		
		return registrationTemplateService.addRegistrationTemplate(new RegistrationTemplateImpl(templateText, authorizedUserGroupDN, agentCreationDN));
	}
	
	//delete registration template
	@RequestMapping(method=RequestMethod.POST ,value = "/delete", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public Boolean deleteTemplate(@RequestParam(value = "id", required=true) Long id) {
		
		try {
			registrationTemplateService.delete(id);
			return true;
		} catch (Exception e) {
			return false;
		}
	}
}