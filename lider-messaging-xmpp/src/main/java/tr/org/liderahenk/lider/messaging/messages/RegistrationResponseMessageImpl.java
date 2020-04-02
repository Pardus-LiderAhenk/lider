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

import org.codehaus.jackson.annotate.JsonIgnoreProperties;

import tr.org.liderahenk.lider.core.api.messaging.enums.LiderMessageType;
import tr.org.liderahenk.lider.core.api.messaging.enums.StatusCode;
import tr.org.liderahenk.lider.core.api.messaging.messages.IRegistrationResponseMessage;
import tr.org.liderahenk.lider.core.api.messaging.subscribers.IRegistrationSubscriber;

/**
 * Registration information returned from {@link IRegistrationSubscriber}.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 *
 */
@JsonIgnoreProperties(ignoreUnknown = true, value = { "recipient" })
public class RegistrationResponseMessageImpl implements IRegistrationResponseMessage {

	private static final long serialVersionUID = -5856136607792194558L;

	private LiderMessageType type = LiderMessageType.REGISTRATION_RESPONSE;
	
	private String recipient;

	private StatusCode status;

	private String message;

	private String agentDn;
	
	private String ldapUserDn;
	
	private String ldapServer;

	private String ldapBaseDn;
	
	private String ldapVersion;

	private String adDomainName;
	
	private String adHostName;
	
	private String adIpAddress;
	
	private String adAdminPassword;

	private String adAdminUserName;
	
	private Date timestamp;
	
	private Boolean disableLocalUser;

	public RegistrationResponseMessageImpl(StatusCode status, String message, String agentDn, String recipient,
			Date timestamp) {
		this.status = status;
		this.message = message;
		this.agentDn = agentDn;
		this.recipient = recipient;
		this.timestamp = timestamp;
	}

	@Override
	public LiderMessageType getType() {
		return type;
	}

	public void setType(LiderMessageType type) {
		this.type = type;
	}

	@Override
	public StatusCode getStatus() {
		return status;
	}

	public void setStatus(StatusCode status) {
		this.status = status;
	}

	@Override
	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	@Override
	public String getAgentDn() {
		return agentDn;
	}

	public void setAgentDn(String agentDn) {
		this.agentDn = agentDn;
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
	public String getLdapServer() {
		return ldapServer;
	}

	public void setLdapServer(String ldapServer) {
		this.ldapServer = ldapServer;
	}

	@Override
	public String getLdapBaseDn() {
		return ldapBaseDn;
	}

	public void setLdapBaseDn(String ldapBaseDn) {
		this.ldapBaseDn = ldapBaseDn;
	}

	@Override
	public String getLdapVersion() {
		return ldapVersion;
	}

	public void setLdapVersion(String ldapVersion) {
		this.ldapVersion = ldapVersion;
	}

	public String getLdapUserDn() {
		return ldapUserDn;
	}

	public void setLdapUserDn(String ldapUserDn) {
		this.ldapUserDn = ldapUserDn;
	}
	@Override
	public String getAdDomainName() {
		return adDomainName;
	}
	@Override
	public void setAdDomainName(String adDomainName) {
		this.adDomainName = adDomainName;
	}
	@Override
	public String getAdHostName() {
		return adHostName;
	}
	@Override
	public void setAdHostName(String adHostName) {
		this.adHostName = adHostName;
	}
	@Override
	public String getAdIpAddress() {
		return adIpAddress;
	}
	@Override
	public void setAdIpAddress(String adIpAddress) {
		this.adIpAddress = adIpAddress;
	}
	@Override
	public String getAdAdminPassword() {
		return adAdminPassword;
	}

	public void setAdAdminPassword(String adAdminPassword) {
		this.adAdminPassword = adAdminPassword;
	}

	public String getAdAdminUserName() {
		return adAdminUserName;
	}

	public void setAdAdminUserName(String adAdminUserName) {
		this.adAdminUserName = adAdminUserName;
	}

	public Boolean getDisableLocalUser() {
		return disableLocalUser;
	}

	public void setDisableLocalUser(Boolean disableLocalUser) {
		this.disableLocalUser = disableLocalUser;
	}

}
