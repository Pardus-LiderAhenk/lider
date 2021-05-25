
package tr.org.lider.messaging.messages;

/**
 * IUserSessionMessage is used to notify the system for user login & logout
 * events.
 *
 */
public interface IUserSessionMessage extends IAgentMessage {

	/**
	 * 
	 * @return user name
	 */
	String getUsername();

	/**
	 * (Optional)
	 * 
	 * @return comma-separated IP addresses
	 */
	String getIpAddresses();
	
	String getUserIp();
	
	String getHostname();
	
	int getMemory();
	
	int getDiskTotal();
	
	int getDiskUsed();
	
	int getDiskFree();
	
	String getOsVersion();
	
	String getAgentVersion();

}
