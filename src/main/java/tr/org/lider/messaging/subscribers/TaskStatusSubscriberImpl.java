package tr.org.lider.messaging.subscribers;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Dictionary;
import java.util.Hashtable;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.entities.AgentImpl;
import tr.org.lider.entities.CommandExecutionImpl;
import tr.org.lider.entities.CommandExecutionResultImpl;
import tr.org.lider.entities.CommandImpl;
import tr.org.lider.entities.PluginImpl;
import tr.org.lider.messaging.enums.ContentType;
import tr.org.lider.messaging.enums.StatusCode;
import tr.org.lider.messaging.messages.ITaskStatusMessage;
import tr.org.lider.messaging.messages.XMPPClientImpl;
import tr.org.lider.models.TaskStatusNotificationImpl;
import tr.org.lider.repositories.AgentRepository;
import tr.org.lider.repositories.CommandExecutionRepository;
import tr.org.lider.repositories.CommandExecutionResultRepository;
import tr.org.lider.services.ConfigurationService;
import tr.org.lider.utils.FileCopyUtils;


/**
 * handle task result and send result to lider console
 */
@Component
public class TaskStatusSubscriberImpl implements ITaskStatusSubscriber {

	private static Logger logger = LoggerFactory.getLogger(TaskStatusSubscriberImpl.class);

	@Autowired
	private AgentRepository agentRepository;

	@Autowired
	private CommandExecutionRepository commanExecutionRepository;

	@Autowired
	private CommandExecutionResultRepository commandExecutionResultRepository;

	@Autowired
	private ConfigurationService configurationService;

	@Autowired
	private XMPPClientImpl messagingService;


	@Override
	public void messageReceived(ITaskStatusMessage message) {

		if (message != null) {
			logger.info("Task status subscriber received message from {}", message.getFrom());
			String jid = message.getFrom().split("@")[0];

			String mailSubject = null;
			String mailContent = null;

			try {
				if (message.getResponseData() != null && message.getResponseData().get("mail_send") != null) {
					Boolean mailSend = (Boolean) message.getResponseData().get("mail_send");
					mailSubject = (String) (mailSend != null && mailSend.booleanValue()
							? message.getResponseData().get("mail_subject")
							: null);
					mailContent = (String) (mailSend != null && mailSend.booleanValue()
							? message.getResponseData().get("mail_content")
							: null);
				}
			} catch (Exception e1) {
				logger.error(e1.getMessage(), e1);
			}

			// Find related agent
			List<AgentImpl> agents = agentRepository.findByJid(jid);

			if (agents != null && agents.size() > 0) {

				AgentImpl agent = agents.get(0);
				if (agent != null) {
					// Find related command execution.
					// Here we can use agent DN to find the execution record
					// because (unlike policies) tasks can only be executed for
					// agents on agents!
					try {

						List<CommandExecutionImpl> executions = commanExecutionRepository.findCommandExecutionByTaskAndUid(jid, message.getTaskId());

						CommandExecutionImpl commandExecution = null;

						if (executions != null && executions.size() > 0)
							commandExecution = executions.get(0);

						if (commandExecution == null)
							return;

						CommandExecutionResultImpl result = null;

						if (ContentType.getFileContentTypes().contains(message.getContentType())) {
							// Agent must have sent a file before this message! Find
							// the file by its MD5 digest.
							String filePath = configurationService.getFileServerAgentFilePath().replaceFirst("\\{0\\}",
									jid.toLowerCase());
							if (!filePath.endsWith("/"))
								filePath += "/";
							filePath += message.getResponseData().get("md5").toString();
							byte[] data = new FileCopyUtils().copyFile(configurationService.getFileServerHost(),
									configurationService.getFileServerPort(),
									configurationService.getFileServerUsername(),
									configurationService.getFileServerPassword(), filePath, "/tmp/lider");

							result = new CommandExecutionResultImpl(null, commandExecution, agent.getId(),
									message.getResponseCode(), message.getResponseMessage(), data,
									message.getContentType(), new Date(), mailSubject, mailContent);
						} else {

							byte[] data = new ObjectMapper().writeValueAsBytes(message.getResponseData());

							result = new CommandExecutionResultImpl(null, (CommandExecutionImpl) commandExecution,
									agent.getId(), message.getResponseCode(), message.getResponseMessage(), data,
									message.getContentType(), new Date(), mailSubject, mailContent);
						}

						commandExecution.addCommandExecutionResult(result);

						// Save command execution with result
						result = commandExecutionResultRepository.save(result);

						// Throw an event if the task processing finished
						if (StatusCode.getTaskEndingStates().contains(message.getResponseCode())) {
							Dictionary<String, Object> payload = new Hashtable<String, Object>();
							// Task status message
							payload.put("message", message);
							if (ContentType.getFileContentTypes().contains(message.getContentType())) {
								logger.info("Removing data from the result before sending!");
								// If result contains a file, ignore the file
								// (we should not use XMPP for file transfer!)
								// Instead, Lider Console can query the file by
								// its result ID.
								// result = entityFactory.createCommandExecutionResult(message, result.getId(),
								// commandExecution, agent.getId(), mailSubject, mailContent);

								CommandExecutionImpl c = new CommandExecutionImpl();
								c.setId(commandExecution.getId());
								c.setDn(commandExecution.getDn());
								c.setCreateDate(commandExecution.getCreateDate());
								c.setDnType(commandExecution.getDnType());
								c.setCommand((CommandImpl) commandExecution.getCommand());

								result = new CommandExecutionResultImpl(result.getId(), c, agent.getId(),
										message.getResponseCode(), message.getResponseMessage(), null,
										message.getContentType(), new Date(), mailSubject, mailContent);
							} else {
								logger.info("Sending the result with data!");
							}

							String recipient = result.getCommandExecution().getCommand().getCommandOwnerUid();
							logger.info("Sending task status message to Lider Console. Task: {} Status: {} JID: {}",
									new Object[] { message.getTaskId(), message.getResponseCode(), recipient });

							try {
								if(result.getResponseData()!=null) {
								result.setResponseDataStr(new String(result.getResponseData()));}
								

								PluginImpl p = result.getCommandExecution().getCommand().getTask().getPlugin();
								TaskStatusNotificationImpl notification = new TaskStatusNotificationImpl(recipient,
										p.getName(), p.getVersion(),
										result.getCommandExecution().getCommand().getTask().getCommandClsId(),
										result.getCommandExecution(), result, new Date());

								ObjectMapper mapper = new ObjectMapper();
								mapper.setDateFormat(new SimpleDateFormat("dd-MM-yyyy HH:mm"));
								messagingService.sendChatMessage(mapper.writeValueAsString(notification),
										notification.getRecipient());

							} catch (Exception e) {
								logger.error(e.getMessage(), e);
							}

							logger.info("Handled task status.");

						}
					} catch (Exception e) {
						logger.error(e.getMessage(), e);
					}
				}
			}
		}
	}
}
