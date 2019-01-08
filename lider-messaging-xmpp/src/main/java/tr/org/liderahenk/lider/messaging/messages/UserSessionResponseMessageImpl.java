/*
*
*    Copyright © 2015-2016 Tübitak ULAKBIM
*
*    This file is part of Lider Ahenk.
*
*    Lider Ahenk is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    Lider Ahenk is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with Lider Ahenk.  If not, see <http://www.gnu.org/licenses/>.
*/
package tr.org.liderahenk.lider.messaging.messages;

import java.util.Date;
import java.util.Map;

import org.codehaus.jackson.annotate.JsonIgnoreProperties;

import tr.org.liderahenk.lider.core.api.messaging.enums.LiderMessageType;
import tr.org.liderahenk.lider.core.api.messaging.messages.IResponseAgreementMessage;
import tr.org.liderahenk.lider.core.api.messaging.messages.IUserSessionResponseMesssage;

/**
 * Default implementation for {@link IResponseAgreementMessage}
 * 
 */

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
