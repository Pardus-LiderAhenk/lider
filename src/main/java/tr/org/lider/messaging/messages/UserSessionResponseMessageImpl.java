package tr.org.lider.messaging.messages;

import java.util.Date;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import tr.org.lider.messaging.enums.LiderMessageType;

@JsonIgnoreProperties(ignoreUnknown = true, value = { "recipient" })
public class UserSessionResponseMessageImpl implements IUserSessionResponseMesssage {

	private static final long serialVersionUID = 3847747068843674068L;

	private LiderMessageType type = LiderMessageType.LOGIN_RESPONSE;

	private String recipient;
	
	private String userName;

	private Map<String, Object> parameterMap;

	private Date timestamp;

	public UserSessionResponseMessageImpl(String recipient, Map<String, Object> parameterMap,String userName,
			Date timestamp) {
		this.recipient = recipient;
		this.parameterMap = parameterMap;
		this.timestamp = timestamp;
		this.userName= userName;
	}

	@Override
	public LiderMessageType getType() {
		return type;
	}

	public void setType(LiderMessageType type) {
		this.type = type;
	}

	@Override
	public String getRecipient() {
		return recipient;
	}

	public void setRecipient(String recipient) {
		this.recipient = recipient;
	}

	@Override
	public Map<String, Object> getParameterMap() {
		return parameterMap;
	}

	public void setParameterMap(Map<String, Object> parameterMap) {
		this.parameterMap = parameterMap;
	}

	
	@Override
	public Date getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}

	@Override
	public String toString() {
		return "UserSessionResponseMessageImpl [type=" + type + ", recipient=" + recipient + ", parameterMap="
				+ parameterMap + ", timestamp=" + timestamp + "]";
	}
	
	@Override
	public String getUserName() {
		return userName;
	}
	
	@Override
	public void setUserName(String userName) {
		this.userName = userName;
	}

}
