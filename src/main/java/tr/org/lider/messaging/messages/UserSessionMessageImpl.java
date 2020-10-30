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
	
	private int memory;
	
	private int diskTotal;
	
	private int diskUsed;
	
	private int diskFree;
	
	private String osVersion;

	private Date timestamp;
	
	private String agentVersion;
	

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

	@Override
	public String getOsVersion() {
		return this.osVersion;
	}

	public void setOsVersion(String osVersion) {
		this.osVersion = osVersion;
	}

	@Override
	public int getDiskTotal() {
		return this.diskTotal;
	}

	@Override
	public int getDiskUsed() {
		return this.diskUsed;
	}

	@Override
	public int getDiskFree() {
		return this.diskFree;
	}

	public void setDiskTotal(int diskTotal) {
		this.diskTotal = diskTotal;
	}

	public void setDiskUsed(int diskUsed) {
		this.diskUsed = diskUsed;
	}

	public void setDiskFree(int diskFree) {
		this.diskFree = diskFree;
	}

	@Override
	public int getMemory() {
		return this.memory;
	}

	public void setMemory(int memory) {
		this.memory = memory;
	}
	
	@Override
	public String getAgentVersion() {
		return this.agentVersion;
	}

	public void setAgentVersion(String agentVersion) {
		this.agentVersion = agentVersion;
	}
	
}
