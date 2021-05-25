package tr.org.lider.messaging.listeners;

import java.text.SimpleDateFormat;
import java.util.regex.Pattern;

import org.jivesoftware.smack.SmackException.NotConnectedException;
import org.jivesoftware.smack.StanzaListener;
import org.jivesoftware.smack.filter.StanzaFilter;
import org.jivesoftware.smack.packet.Message;
import org.jivesoftware.smack.packet.Stanza;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.messaging.messages.ILiderMessage;
import tr.org.lider.messaging.messages.UserSessionMessageImpl;
import tr.org.lider.messaging.messages.XMPPClientImpl;
import tr.org.lider.messaging.subscribers.IUserSessionSubscriber;

/**
 * User session listener is responsible for logging user login and logout
 * events.
 */
public class UserSessionListener implements StanzaListener, StanzaFilter {

	private static Logger logger = LoggerFactory.getLogger(UserSessionListener.class);

	/**
	 * Pattern used to filter messages
	 */
	private static final Pattern messagePattern = Pattern.compile(".*\\\"type\\\"\\s*:\\s*\\\"LOG(IN|OUT)\\\".*",
			Pattern.CASE_INSENSITIVE);

	/**
	 * Message subscriber
	 */
	private IUserSessionSubscriber subscriber;
	
	private XMPPClientImpl client;
	
	
	
	 public UserSessionListener(XMPPClientImpl client) {
		 this.client = client;
	}
	

	@Override
	public boolean accept(Stanza stanza) {
		if (stanza instanceof Message) {
			Message msg = (Message) stanza;
			// All messages from agents are type normal
			// Message body must contain one of these strings => "type":
			// "LOGIN" or "type": "LOGOUT"
			if (Message.Type.normal.equals(msg.getType()) && messagePattern.matcher(msg.getBody()).matches()) {
				return true;
			}
		}
		return false;
	}

	@Override
	public void processPacket(Stanza packet) throws NotConnectedException {
		try {
			if (packet instanceof Message) {

				Message msg = (Message) packet;
				logger.info("Register message received from => {}, body => {}", msg.getFrom(), msg.getBody());

				ObjectMapper mapper = new ObjectMapper();
				mapper.setDateFormat(new SimpleDateFormat("dd-MM-yyyy HH:mm"));

				// Construct message
				UserSessionMessageImpl message = mapper.readValue(msg.getBody(), UserSessionMessageImpl.class);
				message.setFrom(msg.getFrom());

				if (subscriber != null) {
					ILiderMessage  responseMessage = subscriber.messageReceived(message);
					
					if (responseMessage != null) {
						client.sendMessage(new ObjectMapper().writeValueAsString(responseMessage), msg.getFrom());
					}
					
					logger.debug("Notified subscriber => {}", subscriber);
				}

			}
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}
	}

	/**
	 * 
	 * @param subscriber
	 */
	public void setSubscriber(IUserSessionSubscriber subscriber) {
		this.subscriber = subscriber;
	}

}
