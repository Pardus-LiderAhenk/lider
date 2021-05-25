package tr.org.lider.messaging.messages;

import java.util.Map;

/**
 * Interface for User Session messages sent <b>from Lider to agents</b>.
 *
 * 
 */
public interface IUserSessionResponseMesssage extends ILiderMessage {

	/**
	 * 
	 * @return custom parameter map that can be used to execute indicated
	 *         'protocol'
	 */
	Map<String, Object> getParameterMap();

	String getUserName();

	void setUserName(String userName);

	

}
