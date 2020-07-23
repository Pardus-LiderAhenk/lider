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

import tr.org.lider.messaging.enums.StatusCode;

/**
 * Registration information returned from {@link IRegistrationSubscriber}
 *
 */
public interface IRegistrationResponseMessage extends ILiderMessage {

	/**
	 * 
	 * @return status of registration {@link RegistrationMessageStatus}
	 */
	StatusCode getStatus();

	/**
	 * 
	 * @return information about registration result
	 */
	String getMessage();

	/**
	 * 
	 * @return LDAP DN assigned to agent during registration
	 */
	String getAgentDn();
	
	String getLdapServer();
	
	String getLdapBaseDn();
	
	String getLdapVersion();
	
	void setLdapServer(String ldapServer);

	void setLdapBaseDn(String ldapBaseDn);

	void setLdapVersion(String ldapVersion) ;
	
	String getLdapUserDn();

	void setLdapUserDn(String ldapUserDn);
	
	public String getAdDomainName();

	public void setAdDomainName(String adDomainName);

	public String getAdHostName();

	public void setAdHostName(String adHostName);

	public String getAdIpAddress();

	public void setAdIpAddress(String adIpAddress);

	public String getAdAdminPassword();

	public void setAdAdminPassword(String adAdminPassword);
	
	public String getAdAdminUserName();

	public void setAdAdminUserName(String adAdminUserName);
	
	public Boolean getDisableLocalUser();

	public void setDisableLocalUser(Boolean disableLocalUser);
	
	public String getDirectoryServer();
	
	public void setDirectoryServer(String directoryServer);

}
