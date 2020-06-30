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
import tr.org.lider.entities.AgentPropertyImpl;
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

/**
 * <p>
 * Provides default user login/logout event handler in case no other bundle
 * provides its user session subscriber.
 * </p>
 * 
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
		logger.info("User {} to agent... User Name: {} , Agent : {}", message.getType(), message.getUsername(), uid);
		// Find related agent
		List<AgentImpl> agents = agentRepository.findByJid(uid);

		if (agents != null && agents.size() > 0) {

			AgentImpl agent = agents.get(0);
			// Add new user session info
			UserSessionImpl userSession = new UserSessionImpl(null, null, message.getUsername(), message.getUserIp(),
					getSessionEvent(message.getType()), new Date());

			agent.addUserSession(userSession);
			if (message.getType() == AgentMessageType.LOGIN
					&& (message.getIpAddresses() == null || message.getIpAddresses().isEmpty())) {
				logger.warn("Couldn't find IP addresses of the agent with JID: {}", uid);
			}

			if (message.getType() == AgentMessageType.LOGIN) {
				for (AgentPropertyImpl prop : agent.getProperties()) {
					if (prop.getPropertyName().equals("hardware.disk.total")
							&& Integer.parseInt(prop.getPropertyValue()) != message.getDiskTotal()) {
						logger.info("Total disk size of Agent with ID {} has been changed. Updating in DB", agent.getId());
						prop.setPropertyValue(String.valueOf(message.getDiskTotal()));
					} else if (prop.getPropertyName().equals("hardware.disk.used")
							&& Integer.parseInt(prop.getPropertyValue()) != message.getDiskUsed()) {
						logger.info("Used disk size of Agent with ID {} has been changed. Updating in DB", agent.getId());
						prop.setPropertyValue(String.valueOf(message.getDiskUsed()));
					} else if (prop.getPropertyName().equals("hardware.disk.free")
							&& Integer.parseInt(prop.getPropertyValue()) != message.getDiskFree()) {
						logger.info("Free disk size of Agent with ID {} has been changed. Updating in DB", agent.getId());
						prop.setPropertyValue(String.valueOf(message.getDiskFree()));
					} else if (prop.getPropertyName().equals("hardware.memory.total")
							&& Integer.parseInt(prop.getPropertyValue()) != message.getMemory()) {
						logger.info("Memory size of Agent with ID {} has been changed. Updating in DB", agent.getId());
						prop.setPropertyValue(String.valueOf(message.getMemory()));
					} else if (prop.getPropertyName().equals("os.version") 
							&& !prop.getPropertyValue().equals(message.getOsVersion())) {
						logger.info("OS Version of Agent with ID {} has been changed. Updating in DB", agent.getId());
						prop.setPropertyValue(message.getOsVersion());
					} else if (prop.getPropertyName().equals("hardware.network.ipAddresses")
							&& prop.getPropertyValue() != message.getIpAddresses()
							&& !agent.getIpAddresses().equals(message.getIpAddresses())) {
						logger.info("IP Addresses of Agent with ID {} has been changed. Updating in DB", agent.getId());
						prop.setPropertyValue(message.getIpAddresses());
						agent.setIpAddresses(message.getIpAddresses());
					} else if (!agent.getHostname().equals(message.getHostname())) {
						logger.info("Hostname of Agent with ID {} has been changed. Updating in DB", agent.getId());
						agent.setHostname(message.getHostname());
					}
				}
			}
			// Merge records
			agentRepository.save(agent);
			// find user authority for sudo role
			// if user has sudo role user get sudoRole on agent
			List<LdapEntry> role = getUserRoleGroupList(configurationService.getUserLdapRolesDn(),
					userSession.getUsername(), message.getHostname());

			if (role != null && role.size() > 0) {
				Map<String, Object> params = new HashMap<>();
				return new UserSessionResponseMessageImpl(message.getFrom(), params, userSession.getUsername(),
						new Date());
			} else {
				logger.info("Logined user not authorized. User = " + userSession.getUsername());
				return null;
			}
		} else {
			logger.warn("Couldn't find the agent with JID: {}", uid);
			return null;
		}
	}

	private List<LdapEntry> getUserRoleGroupList(String userLdapRolesDn, String userName, String hostName)
			throws LdapException {
		List<LdapEntry> userAuthDomainGroupList;
		List<LdapSearchFilterAttribute> filterAttt = new ArrayList<>();

		filterAttt.add(new LdapSearchFilterAttribute("sudoUser", userName, SearchFilterEnum.EQ));
		filterAttt.add(new LdapSearchFilterAttribute("sudoHost", "ALL", SearchFilterEnum.EQ));
		logger.info("Serching for username " + userName + " in OU " + userLdapRolesDn);
		userAuthDomainGroupList = ldapService.search(userLdapRolesDn, filterAttt,
				new String[] { "cn", "dn", "sudoCommand", "sudoHost", "sudoUser" });

		if (userAuthDomainGroupList.size() == 0) {
			filterAttt = new ArrayList<>();
			filterAttt.add(new LdapSearchFilterAttribute("sudoUser", userName, SearchFilterEnum.EQ));
			filterAttt.add(new LdapSearchFilterAttribute("sudoHost", hostName, SearchFilterEnum.EQ));

			userAuthDomainGroupList = ldapService.search(userLdapRolesDn, filterAttt,
					new String[] { "cn", "dn", "sudoCommand", "sudoHost", "sudoUser" });
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
