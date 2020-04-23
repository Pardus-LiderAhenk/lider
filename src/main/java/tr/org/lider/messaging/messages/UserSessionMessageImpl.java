package tr.org.lider.messaging.messages;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import tr.org.lider.messaging.enums.AgentMessageType;

/**
 * Default implementation for {@link IUserSessionMessage}
 *
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserSessionMessageImpl implements IUserSessionMessage {

	private static final long serialVersionUID = -5432714879052699027L;

	private AgentMessageType type;

	private String from;

	private String username;

	private String ipAddresses;
	
	private String hostname;
	
	private String userIp; // for ltsp user sessions

	private Date timestamp;
	

	@Override
	public AgentMessageType getType() {
		return type;
	}

	public void setType(AgentMessageType type) {
		this.type = type;
	}

	@Override
	public String getFrom() {
		return from;
	}

	public void setFrom(String from) {
		this.from = from;
	}

	@Override
	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	@Override
	public String getIpAddresses() {
		return ipAddresses;
	}

	public void setIpAddresses(String ipAddresses) {
		this.ipAddresses = ipAddresses;
	}

	@Override
	public Date getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}

	public void setUserIp(String userIp) {
		this.userIp = userIp;
	}

	public String getUserIp() {
		return userIp;
	}

	public String getHostname() {
		return hostname;
	}

	public void setHostname(String hostname) {
		this.hostname = hostname;
	}

}
