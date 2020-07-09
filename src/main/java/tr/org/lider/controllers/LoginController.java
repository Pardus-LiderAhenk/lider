package tr.org.lider.controllers;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
import tr.org.lider.services.ConfigurationService;

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
	LDAPServiceImpl ldapService;
	
	@RequestMapping(value = "/",method = {RequestMethod.GET, RequestMethod.POST})
	public String getMainPage(Model model, Authentication authentication) {
		try {
			LiderSecurityUserDetails userDetails = (LiderSecurityUserDetails) authentication.getPrincipal();
			logger.info("User logged as " + userDetails.getUsername());
			logger.info("User has authorities: " + userDetails.getAuthorities());
			model.addAttribute("user", userDetails);
			model.addAttribute("userName", userDetails.getLiderUser().getName());
			
			model.addAttribute("password", userDetails.getPassword());
			model.addAttribute("userNameJid", userDetails.getLiderUser().getName() + "@" + configurationService.getXmppServiceName());
			logger.info("User jid : " + userDetails.getLiderUser().getName() + "@" + configurationService.getXmppServiceName());
			model.addAttribute("xmppHost", configurationService.getXmppHost());
			model.addAttribute("roleNames", userDetails.getLiderUser().getRoles());
			logger.info("User roles : " + userDetails.getLiderUser().getRoles());
		} catch (Exception e) {
			e.printStackTrace();
		}
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
	public Boolean changeLanguage(@RequestParam String lang, Model model, Authentication authentication) throws LdapException {
		LiderSecurityUserDetails userDetails = (LiderSecurityUserDetails) authentication.getPrincipal();
		ldapService.updateEntryRemoveAttribute(userDetails.getLiderUser().getDn(), "preferredLanguage");
		ldapService.updateEntryAddAtribute(userDetails.getLiderUser().getDn(), "preferredLanguage", lang);
		return true;
	}
}
