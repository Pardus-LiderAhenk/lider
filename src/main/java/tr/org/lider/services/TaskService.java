package tr.org.lider.services;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.jivesoftware.smack.SmackException.NotConnectedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.JsonMappingException;

import tr.org.lider.LiderSecurityUserDetails;
import tr.org.lider.entities.CommandExecutionImpl;
import tr.org.lider.entities.CommandImpl;
import tr.org.lider.entities.PluginTask;
import tr.org.lider.entities.TaskImpl;
import tr.org.lider.ldap.DNType;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.messaging.messages.ExecuteTaskMessageImpl;
import tr.org.lider.messaging.messages.FileServerConf;
import tr.org.lider.messaging.messages.ILiderMessage;
import tr.org.lider.messaging.messages.XMPPClientImpl;
import tr.org.lider.repositories.TaskRepository;
import tr.org.lider.utils.IRestResponse;
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
	

	public IRestResponse execute(PluginTask request) {

		// Getting target entries 
		/**
		 * Getting target entries.. selected entries can be group ahhenk or organizational unit.
		 * targetEntries must be only Ahenk. 
		 * getTargetList method finds all suitable ahenks from selected group or organizational unit
		 * 
		 */
		List<LdapEntry> targetEntries = getTargetList(request);

		// Create & persist task
		TaskImpl task= new TaskImpl(null, request.getPlugin(), request.getCommandId(), request.getParameterMap(), false,
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
			command= new CommandImpl(null, null, task, request.getDnList(), request.getDnType(), uidList,findCommandOwnerJid(), 
					((PluginTask) request).getActivationDate(), 
					null, new Date(), null, false, false);
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

				// Task message
				ILiderMessage message = null;
				if (isAhenk) {
					// Set agent JID (the JID is UID of the LDAP entry)
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
					
					FileServerConf fileServerConf=request.getPlugin().isUsesFileTransfer() ? configService.getFileServerConf(uid.toLowerCase()) : null;
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
	
	private List<LdapEntry> getTargetList(PluginTask request) {
		List<LdapEntry> targetEntries= new ArrayList<>();
		List<LdapEntry> selectedtEntries= request.getEntryList();
		for (LdapEntry ldapEntry : selectedtEntries) {
			if(ldapEntry.getType().equals(DNType.AHENK)) {
				targetEntries.add(ldapEntry);
			}
			if(ldapEntry.getType().equals(DNType.GROUP)) {
				String[] members= ldapEntry.getAttributesMultiValues().get("member");
				for (int i = 0; i < members.length; i++) {
					String dn = members[i];
					try {
						List<LdapEntry> member= ldapService.findSubEntries(dn, "(objectclass=pardusDevice)", new String[] { "*" }, SearchScope.OBJECT);
						if(member!=null && member.size()>0) {
							targetEntries.add(member.get(0));
						}
						
						
					} catch (LdapException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
				
			}
			if(ldapEntry.getType().equals(DNType.ORGANIZATIONAL_UNIT)) {
				
			}
		}
		
		
		return targetEntries;
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
	
	
	private String findCommandOwnerJid() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		
		if (authentication != null && !(authentication instanceof AnonymousAuthenticationToken)) {
			Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
			if ( principal instanceof UserDetails) {
				LiderSecurityUserDetails userDetails = (LiderSecurityUserDetails) principal;
				logger.info(" task owner jid : "+userDetails.getLiderUser().getName());
				return userDetails.getLiderUser().getName();
			} 
			
		}
		return null;
	}
	
	
	
	
}
