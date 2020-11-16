package tr.org.lider.controllers;

import java.util.List;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.BuildProperties;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import tr.org.lider.LiderSecurityUserDetails;
import tr.org.lider.constant.LiderConstants;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.messaging.messages.SessionInfo;
import tr.org.lider.services.CommandService;
import tr.org.lider.services.ConfigurationService;
import tr.org.lider.services.XMPPPrebindService;

/**
 * 
 * @author M. Edip YILDIZ
 */
@Controller
public class LoginController {
	
	Logger logger = LoggerFactory.getLogger(LoginController.class);
	
	@Autowired
	private ConfigurationService configurationService;
	
	@Autowired
	private LDAPServiceImpl ldapService;
	
	@Autowired
	private CommandService commandService;
	
	@Autowired
	private BuildProperties buildProperties;

	@Autowired
	private XMPPPrebindService xmppPrebindService;
	
	
	@RequestMapping(value = "/",method = {RequestMethod.GET, RequestMethod.POST})
	public String getMainPage(Model model, Authentication authentication) {
		try {
			LiderSecurityUserDetails userDetails = (LiderSecurityUserDetails) authentication.getPrincipal();
			logger.info("User logged as ldap dn " + userDetails.getLiderUser().getDn());
			logger.info("User has authorities: " + userDetails.getAuthorities());
			model.addAttribute("user", userDetails);
			model.addAttribute("userName", userDetails.getLiderUser().getName());
			
			model.addAttribute("password", userDetails.getPassword());
			model.addAttribute("userNameJid", userDetails.getLiderUser().getName() + "@" + configurationService.getXmppServiceName());
			logger.info("User jid : " + userDetails.getLiderUser().getName() + "@" + configurationService.getXmppServiceName());
			model.addAttribute("xmppHost", configurationService.getXmppHost());
			model.addAttribute("roleNames", userDetails.getLiderUser().getRoles());
			logger.info("User roles : " + userDetails.getLiderUser().getRoles());
			
			String version=buildProperties.getVersion();
			model.addAttribute("liderVersion", version);
			
			SessionInfo sessionInfo= xmppPrebindService.getSession(userDetails.getLiderUser().getName(), userDetails.getLiderUser().getPassword());
		    model.addAttribute("SID", sessionInfo.getSid());
		    model.addAttribute("RID", sessionInfo.getRid());
		    model.addAttribute("JID", sessionInfo.getJid());
		    logger.info("Getting prebind sessionInfo SID {} RID {} JID {} ", sessionInfo.getSid(),sessionInfo.getRid(),sessionInfo.getJid());
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		//get count of users
		int countOfLDAPUsers = 0;
		int countOfComputers = 0;
		try {
			List<LdapEntry> ldapUserList = ldapService.findSubEntries(configurationService.getLdapRootDn(), 
					"(objectclass=pardusAccount)", new String[] { "*" }, SearchScope.SUBTREE);
			List<LdapEntry> ldapComputerList = ldapService.findSubEntries(configurationService.getLdapRootDn(), 
					"(objectclass=pardusDevice)", new String[] { "*" }, SearchScope.SUBTREE);
			countOfLDAPUsers = ldapUserList.size();
			countOfComputers = ldapComputerList.size();
		} catch (LdapException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		model.addAttribute("totalUserNumber", countOfLDAPUsers);
		model.addAttribute("totalComputerNumber", countOfComputers);
		
		//sent task total number
		model.addAttribute("totalSentTaskNumber", commandService.getTotalCountOfSentTasks());
		return LiderConstants.Pages.MAIN_PAGE;
	}
	
	@RequestMapping(value = "/logout")
	public String logout(Model model, Authentication authentication) {
		return "login";
	}
	
	@RequestMapping(value = "/login")
	public String login(Model model, Authentication authentication) {
		if(configurationService.isConfigurationDone()) {
			return "login";
		} else {
			return "config";
		}
	}
	
	@RequestMapping(value = "/changeLanguage", method = {RequestMethod.POST})
	@ResponseBody
	public Boolean changeLanguage(@RequestParam String langa1799b6ac27611eab3de0242ac130004, Model model, Authentication authentication) throws LdapException {
		LiderSecurityUserDetails userDetails = (LiderSecurityUserDetails) authentication.getPrincipal();
		ldapService.updateEntryRemoveAttribute(userDetails.getLiderUser().getDn(), "preferredLanguage");
		ldapService.updateEntryAddAtribute(userDetails.getLiderUser().getDn(), "preferredLanguage", langa1799b6ac27611eab3de0242ac130004);
		return true;
	}
}