/*
*
*    Copyright © 2015-2016 Tübitak ULAKBIM
*
*    This file is part of Lider Ahenk.
*
*    Lider Ahenk is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    Lider Ahenk is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with Lider Ahenk.  If not, see <http://www.gnu.org/licenses/>.
*/
package tr.org.liderahenk.lider.rest;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import tr.org.liderahenk.lider.core.api.authorization.IAuthService;
import tr.org.liderahenk.lider.core.api.configuration.IConfigurationService;
import tr.org.liderahenk.lider.core.api.ldap.ILDAPService;
import tr.org.liderahenk.lider.core.api.ldap.model.LdapEntry;
import tr.org.liderahenk.lider.core.api.messaging.IMessageFactory;
import tr.org.liderahenk.lider.core.api.messaging.IMessagingService;
import tr.org.liderahenk.lider.core.api.persistence.dao.ICommandDao;
import tr.org.liderahenk.lider.core.api.persistence.dao.ITaskDao;
import tr.org.liderahenk.lider.core.api.persistence.entities.ICommand;
import tr.org.liderahenk.lider.core.api.persistence.entities.ICommandExecution;
import tr.org.liderahenk.lider.core.api.persistence.entities.ICommandExecutionResult;
import tr.org.liderahenk.lider.core.api.persistence.entities.ITask;
import tr.org.liderahenk.lider.core.api.persistence.factories.IEntityFactory;
import tr.org.liderahenk.lider.core.api.rest.IRequestFactory;
import tr.org.liderahenk.lider.core.api.rest.IResponseFactory;
import tr.org.liderahenk.lider.core.api.rest.enums.RestResponseStatus;
import tr.org.liderahenk.lider.core.api.rest.exceptions.InvalidRequestException;
import tr.org.liderahenk.lider.core.api.rest.processors.ITaskRequestProcessor;
import tr.org.liderahenk.lider.core.api.rest.requests.ITaskRequest;
import tr.org.liderahenk.lider.core.api.rest.responses.IRestResponse;
import tr.org.liderahenk.lider.core.api.router.IServiceRouter;
import tr.org.liderahenk.lider.core.api.taskmanager.exceptions.TaskExecutionFailedException;
import tr.org.liderahenk.lider.rest.dto.ExecutedTask;

/**
 * Processor class for handling/processing task data.
 * 
 * @author <a href="mailto:caner.feyzullahoglu@agem.com.tr">Caner
 *         Feyzullahoğlu</a>
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 *
 */
public class TaskRequestProcessorImpl implements ITaskRequestProcessor {

	private static Logger logger = LoggerFactory.getLogger(TaskRequestProcessorImpl.class);

	private IRequestFactory requestFactory;
	private IResponseFactory responseFactory;
	private IServiceRouter serviceRouter;
	private IAuthService authService;
	private IConfigurationService configService;
	private ILDAPService ldapService;
	private ITaskDao taskDao;
	private ICommandDao commandDao;
	private IMessagingService messagingService;
	private IMessageFactory messageFactory;
	private IEntityFactory entityFactory;

	@Override
	public IRestResponse execute(String json) {

		ITaskRequest request = null;
		List<LdapEntry> targetEntries = null;

		try {
			request = requestFactory.createTaskCommandRequest(json);

			// This is the default format for operation definitions. (such as
			// BROWSER/SAVE, USB/ENABLE etc.)
			String targetOperation = request.getPluginName() + "/" + request.getCommandId();
			logger.debug("Target operation: {}", targetOperation);

			// DN list may contain any combination of agent, user,
			// organizational unit and group DNs,
			// and DN type indicates what kind of entries in this list are
			// subject to command execution. Therefore we need to find these
			// LDAP entries first before authorization and command execution
			// phases.
			targetEntries = ldapService.findTargetEntries(request.getDnList(), request.getDnType());

			if (configService.getUserAuthorizationEnabled()) {
				Subject currentUser = null;
				try {
					currentUser = SecurityUtils.getSubject();
				} catch (Exception e) {
					logger.error(e.getMessage(), e);
				}
				if (currentUser != null && currentUser.getPrincipal() != null) {
					request.setOwner(currentUser.getPrincipal().toString());
					
					if (targetEntries != null && !targetEntries.isEmpty()) {
						// Find only 'permitted' entries:
						targetEntries = authService.getPermittedEntries(currentUser.getPrincipal().toString(),
								targetEntries, targetOperation);
						if (targetEntries == null || targetEntries.isEmpty()) {
							logger.error("Target Entries is not allowed for user "+ currentUser.getPrincipal().toString());
							return responseFactory.createResponse(request, RestResponseStatus.ERROR, Arrays.asList(new String[] { "Target Entries is not allowed for user" }));
						}
					} else if (ldapService.getUser(currentUser.getPrincipal().toString()) == null) {
						// Request might not contain any target entries, When
						// that's the case, check only if user exists!
						logger.error("User not authorized: {}", currentUser.getPrincipal().toString());
						return responseFactory.createResponse(request, RestResponseStatus.ERROR,
								Arrays.asList(new String[] { "NOT_AUTHORIZED" }));
					}
				} else {
					logger.warn("Unauthenticated user access.");
					return responseFactory.createResponse(request, RestResponseStatus.ERROR,
							Arrays.asList(new String[] { "NOT_AUTHORIZED" }));
				}
			}
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return responseFactory.createResponse(request, RestResponseStatus.ERROR,
					Arrays.asList(new String[] { e.getMessage() }));
		}

		try {
			logger.info("Request processed & authorized successfully. Delegating it to service router.");
			return serviceRouter.delegateRequest(request, targetEntries);
		} catch (InvalidRequestException e) {
			logger.error(e.getMessage(), e);
			return responseFactory.createResponse(request, RestResponseStatus.ERROR,
					Arrays.asList(new String[] { "No matching command found to process request!" }));
		} catch (TaskExecutionFailedException e) {
			logger.error(e.getMessage(), e);
			return responseFactory.createResponse(request, RestResponseStatus.ERROR, Arrays.asList(
					new String[] { "Cannot submit task for request!", e.getMessage(), e.getCause().getMessage() }));
		}
	}

	@Override
	public IRestResponse cancelTask(Long id) {
		if (id == null) {
			throw new IllegalArgumentException("ID was null.");
		}
		List<? extends ICommand> result = commandDao.findByProperty(ICommand.class, "task.id", id, 1);
		ICommand command = result != null && !result.isEmpty() ? result.get(0) : null;
		if (command == null) {
			throw new IllegalStateException("Couldn't find related command record while rescheduling task");
		}
		// If this is a scheduled task, send message to related agent(s) as
		// well
		if (command.getTask().getCronExpression() != null) {
			List<String> uidList = command.getUidList();
			if (uidList != null) {
				for (String uid : uidList) {
					try {
						messagingService.sendMessage(messageFactory.createUpdateScheduledTaskMessage(uid, id, null));
					} catch (Exception e) {
						logger.error(e.getMessage(), e);
					}
				}
			}
		}
		taskDao.delete(id);
		logger.info("Task record deleted and related agents notified: {}", id);
		return responseFactory.createResponse(RestResponseStatus.OK, "Task cancelled.");
	}

	@Override
	public IRestResponse rescheduleTask(Long id, String cronExpression) {
		if (id == null) {
			throw new IllegalArgumentException("ID was null.");
		}
		if (cronExpression == null) {
			throw new IllegalArgumentException("Cron expression was null.");
		}
		List<? extends ICommand> result = commandDao.findByProperty(ICommand.class, "task.id", id, 1);
		ICommand command = result != null && !result.isEmpty() ? result.get(0) : null;
		if (command == null) {
			throw new IllegalStateException("Couldn't find related command record while rescheduling task.");
		}
		if (command.getTask().getCronExpression() == null) {
			throw new IllegalStateException("Cannot reschedule tasks without cron expression.");
		}
		List<String> uidList = command.getUidList();
		if (uidList != null) {
			for (String uid : uidList) {
				try {
					messagingService
							.sendMessage(messageFactory.createUpdateScheduledTaskMessage(uid, id, cronExpression));
				} catch (Exception e) {
					logger.error(e.getMessage(), e);
				}
			}
		}
		try {
			taskDao.update(entityFactory.createTask(command.getTask(), cronExpression));
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return responseFactory.createResponse(RestResponseStatus.ERROR,
					Arrays.asList(new String[] { "Error occurred while rescheduling task." }));
		}
		logger.info("Task record updated and related agents rescheduled: {}", id);
		return responseFactory.createResponse(RestResponseStatus.OK, "Task rescheduled.");
	}

	@Override
	public IRestResponse listExecutedTasks(String pluginName, Boolean onlyFutureTasks, Boolean onlyScheduledTasks,
			Date createDateRangeStart, Date createDateRangeEnd, Integer status, Integer maxResults) {
		// Try to find command results
		List<Object[]> resultList = commandDao.findTaskCommand(pluginName, onlyFutureTasks, onlyScheduledTasks,
				createDateRangeStart, createDateRangeEnd, status, maxResults);
		List<ExecutedTask> tasks = null;
		// Convert SQL result to collection of tasks.
		if (resultList != null) {
			tasks = new ArrayList<ExecutedTask>();
			for (Object[] arr : resultList) {
				if (arr.length != 6) {
					continue;
				}
				ExecutedTask task = new ExecutedTask((ITask) arr[0],(Long) arr[1], (Integer) arr[2], (Integer) arr[3],
						(Integer) arr[4], (Date) arr[5]);
				tasks.add(task);
			}
		}

		// Construct result map
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			resultMap.put("tasks", tasks);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}

		return responseFactory.createResponse(RestResponseStatus.OK, "Records listed.", resultMap);
	}

	/**
	 * Find command record related to task specified by id.
	 */
	@Override
	public IRestResponse getCommand(Long taskId) {
		if (taskId == null) {
			throw new IllegalArgumentException("ID was null.");
		}
		Map<String, Object> propertiesMap = new HashMap<String, Object>();
		propertiesMap.put("task.id", taskId);
		List<? extends ICommand> commands = commandDao.findByProperties(ICommand.class, propertiesMap, null, 1);
		ICommand command = commands.get(0);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("command", command);
		return responseFactory.createResponse(RestResponseStatus.OK, "Record retrieved.", resultMap);
	}

	@Override
	public IRestResponse listCommands(Integer maxResults) {
		// Try to find commands
		List<? extends ICommand> commands = commandDao.findTaskCommands(maxResults);

		// Construct result map
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			resultMap.put("commands", commands);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}

		return responseFactory.createResponse(RestResponseStatus.OK, "Records listed.", resultMap);
	}

	@Override
	public IRestResponse getResponseData(Long commandExecutionResultId) {
		if (commandExecutionResultId == null) {
			throw new IllegalArgumentException("ID was null.");
		}

		// Try to find execution result
		ICommandExecutionResult executionResult = commandDao.findExecutionResult(commandExecutionResultId);

		// Construct result map
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			resultMap.put("responseData", executionResult.getResponseData());
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}

		return responseFactory.createResponse(RestResponseStatus.OK, "Records listed.", resultMap);
	}

	/**
	 * Get all executed tasks of an agent.
	 */
	@Override
	public IRestResponse listExecutedDeviceTasks(String uid) {
		List<? extends ICommand> resultList = taskDao.listExecutedDeviceTasks(uid);
		// Construct result map
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			resultMap.put("tasks", resultList);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}		
		return responseFactory.createResponse(RestResponseStatus.OK, "Records listed.", resultMap);
	}
	
	/**
	 * 
	 * @param serviceRouter
	 */
	public void setServiceRouter(IServiceRouter serviceRouter) {
		this.serviceRouter = serviceRouter;
	}

	/**
	 * 
	 * @param requestFactory
	 */
	public void setRequestFactory(IRequestFactory requestFactory) {
		this.requestFactory = requestFactory;
	}

	/**
	 * 
	 * @param responseFactory
	 */
	public void setResponseFactory(IResponseFactory responseFactory) {
		this.responseFactory = responseFactory;
	}

	/**
	 * 
	 * @param authService
	 */
	public void setAuthService(IAuthService authService) {
		this.authService = authService;
	}

	/**
	 * 
	 * @param ldapService
	 */
	public void setLdapService(ILDAPService ldapService) {
		this.ldapService = ldapService;
	}

	/**
	 * 
	 * @param configService
	 */
	public void setConfigService(IConfigurationService configService) {
		this.configService = configService;
	}

	/**
	 * 
	 * @param taskDao
	 */
	public void setTaskDao(ITaskDao taskDao) {
		this.taskDao = taskDao;
	}

	/**
	 * 
	 * @param commandDao
	 */
	public void setCommandDao(ICommandDao commandDao) {
		this.commandDao = commandDao;
	}

	/**
	 * 
	 * @param messagingService
	 */
	public void setMessagingService(IMessagingService messagingService) {
		this.messagingService = messagingService;
	}

	/**
	 * 
	 * @param messageFactory
	 */
	public void setMessageFactory(IMessageFactory messageFactory) {
		this.messageFactory = messageFactory;
	}

	/**
	 * 
	 * @param entityFactory
	 */
	public void setEntityFactory(IEntityFactory entityFactory) {
		this.entityFactory = entityFactory;
	}

}
