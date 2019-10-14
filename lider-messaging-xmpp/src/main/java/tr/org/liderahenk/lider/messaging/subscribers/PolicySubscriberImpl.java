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
package tr.org.liderahenk.lider.messaging.subscribers;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import tr.org.liderahenk.lider.core.api.configuration.IConfigurationService;
import tr.org.liderahenk.lider.core.api.ldap.ILDAPService;
import tr.org.liderahenk.lider.core.api.ldap.LdapSearchFilterAttribute;
import tr.org.liderahenk.lider.core.api.ldap.enums.SearchFilterEnum;
import tr.org.liderahenk.lider.core.api.ldap.exceptions.LdapException;
import tr.org.liderahenk.lider.core.api.ldap.model.LdapEntry;
import tr.org.liderahenk.lider.core.api.messaging.IMessageFactory;
import tr.org.liderahenk.lider.core.api.messaging.messages.IExecutePoliciesMessage;
import tr.org.liderahenk.lider.core.api.messaging.messages.IGetPoliciesMessage;
import tr.org.liderahenk.lider.core.api.messaging.subscribers.IPolicySubscriber;
import tr.org.liderahenk.lider.core.api.persistence.dao.IPolicyDao;
import tr.org.liderahenk.lider.core.api.persistence.entities.IPolicy;
import tr.org.liderahenk.lider.core.api.persistence.entities.IProfile;

/**
 * Provides related agent and user policies according to specified username and
 * agent JID in received message.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 * @author <a href="mailto:caner.feyzullahoglu@agem.com.tr">Caner
 *         Feyzullahoğlu</a>
 * @see tr.org.liderahenk.lider.core.api.messaging.subscribers.IPolicySubscriber
 *
 */
public class PolicySubscriberImpl implements IPolicySubscriber {

	private static Logger logger = LoggerFactory.getLogger(PolicySubscriberImpl.class);

	private ILDAPService ldapService;
	private IConfigurationService configurationService;
	private IPolicyDao policyDao;
	private IMessageFactory messageFactory;

	@Override
	public IExecutePoliciesMessage messageReceived(IGetPoliciesMessage message) throws Exception {

		String agentUid = message.getFrom().split("@")[0];
		String userUid = message.getUsername();
		String userPolicyVersion = message.getUserPolicyVersion();
		String agentPolicyVersion = message.getAgentPolicyVersion();

		// Find LDAP user entry
		String userDn = findUserDn(userUid);
		// Find LDAP group entries to which user belongs
		List<LdapEntry> groupsOfUser = findGroups(userDn);

		// Find user policy.
		// (User policy can be related to either user entry or group entries
		// which ever is the latest)
		List<Object[]> resultList = policyDao.getLatestUserPolicy(userUid, groupsOfUser);
		IPolicy userPolicy = null;
		Long userCommandExecutionId = null;
		Date userExpirationDate = null;
		if (resultList != null && !resultList.isEmpty() && resultList.get(0) != null && resultList.get(0).length == 4) {
			userPolicy = (IPolicy) resultList.get(0)[0];
			userCommandExecutionId = (Long) resultList.get(0)[1];
			userExpirationDate = (Date) resultList.get(0)[2];
		}
		// If policy version is different than the policy version provided by
		// user who is logged in, send its profiles to agent.
		boolean sendUserPolicy = userPolicy != null && userPolicy.getPolicyVersion() != null
				&& !userPolicy.getPolicyVersion().equalsIgnoreCase(userPolicyVersion);

		// Find agent policy.
		resultList = policyDao.getLatestAgentPolicy(agentUid);
		IPolicy agentPolicy = null;
		Long agentCommandExecutionId = null;
		Date agentExpirationDate = null;
		if (resultList != null && !resultList.isEmpty() && resultList.get(0) != null && resultList.get(0).length == 4) {
			agentPolicy = (IPolicy) resultList.get(0)[0];
			agentCommandExecutionId = (Long) resultList.get(0)[1];
			agentExpirationDate = (Date) resultList.get(0)[2];
		}
		// If policy version is different than the policy version provided by
		// agent, send its profiles to agent.
		boolean sendAgentPolicy = agentPolicy != null && agentPolicy.getPolicyVersion() != null
				&& !agentPolicy.getPolicyVersion().equalsIgnoreCase(agentPolicyVersion);

		// Check if one of the plugins use file transfer
		boolean usesFileTransfer = false;
		if (sendUserPolicy) {
			for (IProfile profile : userPolicy.getProfiles()) {
				if (profile.getPlugin() != null && profile.getPlugin().isUsesFileTransfer()) {
					usesFileTransfer = true;
					break;
				}
			}
		}
		if (!usesFileTransfer && sendAgentPolicy) {
			for (IProfile profile : agentPolicy.getProfiles()) {
				if (profile.getPlugin() != null && profile.getPlugin().isUsesFileTransfer()) {
					usesFileTransfer = true;
					break;
				}
			}
		}

		// Create message
		IExecutePoliciesMessage response = messageFactory.createExecutePoliciesMessage(null, userUid,
				sendUserPolicy ? new ArrayList<IProfile>(userPolicy.getProfiles()) : null,
				userPolicy != null ? userPolicy.getPolicyVersion() : null, userCommandExecutionId,
				sendUserPolicy ? userExpirationDate : null,
				sendAgentPolicy ? new ArrayList<IProfile>(agentPolicy.getProfiles()) : null,
				agentPolicy != null ? agentPolicy.getPolicyVersion() : null, agentCommandExecutionId,
				sendAgentPolicy ? agentExpirationDate : null,
				usesFileTransfer ? configurationService.getFileServerConf(agentUid) : null);
		logger.debug("Execute policies message: {}", response);
		return response;
	}

	/**
	 * Find user DN by given UID
	 * 
	 * @param userUid
	 * @return
	 * @throws LdapException
	 */
	private String findUserDn(String userUid) throws LdapException {
		return ldapService.getDN(configurationService.getLdapRootDn(), configurationService.getUserLdapUidAttribute(),
				userUid);
	}

	/**
	 * Find groups of a given user
	 * 
	 * @param userDn
	 * @return
	 * @throws LdapException
	 */
	private List<LdapEntry> findGroups(String userDn) throws LdapException {
		List<LdapSearchFilterAttribute> filterAttributesList = new ArrayList<LdapSearchFilterAttribute>();
		String[] groupLdapObjectClasses = configurationService.getGroupLdapObjectClasses().split(",");
		for (String groupObjCls : groupLdapObjectClasses) {
			filterAttributesList.add(new LdapSearchFilterAttribute("objectClass", groupObjCls, SearchFilterEnum.EQ));
		}
		filterAttributesList.add(new LdapSearchFilterAttribute("member", userDn, SearchFilterEnum.EQ));
		return ldapService.search(configurationService.getLdapRootDn(), filterAttributesList, null);
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
	 * @param configurationService
	 */
	public void setConfigurationService(IConfigurationService configurationService) {
		this.configurationService = configurationService;
	}

	/**
	 * 
	 * @param policyDao
	 */
	public void setPolicyDao(IPolicyDao policyDao) {
		this.policyDao = policyDao;
	}

	/**
	 * 
	 * @param messageFactory
	 */
	public void setMessageFactory(IMessageFactory messageFactory) {
		this.messageFactory = messageFactory;
	}

}
