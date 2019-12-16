package tr.org.lider.controllers;

import javax.servlet.ServletContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import tr.org.lider.LiderSecurityUserDetails;
import tr.org.lider.constant.LiderConstants;
import tr.org.lider.services.ConfigurationService;
import tr.org.lider.services.LoginService;

/**
 * 
 * @author M. Edip YILDIZ
 */
@RestController()
public class LoginController {
	
	Logger logger = LoggerFactory.getLogger(LoginController.class);

	@Autowired
	public LoginService loginService;
	
	@Autowired
	public ServletContext servletContext;
	
	@Autowired
	private ConfigurationService configService;

	@RequestMapping(value = "/")
	public ModelAndView login(Model model, Authentication authentication) {

		ModelAndView modelAndView = new ModelAndView();
		try {

			LiderSecurityUserDetails userDetails = (LiderSecurityUserDetails) authentication.getPrincipal();
			
			logger.info("User logged as " + userDetails.getAuthorities());
			logger.info("User has authorities: " + userDetails.getAuthorities());
			
			modelAndView.setViewName(LiderConstants.Pages.PAGES_MAIN_PAGE);
			modelAndView.addObject("user", userDetails);
			modelAndView.addObject("password", userDetails.getPassword());
			modelAndView.addObject("userNameJid", userDetails.getLiderUser().getName() + "@" + configService.getXmppServiceName());
			modelAndView.addObject("xmppHost", configService.getXmppHost());
		} catch (Exception e) {
			e.printStackTrace();
		}

		return modelAndView;
	}
	
	@RequestMapping(value = "/logout")
	public ModelAndView logout(Model model, Authentication authentication) {
		
		ModelAndView modelAndView = new ModelAndView();
		try {
			modelAndView.setViewName("logout");
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		return modelAndView;
	}
	
	

}
