package tr.org.lider.messaging.subscribers;

import tr.org.lider.messaging.messages.ILiderMessage;
import tr.org.lider.messaging.messages.IUserSessionMessage;

/**
 * User session interface, any bundle - exposing an implementation of this
 * interface as a service - will be notified of messages received by underlying
 * messaging system.
 *
 */
public interface IUserSessionSubscriber {

	/**
	 * Handle user login/logout events.
	 * 
	 * @param message
	 * @return
	 * @throws Exception
	 * 
	 */
	ILiderMessage messageReceived(IUserSessionMessage message) throws Exception;

}
