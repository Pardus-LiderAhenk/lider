package tr.org.lider.services;

import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.PluginTask;
import tr.org.lider.repositories.PluginTaskRepository;

@Service
public class PluginTaskService {

	@Autowired
	private PluginTaskRepository pluginTaskRepository;
	
	@PostConstruct
	public void init() throws Exception {
	}
	
	public List<PluginTask> findAll() {
		return pluginTaskRepository.findAll(Sort.by("name"));
	}
}
