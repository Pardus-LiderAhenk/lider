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

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import tr.org.lider.messaging.enums.LiderMessageType;

/**
 * Default implementation for {@link IExecutePoliciesMessage}. This message is
 * sent <b>from Lider to agent</b> in order to execute specified policies. As a
 * response {@link PolicyStatusMessageImpl} will be returned.
 * 
 */
@JsonIgnoreProperties(ignoreUnknown = true, value = { "recipient" })
public class ExecutePoliciesMessageImpl implements IExecutePoliciesMessage {

	private static final long serialVersionUID = 8283628510292186821L;

	private LiderMessageType type = LiderMessageType.EXECUTE_POLICY;
	private String recipient;
	private Date timestamp;
	private String username;
	private List<ExecutePolicyImpl> executePolicyList = new ArrayList<ExecutePolicyImpl>();
	
	public ExecutePoliciesMessageImpl() {
		super();
	}

	public ExecutePoliciesMessageImpl(LiderMessageType type, String recipient, Date timestamp, String username,
			List<ExecutePolicyImpl> executePolicyList) {
		super();
		this.type = type;
		this.recipient = recipient;
		this.timestamp = timestamp;
		this.username = username;
		this.executePolicyList = executePolicyList;
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
	public Date getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}

	@Override
	public List<ExecutePolicyImpl> getExecutePolicyList() {
		return this.executePolicyList;
	}

	public void setExecutePolicyList(List<ExecutePolicyImpl> executePolicyList) {
		this.executePolicyList = executePolicyList;
	}

	@Override
	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}
	
}
