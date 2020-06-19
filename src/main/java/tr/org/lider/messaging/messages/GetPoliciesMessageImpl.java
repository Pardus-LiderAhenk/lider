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
package tr.org.lider.messaging.messages;

import java.util.Date;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import tr.org.lider.messaging.enums.AgentMessageType;


/**
 * Default implementation for {@link IGetPoliciesMessage}
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class GetPoliciesMessageImpl implements IGetPoliciesMessage {

	private static final long serialVersionUID = -1867891171608060994L;

	private AgentMessageType type;

	private String from;

	private String username;

	private String userPolicyVersion;

	private String agentPolicyVersion;

	private Date timestamp;
	
	private Map<String, String[]> policyList;

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
	public String getUserPolicyVersion() {
		return userPolicyVersion;
	}

	public void setUserPolicyVersion(String userPolicyVersion) {
		this.userPolicyVersion = userPolicyVersion;
	}

	@Override
	public String getAgentPolicyVersion() {
		return agentPolicyVersion;
	}

	public void setAgentPolicyVersion(String agentPolicyVersion) {
		this.agentPolicyVersion = agentPolicyVersion;
	}

	@Override
	public Date getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}

	@Override
	public Map<String, String[]> getPolicyList() {
		return policyList;
	}

	public void setPolicyList(Map<String, String[]> policyList) {
		this.policyList = policyList;
	}
	

}
