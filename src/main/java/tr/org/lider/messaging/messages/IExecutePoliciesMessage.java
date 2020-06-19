package tr.org.lider.messaging.messages;

import java.util.List;

/**
 * Interface for execute policy messages sent <b>from Lider to agents</b>.
 *
 */
public interface IExecutePoliciesMessage extends ILiderMessage {

	/**
	 * 
	 * @return
	 */
	List<ExecutePolicyImpl> getExecutePolicyList();
	
	String getUsername();

}
