package tr.org.lider.messaging.messages;

import java.util.Map;

import tr.org.lider.messaging.enums.ContentType;
import tr.org.lider.messaging.enums.StatusCode;


/**
 * Interface for policy status messages. This kind of message is sent after
 * policy execution.
 */
public interface IPolicyStatusMessage extends IAgentMessage {

	/**
	 * 
	 * @return
	 */
	String getPolicyVersion();

	/**
	 * 
	 * @return
	 */
	StatusCode getResponseCode();

	/**
	 * 
	 * @return
	 */
	String getResponseMessage();

	/**
	 * 
	 * @return
	 */
	Map<String, Object> getResponseData();

	/**
	 * 
	 * @return indicate content type of response data.
	 */
	ContentType getContentType();

	/**
	 * This identifier will be used to match incoming message to recorded
	 * command.
	 * 
	 * @return command execution ID
	 */
	Long getCommandExecutionId();

}
