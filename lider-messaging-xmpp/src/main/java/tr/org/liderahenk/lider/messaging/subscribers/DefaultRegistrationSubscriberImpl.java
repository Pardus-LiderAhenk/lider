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
import tr.org.liderahenk.lider.core.api.messaging.enums.StatusCode;
import tr.org.liderahenk.lider.core.api.messaging.messages.ILiderMessage;
import tr.org.liderahenk.lider.core.api.messaging.messages.IRegistrationMessage;
import tr.org.liderahenk.lider.core.api.messaging.messages.IRegistrationResponseMessage;
import tr.org.liderahenk.lider.core.api.messaging.subscribers.IRegistrationSubscriber;
import tr.org.liderahenk.lider.core.api.persistence.dao.IAgentDao;
import tr.org.liderahenk.lider.core.api.persistence.entities.IAgent;
import tr.org.liderahenk.lider.core.api.persistence.factories.IEntityFactory;
import tr.org.liderahenk.lider.messaging.messages.RegistrationResponseMessageImpl;

/**
 * <p>
 * Provides default agent registration (and unregistration) in case no other
 * bundle provides its registration subscriber.
 * </p>
 * 
 * <p>
 * During agent registration, agent DN with the following format will be
 * created: <br/>
 * cn=${JID},ou=Ahenkler,dc=mys,dc=pardus,dc=org<br/>
 * Also, agent record and its properties will be persisted in the database.
 * </p>
 * 
 * <p>
 * After successful registration, agent DN will be returned to the sender agent.
 * Otherwise error code and error message will be returned.
 * </p>
 * 
 * <p>
 * Similarly, during agent unregistration, agent record will be removed from the
 * database and its LDAP entry will also be deleted.
 * </p>
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 * @see tr.org.liderahenk.lider.core.api.messaging.IRegistrationSubscriber
 * @see tr.org.liderahenk.lider.core.api.messaging.IRegistrationMessage
 *
 */
public class DefaultRegistrationSubscriberImpl implements IRegistrationSubscriber {

	private static Logger logger = LoggerFactory.getLogger(DefaultRegistrationSubscriberImpl.class);

	private ILDAPService ldapService;
	private IConfigurationService configurationService;
	private IAgentDao agentDao;
	private IEntityFactory entityFactory;
	private String LDAP_VERSION = "3";
	
	private static String DIRECTORY_SERVER_LDAP="LDAP";
	private static String DIRECTORY_SERVER_AD="AD";


	/**
	 * Check if agent defined in the received message is already registered, if
	 * it is, update its values and properties. Otherwise create new agent LDAP
	 * entry and new agent database record.
	 */
	@Override
	public ILiderMessage messageReceived(IRegistrationMessage message) throws Exception {

		String jid = message.getFrom().split("@")[0];

		// Register agent
		if (AgentMessageType.REGISTER == message.getType()) {
			
			boolean alreadyExists = false;
			String dn = null;
			
			String userName = message.getUserName();
			String userPassword = message.getUserPassword();
			String directoryServer = message.getDirectoryServer();
			
			LdapEntry ldapUserEntry= getUserFromLdap(userName, userPassword);
			
			if(ldapUserEntry==null) {
				RegistrationResponseMessageImpl	respMessage = new RegistrationResponseMessageImpl(StatusCode.NOT_AUTHORIZED,
						"User Not Found", dn, null, new Date());
				return respMessage;
			}
			// Try to find agent LDAP entry
			final List<LdapEntry> entries = ldapService.search(configurationService.getAgentLdapJidAttribute(), jid,
					new String[] { configurationService.getAgentLdapJidAttribute() });
			LdapEntry entry = entries != null && !entries.isEmpty() ? entries.get(0) : null;

			if (entry != null) {
				alreadyExists = true;
				dn = entry.getDistinguishedName();
				logger.info("Updating LDAP entry: {} with password: {}",
						new Object[] { message.getFrom(), message.getPassword() });
				// Update agent LDAP entry.
				ldapService.updateEntry(dn, "userPassword", message.getPassword());
				logger.info("Agent LDAP entry {} updated successfully!", dn);
			} else {
				dn = createEntryDN(message);
				logger.info("Creating LDAP entry: {} with password: {}",
						new Object[] { message.getFrom(), message.getPassword() });
				// Create new agent LDAP entry.
				ldapService.addEntry(dn, computeAttributes(jid, message.getPassword()));
				logger.info("Agent LDAP entry {} created successfully!", dn);
			}

			// Try to find related agent database record
			List<? extends IAgent> agents = agentDao.findByProperty(IAgent.class, "jid", jid, 1);
			IAgent agent = agents != null && !agents.isEmpty() ? agents.get(0) : null;

			if (agent != null) {
				alreadyExists = true;
				// Update the record
				agent = entityFactory.createAgent(agent,null, message.getPassword(), message.getHostname(),
						message.getIpAddresses(), message.getMacAddresses(), message.getData());
				agentDao.update(agent);
			} else {
				// Create new agent database record
				agent = entityFactory.createAgent(null, jid, dn, message.getPassword(), message.getHostname(),
						message.getIpAddresses(), message.getMacAddresses(), message.getData());
				agentDao.save(agent);
			}
			
			
			IRegistrationResponseMessage respMessage=null;
			

			if (alreadyExists) {
				logger.warn(
						"Agent {} already exists! Updated its password and database properties with the values submitted.",
						dn);
				respMessage =new RegistrationResponseMessageImpl(StatusCode.ALREADY_EXISTS,
						dn + " already exists! Updated its password and database properties with the values submitted.",
						dn, null, new Date());

				
			} else {
				logger.info("Agent {} and its related database record created successfully!", dn);
				respMessage = new RegistrationResponseMessageImpl(StatusCode.REGISTERED,
						dn + " and its related database record created successfully!", dn, null, new Date());
			}
			
			respMessage.setDisableLocalUser(configurationService.getDisableLocalUser());
			
			if(directoryServer.equals(DIRECTORY_SERVER_LDAP)) {
				respMessage.setLdapServer(configurationService.getLdapServer());
				respMessage.setLdapBaseDn(configurationService.getUserLdapBaseDn());
				respMessage.setLdapVersion(LDAP_VERSION);
				respMessage.setLdapUserDn(dn);
			}
//			 # self.domain_name = "engerek.local"
//			 # self.host_name = "liderahenk.engerek.local"
//			 # self.ip_address = "172.16.103.28"
//			 # self.password = "Pp123456"
			else if(directoryServer.equals(DIRECTORY_SERVER_AD)) {
				respMessage.setAdDomainName(configurationService.getAdDomainName());
				respMessage.setAdHostName(configurationService.getAdHostName());
				respMessage.setAdIpAddress(configurationService.getAdIpAddress());
				respMessage.setAdAdminPassword(configurationService.getAdAdminPassword());
				respMessage.setAdAdminUserName(configurationService.getAdAdminUserName());
			}
			
			
			logger.info("Registration message created..  "
					+ "Message details ldap base dn : " +respMessage.getLdapBaseDn() 
					+ "  ldap server =" + respMessage.getLdapBaseDn()
					+ "  ldap userdn =" + respMessage.getLdapUserDn()
					+ "  ldap version =" + respMessage.getLdapVersion()
					);
			return respMessage;
			
		} else if (AgentMessageType.UNREGISTER == message.getType()) {
			
			logger.info("Unregister message from jid : "+jid);
			logger.info("Unregister message UserName: "+message.getUserName());
			
			// Check if agent LDAP entry already exists
			final List<LdapEntry> entry = ldapService.search(configurationService.getAgentLdapJidAttribute(), jid,
					new String[] { configurationService.getAgentLdapJidAttribute() });

			String dn=null;
			// Delete agent LDAP entry
			if (entry != null && !entry.isEmpty()) {
				dn = entry.get(0).getDistinguishedName();
				ldapService.deleteEntry(dn);
			}

			// Find related agent database record.
			List<? extends IAgent> agents = agentDao.findByProperty(IAgent.class, "jid", jid, 1);
			IAgent agent = agents != null && !agents.isEmpty() ? agents.get(0) : null;

			// Mark the record as deleted.
			if (agent != null) {
				agentDao.delete(agent.getId());
			}

			return new RegistrationResponseMessageImpl(StatusCode.UNREGISTERED,
					dn + " and its related database record unregistered successfully!", dn, null, new Date());
		} else if (AgentMessageType.REGISTER_LDAP == message.getType()) {
			logger.info("REGISTER_LDAP");
			return null;
		}

		return null;
	}

	@Override
	public ILiderMessage postRegistration() throws Exception {
		return null;
	}

	/**
	 * Create agent DN in the following format:<br/>
	 * cn=${JID},ou=Ahenkler,dc=liderahenk,dc=org<br/>
	 * 
	 * @param message
	 *            register message
	 * @return created agent DN
	 */
	private String createEntryDN(IRegistrationMessage message) {
		StringBuilder entryDN = new StringBuilder();
		// Generate agent ID attribute
		entryDN.append(configurationService.getAgentLdapIdAttribute());
		entryDN.append("=");
		entryDN.append(message.getFrom().split("@")[0]);
		// Append base DN
		entryDN.append(",");
		entryDN.append(configurationService.getAgentLdapBaseDn());
		return entryDN.toString();
	}

	/**
	 * 
	 * @param jid
	 * @param password
	 * @return
	 */
	private Map<String, String[]> computeAttributes(final String jid, final String password) {
		Map<String, String[]> attributes = new HashMap<String, String[]>();
		attributes.put("objectClass", configurationService.getAgentLdapObjectClasses().split(","));
		attributes.put(configurationService.getAgentLdapIdAttribute(), new String[] { jid });
		attributes.put(configurationService.getAgentLdapJidAttribute(), new String[] { jid });
		attributes.put("userPassword", new String[] { password });
		// FIXME remove this line, after correcting LDAP schema!
		attributes.put("owner", new String[] { "ou=Ahenkler,dc=liderahenk,dc=org" });
		return attributes;
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

	
	private LdapEntry getUserFromLdap(String userName, String userPassword) throws LdapException {

		LdapEntry user = null;

		List<LdapSearchFilterAttribute> filterAtt = new ArrayList();
		filterAtt.add(new LdapSearchFilterAttribute("uid", userName, SearchFilterEnum.EQ));
		filterAtt.add(new LdapSearchFilterAttribute("userPassword", userPassword, SearchFilterEnum.EQ));

		List<LdapEntry> userList = ldapService.search(filterAtt, new String[] { "cn", "dn","uid" });
		if (userList != null && userList.size() > 0) {

			user = userList.get(0);
		}
		return user;
	}
	
	
}
