package tr.org.lider.messaging.subscribers;

import tr.org.lider.messaging.messages.IPolicyStatusMessage;

/**
 * Message consumer interface, any bundle - exposing an implementation of this
 * interface as a service - will be notified of messages received by underlying
 * messaging system.
 */
public interface IPolicyStatusSubscriber {

	/**
	 * 
	 * @param message
	 * @throws Exception 
	 */
	void messageReceived(IPolicyStatusMessage message) throws Exception;

}
