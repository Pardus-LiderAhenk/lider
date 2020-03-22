package tr.org.lider.services;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.entities.ConfigImpl;
import tr.org.lider.models.ConfigParams;
import tr.org.lider.repositories.ConfigRepository;

@Service
public class ConfigService {

	Logger logger = LoggerFactory.getLogger(ConfigService.class);

	@Autowired
	ConfigRepository configRepository;

	//for singleton
	private static ConfigParams configParams;

	public ConfigImpl save(ConfigImpl config) {
		//if configParams is updated delete configParams
		if(config.getName().equals("liderConfigParams")) {
			configParams = null;
		}
		return configRepository.save(config);
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

	public void deleteByName(String name) {
		//if configParams is updated delete configParams
		if(name.equals("liderConfigParams")) {
			configParams = null;
		}
		configRepository.deleteByName(name);
	}
	public ConfigParams getConfigParams() {
		if (configParams == null) {
			try {
				ObjectMapper mapper = new ObjectMapper();
				configParams = mapper.readValue(findByName("liderConfigParams").get().getValue(), ConfigParams.class);
				return configParams;
			} catch (JsonProcessingException e) {
				logger.error("Error occured while retrieving config params from db.");
				e.printStackTrace();
				return null;
			}
		} else {
			return configParams;
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
