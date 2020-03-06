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
package tr.org.liderahenk.lider.persistence.factories;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.codehaus.jackson.map.ObjectMapper;

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
import tr.org.liderahenk.lider.core.api.persistence.factories.IEntityFactory;
import tr.org.liderahenk.lider.core.api.plugin.IPluginInfo;
import tr.org.liderahenk.lider.core.api.plugin.deployer.IManagedPlugin;
import tr.org.liderahenk.lider.core.api.plugin.deployer.IPluginPart;
import tr.org.liderahenk.lider.core.api.rest.requests.ICommandRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.IPolicyExecutionRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.IPolicyRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.IProfileRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.IReportTemplateColumRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.IReportTemplateParameterRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.IReportTemplateRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.IReportViewColumnRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.IReportViewParameterRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.IReportViewRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.ISearchGroupEntryRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.ISearchGroupRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.ITaskRequest;
import tr.org.liderahenk.lider.persistence.entities.AgentImpl;
import tr.org.liderahenk.lider.persistence.entities.AgentPropertyImpl;
import tr.org.liderahenk.lider.persistence.entities.AgreementStatusImpl;
import tr.org.liderahenk.lider.persistence.entities.CommandExecutionImpl;
import tr.org.liderahenk.lider.persistence.entities.CommandExecutionResultImpl;
import tr.org.liderahenk.lider.persistence.entities.CommandImpl;
import tr.org.liderahenk.lider.persistence.entities.MailAddressImpl;
import tr.org.liderahenk.lider.persistence.entities.MailContentImpl;
import tr.org.liderahenk.lider.persistence.entities.ManagedPlugin;
import tr.org.liderahenk.lider.persistence.entities.OperationLogImpl;
import tr.org.liderahenk.lider.persistence.entities.PluginImpl;
import tr.org.liderahenk.lider.persistence.entities.PluginPart;
import tr.org.liderahenk.lider.persistence.entities.PolicyImpl;
import tr.org.liderahenk.lider.persistence.entities.ProfileImpl;
import tr.org.liderahenk.lider.persistence.entities.ReportTemplateColumnImpl;
import tr.org.liderahenk.lider.persistence.entities.ReportTemplateImpl;
import tr.org.liderahenk.lider.persistence.entities.ReportTemplateParameterImpl;
import tr.org.liderahenk.lider.persistence.entities.ReportViewColumnImpl;
import tr.org.liderahenk.lider.persistence.entities.ReportViewImpl;
import tr.org.liderahenk.lider.persistence.entities.ReportViewParameterImpl;
import tr.org.liderahenk.lider.persistence.entities.SearchGroupEntryImpl;
import tr.org.liderahenk.lider.persistence.entities.SearchGroupImpl;
import tr.org.liderahenk.lider.persistence.entities.TaskImpl;
import tr.org.liderahenk.lider.persistence.entities.UserSessionImpl;

/**
 * Default implementation for {@link IEntityFactory}.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 *
 */
public class EntityFactoryImpl implements IEntityFactory {

	@Override
	public ICommandExecutionResult createCommandExecutionResult(IPolicyStatusMessage message,
			ICommandExecution commandExecution, Long agentId, String mailSubject, String mailContent) throws Exception {
		byte[] data = new ObjectMapper().writeValueAsBytes(message.getResponseData());
		return new CommandExecutionResultImpl(null, (CommandExecutionImpl) commandExecution, agentId,
				message.getResponseCode(), message.getResponseMessage(), data, message.getContentType(), new Date(),
				mailSubject, mailContent);
	}

	@Override
	public ICommandExecutionResult createCommandExecutionResult(ITaskStatusMessage message,
			ICommandExecution commandExecution, Long agentId, String mailSubject, String mailContent) throws Exception {
		byte[] data = new ObjectMapper().writeValueAsBytes(message.getResponseData());
		return new CommandExecutionResultImpl(null, (CommandExecutionImpl) commandExecution, agentId,
				message.getResponseCode(), message.getResponseMessage(), data, message.getContentType(), new Date(),
				mailSubject, mailContent);
	}

	@Override
	public ICommandExecutionResult createCommandExecutionResult(ITaskStatusMessage message, byte[] data,
			ICommandExecution commandExecution, Long agentId, String mailSubject, String mailContent) {
		return new CommandExecutionResultImpl(null, (CommandExecutionImpl) commandExecution, agentId,
				message.getResponseCode(), message.getResponseMessage(), data, message.getContentType(), new Date(),
				mailSubject, mailContent);
	}

	/**
	 * Remove data byte array!
	 */
	@Override
	public ICommandExecutionResult createCommandExecutionResult(ITaskStatusMessage message, Long resultId,
			ICommandExecution commandExecution, Long agentId, String mailSubject, String mailContent) {
		CommandExecutionImpl c = new CommandExecutionImpl();
		c.setId(commandExecution.getId());
		c.setDn(commandExecution.getDn());
		c.setCreateDate(commandExecution.getCreateDate());
		c.setDnType(commandExecution.getDnType());
		c.setCommand((CommandImpl) commandExecution.getCommand());
		return new CommandExecutionResultImpl(resultId, c, agentId, message.getResponseCode(),
				message.getResponseMessage(), null, message.getContentType(), new Date(), mailSubject, mailContent);
	}

	@Override
	public IOperationLog createLog(String userId, CrudType crudType, Long taskId, Long policyId, Long profileId,
			String message, byte[] requestData, String requestIp) {
		return new OperationLogImpl(null, userId, crudType, taskId, policyId, profileId, message, requestData,
				requestIp, new Date());
	}

	@Override
	public ITask createTask(IPlugin plugin, ITaskRequest request) throws Exception {
		return new TaskImpl(null, (PluginImpl) plugin, request.getCommandId(), request.getParameterMap(), false,
				request.getCronExpression(), new Date(), null);
	}

	@Override
	public ICommandExecution createCommandExecution(LdapEntry entry, ICommand command, String uid, boolean isOnline) {
		return new CommandExecutionImpl(null, (CommandImpl) command, uid, entry.getType(), entry.getDistinguishedName(),
				new Date(), null, isOnline);
	}

	@Override
	public ICommand createCommand(ITask task, ICommandRequest request, String commandOwnerJid, List<String> uidList)
			throws Exception {
		Boolean mailSend = (Boolean) (((ITaskRequest) request).getParameterMap() != null ? ((ITaskRequest) request).getParameterMap().get("mailSend") : null);
		return new CommandImpl(null, null, (TaskImpl) task, request.getDnList(), request.getDnType(), uidList,
				commandOwnerJid, ((ITaskRequest) request).getActivationDate(), null, new Date(), null, mailSend != null && mailSend ? false : true);
	}

	@Override
	public ICommand createCommand(IPolicy policy, ICommandRequest request, String commandOwnerJid) throws Exception {
		return new CommandImpl(null, (PolicyImpl) policy, null, request.getDnList(), request.getDnType(), null,
				commandOwnerJid, ((IPolicyExecutionRequest) request).getActivationDate(),
				((IPolicyExecutionRequest) request).getExpirationDate(), new Date(), null, false);
	}

	@Override
	public IProfile createProfile(IPlugin plugin, IProfileRequest request) throws Exception {
		return new ProfileImpl(null, (PluginImpl) plugin, request.getLabel(), request.getDescription(),
				request.isOverridable(), request.isActive(), false, request.getProfileData(), new Date(), null);
	}

	@Override
	public IProfile createProfile(IProfile profile, IProfileRequest request) throws Exception {
		return new ProfileImpl(profile.getId(), (PluginImpl) profile.getPlugin(), request.getLabel(),
				request.getDescription(), request.isOverridable(), request.isActive(), profile.isDeleted(),
				request.getProfileData(), profile.getCreateDate(), new Date());
	}

	@Override
	public IPolicy createPolicy(IPolicyRequest request) throws Exception {
		return new PolicyImpl(null, request.getLabel(), request.getDescription(), request.isActive(), false, null,
				new Date(), null, null);
	}

	@Override
	public IPolicy createPolicy(IPolicy policy, IPolicyRequest request) throws Exception {
		return new PolicyImpl(policy.getId(), request.getLabel(), request.getDescription(), request.isActive(),
				policy.isDeleted(), null, policy.getCreateDate(), new Date(), policy.getPolicyVersion());
	}

	@Override
	public IPlugin createPlugin(IPluginInfo info) throws Exception {
		return new PluginImpl(null, info.getPluginName(), info.getPluginVersion(), info.getDescription(), true, false,
				info.getMachineOriented(), info.getUserOriented(), info.getPolicyPlugin(), info.getTaskPlugin(),
				info.getUsesFileTransfer(), info.getXbased(), null, new Date(), null);
	}

	@Override
	public IPlugin createPlugin(IPlugin plugin, IPluginInfo info) throws Exception {
		return new PluginImpl(plugin.getId(), plugin.getName(), plugin.getVersion(), info.getDescription(), true, false,
				info.getMachineOriented(), info.getUserOriented(), info.getPolicyPlugin(), info.getTaskPlugin(),
				info.getUsesFileTransfer(), info.getXbased(), null, plugin.getCreateDate(), new Date());
	}

	@Override
	public IUserSession createUserSession(String username, String userIp, SessionEvent sessionEvent ) {
		return new UserSessionImpl(null, null, username, userIp, sessionEvent, new Date());
	}

	@Override
	public IReportTemplate createReportTemplate(IReportTemplate existingTemplate, IReportTemplate template) {
		ReportTemplateImpl templateImpl = new ReportTemplateImpl(existingTemplate.getId(), existingTemplate.getName(),
				template.getDescription(), template.getQuery(), template.getCode(), null, null,
				existingTemplate.getCreateDate(), new Date());
		Set<? extends IReportTemplateParameter> params = template.getTemplateParams();
		if (params != null) {
			for (IReportTemplateParameter param : params) {
				templateImpl.addTemplateParameter(param);
			}
		}
		Set<? extends IReportTemplateColumn> columns = template.getTemplateColumns();
		if (columns != null) {
			for (IReportTemplateColumn column : columns) {
				templateImpl.addTemplateColumn(column);
			}
		}
		return templateImpl;
	}

	@Override
	public IReportTemplate createReportTemplate(IReportTemplate template) {
		return new ReportTemplateImpl(template);
	}

	@Override
	public IReportTemplate createReportTemplate(IReportTemplateRequest request) {
		ReportTemplateImpl template = new ReportTemplateImpl(request.getId(), request.getName(),
				request.getDescription(), request.getQuery(), request.getCode(), null, null, new Date(), null);

		List<? extends IReportTemplateParameterRequest> params = request.getTemplateParams();
		if (params != null) {
			for (IReportTemplateParameterRequest p : params) {
				template.addTemplateParameter(new ReportTemplateParameterImpl(null, template, p.getKey(), p.getLabel(),
						p.getType(), p.getDefaultValue(), p.isMandatory(), new Date()));
			}
		}
		List<? extends IReportTemplateColumRequest> columns = request.getTemplateColumns();
		if (columns != null) {
			for (IReportTemplateColumRequest c : columns) {
				template.addTemplateColumn(
						new ReportTemplateColumnImpl(null, template, c.getName(), c.getColumnOrder(), new Date()));
			}
		}

		return template;
	}

	@Override
	public IReportTemplate createReportTemplate(IReportTemplate existingTemplate, IReportTemplateRequest request) {
		ReportTemplateImpl template = new ReportTemplateImpl(existingTemplate.getId(), request.getName(),
				request.getDescription(), request.getQuery(), request.getCode(), null, null,
				existingTemplate.getCreateDate(), new Date());

		List<? extends IReportTemplateParameterRequest> params = request.getTemplateParams();
		if (params != null) {
			for (IReportTemplateParameterRequest p : params) {
				template.addTemplateParameter(new ReportTemplateParameterImpl(null, template, p.getKey(), p.getLabel(),
						p.getType(), p.getDefaultValue(), p.isMandatory(), new Date()));
			}
		}
		List<? extends IReportTemplateColumRequest> columns = request.getTemplateColumns();
		if (columns != null) {
			for (IReportTemplateColumRequest c : columns) {
				template.addTemplateColumn(
						new ReportTemplateColumnImpl(null, template, c.getName(), c.getColumnOrder(), new Date()));
			}
		}

		return template;
	}

	@Override
	public IAgent createAgent(IAgent agent) {
		return new AgentImpl(agent);
	}

	@Override
	public ICommand createCommand(ICommand command, boolean sentMail) throws Exception {
		CommandImpl c = new CommandImpl(command);
		c.setSentMail(sentMail);
		return c;
	}

	@Override
	public IAgent createAgent(String jid, String dn, String password, String hostname, String ipAddresses,
			String macAddresses, Map<String, Object> data) {
		AgentImpl agentImpl = new AgentImpl(null, jid, false, dn, password, hostname, ipAddresses, macAddresses,
				new Date(), null, null, null);
		if (data != null) {
			for (Entry<String, Object> entry : data.entrySet()) {
				if (entry.getKey() != null && entry.getValue() != null) {
					agentImpl.addProperty(new AgentPropertyImpl(null, agentImpl, entry.getKey(),
							entry.getValue().toString(), new Date()));
				}
			}
		}
		return agentImpl;
	}

	@SuppressWarnings("unchecked")
	@Override
	public IAgent createAgent(IAgent existingAgent, String dn, String password, String hostname, String ipAddresses,
			String macAddresses, Map<String, Object> data) {
		
		AgentImpl agentImpl = new AgentImpl(existingAgent.getId(), existingAgent.getJid(), false, dn == null ? existingAgent.getDn() : dn,
				password, hostname, ipAddresses, macAddresses, existingAgent.getCreateDate(), new Date(),
				(Set<AgentPropertyImpl>) existingAgent.getProperties(),
				(Set<UserSessionImpl>) existingAgent.getSessions());
		if (data != null) {
			for (Entry<String, Object> entry : data.entrySet()) {
				if (entry.getKey() != null && entry.getValue() != null) {
					agentImpl.addProperty(new AgentPropertyImpl(null, agentImpl, entry.getKey(),
							entry.getValue().toString(), new Date()));
				}
			}
		}
		return agentImpl;
	}
	@SuppressWarnings("unchecked")
	@Override
	public IAgent createAgent(IAgent existingAgent, String dn, String jid, String password, String hostname, String ipAddresses,
			String macAddresses, Map<String, Object> data) {
		
		AgentImpl agentImpl = new AgentImpl(existingAgent.getId(), jid ==null ? existingAgent.getJid() : jid, false, dn == null ? existingAgent.getDn() : dn,
				password, hostname, ipAddresses, macAddresses, existingAgent.getCreateDate(), new Date(),
				(Set<AgentPropertyImpl>) existingAgent.getProperties(),
				(Set<UserSessionImpl>) existingAgent.getSessions());
		if (data != null) {
			for (Entry<String, Object> entry : data.entrySet()) {
				if (entry.getKey() != null && entry.getValue() != null) {
					agentImpl.addProperty(new AgentPropertyImpl(null, agentImpl, entry.getKey(),
							entry.getValue().toString(), new Date()));
				}
			}
		}
		return agentImpl;
	}

	@Override
	public IReportView createReportView(IReportViewRequest request, IReportTemplate template) {
		return new ReportViewImpl(request.getId(), (ReportTemplateImpl) template, request.getName(),
				request.getDescription(), request.getType(), null, null, request.getAlarmCheckPeriod(),
				request.getAlarmRecordNumThreshold(), request.getAlarmMail(), new Date(), null);
	}

	@Override
	public IReportView createReportView(IReportView existingView, IReportViewRequest request,
			IReportTemplate template) {
		return new ReportViewImpl(existingView.getId(), (ReportTemplateImpl) template, request.getName(),
				request.getDescription(), request.getType(), null, null, request.getAlarmCheckPeriod(),
				request.getAlarmRecordNumThreshold(), request.getAlarmMail(), existingView.getCreateDate(), new Date());
	}

	@Override
	public IReportViewColumn createReportViewColumn(IReportViewColumnRequest c, IReportTemplateColumn tCol) {
		return new ReportViewColumnImpl(c.getId(), null, (ReportTemplateColumnImpl) tCol, c.getType(), c.getLegend(),
				c.getWidth(), new Date());
	}

	@Override
	public IReportViewParameter createReportViewParameter(IReportViewParameterRequest p,
			IReportTemplateParameter tParam) {
		return new ReportViewParameterImpl(p.getId(), null, (ReportTemplateParameterImpl) tParam, p.getLabel(),
				p.getValue(), new Date());
	}

	public IPluginPart createPluginPart(Long id, String fileName, String type, String fullPath) {
		return new PluginPart(id, fileName, type, fullPath);
	}

	public IManagedPlugin createManagedPlugin(Long id, String name, String version, Date installationDate,
			Boolean active, List<IPluginPart> parts) {
		return new ManagedPlugin(id, name, version, installationDate, active, parts);
	}

	@Override
	public ISearchGroup createSearchGroup(ISearchGroupRequest request) {
		SearchGroupImpl searchGroupImpl = new SearchGroupImpl(null, request.getName(), request.isSearchAgents(),
				request.isSearchUsers(), request.isSearchGroups(), request.getCriteria(), false, new Date(), null);
		if (request.getEntries() != null) {
			for (ISearchGroupEntryRequest entry : request.getEntries()) {
				searchGroupImpl
						.addEntry(new SearchGroupEntryImpl(null, null, entry.getDn(), entry.getDnType(), new Date()));
			}
		}
		return searchGroupImpl;
	}

	@Override
	public IAgreementStatus createAgreementStatus(IAgent agent, String username, String md5, boolean accepted) {
		return new AgreementStatusImpl(null, (AgentImpl) agent, username, md5, accepted, new Date());
	}

	@Override
	public ITask createTask(ITask task, String cronExpression) {
		TaskImpl taskImpl = new TaskImpl(task);
		taskImpl.setCronExpression(cronExpression);
		taskImpl.setModifyDate(new Date());
		return taskImpl;
	}

	@Override
	public IMailContent createMailContent(IPlugin plugin, IMailContent content) {

		return new MailContentImpl(null, content.getMailContent(),
				content.getMailSendStartegy(),content.getMailSchedulerCronString(),
				
				content.getMailSchdTimePeriod(), content.getMailSchdTimePeriodType(),
				(PluginImpl) plugin, new Date(), null);
	}

	@Override
	public IMailAddress createMailAddress(IPlugin plugin, IMailAddress mailAddress) {
		return new MailAddressImpl(mailAddress.getId(), mailAddress.getMailAddress(), (PluginImpl) plugin, new Date(),
				mailAddress.getModifyDate(), mailAddress.isDeleted());
	}

}
