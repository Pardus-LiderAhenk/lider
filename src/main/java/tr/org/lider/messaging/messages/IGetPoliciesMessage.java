package tr.org.lider.messaging.messages;

import java.util.Map;

/**
 * IGetPoliciesMessage is used to retrieve latest policy of an agent and latest
 * policy of a user.
 */
public interface IGetPoliciesMessage extends IAgentMessage {

	/**
	 * 
	 * @return
	 */
	String getUsername();

	/**
	 * 
	 * @return
	 */
	String getUserPolicyVersion();

	/**
	 * 
	 * @return
	 */
	String getAgentPolicyVersion();
	
	
	Map<String, String[]> getPolicyList();

}
