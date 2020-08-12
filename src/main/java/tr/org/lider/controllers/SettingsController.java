package tr.org.lider.controllers;

import java.util.List;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.LiderSecurityUserDetails;
import tr.org.lider.entities.RoleImpl;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.ldap.OLCAccessRule;
import tr.org.lider.messaging.enums.DomainType;
import tr.org.lider.messaging.enums.Protocol;
import tr.org.lider.messaging.messages.XMPPClientImpl;
import tr.org.lider.models.ConfigParams;
import tr.org.lider.services.ConfigurationService;
import tr.org.lider.services.RoleService;

/**
 * This controller is used for showing and updating all settings for lider
 * 
 * @author <a href="mailto:hasan.kara@pardus.org.tr">Hasan Kara</a>
 * 
 */

@Secured({"ROLE_ADMIN", "ROLE_SETTINGS" })
@RestController
@RequestMapping("lider/settings")
public class SettingsController {

	Logger logger = LoggerFactory.getLogger(SettingsController.class);

	@Autowired
	ConfigurationService configurationService;

	@Autowired
	XMPPClientImpl xmppClient;

	@Autowired
	private LDAPServiceImpl ldapService;

	@Autowired
	private RoleService roleService;

	@RequestMapping(method=RequestMethod.GET, value = "/configurations", produces = MediaType.APPLICATION_JSON_VALUE)
	public ConfigParams getConfigParams() {
		return configurationService.getConfigParams();
	}

	@RequestMapping(method=RequestMethod.GET ,value = "/getConsoleUsers", produces = MediaType.APPLICATION_JSON_VALUE)
	public List<LdapEntry> getLiderConsoleUsers() {
		List<LdapEntry> ldapEntries = null;
		try {
			String filter= "(&(objectClass=pardusAccount)(objectClass=pardusLider)(liderPrivilege=ROLE_USER))";
			ldapEntries  = ldapService.findSubEntries(filter,
					new String[] { "*" }, SearchScope.SUBTREE);
		} catch (LdapException e) {
			e.printStackTrace();
		}
		return ldapEntries;
	}

	@RequestMapping(method=RequestMethod.POST, value = "/update/ldap", produces = MediaType.APPLICATION_JSON_VALUE)
	public ConfigParams updateLdapSettings(@RequestParam (value = "ldapServer", required = true) String ldapServer,
			@RequestParam (value = "ldapPort", required = true) String ldapPort,
			@RequestParam (value = "ldapUsername", required = true) String ldapUsername,
			@RequestParam (value = "ldapPassword", required = true) String ldapPassword,
			@RequestParam (value = "adIpAddress", required = true) String adIpAddress,
			@RequestParam (value = "adPort", required = true) String adPort,
			@RequestParam (value = "adDomainName", required = true) String adDomainName,
			@RequestParam (value = "adAdminUserName", required = true) String adAdminUserName,
			@RequestParam (value = "adAdminUserFullDN", required = true) String adAdminUserFullDN,
			@RequestParam (value = "adAdminPassword", required = true) String adAdminPassword,
			@RequestParam (value = "adHostName", required = true) String adHostName) {

		ConfigParams configParams = configurationService.getConfigParams();
		configParams.setLdapServer(ldapServer);
		configParams.setLdapPort(ldapPort);
		configParams.setLdapUsername(ldapUsername);
		configParams.setLdapPassword(ldapPassword);
		configParams.setAdIpAddress(adIpAddress);
		configParams.setAdPort(adPort);
		configParams.setAdDomainName(adDomainName);
		configParams.setAdAdminUserName(adAdminUserName);
		configParams.setAdAdminUserFullDN(adAdminUserFullDN);
		configParams.setAdAdminPassword(adAdminPassword);
		configParams.setAdHostName(adHostName);
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
			@RequestParam (value = "fileServerPort", required = true) int fileServerPort,
			@RequestParam (value = "fileServerAgentFilePath", required = true) String fileServerAgentFilePath) {

		ConfigParams configParams = configurationService.getConfigParams();
		configParams.setFileServerProtocol(fileTransferType);
		configParams.setFileServerPort(fileServerPort);
		configParams.setFileServerHost(fileServerAddress);
		configParams.setFileServerUsername(fileServerUsername);
		configParams.setFileServerPassword(fileServerPassword);
		configParams.setFileServerAgentFilePath(fileServerAgentFilePath);
		return configurationService.updateConfigParams(configParams);
	}

	@RequestMapping(method=RequestMethod.POST, value = "/update/otherSettings", produces = MediaType.APPLICATION_JSON_VALUE)
	public ConfigParams updateOtherSettings(@RequestParam (value = "disableLocalUser", required = true) Boolean disableLocalUser,
			@RequestParam (value = "domainType", required = true) DomainType domainType) {
		ConfigParams configParams = configurationService.getConfigParams();
		configParams.setDisableLocalUser(disableLocalUser);
		configParams.setDomainType(domainType);
		return configurationService.updateConfigParams(configParams);
	}

	//add roles to user. 
	@RequestMapping(method=RequestMethod.POST, value = "/editUserRoles", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<List<LdapEntry>> editUserRoles(@RequestParam (value = "dn", required = true) String dn,
			@RequestParam(value = "roles[]", required=true) String[] roles,
			Authentication authentication) {
		List<LdapEntry> ldapEntries = null;
		try {
			LdapEntry entry = ldapService.getEntryDetail(dn);
			if(entry != null) {
				if(entry.getAttributesMultiValues().get("liderPrivilege") != null) {
					String[] priviliges = entry.getAttributesMultiValues().get("liderPrivilege");
					for (int i = 0; i < priviliges.length; i++) {
						if(priviliges[i].startsWith("ROLE_")) {
							ldapService.updateEntryRemoveAttribute(dn, "liderPrivilege");
						}
					}
					for (int i = 0; i < roles.length; i++) {
						ldapService.updateEntryAddAtribute(dn, "liderPrivilege", roles[i]);
					}
				} else {
					for (int i = 0; i < roles.length; i++) {
						ldapService.updateEntryAddAtribute(dn, "liderPrivilege", roles[i]);
					}
				}
			}
			//if user edited own console roles redirect to logout
			LiderSecurityUserDetails userDetails = (LiderSecurityUserDetails) authentication.getPrincipal();
			if(userDetails.getLiderUser().getDn().equals(dn)) {
				authentication.setAuthenticated(false);
				return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
			} else {
				String filter= "(&(objectClass=pardusAccount)(objectClass=pardusLider)(liderPrivilege=ROLE_USER))";
				ldapEntries  = ldapService.findSubEntries(filter,
						new String[] { "*" }, SearchScope.SUBTREE);
				return new ResponseEntity<>(ldapEntries, HttpStatus.OK);
			}
		} catch (LdapException e) {
			e.printStackTrace();
			return null;
		}
	}

	@RequestMapping(method=RequestMethod.POST, value = "/deleteConsoleUser", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<List<LdapEntry>> deleteConsoleUser(@RequestParam (value = "dn", required = true) String dn,
			Authentication authentication) {
		List<LdapEntry> ldapEntries = null;
		try {
			LdapEntry entry = ldapService.getEntryDetail(dn);
			if(entry != null) {
				if(entry.getAttributesMultiValues().get("liderPrivilege") != null) {
					String[] priviliges = entry.getAttributesMultiValues().get("liderPrivilege");
					for (int i = 0; i < priviliges.length; i++) {
						if(priviliges[i].startsWith("ROLE_")) {
							ldapService.updateEntryRemoveAttributeWithValue(dn, "liderPrivilege", priviliges[i]);
						}
					}
				}
			}
			//if user deleted own console roles redirect to logout
			LiderSecurityUserDetails userDetails = (LiderSecurityUserDetails) authentication.getPrincipal();
			if(userDetails.getLiderUser().getDn().equals(dn)) {
				authentication.setAuthenticated(false);
				return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
			} else {
				String filter= "(&(objectClass=pardusAccount)(objectClass=pardusLider)(liderPrivilege=ROLE_USER))";
				ldapEntries  = ldapService.findSubEntries(filter,
						new String[] { "*" }, SearchScope.SUBTREE);
				return new ResponseEntity<>(ldapEntries, HttpStatus.OK);
			}

		} catch (LdapException e) {
			e.printStackTrace();
			return null;
		}
	}

	@RequestMapping(method=RequestMethod.GET ,value = "/getRoles", produces = MediaType.APPLICATION_JSON_VALUE)
	public List<RoleImpl> getRoles() {
		return roleService.getRoles();
	}

	@RequestMapping(method=RequestMethod.POST ,value = "/saveMenusForRole", produces = MediaType.APPLICATION_JSON_VALUE)
	public List<RoleImpl> saveMenusForRole(@RequestBody RoleImpl role) {
		if(!role.getName().equals("ROLE_ADMIN")) {
			roleService.saveRole(role);
			return roleService.getRoles();
		} else {
			return null;
		}
	}

	@RequestMapping(method=RequestMethod.POST ,value = "/getOLCAccessRules", produces = MediaType.APPLICATION_JSON_VALUE)
	public List<OLCAccessRule> getUsersOLCAccessRules(@RequestParam (value = "dn", required = true) String dn) {
		if(!dn.equals("")) {
			try {
				List<OLCAccessRule> ruleList = ldapService.getSubTreeOLCAccessRules(dn);
				return ruleList;
			} catch (LdapException e) {
				logger.error(e.getMessage());
				return null;
			}
		} else {
			return null;
		}
	}

	@RequestMapping(method=RequestMethod.POST ,value = "/addOLCAccessRule", produces = MediaType.APPLICATION_JSON_VALUE)
	public Boolean addOLCAccessRule(@RequestParam (value = "groupDN", required = true) String groupDN,
			@RequestParam (value = "olcAccessDN", required = true) String olcAccessDN,
			@RequestParam (value = "accessType", required = true) String accessType) {
		if(!groupDN.equals("")) {
			OLCAccessRule rule = new OLCAccessRule();
			rule.setAccessDNType("dn.subtree");
			rule.setAccessDN(olcAccessDN);
			rule.setAssignedDNType("group.exact");
			rule.setAssignedDN(groupDN);
			rule.setAccessType(accessType);
			return ldapService.addOLCAccessRule(rule);
		} else {
			return false;
		}
	}
	
	@RequestMapping(method=RequestMethod.POST ,value = "/deleteOLCAccessRule", produces = MediaType.APPLICATION_JSON_VALUE)
	public Boolean deleteOLCAccessRule(@RequestBody OLCAccessRule rule) 
	{
		ldapService.removeOLCAccessRuleWithParents(rule);
		return true;
	}

}