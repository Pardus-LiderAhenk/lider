package tr.org.lider.services;

import java.util.ArrayList;
import java.util.List;

import javax.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.entities.CommandExecutionImpl;
import tr.org.lider.entities.CommandExecutionResultImpl;
import tr.org.lider.entities.CommandImpl;
import tr.org.lider.entities.TaskImpl;
import tr.org.lider.repositories.CommandExecutionRepository;
import tr.org.lider.repositories.CommandExecutionResultRepository;
import tr.org.lider.repositories.CommandRepository;

@Service
public class CommandService {

	Logger logger = LoggerFactory.getLogger(CommandService.class);

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

	public CommandImpl updateCommand(CommandImpl commandImpl) {
		return 	commandRepository.save(commandImpl);
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

	public Long getTotalCountOfSentTasks() {
		return commandExecutionRepository.count();
	}

	public CommandExecutionResultImpl getCommandExecutionResultByID(Long id) {
		return commandExecutionResultRepository.findOne(id);
	}

	public void updateAgentDN(String currentDN, String newDN) {
		commandExecutionRepository.updateAgentDN(currentDN, newDN);

		List<CommandImpl> listOfCommand = commandRepository.findAllByDnListJsonStringContaining(currentDN);
		for (CommandImpl commandImpl : listOfCommand) {
			String updatedDNList = commandImpl.getDnListJsonString().replace(currentDN, newDN);
			commandRepository.updateAgentDN(commandImpl.getId(), updatedDNList);
		}
	}

	public void updateAgentHostname(String currentDN, String newDN, String uid, String newHostname) {
		//update dn and uid in C_COMMAND_EXECUTION table
		commandExecutionRepository.updateAgentDNAndUID(currentDN, newDN, newHostname);

		//update dn in C_COMMAND table
		List<CommandImpl> listOfCommandByDN = commandRepository.findAllByDnListJsonStringContaining(currentDN);
		for (CommandImpl commandImpl : listOfCommandByDN) {
			String updatedDNList = commandImpl.getDnListJsonString().replace(currentDN, newDN);
			commandRepository.updateAgentDN(commandImpl.getId(), updatedDNList);
		}

		//update uid list in C_COMMAND table
		ObjectMapper mapper = new ObjectMapper();
		List<CommandImpl> listOfCommandByUID = commandRepository.findAllByUidListJsonStringContaining("\"" + uid + "\"");
		for (CommandImpl command : listOfCommandByUID) {
			List<String> uidList = command.getUidList();
			for (int i = 0; i < uidList.size(); i++) {
				if(uidList.get(i).equals(uid)) {
					String newUID = uidList.get(i).replace(uid, newHostname);
					uidList.set(i, newUID);
				}
			}

			try {
				command.setUidListJsonString(uidList != null ? mapper.writeValueAsString(uidList) : null);
				commandRepository.save(command);
			} catch (JsonProcessingException e) {
				logger.error("Error occured while updating UID list of CommandImpl for renaming agent");
			}
		}
	}


	@Transactional
	public void deleteAgentCommands(String dn, String uid) {
		String uidListJsonString = "[\"" + uid + "\"]";
		commandRepository.deleteByUidListJsonString(uidListJsonString);
		ObjectMapper mapper = new ObjectMapper();
		List<CommandImpl> commandList = commandRepository.findByUidListJsonStringContaining("\"" + uid + "\"");
		for (CommandImpl command : commandList) {
			List<String> uidList = command.getUidList();
			for (int i = 0; i < uidList.size(); i++) {
				if(uidList.get(i).equals(uid)) {
					uidList.remove(i);
					break;
				}
			}

			try {
				command.setUidListJsonString(uidList != null ? mapper.writeValueAsString(uidList) : null);
				for (int i = 0; i < command.getCommandExecutions().size(); i++) {
					if(command.getCommandExecutions().get(i).getDn().equals(dn)) {
						command.getCommandExecutions().remove(i);
					}
				}
				commandRepository.save(command);
			} catch (JsonProcessingException e) {
				logger.error("Error occured while updating UID list of CommandImpl for deleting agent");
			}

			commandExecutionRepository.deleteByDn(dn);
		}
	}
}
