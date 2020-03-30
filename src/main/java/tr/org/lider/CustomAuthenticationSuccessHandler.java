package tr.org.lider;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import tr.org.lider.messaging.messages.XMPPClientImpl;

/**
 * Handler for setting up XMPP Service and start it after successfull login.
 * 
 * @author <a href="mailto:hasan.kara@pardus.org.tr">Hasan Kara</a>
 * 
 */

@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

	Logger logger = LoggerFactory.getLogger(CustomAuthenticationSuccessHandler.class);
	
	@Autowired
	private XMPPClientImpl xmppClientImpl;

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {
		try {
			xmppClientImpl.initXMPPClient();
		} catch (Exception e) {
			e.printStackTrace();
			logger.error("Error occured during initialization of XMPP parameters.");
		}
		response.sendRedirect("/");
	}
}
