package tr.org.lider;

import java.io.IOException;
import java.util.Locale;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.savedrequest.SavedRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;
import org.springframework.web.util.WebUtils;

import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.services.ConfigurationService;

/**
 * Handler for setting up XMPP Service and start it after successful login.
 * 
 * @author <a href="mailto:hasan.kara@pardus.org.tr">Hasan Kara</a>
 * 
 */

@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

	Logger logger = LoggerFactory.getLogger(CustomAuthenticationSuccessHandler.class);
	
	@Autowired
	private ConfigurationService configurationService;
	
	@Autowired
	private LDAPServiceImpl ldapService;
	
	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {
		configurationService.destroyConfigParams();

		try {
			LiderSecurityUserDetails userDetails = (LiderSecurityUserDetails) authentication.getPrincipal();
			String preferredLanguage = ldapService.getPreferredLanguage(userDetails.getLiderUser().getDn());
			Locale locale = new Locale(preferredLanguage);
			WebUtils.setSessionAttribute(request,SessionLocaleResolver.LOCALE_SESSION_ATTRIBUTE_NAME,locale);
		} catch (LdapException e) {
			e.printStackTrace();
			Locale locale = new Locale("tr");
			WebUtils.setSessionAttribute(request,SessionLocaleResolver.LOCALE_SESSION_ATTRIBUTE_NAME,locale);
		}
		HttpSession session = request.getSession();
	    SavedRequest savedRequest = (SavedRequest) session.getAttribute("SPRING_SECURITY_SAVED_REQUEST");

	    if(savedRequest != null) {
	        response.sendRedirect(savedRequest.getRedirectUrl());
	    } else {
	    	response.sendRedirect("/");
	    }
		
	}
}
