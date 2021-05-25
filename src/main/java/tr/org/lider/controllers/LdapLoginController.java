package tr.org.lider.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.entities.AgentImpl;
import tr.org.lider.models.ConfigParams;
import tr.org.lider.services.AgentService;
import tr.org.lider.services.ConfigurationService;

@RestController
@RequestMapping("ldap_login")
public class LdapLoginController {
	
	Logger logger = LoggerFactory.getLogger(LdapLoginController.class);
	
	@Autowired
	ConfigurationService configurationService;
	
	@Autowired
	AgentService agentService;
	
//	get directory server(Active Directory and OpenLDAP) configurations method for ldap-login task
	@RequestMapping(method=RequestMethod.GET, value = "/configurations", produces = MediaType.APPLICATION_JSON_VALUE)
	public ConfigParams getConfigParams() {
		return configurationService.getConfigParams();
	}
	
//	updated user directory domain method by AD or OpenLDAP
	@RequestMapping(method=RequestMethod.POST ,value = "/update_directory_domain", produces = MediaType.APPLICATION_JSON_VALUE)
	public AgentImpl changeUserDirectoryDomain(@RequestParam (value = "agentJid") String agentJid,
			@RequestParam (value = "userDirectoryDomain") String userDirectoryDomain) {
		return agentService.updateUserDirectoryAgentByJid(agentJid, userDirectoryDomain);
	}
	
}
