package tr.org.lider.controllers;

import javax.servlet.ServletContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import tr.org.lider.LiderSecurityUserDetails;
import tr.org.lider.constant.LiderConstants;
import tr.org.lider.services.ConfigService;
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
	private ConfigService configService;
	
	@RequestMapping(value = "/",method = {RequestMethod.GET, RequestMethod.POST})
	public String getMainPage(Model model, Authentication authentication) {
		try {
			LiderSecurityUserDetails userDetails = (LiderSecurityUserDetails) authentication.getPrincipal();
			logger.info("User logged as " + userDetails.getAuthorities());
			logger.info("User has authorities: " + userDetails.getAuthorities());
			
			model.addAttribute("user", userDetails);
			model.addAttribute("password", userDetails.getPassword());
			model.addAttribute("userNameJid", userDetails.getLiderUser().getName() + "@" + configurationService.getXmppServiceName());
			model.addAttribute("xmppHost", configurationService.getXmppHost());
		} catch (Exception e) {
			e.printStackTrace();
		}
		return LiderConstants.Pages.PAGES_MAIN_PAGE;
	}
	
	@RequestMapping(value = "/logout")
	public String logout(Model model, Authentication authentication) {
		return "login";
	}
	
	@RequestMapping(value = "/login")
	public String login(Model model, Authentication authentication) {
		if(configService.isConfigurationDone()) {
//			try {
//				ObjectMapper mapper = new ObjectMapper();
//				ConfigParams c = mapper.readValue(configService.findByName("liderConfigParams").get().getValue(), ConfigParams.class);
//				System.err.println(c.getLdapRootDn());
//			} catch (JsonProcessingException e) {
//				// TODO Auto-generated catch block
//				e.printStackTrace();
//			}
			return "login";
		} else {
			return "config";
		}
	}

}
