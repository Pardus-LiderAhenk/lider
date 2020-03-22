package tr.org.lider.controllers;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.entities.ConfigImpl;
import tr.org.lider.models.ConfigParams;
import tr.org.lider.services.ConfigService;

@Controller
@RequestMapping("/config")
public class ConfigController {
	
	Logger logger = LoggerFactory.getLogger(ConfigController.class);
	
	@Autowired
	ConfigService configService;
	
	@RequestMapping(value = "")
	public String getPage() {
		return "config";
	}
	
	@RequestMapping(method=RequestMethod.POST, value = "/save", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public Boolean saveConfigParams(ConfigParams configParams) {
		//set default configuration params
		configParams.setDefaultParams();
		try {
			//convert params object to string and save it to Config table
			ObjectMapper mapper = new ObjectMapper();
			String jsonString = mapper.writeValueAsString(configParams);
			configService.save(new ConfigImpl("liderConfigParams", jsonString));
		} catch (JsonProcessingException e) {
			e.printStackTrace();
			logger.error("Error occured while converting ConfigParams object to json string: " + e.getMessage());
			return false;
		}
		return true;
	}
}