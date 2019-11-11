package tr.org.lider.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.PluginImpl;
import tr.org.lider.entities.PluginTask;
import tr.org.lider.repositories.PluginRepository;
import tr.org.lider.repositories.PluginTaskRepository;

@Service
public class PluginService {
	
	@Autowired
	private PluginRepository pluginRepository;	
	
	@Autowired
	private PluginTaskRepository pluginTaskRepository;	

	public List<PluginImpl> findAllPlugins() {
		
		List<PluginImpl> pluginList=new ArrayList<>();
		pluginRepository.findAll().forEach(pluginList::add);
		
		return pluginList ;
	}
	
	public PluginImpl getPlugin(Long id) {
		
		return pluginRepository.findOne(id);
	}
	
	public PluginImpl addPlugin(PluginImpl pluginImpl) {
		
		return pluginRepository.save(pluginImpl);
	}
	
	public void deletePlugin(PluginImpl pluginImpl) {
		
		pluginRepository.delete(pluginImpl);
	}

	public PluginImpl updatePlugin(PluginImpl pluginImpl) {
		
		return 	pluginRepository.save(pluginImpl);
	}
	
	
	public List<PluginImpl> findPluginByNameAndVersion(String name, String version) {
		
		return pluginRepository.findByNameAndVersion(name, version);
	}
	
	public List<PluginTask> findAllPluginTask() {
		
		return pluginTaskRepository.findByState(1);
	}
	
	
	
}
