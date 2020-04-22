package tr.org.lider.controllers;

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
			model.addAttribute("roleNames", userDetails.getLiderUser().getRoles());
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
		
//		LdapConnectionConfig lconfig = new LdapConnectionConfig();
//		lconfig.setLdapHost(configurationService.getLdapServer());
//		lconfig.setLdapPort(Integer.parseInt(configurationService.getLdapPort()));
//		lconfig.setName("cn=admin,cn=config");
//		lconfig.setCredentials(configurationService.getLdapPassword());
//		lconfig.setUseSsl(false);
//
//		 LdapConnectionPool pool;
//		// Create connection pool
//		PoolableLdapConnectionFactory factory = new PoolableLdapConnectionFactory(lconfig);
//		pool = new LdapConnectionPool(factory);
//		pool.setTestOnBorrow(true);
//		pool.setMaxActive(-1);
//		pool.setMaxWait(3000);
//		pool.setWhenExhaustedAction(GenericObjectPool.WHEN_EXHAUSTED_BLOCK);
//		logger.debug(this.toString());
//		
//		
//		try {
//			LdapConnection connection = null;
//			connection = pool.getConnection();
//			Entry entry = null;
//			try {
//				entry = connection.lookup("olcDatabase={1}mdb,cn=config");
//				if (entry != null) {
//
//					for (Attribute a : entry.getAttributes()) {
//						if (a.contains(value)) {
//							a.remove(value);
//						}
//					}
//				}
//				entry.add(, values);
//				System.err.println("entry geldi");
//			} catch (org.apache.directory.api.ldap.model.exception.LdapException e) {
//				logger.error(e.getMessage(), e);
//				throw new LdapException(e);
//			}
//			System.err.println("connected");
//		} catch (Exception e) {
//			System.err.println(" not connected");
//			// TODO: handle exception
//		}
		if(configurationService.isConfigurationDone()) {
			return "login";
		} else {
			return "config";
		}
	}
}
