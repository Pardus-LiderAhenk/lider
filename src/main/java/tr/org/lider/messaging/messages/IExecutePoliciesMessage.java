package tr.org.lider.messaging.messages;

import java.util.Date;
import java.util.List;

import tr.org.lider.entities.ProfileImpl;

/**
 * Interface for execute policy messages sent <b>from Lider to agents</b>.
 *
 */
public interface IExecutePoliciesMessage extends ILiderMessage {

	/**
	 * 
	 * @return
	 */
	String getUsername();

	/**
	 * 
	 * @return
	 */
	List<ProfileImpl> getUserPolicyProfiles();

	/**
	 * 
	 * @return
	 */
	String getUserPolicyVersion();

	/**
	 * 
	 * @return
	 */
	Long getUserCommandExecutionId();

	/**
	 * 
	 * @return
	 */
	List<ProfileImpl> getAgentPolicyProfiles();

	/**
	 * 
	 * @return
	 */
	Long getAgentCommandExecutionId();

	/**
	 * 
	 * @return
	 */
	String getAgentPolicyVersion();

	/**
	 * Optional parameter for file transfer. (If a plugin uses file transfer,
	 * which can be determined by {@link IPluginInfo} implementation, this
	 * optional parameter will be set before sending EXECUTE_TASK /
	 * EXECUTE_POLICY messages to agents)
	 * 
	 * @return configuration required to transfer file.
	 */
	FileServerConf getFileServerConf();

	Date getUserPolicyExpirationDate();

	Date getAgentPolicyExpirationDate();

}
