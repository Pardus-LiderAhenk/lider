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

import java.io.Serializable;
import java.util.Date;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import tr.org.lider.messaging.enums.AgentMessageType;

/**
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class RegistrationMessageImpl implements Serializable {

	private static final long serialVersionUID = -7391747508878706457L;

	private AgentMessageType type;

	private String from;

	private String password;

	private String hostname;

	private String ipAddresses;

	private String macAddresses;
	
	private String userName;
	
	private String userPassword;

	private Map<String, Object> data;
	
	private String directoryServer;

	private Date timestamp;

	
	public AgentMessageType getType() {
		return type;
	}

	public void setType(AgentMessageType type) {
		this.type = type;
	}

	
	public String getFrom() {
		return from;
	}

	public void setFrom(String from) {
		this.from = from;
	}

	
	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	
	public String getHostname() {
		return hostname;
	}

	public void setHostname(String hostname) {
		this.hostname = hostname;
	}

	
	public String getIpAddresses() {
		return ipAddresses;
	}

	public void setIpAddresses(String ipAddresses) {
		this.ipAddresses = ipAddresses;
	}

	
	public String getMacAddresses() {
		return macAddresses;
	}

	public void setMacAddresses(String macAddresses) {
		this.macAddresses = macAddresses;
	}

	
	public Map<String, Object> getData() {
		return data;
	}

	public void setData(Map<String, Object> data) {
		this.data = data;
	}

	
	public Date getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getUserPassword() {
		return userPassword;
	}

	public void setUserPassword(String userPassword) {
		this.userPassword = userPassword;
	}

	public String getDirectoryServer() {
		return directoryServer;
	}

	public void setDirectoryServer(String directoryServer) {
		this.directoryServer = directoryServer;
	}

}
