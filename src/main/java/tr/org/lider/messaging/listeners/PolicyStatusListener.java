package tr.org.lider.messaging.listeners;

import java.text.SimpleDateFormat;
import java.util.List;
import java.util.regex.Pattern;

import org.jivesoftware.smack.SmackException.NotConnectedException;
import org.jivesoftware.smack.StanzaListener;
import org.jivesoftware.smack.filter.StanzaFilter;
import org.jivesoftware.smack.packet.Message;
import org.jivesoftware.smack.packet.Stanza;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.messaging.messages.PolicyStatusMessageImpl;
import tr.org.lider.messaging.subscribers.IPolicyStatusSubscriber;

/**
 * Listens to policy status messages
 *
 */
public class PolicyStatusListener implements StanzaListener, StanzaFilter {

	private static Logger logger = LoggerFactory.getLogger(PolicyStatusListener.class);

	/**
	 * Pattern used to filter messages
	 */
	private static final Pattern messagePattern = Pattern.compile(".*\\\"type\\\"\\s*:\\s*\\\"POLICY_STATUS\\\".*",
			Pattern.CASE_INSENSITIVE);

	/**
	 * Message subscribers
	 */
	private List<IPolicyStatusSubscriber> subscribers;

	@Override
	public boolean accept(Stanza stanza) {
		if (stanza instanceof Message) {
			Message msg = (Message) stanza;
			// All messages from agents are type normal
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
				logger.info("Policy status update message received from => {}, body => {}", msg.getFrom(),
						msg.getBody());

				ObjectMapper mapper = new ObjectMapper();
				mapper.setDateFormat(new SimpleDateFormat("dd-MM-yyyy HH:mm"));

				PolicyStatusMessageImpl message = mapper.readValue(msg.getBody(), PolicyStatusMessageImpl.class);
				message.setFrom(msg.getFrom());

				for (IPolicyStatusSubscriber subscriber : subscribers) {
					try {
						subscriber.messageReceived(message);
					} catch (Exception e) {
						logger.error("Subscriber could not handle message: ", e);
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
	 * @param subscribers
	 */
	public void setSubscribers(List<IPolicyStatusSubscriber> subscribers) {
		this.subscribers = subscribers;
	}

}
