package tr.org.lider.services;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import org.jivesoftware.smack.SmackException.NotConnectedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.entities.CommandExecutionImpl;
import tr.org.lider.entities.CommandImpl;
import tr.org.lider.entities.PluginImpl;
import tr.org.lider.entities.TaskImpl;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.messaging.messages.ExecuteTaskMessageImpl;
import tr.org.lider.messaging.messages.FileServerConf;
import tr.org.lider.messaging.messages.ILiderMessage;
import tr.org.lider.messaging.messages.ITaskStatusMessage;
import tr.org.lider.messaging.messages.XMPPClientImpl;
import tr.org.lider.messaging.subscribers.ITaskStatusSubscriber;
import tr.org.lider.models.TaskRequestImpl;
import tr.org.lider.repositories.TaskRepository;
import tr.org.lider.utils.CommandResultImpl;
import tr.org.lider.utils.IRestResponse;
import tr.org.lider.utils.ITaskRequest;
import tr.org.lider.utils.ResponseFactoryService;
import tr.org.lider.utils.RestResponseStatus;

@Service
public class TaskService {
	
	Logger logger = LoggerFactory.getLogger(TaskService.class);
	
	@Autowired
	private LDAPServiceImpl ldapService;
	
	@Autowired
	private ConfigurationService configService;

	@Autowired
	private XMPPClientImpl messagingService;

	@Autowired
	private PluginService pluginService;
	
	@Autowired
	private CommandService commandService;

	@Autowired
	private ResponseFactoryService responseFactoryService;
	
	@Autowired
	private TaskRepository taskRepository;
	

	public IRestResponse execute(String requestBodyDecoded) {

		ITaskRequest request = null;
		List<LdapEntry> targetEntries = null;

		try {
			request = new ObjectMapper().readValue(requestBodyDecoded, TaskRequestImpl.class);

			// This is the default format for operation definitions. (such as BROWSER/SAVE, USB/ENABLE etc.)
			String targetOperation = request.getPluginName() + "/" + request.getCommandId();
			logger.debug("Target operation: {}", targetOperation);

			// DN list may contain any combination of agent, user,
			// organizational unit and group DNs,
			// and DN type indicates what kind of entries in this list are
			// subject to command execution. Therefore we need to find these
			// LDAP entries first before authorization and command execution
			// phases.
			targetEntries = ldapService.findTargetEntries(request.getDnList(), request.getDnType());
			
			
//
//			if (configService.getUserAuthorizationEnabled()) {
//				Subject currentUser = null;
//				try {
//					currentUser = SecurityUtils.getSubject();
//				} catch (Exception e) {
//					logger.error(e.getMessage(), e);
//				}
//				if (currentUser != null && currentUser.getPrincipal() != null) {
//					request.setOwner(currentUser.getPrincipal().toString());
//					
//					if (targetEntries != null && !targetEntries.isEmpty()) {
//						// Find only 'permitted' entries:
//						targetEntries = authService.getPermittedEntries(currentUser.getPrincipal().toString(),
//								targetEntries, targetOperation);
//						if (targetEntries == null || targetEntries.isEmpty()) {
//							logger.error("Target Entries is not allowed for user "+ currentUser.getPrincipal().toString());
//							return responseFactory.createResponse(request, RestResponseStatus.ERROR, Arrays.asList(new String[] { "Target Entries is not allowed for user" }));
//						}
//					} else if (ldapService.getUser(currentUser.getPrincipal().toString()) == null) {
//						// Request might not contain any target entries, When
//						// that's the case, check only if user exists!
//						logger.error("User not authorized: {}", currentUser.getPrincipal().toString());
//						return responseFactoryService.createResponse(request, RestResponseStatus.ERROR,
//								Arrays.asList(new String[] { "NOT_AUTHORIZED" }));
//					}
//				} else {
//					logger.warn("Unauthenticated user access.");
//					return responseFactoryService.createResponse(request, RestResponseStatus.ERROR,
//							Arrays.asList(new String[] { "NOT_AUTHORIZED" }));
//				}
//			}
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return responseFactoryService.createResponse(request, RestResponseStatus.ERROR,	Arrays.asList(new String[] { e.getMessage() }));
		}
			//return serviceRouter.delegateRequest(request, targetEntries);
		String key = buildKey(request.getPluginName(), request.getPluginVersion(),	request.getCommandId());
		
		
		// Find related plugin
		
		
		List<PluginImpl> plugins= pluginService.findPluginByNameAndVersion(request.getPluginName(), request.getPluginVersion());
		
		PluginImpl selectedPlugin=null;
		
		if(plugins!=null && plugins.size()>0) {
		
			selectedPlugin=plugins.get(0);
			
		}

		// Create & persist task
		TaskImpl task= new TaskImpl(null, selectedPlugin, request.getCommandId(), request.getParameterMap(), false,
				request.getCronExpression(), new Date(), null);

		task = taskRepository.save(task);
		
		// Task has an activation date, it will be sent to agent(s) on that date.
		
		List<String> uidList = new ArrayList<String>();
		
		for (LdapEntry entry : targetEntries) {
			if (ldapService.isAhenk(entry)) {
				uidList.add(entry.get(configService.getAgentLdapJidAttribute()));
			}
		}
		
		CommandImpl command=null;
		
		try {
			command= new CommandImpl(null, null, task, 
					request.getDnList(), 
					request.getDnType(), 
					uidList,
					"lider_console", 
					((ITaskRequest) request).getActivationDate(), 
					null, new Date(), null, false);
		} catch (JsonGenerationException e) {
			e.printStackTrace();
		} catch (JsonMappingException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		if(command!=null)
		commandService.addCommand(command);
		
		if (targetEntries != null && !targetEntries.isEmpty()) {
			
			for (final LdapEntry entry : targetEntries) {
				
				boolean isAhenk = ldapService.isAhenk(entry);
				
				String uid = isAhenk ? entry.get(configService.getAgentLdapJidAttribute()) : null;
				
				logger.info("DN type: {}, UID: {}", entry.getType().toString(), uid);
				
				uid=uid.trim();

				Boolean isOnline=messagingService.isRecipientOnline(getFullJid(uid));
				
				CommandExecutionImpl execution=	new CommandExecutionImpl(null, 
						command, uid, entry.getType(), entry.getDistinguishedName(),
						new Date(), null, isOnline);
				
				command.addCommandExecution(execution);

				String cronStr = task.getCronExpression();
			
				// Task message
				ILiderMessage message = null;
				if (isAhenk) {
					// Set agent JID
					// (the JID is UID of the LDAP entry)
					if (uid == null || uid.isEmpty()) {
						logger.error("JID was null. Ignoring task: {} for agent: {}",	new Object[] { task.toJson(), entry.getDistinguishedName() });
						continue;
					}
					logger.info("Sending task to agent with JID: {}", uid);
					
					String taskJsonString = null;
					try {
						taskJsonString = task.toJson();
					} catch (Exception e) {
						logger.error(e.getMessage(), e);
					}
					
					FileServerConf fileServerConf=selectedPlugin.isUsesFileTransfer() 
							? configService.getFileServerConf(uid.toLowerCase()) : null;
					 // uid=jid
					message= new ExecuteTaskMessageImpl(taskJsonString, uid, new Date(), fileServerConf);
					
					// TaskStatusUpdateListener in XMPPClientImpl class
					try {
						messagingService.sendMessage(message);
					} catch (JsonGenerationException e) {
						e.printStackTrace();
					} catch (JsonMappingException e) {
						e.printStackTrace();
					} catch (NotConnectedException e) {
						e.printStackTrace();
					} catch (IOException e) {
						e.printStackTrace();
					}

				}
				commandService.addCommandExecution(execution);
			}
		}
		
		
		return responseFactoryService.createResponse(RestResponseStatus.OK,"Task Basarı ile Gonderildi.");
	}

	
	public String buildKey(String pluginName, String pluginVersion, String commandId) {
		StringBuilder key = new StringBuilder();
		key.append(pluginName).append(":").append(pluginVersion).append(":").append(commandId);
		return key.toString().toUpperCase(Locale.ENGLISH);
	}
	
	public String getFullJid(String jid) {
		String jidFinal = jid;
		if (jid.indexOf("@") < 0) {
			jidFinal = jid + "@" + configService.getXmppServiceName();
		}
		return jidFinal;
	}
	
	
}
