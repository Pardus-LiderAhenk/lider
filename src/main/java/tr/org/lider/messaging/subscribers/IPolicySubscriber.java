package tr.org.lider.messaging.subscribers;

import tr.org.lider.messaging.messages.IExecutePoliciesMessage;
import tr.org.lider.messaging.messages.IGetPoliciesMessage;

/**
 * Policies interface, any bundle - exposing an implementation of this interface
 * as a service - will be notified of messages received by underlying messaging
 * system.
 *
 */
public interface IPolicySubscriber {

	/**
	 * Handle machine and user policies that need to be executed
	 * @param message
	 * @return
	 * @throws Exception
	 */
	IExecutePoliciesMessage messageReceived(IGetPoliciesMessage message) throws Exception;

}
