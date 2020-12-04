/**
 * Registration suscriber for DİB
 * if hostname does not match with any registration rules agent will be
 * added to Agent ou as default
 * 
 * @author <a href="mailto:hasan.kara@pardus.org.tr">Hasan Kara</a>
 * 
 */
package tr.org.lider.messaging.subscribers;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.naming.InvalidNameException;
import javax.naming.ldap.LdapName;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import tr.org.lider.entities.AgentImpl;
import tr.org.lider.entities.AgentPropertyImpl;
import tr.org.lider.entities.RegistrationTemplateImpl;
import tr.org.lider.entities.UserSessionImpl;
import tr.org.lider.ldap.DNType;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.ldap.LdapSearchFilterAttribute;
import tr.org.lider.ldap.SearchFilterEnum;
import tr.org.lider.messaging.enums.AgentMessageType;
import tr.org.lider.messaging.enums.StatusCode;
import tr.org.lider.messaging.messages.ILiderMessage;
import tr.org.lider.messaging.messages.IRegistrationResponseMessage;
import tr.org.lider.messaging.messages.RegistrationMessageImpl;
import tr.org.lider.messaging.messages.RegistrationResponseMessageImpl;
import tr.org.lider.messaging.messages.XMPPClientImpl;
import tr.org.lider.repositories.AgentRepository;
import tr.org.lider.services.ConfigurationService;
import tr.org.lider.services.RegistrationTemplateService;


@Component
@ConditionalOnProperty(name = "registrationSubscriber.class", havingValue = "iski")
public class IskiRegistrationSubscriberImpl implements IRegistrationSubscriber {

	private static Logger logger = LoggerFactory.getLogger(IskiRegistrationSubscriberImpl.class);

	@Autowired
	private LDAPServiceImpl ldapService;

	@Autowired
	private ConfigurationService configurationService;

	@Autowired
	private AgentRepository agentDao;

	@Autowired
	private RegistrationTemplateService registrationTemplateService;

	@Autowired
	private XMPPClientImpl xmppClient;
	
	private String LDAP_VERSION = "3";

	private static String DIRECTORY_SERVER_LDAP="LDAP";
	private static String DIRECTORY_SERVER_AD="ACTIVE_DIRECTORY";
	//private static String DIRECTORY_SERVER_NONE="NONE";

	/**
	 * Check if agent defined in the received message is already registered, if
	 * it is, update its values and properties. Otherwise create new agent LDAP
	 * entry and new agent database record.
	 */
	@Override
	public ILiderMessage messageReceived(RegistrationMessageImpl message) throws Exception {

		String jid = message.getFrom().split("@")[0];
		String ipAddresses[] = message.getIpAddresses().replaceAll(" ", "").replaceAll("'", "").split(",");

		// Register agent
		if (AgentMessageType.REGISTER == message.getType()) {

			boolean alreadyExists = false;
			String dn = null;

			String userName = message.getUserName();
			String userPassword = message.getUserPassword();
			String directoryServer =DIRECTORY_SERVER_LDAP;

			if( configurationService.getDomainType()!=null) {
				directoryServer= configurationService.getDomainType().name();
			}

			LdapEntry ldapUserEntry= getUserFromLdap(userName, userPassword);

			if(ldapUserEntry==null) {

				RegistrationResponseMessageImpl	respMessage = new RegistrationResponseMessageImpl(StatusCode.NOT_AUTHORIZED,
						"User Not Found!!!", dn, null, new Date());
				return respMessage;
			}

			// Try to find agent LDAP entry
			final List<LdapEntry> entries = ldapService.search(configurationService.getAgentLdapJidAttribute(), jid,
					new String[] { configurationService.getAgentLdapJidAttribute() });
			LdapEntry entry = entries != null && !entries.isEmpty() ? entries.get(0) : null;

			if (entry != null) {
				alreadyExists = true;
				dn = entry.getDistinguishedName();
				logger.info("{} Already exist in LDAP ",new Object[] {dn});
//				logger.info("Updating LDAP entry: {} with password: {}",new Object[] { message.getFrom(), message.getPassword() });
//				// Update agent LDAP entry.
//				ldapService.updateEntry(dn, "userPassword", message.getPassword());
//
//				logger.info("Agent LDAP entry {} updated successfully!", dn);
			} else {
				//check if there are templates and if agent has any rule for its ip address
				List<RegistrationTemplateImpl> templates = registrationTemplateService.findAllOrderByUnitLength();
				RegistrationTemplateImpl agentTemplate = null;
				Boolean isTemplateFound = false;
				for (RegistrationTemplateImpl template : templates) {
					for (String ip : ipAddresses) {
						if(ip.startsWith(template.getUnitId())) {
							agentTemplate = template;
							isTemplateFound = true;
							logger.info("Registration template found: " + agentTemplate.toString());
							break;
						}
					}
					if(isTemplateFound) {
						break;
					}
				}

				//if agent has registration template rule check if user is authorized for that
				if(agentTemplate != null) {
					Boolean ldapUserAllowedForRegistration = false;
					LdapEntry templateLdapEntry = ldapService.getEntryDetail(agentTemplate.getAuthGroup());
					if(templateLdapEntry != null) {
						if(templateLdapEntry.getType() == DNType.GROUP) {
							for (String memberDN : templateLdapEntry.getAttributesMultiValues().get("member")) {
								if(memberDN.equals(ldapUserEntry.getDistinguishedName())) {
									ldapUserAllowedForRegistration = true;
									break;
								}
							}
						} else {
							if(ldapUserEntry.getDistinguishedName().equals(agentTemplate.getAuthGroup())) {
								ldapUserAllowedForRegistration = true;
							}
						}
						if(ldapUserAllowedForRegistration) {
							logger.info("User is allowed for agent registration. " + ldapUserEntry.getDistinguishedName() + " is member of agent template auth group: " + agentTemplate.getAuthGroup());
						} else {
							logger.error(ldapUserEntry.getDistinguishedName() + " is not allowed to register agent:" + message.getHostname());
							logger.error(ldapUserEntry.getDistinguishedName() + " is not member of agent template auth group: " + agentTemplate.getAuthGroup());
						}
						if(ldapUserAllowedForRegistration) {

							LdapName dnList = new LdapName(agentTemplate.getParentDn());
							List<String> subDNList = new ArrayList<>();
							String subDN = "";
							for (int i = 1; i <= dnList.getRdns().size(); i++) {
								for (int j = dnList.getRdns().size()-i; j >= 0; j--) {
									subDN += dnList.get(j) + ",";
								}
								if(subDN.substring(0, (subDN.length()-1)).equals(configurationService.getAgentLdapBaseDn())) {
									break;
								}
								subDNList.add(subDN.substring(0, (subDN.length()-1)));
								subDN = "";
							}
							for (int i = subDNList.size()-1; i >= 0; i--) {
								if(!organizationUnitDoesExist(subDNList.get(i))) {
									createOrganizationalUnit(subDNList.get(i));
								}
							}
							/*
							LdapName dnList = new LdapName(agentTemplate.getParentDn());
							List<String> listOfDNToCreate = new ArrayList<>();
							for (int i = 1; i <= dnList.size(); i++) {
								String parentDN = "";
								for (int j = dnList.size()-i; j >= 0; j--) {
									parentDN += dnList.get(j) + ',';
								}
								parentDN = parentDN.substring(0,parentDN.length()-1);
								if(configurationService.getAgentLdapBaseDn().equals(parentDN)) {
									break;
								}
								listOfDNToCreate.add(parentDN);
							}
							for (int i = listOfDNToCreate.size() -1 ; i >=0; i--) {
								if(!organizationUnitDoesExist(listOfDNToCreate.get(i))) {
									createOrganizationalUnit(listOfDNToCreate.get(i));
								}
							}
							*/
						} else {
							RegistrationResponseMessageImpl	respMessage = new RegistrationResponseMessageImpl(StatusCode.NOT_AUTHORIZED,
									"User is not authorized", dn, null, new Date());
							return respMessage;
						}
					} else {
						RegistrationResponseMessageImpl	respMessage = new RegistrationResponseMessageImpl(StatusCode.NOT_AUTHORIZED,
								"Registration template auth group not found", dn, null, new Date());
						return respMessage;
					}
					dn = createEntryDN(message, agentTemplate.getParentDn());
				} else {
					dn = createEntryDN(message, configurationService.getAgentLdapBaseDn());
				}

				logger.info("Creating LDAP entry: {} with password: {}",new Object[] { message.getFrom(), message.getPassword() });
				// Create new agent LDAP entry.
				ldapService.addEntry(dn, computeAttributes(jid, message.getPassword()));
				logger.info("Agent LDAP entry {} created successfully!", dn);
				//add liderOSType to agent LDAP node
				String osType = "Linux";
				if(message.getData().get("os.name") != null) {
					if(message.getData().get("os.name").equals("Windows")) {
						osType = "Windows";
					}
				}
				ldapService.updateEntryAddAtribute(dn, "liderDeviceOSType", osType);

			}

			// Try to find related agent database record
			List<? extends AgentImpl> agents = agentDao.findByJid(jid);

			AgentImpl agent = agents != null && !agents.isEmpty() ? agents.get(0) : null;
			// Update the record
			if (agent != null) {
				alreadyExists = true;
				Boolean macAlreadyExists = true;
				if(!message.getMacAddresses().equals("")) {
					String[] messageMacIDList = message.getMacAddresses().replace(" ", "").replaceAll("'", "").split(",");
					String[] agentMacIDList = agent.getMacAddresses().replace(" ", "").replaceAll("'", "").split(",");
					
					for(String messageMacID:messageMacIDList) {
						for (String agentMacID:agentMacIDList) {
							if (messageMacID.equals(agentMacID)) {
								macAlreadyExists = false;
								break;
							}
						}
					}
				}
				if (macAlreadyExists == false) {
					alreadyExists = false;
					agent = new AgentImpl(
							agent.getId(), 
							agent.getJid(), 
							false, 
							dn,
							message.getPassword(), 
							message.getHostname(), 
							message.getIpAddresses(), 
							message.getMacAddresses(), 
							agent.getCreateDate(), 
							new Date(),
							false,
							(Set<AgentPropertyImpl>) agent.getProperties(),
							(Set<UserSessionImpl>) agent.getSessions(),directoryServer);

					if (message.getData() != null) {
						for (Entry<String, Object>  entryy : message.getData().entrySet()) {
							if (entryy.getKey() != null && entryy.getValue() != null) {
								agent.addProperty(new AgentPropertyImpl(null, agent, entryy.getKey(),
										entryy.getValue().toString(), new Date()));
							}
						}
					}
					// Update agentDatabase.
					logger.info("Updating agentJid: {} with password: {} in database",new Object[] {agent.getJid(), message.getPassword()});
					agentDao.save(agent);
					logger.info("Agent Database {} updated successfully!", agent.getJid());
					// Update agent LDAP entry
					logger.info("Updating LDAP entry: {} with password: {}",new Object[] { message.getFrom(), message.getPassword() });
					ldapService.updateEntry(dn, "userPassword", message.getPassword());
					logger.info("Agent LDAP entry {} updated successfully!", dn);
				} else {
					logger.info("{} Already exist in Database ",new Object[] {agent.getJid()});
				}
			} else {
				alreadyExists = false;
				// Create new agent database record
				logger.debug("Creating new agent record in database.");
				AgentImpl agentImpl = new AgentImpl(null, jid, false, dn, message.getPassword(), 
						message.getHostname(), 
						message.getIpAddresses(),  
						message.getMacAddresses(),
						new Date(), null, false, null, null,directoryServer);
				if (message.getData() != null) {
					for (Entry<String, Object> entryy : message.getData().entrySet()) {
						if (entryy.getKey() != null && entryy.getValue() != null) {
							agentImpl.addProperty(new AgentPropertyImpl(null, agentImpl, entryy.getKey(),
									entryy.getValue().toString(), new Date()));
						}
					}
				}
				agentDao.save(agentImpl);
			}
			IRegistrationResponseMessage respMessage=null;

			if (alreadyExists) {
				logger.warn("Agent {} already exists! Hostname already in use", dn);

				respMessage =new RegistrationResponseMessageImpl(StatusCode.ALREADY_EXISTS,
						dn + " already exists! Updated its password and database properties with the values submitted.",
						dn, null, new Date());

			} else {
				logger.info("Agent {} and its related database record created successfully!", dn);

				respMessage = new RegistrationResponseMessageImpl(StatusCode.REGISTERED,
						dn + " and its related database record created successfully!", dn, null, new Date());
			}

			respMessage.setDisableLocalUser(configurationService.getDisableLocalUser());
			respMessage.setDirectoryServer(directoryServer);

			if(directoryServer.equals(DIRECTORY_SERVER_LDAP)) {
				respMessage.setLdapServer(configurationService.getLdapServer());
				respMessage.setLdapBaseDn(configurationService.getLdapRootDn());
				respMessage.setLdapVersion(LDAP_VERSION);
				respMessage.setLdapUserDn(dn);

				logger.info("Registration message created..  "
						+ "Message details ldap base dn : " +respMessage.getLdapBaseDn() 
						+ "  ldap server =" + respMessage.getLdapBaseDn()
						+ "  ldap userdn =" + respMessage.getLdapUserDn()
						+ "  ldap version =" + respMessage.getLdapVersion()
						);

			}
			else if(directoryServer.equals(DIRECTORY_SERVER_AD)) {
				respMessage.setAdDomainName(configurationService.getAdDomainName());
				respMessage.setAdHostName(configurationService.getAdHostName());
				respMessage.setAdIpAddress(configurationService.getAdIpAddress());
				respMessage.setAdAdminPassword(configurationService.getAdAdminPassword());
				respMessage.setAdAdminUserName(configurationService.getAdAdminUserName());

				logger.info("Registration message created..  "
						+ "Message details ldap base dn : " +respMessage.getLdapBaseDn() 
						+ "  ldap server =" + respMessage.getLdapBaseDn()
						+ "  ldap userdn =" + respMessage.getLdapUserDn()
						+ "  ldap version =" + respMessage.getLdapVersion()
						);
			}
			xmppClient.addClientToRoster(jid + "@"+configurationService.getXmppServiceName());
			return respMessage;

		} else if (AgentMessageType.UNREGISTER == message.getType()) {

			logger.info("Unregister message from jid : "+jid);
			logger.info("Unregister message UserName: "+message.getUserName());
			String userName = message.getUserName();
			String userPassword = message.getUserPassword();

			String directoryServer ="LDAP";
			if( configurationService.getDomainType()!=null) {
				directoryServer= configurationService.getDomainType().name();
			}
			LdapEntry ldapUserEntry= getUserFromLdap(userName, userPassword);
			if(ldapUserEntry==null) {
				RegistrationResponseMessageImpl	respMessage = new RegistrationResponseMessageImpl(StatusCode.NOT_AUTHORIZED,
						"User Not Found", null, null, new Date());
				return respMessage;
			}

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
			List<? extends AgentImpl> agents = agentDao.findByJid(jid);
			AgentImpl agent = agents != null && !agents.isEmpty() ? agents.get(0) : null;

			// Mark the record as deleted.
			if (agent != null) {
				agentDao.delete(agent);
			}
			IRegistrationResponseMessage respMessage= new RegistrationResponseMessageImpl(StatusCode.UNREGISTERED,dn 
					+ " and its related database record unregistered successfully!", dn, null, new Date());
			respMessage.setDirectoryServer(directoryServer);
			return respMessage;

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
	private String createEntryDN(RegistrationMessageImpl message, String parentOU ) {
		StringBuilder entryDN = new StringBuilder();
		// Generate agent ID attribute
		entryDN.append(configurationService.getAgentLdapIdAttribute());
		entryDN.append("=");
		entryDN.append(message.getFrom().split("@")[0]);
		// Append base DN
		entryDN.append(",");
		entryDN.append(parentOU);
		return entryDN.toString();
	}

	private void createOrganizationalUnit(String dn) {
		try {
			LdapName dnList = new LdapName(dn);
			String ouName = dnList.get(dnList.size()-1).split("=")[1];
			Map<String, String[]> attributes = new HashMap<String,String[]>();
			attributes.put("objectClass", new String[] {"organizationalUnit", "top", "pardusLider"} );
			
			attributes.put("ou", new String[] { ouName });
			ldapService.addEntry(dn, attributes);
			logger.info("OU created successfully RDN ="+dn);
		} catch (LdapException e) {
			logger.error(e.getMessage());
		} catch (InvalidNameException e) {
			e.printStackTrace();
		}
	}

	private boolean organizationUnitDoesExist(String dn) throws LdapException {
		logger.info("Checking for  dn->{} entry does exists", dn);
		if (ldapService.getEntry(dn, new String[] {}) != null) {
			logger.debug("Entry: {} already exists", dn);
			return true;
		} else {
			logger.debug("{} not found", dn);
			return false;
		}
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

	private LdapEntry getUserFromLdap(String userName, String userPassword) throws LdapException {
		LdapEntry user = null;
		List<LdapSearchFilterAttribute> filterAtt = new ArrayList<LdapSearchFilterAttribute>();
		filterAtt.add(new LdapSearchFilterAttribute("uid", userName, SearchFilterEnum.EQ));
		filterAtt.add(new LdapSearchFilterAttribute("userPassword", userPassword, SearchFilterEnum.EQ));
		List<LdapEntry> userList = ldapService.search(filterAtt, new String[] { "cn", "dn","uid" });
		if (userList != null && userList.size() > 0) {
			user = userList.get(0);
		}
		return user;
	}

}
