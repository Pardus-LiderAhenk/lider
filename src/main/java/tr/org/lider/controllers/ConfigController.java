package tr.org.lider.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.entities.ConfigImpl;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.models.ConfigParams;
import tr.org.lider.services.ConfigurationService;

/**
 * Getting configuration settings and saving it to database.
 * 
 * @author <a href="mailto:hasan.kara@pardus.org.tr">Hasan Kara</a>
 * 
 */

@RestController
@RequestMapping("/lider/config")
public class ConfigController {
	
	Logger logger = LoggerFactory.getLogger(ConfigController.class);
	
	@Autowired
	ConfigurationService configurationService;
	
	@Autowired
	LDAPServiceImpl ldapService;
	
	@RequestMapping(method=RequestMethod.POST, value = "/save", produces = MediaType.APPLICATION_JSON_VALUE)
	public Boolean saveConfigParams(ConfigParams configParams) throws Exception {
		//set default configuration params
		if(configurationService.isConfigurationDone()) {
			return null;
		} else {
			configParams.setDefaultParams();
			try {
				//convert params object to string and save it to Config table
				ObjectMapper mapper = new ObjectMapper();
				String jsonString = mapper.writeValueAsString(configParams);
				configurationService.save(new ConfigImpl("liderConfigParams", jsonString));
				logger.info("Configuration settings are completed and saved to database.");
				return true;
			} catch (JsonProcessingException e) {
				e.printStackTrace();
				logger.error("Error occured while converting ConfigParams object to json string: " + e.getMessage());
				return false;
			}
		}

	}
	
	@RequestMapping(method=RequestMethod.GET, value = "/configurations", produces = MediaType.APPLICATION_JSON_VALUE)
	public ConfigParams getConfigParams() {
		return configurationService.getConfigParams();
	}
}