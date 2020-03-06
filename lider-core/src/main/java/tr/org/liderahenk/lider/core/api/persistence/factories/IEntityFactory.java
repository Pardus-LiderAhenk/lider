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
package tr.org.liderahenk.lider.core.api.persistence.factories;

import java.util.Date;
import java.util.List;
import java.util.Map;

import tr.org.liderahenk.lider.core.api.ldap.model.LdapEntry;
import tr.org.liderahenk.lider.core.api.messaging.messages.IPolicyStatusMessage;
import tr.org.liderahenk.lider.core.api.messaging.messages.ITaskStatusMessage;
import tr.org.liderahenk.lider.core.api.persistence.entities.IAgent;
import tr.org.liderahenk.lider.core.api.persistence.entities.IAgreementStatus;
import tr.org.liderahenk.lider.core.api.persistence.entities.ICommand;
import tr.org.liderahenk.lider.core.api.persistence.entities.ICommandExecution;
import tr.org.liderahenk.lider.core.api.persistence.entities.ICommandExecutionResult;
import tr.org.liderahenk.lider.core.api.persistence.entities.IMailAddress;
import tr.org.liderahenk.lider.core.api.persistence.entities.IMailContent;
import tr.org.liderahenk.lider.core.api.persistence.entities.IOperationLog;
import tr.org.liderahenk.lider.core.api.persistence.entities.IPlugin;
import tr.org.liderahenk.lider.core.api.persistence.entities.IPolicy;
import tr.org.liderahenk.lider.core.api.persistence.entities.IProfile;
import tr.org.liderahenk.lider.core.api.persistence.entities.IReportTemplate;
import tr.org.liderahenk.lider.core.api.persistence.entities.IReportTemplateColumn;
import tr.org.liderahenk.lider.core.api.persistence.entities.IReportTemplateParameter;
import tr.org.liderahenk.lider.core.api.persistence.entities.IReportView;
import tr.org.liderahenk.lider.core.api.persistence.entities.IReportViewColumn;
import tr.org.liderahenk.lider.core.api.persistence.entities.IReportViewParameter;
import tr.org.liderahenk.lider.core.api.persistence.entities.ISearchGroup;
import tr.org.liderahenk.lider.core.api.persistence.entities.ITask;
import tr.org.liderahenk.lider.core.api.persistence.entities.IUserSession;
import tr.org.liderahenk.lider.core.api.persistence.enums.CrudType;
import tr.org.liderahenk.lider.core.api.persistence.enums.SessionEvent;
import tr.org.liderahenk.lider.core.api.plugin.IPluginInfo;
import tr.org.liderahenk.lider.core.api.plugin.deployer.IManagedPlugin;
import tr.org.liderahenk.lider.core.api.plugin.deployer.IPluginPart;
import tr.org.liderahenk.lider.core.api.rest.requests.ICommandRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.IPolicyRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.IProfileRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.IReportTemplateRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.IReportViewColumnRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.IReportViewParameterRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.IReportViewRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.ISearchGroupRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.ITaskRequest;

/**
 * Factory class for all entities.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 *
 */
public interface IEntityFactory {

	/**
	 * 
	 * @param message
	 * @param commandExecution
	 * @param agentId
	 * @param mailContent 
	 * @param mailSubject 
	 * @return
	 * @throws Exception
	 */
	ICommandExecutionResult createCommandExecutionResult(IPolicyStatusMessage message,
			ICommandExecution commandExecution, Long agentId, String mailSubject, String mailContent) throws Exception;

	/**
	 * 
	 * @param message
	 * @param commandExecution
	 * @param agentId
	 * @return
	 * @throws Exception
	 */
	ICommandExecutionResult createCommandExecutionResult(ITaskStatusMessage message, ICommandExecution commandExecution,
			Long agentId, String mailSubject, String mailContent) throws Exception;

	/**
	 * 
	 * @param message
	 * @param data
	 * @param commandExecution
	 * @param agentId
	 * @return
	 */
	ICommandExecutionResult createCommandExecutionResult(ITaskStatusMessage message, byte[] data,
			ICommandExecution commandExecution, Long agentId, String mailSubject, String mailContent);

	/**
	 * 
	 * @param userId
	 * @param crudType
	 * @param taskId
	 * @param policyId
	 * @param profileId
	 * @param message
	 * @param requestData
	 * @param requestIp
	 * @return
	 */
	IOperationLog createLog(String userId, CrudType crudType, Long taskId, Long policyId, Long profileId,
			String message, byte[] requestData, String requestIp);

	/**
	 * 
	 * @param plugin
	 * @param request
	 * @return
	 * @throws Exception
	 */
	ITask createTask(IPlugin plugin, ITaskRequest request) throws Exception;

	/**
	 * 
	 * @param entry
	 * @param command
	 * @return
	 */
	ICommandExecution createCommandExecution(LdapEntry entry, ICommand command, String uid, boolean isOnline);

	/**
	 * 
	 * @param task
	 * @param request
	 * @param commandOwnerJid
	 * @param uidList
	 * @return
	 * @throws Exception
	 */
	ICommand createCommand(ITask task, ICommandRequest request, String commandOwnerJid, List<String> uidList)
			throws Exception;

	/**
	 * 
	 * @param policy
	 * @param request
	 * @param commandOwnerJid
	 * @return
	 * @throws Exception
	 */
	ICommand createCommand(IPolicy policy, ICommandRequest request, String commandOwnerJid) throws Exception;

	/**
	 * 
	 * @param plugin
	 * @param request
	 * @return
	 * @throws Exception
	 */
	IProfile createProfile(IPlugin plugin, IProfileRequest request) throws Exception;

	/**
	 * 
	 * @param profile
	 * @param request
	 * @return
	 * @throws Exception
	 */
	IProfile createProfile(IProfile profile, IProfileRequest request) throws Exception;

	/**
	 * 
	 * @param request
	 * @return
	 * @throws Exception
	 */
	IPolicy createPolicy(IPolicyRequest request) throws Exception;

	/**
	 * 
	 * @param policy
	 * @param request
	 * @return
	 * @throws Exception
	 */
	IPolicy createPolicy(IPolicy policy, IPolicyRequest request) throws Exception;

	/**
	 * 
	 * @param info
	 * @return
	 * @throws Exception
	 */
	IPlugin createPlugin(IPluginInfo info) throws Exception;

	/**
	 * 
	 * @param plugin
	 * @param info
	 * @return
	 * @throws Exception
	 */
	IPlugin createPlugin(IPlugin plugin, IPluginInfo info) throws Exception;

	/**
	 * 
	 * @param username
	 * @param sessionEvent
	 * @return
	 */
	IUserSession createUserSession(String username, String userIp, SessionEvent sessionEvent);

	/**
	 * 
	 * @param existingTemplate
	 * @param template
	 * @return
	 */
	IReportTemplate createReportTemplate(IReportTemplate existingTemplate, IReportTemplate template);

	/**
	 * 
	 * @param template
	 * @return
	 */
	IReportTemplate createReportTemplate(IReportTemplate template);

	/**
	 * 
	 * @param request
	 * @return
	 */
	IReportTemplate createReportTemplate(IReportTemplateRequest request);

	/**
	 * 
	 * @param existingTemplate
	 * @param request
	 * @return
	 */
	IReportTemplate createReportTemplate(IReportTemplate existingTemplate, IReportTemplateRequest request);

	/**
	 * 
	 * @param agent
	 * @return
	 */
	IAgent createAgent(IAgent agent);

	/**
	 * 
	 * @param id
	 * @param jid
	 * @param dn
	 * @param password
	 * @param hostname
	 * @param ipAddresses
	 * @param macAddresses
	 * @param data
	 * @return
	 */
	IAgent createAgent(String jid, String dn, String password, String hostname, String ipAddresses,
			String macAddresses, Map<String, Object> data);

	/**
	 * 
	 * @param existingAgent
	 * @param password
	 * @param hostname
	 * @param ipAddresses
	 * @param macAddresses
	 * @param data
	 * @return
	 */
	IAgent createAgent(IAgent existingAgent,String dn, String password, String hostname, String ipAddresses, String macAddresses,
			Map<String, Object> data);
	
	IAgent createAgent(IAgent existingAgent, String dn, String jid, String password, String hostname, String ipAddresses,
			String macAddresses, Map<String, Object> data);

	IPluginPart createPluginPart(Long id, String fileName, String type, String fullPath);

	IManagedPlugin createManagedPlugin(Long id, String name, String version, Date installationDate, Boolean active,
			List<IPluginPart> parts);

	IReportView createReportView(IReportViewRequest request, IReportTemplate template);

	IReportViewColumn createReportViewColumn(IReportViewColumnRequest c, IReportTemplateColumn tCol);

	IReportViewParameter createReportViewParameter(IReportViewParameterRequest p, IReportTemplateParameter tParam);

	IReportView createReportView(IReportView view, IReportViewRequest request, IReportTemplate template);

	ISearchGroup createSearchGroup(ISearchGroupRequest request);

	IAgreementStatus createAgreementStatus(IAgent agent, String username, String md5, boolean accepted);

	ICommandExecutionResult createCommandExecutionResult(ITaskStatusMessage message, Long resultId,
			ICommandExecution commandExecution, Long agentId, String mailSubject, String mailContent);

	ITask createTask(ITask task, String cronExpression);

	IMailContent createMailContent(IPlugin plugin, IMailContent content);

	IMailAddress createMailAddress(IPlugin plugin, IMailAddress mailAddress);

	ICommand createCommand(ICommand command, boolean sentMail) throws Exception;


}
