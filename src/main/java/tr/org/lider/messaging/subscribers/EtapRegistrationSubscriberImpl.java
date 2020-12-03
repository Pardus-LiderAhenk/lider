package tr.org.lider.messaging.subscribers;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.entities.AgentImpl;
import tr.org.lider.entities.AgentPropertyImpl;
import tr.org.lider.entities.UserSessionImpl;
import tr.org.lider.ldap.ILDAPService;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.messaging.enums.AgentMessageType;
import tr.org.lider.messaging.enums.StatusCode;
import tr.org.lider.messaging.messages.ILiderMessage;
import tr.org.lider.messaging.messages.IRegistrationResponseMessage;
import tr.org.lider.messaging.messages.RegistrationMessageImpl;
import tr.org.lider.messaging.messages.RegistrationResponseMessageImpl;
import tr.org.lider.messaging.messages.XMPPClientImpl;
import tr.org.lider.models.EtapInfo;
import tr.org.lider.repositories.AgentRepository;
import tr.org.lider.services.ConfigurationService;


@Component
@ConditionalOnProperty(name = "registrationSubscriber.class", havingValue = "etap")
public class EtapRegistrationSubscriberImpl implements IRegistrationSubscriber{

	private static Logger logger = LoggerFactory.getLogger(EtapRegistrationSubscriberImpl.class);

	@Autowired
	private LDAPServiceImpl ldapService;
	
	@Autowired
	private ConfigurationService configurationService;
	
	@Autowired
	private AgentRepository agentDao;

	@Autowired
	private XMPPClientImpl xmppClient;
	

	public String fullJid;

	@Override
	public ILiderMessage messageReceived(RegistrationMessageImpl message) throws Exception {

		fullJid = message.getFrom();

		if (AgentMessageType.REGISTER == message.getType()) {

			logger.info("ETAP Registration triggered");

			boolean alreadyExists = false;
			
			logger.info("-------------------------mac:" + message.getMacAddresses());
			logger.info("-------------------------hostname:" + message.getHostname());

			String macAddress="";
			EtapInfo etapInfo = null;
			
			if(!message.getMacAddresses().equals("")) {
				String[] macIDList = message.getMacAddresses().replace(" ", "").replaceAll("'", "").split(",");
				for(String macID:macIDList) {
					etapInfo = getDataFromMacID(macID);
					if(etapInfo != null && etapInfo.getResult() == "true") {
						macAddress = macID;
						break;
					}
				}
			}

			if (etapInfo != null && etapInfo.getResult() == "true") {
				
				logger.info("Mac address is found by ETAP DB Service");

				String[] etapOu =new String[] {"Ahenkler",etapInfo.getCity(),etapInfo.getTown(), etapInfo.getSchool()};

				logger.info("ETAP Ou:" + etapOu);

				String dn = null;

				String idAttribute=configurationService.getAgentLdapIdAttribute();

				// Is Agent registered in ldap?
//				final List<LdapEntry> entries = ldapService.search(configurationService.getAgentLdapJidAttribute(),
//						message.getFrom().split("@")[0],
//						new String[] { configurationService.getAgentLdapJidAttribute() });
				final List<LdapEntry> entries = ldapService.search(configurationService.getAgentLdapIdAttribute(),
						macAddress,
						new String[] { configurationService.getAgentLdapJidAttribute(),configurationService.getAgentLdapIdAttribute() });
				LdapEntry entry = entries != null && !entries.isEmpty() ? entries.get(0) : null;

				// Agent already registered
				if (entry != null) {
					logger.info("This agent already registered in LDAP");
					alreadyExists = true;
					dn = entry.getDistinguishedName();
					logger.info("Updating LDAP entry: {} with password: {}",new Object[] { message.getFrom(), message.getPassword() });
					
					// Update agent LDAP entry.
					ldapService.updateEntry(dn, "userPassword", message.getPassword());
					ldapService.updateEntry(dn, "uid", message.getFrom().split("@")[0]);
					logger.info("Agent LDAP entry {} updated successfully!", dn);
				}

				// Agent not registered yet
				else {
					logger.info("Starting ldap registration...");
					// create dn and check is ou level created. if does not
					// exist, create!
					dn = createEntryDN(idAttribute, macAddress, etapOu);
					ldapService.addEntry(dn, computeAttributes(macAddress, message.getPassword(), etapOu));
				}

				// Try to find related agent database record
				
//				List<? extends AgentImpl> agents = agentDao.findByJid(message.getFrom().split("@")[0]);
				List<? extends AgentImpl> agents = agentDao.findByDn(dn);
				
//				List<? extends IAgent> agents = agentDao.findByProperty(IAgent.class, "jid",
//						message.getFrom().split("@")[0], 1);
//				IAgent agent = agents != null && !agents.isEmpty() ? agents.get(0) : null;

				AgentImpl agent = agents != null && !agents.isEmpty() ? agents.get(0) : null;

				
				if (agent != null) {
					logger.debug(
							"Agent already exists in database with dn name.If there is a changed property, it will be updated.");
					alreadyExists = true;
					// Update the record
					agent = new AgentImpl(
							agent.getId(), 
							message.getFrom().split("@")[0], 
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
							(Set<UserSessionImpl>) agent.getSessions());
				
					if (message.getData() != null) {
						for (Entry<String, Object>  entryy : message.getData().entrySet()) {
							if (entryy.getKey() != null && entryy.getValue() != null) {
								agent.addProperty(new AgentPropertyImpl(null, agent, entryy.getKey(),
										entryy.getValue().toString(), new Date()));
							}
						}
					}
					agentDao.save(agent);
				} else {
					// Create new agent database record
					logger.debug("Creating new agent record in database.");
					
					List<? extends AgentImpl> agentsJidList = agentDao.findByJid(message.getFrom().split("@")[0]);
					AgentImpl agentsJid = agentsJidList != null && !agentsJidList.isEmpty() ? agentsJidList.get(0) : null;
					
					if(agentsJid != null) {
						logger.debug(
								"Agent already exists in database with jid name.If there is a changed property, it will be updated.");
						
						AgentImpl agentImpl = new AgentImpl(agentsJid.getId(), null, false, dn ,
								message.getPassword(), 
								message.getHostname(), 
								message.getIpAddresses(), 
								message.getMacAddresses(), 
								agent.getCreateDate(),  new Date(),false,
								(Set<AgentPropertyImpl>) agentsJid.getProperties(),
								(Set<UserSessionImpl>) agentsJid.getSessions());
						
						if (message.getData() != null) {
							for (Entry<String, Object> entryy : message.getData().entrySet()) {
								if (entryy.getKey() != null && entryy.getValue() != null) {
									agentImpl.addProperty(new AgentPropertyImpl(null, agentImpl, entryy.getKey(),
											entryy.getValue().toString(), new Date()));
								}
							}
						}
					}else {
					
						AgentImpl agentImpl = new AgentImpl(null, message.getFrom().split("@")[0], false, dn, message.getPassword(), 
								message.getHostname(), 
								message.getIpAddresses(),  
								message.getMacAddresses(),
								new Date(), null, false, null, null);
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
//					agent = entityFactory.createAgent(null, message.getFrom().split("@")[0], dn, message.getPassword(),
//							message.getHostname(), message.getIpAddresses(), macAddress,
//							message.getData());
//					agentDao.save(agent);
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
				
				logger.info("Trying to add agent {} as a member lider_sunucu roster", dn);
				
				xmppClient.addClientToRoster(fullJid+"@"+configurationService.getXmppServiceName());
					
				logger.info("Agent {} added successfully as a member lider_sunucu roster", dn);
				
				return respMessage;

			} else {
				logger.info("Mac address not found on Etap Service:(");
				
				RegistrationResponseMessageImpl	respMessage = new RegistrationResponseMessageImpl(StatusCode.NOT_AUTHORIZED,
						"Mac ID is not registered to Etap Service.", null, null, new Date());
				//throw new Exception();
				
				return respMessage;
			}
			
			

		} else if (AgentMessageType.UNREGISTER == message.getType()) {
			throw new Exception();
			
		}
		return null;
	}

	public EtapInfo getDataFromMacID(String macID) {

		String restUrl = "http://etaregister.etap.org.tr/eta-register-server.php";
		EtapInfo etapInfo = new EtapInfo();
		etapInfo.setRequest_type("0");
		etapInfo.setMac_id(macID.toUpperCase());

		ObjectMapper objectMapper= new ObjectMapper();
		String data = null;
		try {
			data = objectMapper.writeValueAsString(etapInfo);

			URL url = new URL(restUrl);

			HttpURLConnection connection = (HttpURLConnection) url.openConnection();
			connection.setRequestMethod("POST");
			connection.setRequestProperty("Content-Type", "application/json");
			connection.setDoOutput(true);
			connection.setDoInput(true);

			OutputStreamWriter writer = new OutputStreamWriter(connection.getOutputStream());
			writer.write(data);
			writer.close();

			BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
			String line;

			StringBuffer sb = new StringBuffer();
			while ((line = reader.readLine()) != null) {
				sb.append(line);
			}
			reader.close();

			ObjectMapper objectMapperResp= new ObjectMapper();
			EtapInfo etapInfoResponse=objectMapperResp.readValue(sb.toString(), EtapInfo.class);
			
			return etapInfoResponse;

		} catch (JsonGenerationException e) {
			e.printStackTrace();
		} catch (JsonMappingException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}


	

	public ILiderMessage postRegistration() throws Exception {
//		String command = "cat /etc/system.properties";
//
//		logger.info("Post-registration triggered");
//		logger.info("Execute script message is sending. Command :{}", command);
//
//		return messageFactory.createExecuteScriptMessage(fullJid, command,
//				configurationService.getFileServerConf(fullJid.split("@")[0]));
		return null;
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

	private Map<String, String[]> computeAttributes(final String cn, final String password, String[] dcParameters) {

		Map<String, String[]> attributes = new HashMap<String, String[]>();
		// attributes.put("objectClass", new String[] { "device", "pardusDevice",
		// "orgNo" });
		attributes.put("objectClass", new String[] { "device", "pardusDevice", "pardusLider" });
		attributes.put("cn", new String[] { cn });
		attributes.put("uid", new String[] { fullJid.split("@")[0] });
		attributes.put("userPassword", new String[] { password });
		// TODO fixing about LDAP
		attributes.put("owner", new String[] { "ou=Ahenkler,dc=liderahenk,dc=org" });
		// attributes.put("sunucuNo", new String[] { "9999"});
		return attributes;
	}

	private String createEntryDN(String idAttribute, String cn, String[] ouParameters) throws LdapException {
		String incrementaldn = configurationService.getLdapRootDn();

		for (String ouValue : ouParameters) {
			incrementaldn = "ou=" + ouValue + "," + incrementaldn;

			if (organizationUnitDoesExist(incrementaldn) == false) {
				logger.info(" {} entry adding to ldap hierarchy", ouValue);
				Map<String, String[]> ouMap = new HashMap<String, String[]>();
				ouMap.put("objectClass", new String[] { "top", "organizationalUnit" });
				ouMap.put("ou", new String[] { ouValue });
				ouMap.put("description", new String[] { "pardusDeviceGroup" });
				ldapService.addEntry(incrementaldn, ouMap);
			}
		}

		incrementaldn = idAttribute +"="+ cn + "," + incrementaldn;
		return incrementaldn;
	}

//	public class Entry {
//		String cn;
//		String[] ouParameters;
//
//		public Entry(String cn, String[] ouParameters) {
//			this.cn = cn;
//			this.ouParameters = ouParameters;
//		}
//	}

	

	/**
	 * 
	 * @param ldapService
	 */
	public void setLdapService(LDAPServiceImpl ldapService) {
		this.ldapService = ldapService;
	}

	

}
