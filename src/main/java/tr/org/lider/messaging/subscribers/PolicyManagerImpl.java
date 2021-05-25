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
package tr.org.lider.messaging.subscribers;

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
import tr.org.lider.messaging.enums.StatusCode;
import tr.org.lider.messaging.messages.IPolicyStatusMessage;
import tr.org.lider.messaging.messages.XMPPClientImpl;
import tr.org.lider.repositories.AgentRepository;
import tr.org.lider.repositories.CommandExecutionRepository;
import tr.org.lider.repositories.CommandExecutionResultRepository;
import tr.org.lider.services.ConfigurationService;

/**
 * Default implementation for {@link IPolicyStatusSubscriber}. This class is
 * responsible for executing policies and handling policy status messages.
 */
@Component
public class PolicyManagerImpl implements IPolicyStatusSubscriber {

	private static Logger logger = LoggerFactory.getLogger(PolicyManagerImpl.class);

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

	public void init() {
		logger.info("Initializing policy manager.");
	}
	
	// TODO execute policy method

	/**
	 * Triggered when a policy status message received. This method listens to
	 * agent responses and creates new command execution results accordingly.
	 * It also throws a policy status event in order to notify plugins about
	 * policy result.
	 * 
	 * @throws Exception
	 * @see tr.org.liderahenk.lider.core.api.messaging.messages.
	 *      IPolicyStatusMessage
	 */
	@Override
	public void messageReceived(IPolicyStatusMessage message) throws Exception {
		if (message != null) {
			logger.info("Policy manager received message from {}", message.getFrom());
			String jid = message.getFrom().split("@")[0];
			String mailSubject = null;
			String mailContent = null;
			try {
				if(message.getResponseData()!=null && message.getResponseData().get("mail_send")!=null)
				{
				Boolean mailSend = (Boolean) message.getResponseData().get("mail_send");
				mailSubject = (String) (mailSend != null && mailSend.booleanValue()
						? message.getResponseData().get("mail_subject") : null);
				mailContent = (String) (mailSend != null && mailSend.booleanValue()
						? message.getResponseData().get("mail_content") : null);
				}
			} catch (Exception e1) {
				logger.error(e1.getMessage(), e1);
			}
			// Find related agent
			List<? extends AgentImpl> agents = agentRepository.findByJid(jid);
			if (agents != null && agents.size() > 0) {
				AgentImpl agent = agents.get(0);
				if (agent != null) {
					// Find related command execution.
					CommandExecutionImpl commandExecution = commanExecutionRepository.findOne(message.getCommandExecutionId());
					byte[] data = new ObjectMapper().writeValueAsBytes(message.getResponseData());
					// Create new command execution result
					CommandExecutionResultImpl	result = new CommandExecutionResultImpl(null, (CommandExecutionImpl) commandExecution, agent.getId(),
								message.getResponseCode(), message.getResponseMessage(), data, message.getContentType(), new Date(),
								mailSubject, mailContent);
					 
					commandExecution.addCommandExecutionResult(result);
					try {
						// Save command execution with result
						result = commandExecutionResultRepository.save(result);
						// Throw an event if the task processing finished
						if (StatusCode.getTaskEndingStates().contains(message.getResponseCode())) {
							messagingService.sendChatMessage(message.getResponseMessage(),  commandExecution.getCommand().getCommandOwnerUid());
						}
					} catch (Exception e) {
						logger.error(e.getMessage(), e);
					}
				}
			}
		}
	}
}
