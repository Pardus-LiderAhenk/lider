package tr.org.lider.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.CommandExecutionImpl;
import tr.org.lider.entities.CommandImpl;
import tr.org.lider.repositories.CommandExecutionRepository;
import tr.org.lider.repositories.CommandRepository;

@Service
public class CommandService {
	
	@Autowired
	private CommandRepository commandRepository;	
	
	@Autowired
	private CommandExecutionRepository commandExecutionRepository;	

	public List<CommandImpl> findAllCommands() {
		
		List<CommandImpl> list=new ArrayList<>();
		commandRepository.findAll().forEach(list::add);
		
		return list ;
	}
	
	public CommandImpl getCommand(Long id) {
		
		return commandRepository.findOne(id);
	}
	
	public CommandImpl addCommand(CommandImpl pluginImpl) {
		
		return commandRepository.save(pluginImpl);
	}
	
	public void deleteCommand(CommandImpl pluginImpl) {
		
		commandRepository.delete(pluginImpl);
	}

	public CommandImpl updateCommand(CommandImpl pluginImpl) {
		
		return 	commandRepository.save(pluginImpl);
	}
	
	
	
	// command execution CURD operations
	
	public CommandExecutionImpl getCommandExecution(Long id) {
		
		return commandExecutionRepository.findOne(id);
	}
	
	public CommandExecutionImpl addCommandExecution(CommandExecutionImpl entity) {
		
		return commandExecutionRepository.save(entity);
	}
	
	public void deleteCommandExecution(CommandExecutionImpl entity) {
		
		commandExecutionRepository.delete(entity);
	}
	
	public CommandExecutionImpl updateCommandExecution(CommandExecutionImpl entity) {
		
		return 	commandExecutionRepository.save(entity);
	}
	
	
}
