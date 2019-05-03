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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import tr.org.liderahenk.lider.core.api.configuration.IConfigurationService;
import tr.org.liderahenk.lider.core.api.ldap.ILDAPService;
import tr.org.liderahenk.lider.core.api.ldap.LdapSearchFilterAttribute;
import tr.org.liderahenk.lider.core.api.ldap.enums.SearchFilterEnum;
import tr.org.liderahenk.lider.core.api.ldap.exceptions.LdapException;
import tr.org.liderahenk.lider.core.api.ldap.model.LdapEntry;
import tr.org.liderahenk.lider.core.api.messaging.enums.AgentMessageType;
import tr.org.liderahenk.lider.core.api.messaging.messages.ILiderMessage;
import tr.org.liderahenk.lider.core.api.messaging.messages.IUserSessionMessage;
import tr.org.liderahenk.lider.core.api.messaging.subscribers.IUserSessionSubscriber;
import tr.org.liderahenk.lider.core.api.persistence.dao.IAgentDao;
import tr.org.liderahenk.lider.core.api.persistence.entities.IAgent;
import tr.org.liderahenk.lider.core.api.persistence.entities.IUserSession;
import tr.org.liderahenk.lider.core.api.persistence.enums.SessionEvent;
import tr.org.liderahenk.lider.core.api.persistence.factories.IEntityFactory;
import tr.org.liderahenk.lider.messaging.messages.UserSessionResponseMessageImpl;

/**
 * <p>
 * Provides default user login/logout event handler in case no other bundle
 * provides its user session subscriber.
 * </p>
 * 
 * @see tr.org.liderahenk.lider.core.api.messaging.IUserSessionMessage
 *
 */
public class UserSessionSubscriberImpl implements IUserSessionSubscriber {

	private static Logger logger = LoggerFactory.getLogger(UserSessionSubscriberImpl.class);

	private IAgentDao agentDao;
	private IEntityFactory entityFactory;
	private IConfigurationService configurationService;
	private ILDAPService ldapService;
	
	
	@Override
	public ILiderMessage messageReceived(IUserSessionMessage message) throws Exception {

		String uid = message.getFrom().split("@")[0];

		// Find related agent record
		List<? extends IAgent> agentList = agentDao.findByProperty(IAgent.class, "jid", uid, 1);
		IAgent agent = agentList != null && !agentList.isEmpty() ? agentList.get(0) : null;

		if (agent != null) {
			// Add new user session info
			IUserSession userSession = entityFactory.createUserSession(message.getUsername(), message.getUserIp(),getSessionEvent(message.getType()));
			agent.addUserSession(userSession);
			if (message.getType() == AgentMessageType.LOGIN
					&& (message.getIpAddresses() == null || message.getIpAddresses().isEmpty())) {
				logger.warn("Couldn't find IP addresses of the agent with JID: {}", uid);
			}
			// Merge records
			agentDao.update(agent, message.getIpAddresses());
			
			
			// find user authority
			
			List<LdapEntry> role= getUserRoleGroupList(configurationService.getUserLdapRolesDn(), userSession.getUsername(), message.getHostname());
			
			if (role != null  && role.size() > 0) {
				
				Map<String, Object> params= new HashMap<>();
				
				return new UserSessionResponseMessageImpl(message.getFrom(),params,userSession.getUsername(),new Date());
			}
			else {
				
				logger.info("Logined user not authorized. User = " + userSession.getUsername());
				return null;
			}
			
		} else {
			logger.warn("Couldn't find the agent with JID: {}", uid);
			return null;
		}
	}

	
	private List<LdapEntry> getUserRoleGroupList(String userLdapRolesDn, String userName, String hostName) throws LdapException {
		List<LdapEntry> userAuthDomainGroupList;
		List<LdapSearchFilterAttribute> filterAttt = new ArrayList();
		
		filterAttt.add(new LdapSearchFilterAttribute("sudoUser", userName, SearchFilterEnum.EQ));
		filterAttt.add(new LdapSearchFilterAttribute("sudoHost", "ALL", SearchFilterEnum.EQ));
		logger.info("Serching for username " + userName + " in OU " + userLdapRolesDn);
		userAuthDomainGroupList = ldapService.search(userLdapRolesDn, filterAttt, new String[] { "cn", "dn", "sudoCommand", "sudoHost", "sudoUser" });
		
		if(userAuthDomainGroupList.size()==0) {
			filterAttt = new ArrayList();
			filterAttt.add(new LdapSearchFilterAttribute("sudoUser", userName, SearchFilterEnum.EQ));
			filterAttt.add(new LdapSearchFilterAttribute("sudoHost", hostName, SearchFilterEnum.EQ));
			
			userAuthDomainGroupList = ldapService.search(userLdapRolesDn, filterAttt, new String[] { "cn", "dn", "sudoCommand", "sudoHost", "sudoUser" });
		}
		
		
		return userAuthDomainGroupList;
	}
	/**
	 * 
	 * @param type
	 * @return
	 */
	private SessionEvent getSessionEvent(AgentMessageType type) {
		switch (type) {
		case LOGIN:
			return SessionEvent.LOGIN;
		case LOGOUT:
			return SessionEvent.LOGOUT;
		default:
			return null;
		}
	}

	/**
	 * 
	 * @param agentDao
	 */
	public void setAgentDao(IAgentDao agentDao) {
		this.agentDao = agentDao;
	}

	/**
	 * 
	 * @param entityFactory
	 */
	public void setEntityFactory(IEntityFactory entityFactory) {
		this.entityFactory = entityFactory;
	}

	public ILDAPService getLdapService() {
		return ldapService;
	}

	public void setLdapService(ILDAPService ldapService) {
		this.ldapService = ldapService;
	}


	public void setConfigurationService(IConfigurationService configurationService) {
		this.configurationService = configurationService;
	}

}
