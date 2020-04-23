package tr.org.lider.messaging.subscribers;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import tr.org.lider.entities.AgentImpl;
import tr.org.lider.entities.SessionEvent;
import tr.org.lider.entities.UserSessionImpl;
import tr.org.lider.ldap.ILDAPService;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.ldap.LdapSearchFilterAttribute;
import tr.org.lider.ldap.SearchFilterEnum;
import tr.org.lider.messaging.enums.AgentMessageType;
import tr.org.lider.messaging.messages.ILiderMessage;
import tr.org.lider.messaging.messages.IUserSessionMessage;
import tr.org.lider.messaging.messages.UserSessionResponseMessageImpl;
import tr.org.lider.repositories.AgentRepository;
import tr.org.lider.services.ConfigurationService;

//import tr.org.liderahenk.lider.core.api.configuration.IConfigurationService;
//import tr.org.liderahenk.lider.core.api.ldap.ILDAPService;
//import tr.org.liderahenk.lider.core.api.ldap.LdapSearchFilterAttribute;
//import tr.org.liderahenk.lider.core.api.ldap.enums.SearchFilterEnum;
//import tr.org.liderahenk.lider.core.api.ldap.exceptions.LdapException;
//import tr.org.liderahenk.lider.core.api.ldap.model.LdapEntry;
//import tr.org.liderahenk.lider.core.api.messaging.enums.AgentMessageType;
//import tr.org.liderahenk.lider.core.api.messaging.messages.ILiderMessage;
//import tr.org.liderahenk.lider.core.api.messaging.messages.IUserSessionMessage;
//import tr.org.liderahenk.lider.core.api.messaging.subscribers.IUserSessionSubscriber;
//import tr.org.liderahenk.lider.core.api.persistence.dao.IAgentDao;
//import tr.org.liderahenk.lider.core.api.persistence.entities.IAgent;
//import tr.org.liderahenk.lider.core.api.persistence.entities.IUserSession;
//import tr.org.liderahenk.lider.core.api.persistence.enums.SessionEvent;
//import tr.org.liderahenk.lider.core.api.persistence.factories.IEntityFactory;
//import tr.org.liderahenk.lider.messaging.messages.UserSessionResponseMessageImpl;

/**
 * <p>
 * Provides default user login/logout event handler in case no other bundle
 * provides its user session subscriber.
 * </p>
 * @see tr.org.liderahenk.lider.core.api.messaging.IUserSessionMessage
 */

@Component
public class UserSessionSubscriberImpl implements IUserSessionSubscriber {

	private static Logger logger = LoggerFactory.getLogger(UserSessionSubscriberImpl.class);

	@Autowired
	private AgentRepository agentRepository;
	
	@Autowired
	private ConfigurationService configurationService;
	
	@Autowired
	private ILDAPService ldapService;
	
	
	@Override
	public ILiderMessage messageReceived(IUserSessionMessage message) throws Exception {

		String uid = message.getFrom().split("@")[0];

		// Find related agent
		List<AgentImpl> agents = agentRepository.findByJid(uid);
		
		if (agents != null && agents.size() > 0) {
			
			AgentImpl agent = agents.get(0);
			// Add new user session info
			UserSessionImpl userSession = new UserSessionImpl(null, null, message.getUsername(), message.getUserIp(), 
					getSessionEvent(message.getType()), new Date());
			
			agent.addUserSession(userSession);
			if (message.getType() == AgentMessageType.LOGIN	&& (message.getIpAddresses() == null || message.getIpAddresses().isEmpty())) {
				logger.warn("Couldn't find IP addresses of the agent with JID: {}", uid);
			}
			// Merge records
			agentRepository.save(agent);
			// find user authority for sudo role 
			// if user has sudo role user get sudoRole on agent
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


	public ILDAPService getLdapService() {
		return ldapService;
	}

	public void setLdapService(ILDAPService ldapService) {
		this.ldapService = ldapService;
	}

}
