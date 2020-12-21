package tr.org.lider.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.messaging.messages.SessionInfo;
import tr.org.lider.messaging.messages.XMPPPrebind;

/**
 * 
 * Create XMPPPrebind connection for client attach (Strophe ..vs)

 * @author M. Edip YILDIZ
 *
 */

@Service
public class XMPPPrebindService {
	
	Logger logger = LoggerFactory.getLogger(XMPPPrebindService.class);
	
	@Autowired
	private ConfigurationService configurationService;
	
	public SessionInfo getSession(String username, String password) {
		logger.info("Getting prebind sessionInfo for user {} ", username);
		XMPPPrebind xmppPrebind=null;
		try {
			xmppPrebind = new XMPPPrebind(configurationService.getXmppHost(), configurationService.getXmppServiceName(), "/bosh/","5280", configurationService.getXmppResource(),  false, true);
			
			xmppPrebind.connect(username,password);
	        xmppPrebind.auth();
		} catch (Exception e) {
			e.printStackTrace();
		}
       return xmppPrebind.getSessionInfo();
	}
	

}
