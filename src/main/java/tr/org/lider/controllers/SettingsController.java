package tr.org.lider.controllers;

import java.util.List;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.messaging.enums.Protocol;
import tr.org.lider.messaging.messages.XMPPClientImpl;
import tr.org.lider.models.ConfigParams;
import tr.org.lider.services.ConfigurationService;

@RestController
@RequestMapping("settings")
public class SettingsController {
	
	Logger logger = LoggerFactory.getLogger(SettingsController.class);
	
	@Autowired
	ConfigurationService configurationService;
	
	@Autowired
	XMPPClientImpl xmppClient;
	
	@Autowired
	private LDAPServiceImpl ldapService;
	
	@RequestMapping(method=RequestMethod.GET, value = "/configurations", produces = MediaType.APPLICATION_JSON_VALUE)
	public ConfigParams getConfigParams() {
		return configurationService.getConfigParams();
	}
	
	@RequestMapping(method=RequestMethod.POST, value = "/update/ldap", produces = MediaType.APPLICATION_JSON_VALUE)
	public ConfigParams updateLdapSettings(@RequestParam (value = "ldapServer", required = true) String ldapServer,
			@RequestParam (value = "ldapPort", required = true) String ldapPort,
			@RequestParam (value = "ldapUsername", required = true) String ldapUsername,
			@RequestParam (value = "ldapPassword", required = true) String ldapPassword) {

		ConfigParams configParams = configurationService.getConfigParams();
		configParams.setLdapServer(ldapServer);
		configParams.setLdapPort(ldapPort);
		configParams.setLdapUsername(ldapUsername);
		configParams.setLdapPassword(ldapPassword);
		return configurationService.updateConfigParams(configParams);
	}
	
	@RequestMapping(method=RequestMethod.POST, value = "/update/xmpp", produces = MediaType.APPLICATION_JSON_VALUE)
	public ConfigParams updateXMPPSettings(@RequestParam (value = "xmppHost", required = true) String xmppHost,
			@RequestParam (value = "xmppPort", required = true) int xmppPort,
			@RequestParam (value = "xmppUsername", required = true) String xmppUsername,
			@RequestParam (value = "xmppPassword", required = true) String xmppPassword,
			@RequestParam (value = "xmppMaxRetryConnectionCount", required = true) int xmppMaxRetryConnectionCount,
			@RequestParam (value = "xmppPacketReplayTimeout", required = true) int xmppPacketReplayTimeout,
			@RequestParam (value = "xmppPingTimeout", required = true) int xmppPingTimeout) {

		ConfigParams configParams = configurationService.getConfigParams();
		configParams.setXmppHost(xmppHost);
		configParams.setXmppPort(xmppPort);
		configParams.setXmppUsername(xmppUsername);
		configParams.setXmppPassword(xmppPassword);
		configParams.setXmppMaxRetryConnectionCount(xmppMaxRetryConnectionCount);
		configParams.setXmppPacketReplayTimeout(xmppPacketReplayTimeout);
		configParams.setXmppPingTimeout(xmppPingTimeout);
		ConfigParams updatedParams = configurationService.updateConfigParams(configParams);
		if(updatedParams != null) {
			logger.info("XMPP settings are updated. XMPP will disconnect and reconnect after resetting XMPP parameters.");
			try {
				xmppClient.disconnect();
				xmppClient.setIsXMPPInitialized(false);
				xmppClient.initXMPPClient();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				logger.error("XMPP settings are updated but error occured while connecting with new settings. Message: " + e.getMessage());
			}
		}
		return updatedParams;
	}

	@RequestMapping(method=RequestMethod.POST, value = "/update/fileServer", produces = MediaType.APPLICATION_JSON_VALUE)
	public ConfigParams updateFileServerSettings(@RequestParam (value = "fileTransferType", required = true) Protocol fileTransferType,
			@RequestParam (value = "fileServerAddress", required = true) String fileServerAddress,
			@RequestParam (value = "fileServerUsername", required = true) String fileServerUsername,
			@RequestParam (value = "fileServerPassword", required = true) String fileServerPassword,
			@RequestParam (value = "fileServerPort", required = true) int fileServerPort) {

		ConfigParams configParams = configurationService.getConfigParams();
		configParams.setFileServerProtocol(fileTransferType);
		configParams.setFileServerPort(fileServerPort);
		configParams.setFileServerHost(fileServerAddress);
		configParams.setFileServerUsername(fileServerUsername);
		configParams.setFileServerPassword(fileServerPassword);
		return configurationService.updateConfigParams(configParams);
	}
	
	//add roles to user. roles string will be splitted with comma if more than one role is sent
	@RequestMapping(method=RequestMethod.POST, value = "/add/role", produces = MediaType.APPLICATION_JSON_VALUE)
	public List<LdapEntry> addRoleToUser(@RequestParam (value = "dn", required = true) String dn,
			@RequestParam (value = "roles", required = true) String roles) {
		String[] listOfRoles = roles.split(",");
		try {
			for (int i = 0; i < listOfRoles.length; i++) {
				ldapService.updateEntryAddAtribute(dn, "liderPrivilege", listOfRoles[i]);
			}
		} catch (LdapException e) {
			e.printStackTrace();
			return null;
		}
		List<LdapEntry> ldapEntries = null;
		try {
			String filter= "(&(objectClass=pardusAccount)(objectClass=pardusLider)(liderPrivilege=ROLE_USER))";
			ldapEntries  = ldapService.findSubEntries(filter,
					new String[] { "*" }, SearchScope.SUBTREE);
		} catch (LdapException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return ldapEntries;
	}
	
//	@RequestMapping(method=RequestMethod.POST, value = "/add/role", produces = MediaType.APPLICATION_JSON_VALUE)
//	public List<LdapEntry> removeUserAccessToConsole(@RequestParam (value = "dn", required = true) String dn) {
//		String[] listOfRoles = roles.split(",");
//		try {
//			for (int i = 0; i < listOfRoles.length; i++) {
//				ldapService.updateEntryAddAtribute(dn, "liderPrivilege", listOfRoles[i]);
//			}
//		} catch (LdapException e) {
//			e.printStackTrace();
//			return null;
//		}
//		List<LdapEntry> ldapEntries = null;
//		try {
//			String filter= "(&(objectClass=pardusAccount)(objectClass=pardusLider)(liderPrivilege=ROLE_USER))";
//			ldapEntries  = ldapService.findSubEntries(filter,
//					new String[] { "*" }, SearchScope.SUBTREE);
//		} catch (LdapException e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		}
//		return ldapEntries;
//	}
}