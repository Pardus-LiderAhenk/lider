package tr.org.lider.services;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.controllers.LoginController;
import tr.org.lider.entities.ConfigImpl;
import tr.org.lider.entities.ConfigParams;
import tr.org.lider.repositories.ConfigRepository;

@Service
public class ConfigService {

	Logger logger = LoggerFactory.getLogger(ConfigService.class);
	
	@Autowired
	ConfigRepository configRepository;

	public ConfigImpl save(ConfigImpl config) {
		return configRepository.save(config);
	}

	public List<ConfigImpl> saveAll(List<ConfigImpl> configList) {
		return configRepository.saveAll(configList);
	}

	public List<ConfigImpl> findAll() {
		return configRepository.findAll();
	}

	public Optional<ConfigImpl> findAgentByID(Long configID) {
		return configRepository.findById(configID);
	}

	public Optional<ConfigImpl> findByName(String name) {
		return configRepository.findByName(name);
	}

	public Optional<ConfigImpl> findByValue(String value) {
		return configRepository.findByValue(value);
	}

	public Optional<ConfigImpl> findByNameAndValue(String name, String value) {
		return configRepository.findByNameAndValue(name, value);
	}

	public ConfigParams getConfigParams() {
		try {
			ObjectMapper mapper = new ObjectMapper();
			ConfigParams cParams = mapper.readValue(findByName("liderConfigParams").get().getValue(), ConfigParams.class);
			return cParams;
		} catch (JsonProcessingException e) {
			logger.error("Error occured while retrieving config params from db.");
			e.printStackTrace();
			return null;
		}
	}

	public Boolean isConfigurationDone() {
		if(findByName("liderConfigParams").isPresent()) {
			return true;
		} else {
			return false;
		}
	}


}
