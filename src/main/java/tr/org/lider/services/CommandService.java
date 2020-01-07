package tr.org.lider.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.CommandExecutionImpl;
import tr.org.lider.entities.CommandImpl;
import tr.org.lider.entities.TaskImpl;
import tr.org.lider.repositories.CommandExecutionRepository;
import tr.org.lider.repositories.CommandRepository;

@Service
public class CommandService {
	
	@Autowired
	private CommandRepository commandRepository;	
	
	@Autowired
	private CommandExecutionRepository commandExecutionRepository;	

	public List<CommandImpl> findAllCommands() {
		return commandRepository.findAll() ;
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
	
	// command execution CRUD operations
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
	
	public List<CommandImpl> findAllByDN(String dn) {
		return commandRepository.findAllByDnListJsonStringContaining(dn);
	}
	
	public List<CommandImpl> getExecutedTasks(String dn) {
		List<CommandImpl> listCommand;
		List<CommandExecutionImpl> listCommandExecution;
		List<Object[]> result = commandRepository.test(dn);
		if(result != null) {
			listCommand = new ArrayList<CommandImpl>();
			
			CommandImpl command;
			CommandExecutionImpl commandExecution;
			TaskImpl task;
			for (int i = 0; i < result.size(); i++) {
				listCommandExecution = new ArrayList<CommandExecutionImpl>();
				
				task = new TaskImpl();
				task = (TaskImpl) result.get(i)[0];
				
				commandExecution = new CommandExecutionImpl();
				commandExecution = (CommandExecutionImpl)result.get(i)[1];
				listCommandExecution.add(commandExecution);
				
				command = new CommandImpl();
				command.setCommandOwnerUid((String)result.get(i)[2]);
				command.setId((Long) result.get(i)[3]);
				command.setTask(task);
				command.setCommandExecutions(listCommandExecution);
				
				listCommand.add(command);
			}
			return listCommand;
		} else {
			return null;
		}
	}
}
