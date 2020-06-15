package tr.org.lider.messaging.messages;

import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import tr.org.lider.entities.ProfileImpl;
import tr.org.lider.messaging.enums.LiderMessageType;

@JsonIgnoreProperties(ignoreUnknown = true, value = { "recipient" })
public class ExecutePolicyImpl {
	private LiderMessageType type = LiderMessageType.EXECUTE_POLICY;
	
	private String recipient;
	
	private Date timestamp;
	
	private String username;

	private Long policyID;
	
	private List<ProfileImpl> userPolicyProfiles;

	private String userPolicyVersion;

	private Long userCommandExecutionId;

	private Date userPolicyExpirationDate;

	private List<ProfileImpl> agentPolicyProfiles;

	private String agentPolicyVersion;

	private Long agentCommandExecutionId;

	private Date agentPolicyExpirationDate;

	private FileServerConf fileServerConf;

	public ExecutePolicyImpl() {
		super();
	}

	public ExecutePolicyImpl(String recipient, Date timestamp, String username,
			Long policyID, List<ProfileImpl> userPolicyProfiles, 
			String userPolicyVersion, Long userCommandExecutionId,
			Date userPolicyExpirationDate, List<ProfileImpl> agentPolicyProfiles, String agentPolicyVersion,
			Long agentCommandExecutionId, Date agentPolicyExpirationDate, FileServerConf fileServerConf) {
		super();
		this.recipient = recipient;
		this.timestamp = timestamp;
		this.username = username;
		this.policyID = policyID;
		this.userPolicyProfiles = userPolicyProfiles;
		this.userPolicyVersion = userPolicyVersion;
		this.userCommandExecutionId = userCommandExecutionId;
		this.userPolicyExpirationDate = userPolicyExpirationDate;
		this.agentPolicyProfiles = agentPolicyProfiles;
		this.agentPolicyVersion = agentPolicyVersion;
		this.agentCommandExecutionId = agentCommandExecutionId;
		this.agentPolicyExpirationDate = agentPolicyExpirationDate;
		this.fileServerConf = fileServerConf;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public List<ProfileImpl> getUserPolicyProfiles() {
		return userPolicyProfiles;
	}

	public void setUserPolicyProfiles(List<ProfileImpl> userPolicyProfiles) {
		this.userPolicyProfiles = userPolicyProfiles;
	}

	public String getUserPolicyVersion() {
		return userPolicyVersion;
	}

	public void setUserPolicyVersion(String userPolicyVersion) {
		this.userPolicyVersion = userPolicyVersion;
	}

	public Long getUserCommandExecutionId() {
		return userCommandExecutionId;
	}

	public void setUserCommandExecutionId(Long userCommandExecutionId) {
		this.userCommandExecutionId = userCommandExecutionId;
	}

	public Date getUserPolicyExpirationDate() {
		return userPolicyExpirationDate;
	}

	public void setUserPolicyExpirationDate(Date userPolicyExpirationDate) {
		this.userPolicyExpirationDate = userPolicyExpirationDate;
	}

	public List<ProfileImpl> getAgentPolicyProfiles() {
		return agentPolicyProfiles;
	}

	public void setAgentPolicyProfiles(List<ProfileImpl> agentPolicyProfiles) {
		this.agentPolicyProfiles = agentPolicyProfiles;
	}

	public String getAgentPolicyVersion() {
		return agentPolicyVersion;
	}

	public void setAgentPolicyVersion(String agentPolicyVersion) {
		this.agentPolicyVersion = agentPolicyVersion;
	}

	public Long getAgentCommandExecutionId() {
		return agentCommandExecutionId;
	}

	public void setAgentCommandExecutionId(Long agentCommandExecutionId) {
		this.agentCommandExecutionId = agentCommandExecutionId;
	}

	public Date getAgentPolicyExpirationDate() {
		return agentPolicyExpirationDate;
	}

	public void setAgentPolicyExpirationDate(Date agentPolicyExpirationDate) {
		this.agentPolicyExpirationDate = agentPolicyExpirationDate;
	}

	public FileServerConf getFileServerConf() {
		return fileServerConf;
	}

	public void setFileServerConf(FileServerConf fileServerConf) {
		this.fileServerConf = fileServerConf;
	}

	public LiderMessageType getType() {
		return type;
	}

	public void setType(LiderMessageType type) {
		this.type = type;
	}

	public String getRecipient() {
		return recipient;
	}

	public void setRecipient(String recipient) {
		this.recipient = recipient;
	}

	public Date getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}

	public Long getPolicyID() {
		return policyID;
	}

	public void setPolicyID(Long policyID) {
		this.policyID = policyID;
	}
	
}
