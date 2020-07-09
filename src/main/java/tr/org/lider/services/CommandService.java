package tr.org.lider.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.CommandExecutionImpl;
import tr.org.lider.entities.CommandExecutionResultImpl;
import tr.org.lider.entities.CommandImpl;
import tr.org.lider.entities.PolicyImpl;
import tr.org.lider.entities.TaskImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.repositories.CommandExecutionRepository;
import tr.org.lider.repositories.CommandExecutionResultRepository;
import tr.org.lider.repositories.CommandRepository;

@Service
public class CommandService {
	
	@Autowired
	private CommandRepository commandRepository;	
	
	@Autowired
	private CommandExecutionRepository commandExecutionRepository;	
	
	@Autowired
	private CommandExecutionResultRepository commandExecutionResultRepository;

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
		List<Object[]> result = commandRepository.findCommandsOfAgent(dn);
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
				if(commandExecution.getCommandExecutionResults().size() > 0) {
					if(commandExecution.getCommandExecutionResults().get(0).getResponseData() != null) {
						commandExecution.getCommandExecutionResults().get(0).setResponseDataStr(
								new String(commandExecution.getCommandExecutionResults().get(0).getResponseData()));
					}
					else {
						commandExecution.getCommandExecutionResults().get(0).setResponseDataStr(null);
					}
				} 
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
	
	public CommandExecutionResultImpl getCommandExecutionResultByID(Long id) {
		return commandExecutionResultRepository.findOne(id);
	}
}
