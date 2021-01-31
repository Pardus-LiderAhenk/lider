package tr.org.lider.entities;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonFormat;


/**
 * 
 */
@Entity
@Table(name = "C_OPERATION_LOG")
public class OperationLogImpl implements Serializable {

	private static final long serialVersionUID = -241241606291513291L;

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "ID", unique = true, nullable = false)
	private Long id;

	@Column(name = "USER_ID")
	private String userId;

	@Column(name = "OPERATION_TYPE", length = 1)
	private Integer operationType;

	@Column(name = "TASK_ID")
	private Long taskId;

	@Column(name = "POLICY_ID")
	private Long policyId;

	@Column(name = "PROFILE_ID")
	private Long profileId;

	@Column(name = "LOG_MESSAGE", nullable = false)
	private String logMessage;

	@Lob
	@Column(name = "REQUEST_DATA")
	private byte[] requestData;

	@Column(name = "REQUEST_IP")
	private String requestIp;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATE_DATE", nullable = false)
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss", timezone="Europe/Istanbul")
	private Date createDate;
	
	@Transient
	private String requestDataStr;

	public OperationLogImpl() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public OperationType getCrudType() {
		return OperationType.getType(operationType);
	}

	public void setCrudType(OperationType operationType) {
		if (operationType == null) {
			this.operationType = null;
		} else {
			this.operationType = operationType.getId();
		}
	}

	public Long getTaskId() {
		return taskId;
	}

	public void setTaskId(Long taskId) {
		this.taskId = taskId;
	}

	public Long getPolicyId() {
		return policyId;
	}

	public void setPolicyId(Long policyId) {
		this.policyId = policyId;
	}

	public Long getProfileId() {
		return profileId;
	}

	public void setProfileId(Long profileId) {
		this.profileId = profileId;
	}

	public String getLogMessage() {
		return logMessage;
	}

	public void setLogMessage(String logMessage) {
		this.logMessage = logMessage;
	}

	public byte[] getRequestData() {
		return requestData;
	}

	public void setRequestData(byte[] requestData) {
		this.requestData = requestData;
	}

	public String getRequestIp() {
		return requestIp;
	}

	public void setRequestIp(String requestIp) {
		this.requestIp = requestIp;
	}

	public Date getCreateDate() {
		return createDate;
	}

	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}

	public String getrequestDataStr() {
		return requestDataStr;
	}

	public void setRequestDataStr(String responseDataStr) {
		this.requestDataStr = responseDataStr;
	}
}
