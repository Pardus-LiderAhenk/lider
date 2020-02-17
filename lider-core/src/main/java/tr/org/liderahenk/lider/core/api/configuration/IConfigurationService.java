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
package tr.org.liderahenk.lider.core.api.configuration;

import java.util.List;
import java.util.Map;

import tr.org.liderahenk.lider.core.api.messaging.enums.Protocol;
import tr.org.liderahenk.lider.core.api.messaging.messages.FileServerConf;

/**
 * 
 * Provides configuration service for all Lider core and plugin bundles.
 *
 * @author <a href="mailto:birkan.duman@gmail.com">Birkan Duman</a>
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 * 
 */
public interface IConfigurationService {

	//
	// Lider configuration
	//

	/**
	 * 
	 * @return locale (tr, en)
	 */
	String getLiderLocale();

	//
	// LDAP configuration
	//

	/**
	 * 
	 * @return LDAP server host.
	 */
	String getLdapServer();

	/**
	 * 
	 * @return LDAP server port number.
	 */
	String getLdapPort();

	/**
	 * 
	 * @return LDAP user name.
	 */
	String getLdapUsername();

	/**
	 * 
	 * @return LDAP password.
	 */
	String getLdapPassword();

	/**
	 * 
	 * @return LDAP root DN.
	 */
	String getLdapRootDn();

	/**
	 * 
	 * @return true if using LDAPS, false otherwise.
	 */
	Boolean getLdapUseSsl();

	/**
	 * 
	 * @return true if XMPP client accepts self-signed certificates, false
	 *         otherwise
	 */
	Boolean getLdapAllowSelfSignedCert();

	/**
	 * 
	 * @return LDAP search attributes that can be used in new search editor.
	 */
	String getLdapSearchAttributes();

	//
	// XMPP configuration
	//

	/**
	 * @return XMPP server host.
	 */
	String getXmppHost();

	/**
	 * 
	 * @return XMPP server port number.
	 */
	Integer getXmppPort();

	/**
	 * @return XMPP user name
	 */
	String getXmppUsername();

	/**
	 * 
	 * @return XMPP password.
	 */
	String getXmppPassword();

	/**
	 * 
	 * @return XMPP resource is appended to user JID to ensure uniquness.
	 */
	String getXmppResource();

	/**
	 * @return XMPP service name / domain.
	 */
	String getXmppServiceName();

	/**
	 * @return max retry connection count.
	 */
	int getXmppMaxRetryConnectionCount();

	/**
	 * @return packet replay timeout in milliseconds.
	 */
	int getXmppPacketReplayTimeout();

	/**
	 * 
	 * @return default timeout (in milliseconds) for XMPP ping requests.
	 */
	Integer getXmppPingTimeout();

	/**
	 * 
	 * @return true if XMPP uses SSL, false otherwise.
	 */
	Boolean getXmppUseSsl();

	/**
	 * 
	 * @return true if XMPP client accepts self-signed certificates, false
	 *         otherwise
	 */
	Boolean getXmppAllowSelfSignedCert();

	/**
	 * 
	 * @return true if XMPP uses Custom Trust Manager, false otherwise.
	 */

	Boolean getXmppUseCustomSsl();

	/**
	 * 
	 * @return
	 */
	Integer getXmppPresencePriority();

	//
	// Agent configuration
	//

	/**
	 * 
	 * @return LDAP base DN for agent entries (might be empty or null).
	 */
	String getAgentLdapBaseDn();

	/**
	 * 
	 * @return LDAP agent id attribute for agent entries. Default value is 'cn'.
	 */
	String getAgentLdapIdAttribute();

	/**
	 * 
	 * @return LDAP agent JID attribute for agent entries. Default values is
	 *         'uid'.
	 */
	String getAgentLdapJidAttribute();

	/**
	 * 
	 * @return LDAP agent object classes.
	 */
	String getAgentLdapObjectClasses();

	//
	// User configuration
	//

	/**
	 * 
	 * @return LDAP user search base dn for authentication
	 */
	String getUserLdapBaseDn();

	/**
	 * 
	 * @return LDAP user attribute for authentication
	 */
	String getUserLdapUidAttribute();

	/**
	 * 
	 * @return LDAP user privilege attribute.
	 */
	String getUserLdapPrivilegeAttribute();

	/**
	 * 
	 * @return comma separated LDAP user object classes to be used in search
	 *         filter for authentication
	 * 
	 */
	String getUserLdapObjectClasses();

	/**
	 * 
	 * @return true if LDAP authorization enabled, false otherwise
	 */
	Boolean getUserAuthorizationEnabled();

	/**
	 * 
	 * @return comma separated LDAP group object classes (which is usually just
	 *         'groupOfNames')
	 */
	String getGroupLdapObjectClasses();

	//
	// Task manager configuration
	//

	/**
	 * This feature may affect performance so enable this only if necessary!
	 * 
	 * @return true if we want to check and handle future tasks periodically,
	 *         false otherwise
	 */
	Boolean getTaskManagerCheckFutureTask();

	/**
	 * This feature may affect performance so make this period reasonably long!
	 * 
	 * @return time in milliseconds between successive future task checks.
	 */
	Long getTaskManagerFutureTaskCheckPeriod();

	//
	// Alarm configuration
	//

	/**
	 * This feature may affect performance so enable this only if necessary!
	 * 
	 * @return true if we wan to check and handle reports defined with an alarm
	 *         periodically, false otherwise.
	 */
	Boolean getAlarmCheckReport();

	//
	// Mail configuration
	//

	/**
	 * 
	 * @return
	 */
	String getMailAddress();

	/**
	 * 
	 * @return
	 */
	String getMailPassword();

	/**
	 * 
	 * @return
	 */
	String getMailHost();

	/**
	 * 
	 * @return
	 */
	Integer getMailSmtpPort();

	/**
	 * 
	 * @return
	 */
	Boolean getMailSmtpAuth();

	/**
	 * 
	 * @return
	 */
	Boolean getMailSmtpStartTlsEnable();

	/**
	 * 
	 * @return
	 */
	Boolean getMailSmtpSslEnable();

	/**
	 * 
	 * @return
	 */
	Integer getMailSmtpConnTimeout();

	/**
	 * 
	 * @return
	 */
	Integer getMailSmtpTimeout();

	/**
	 * 
	 * @return
	 */
	Integer getMailSmtpWriteTimeout();

	//
	// Hot deployment & plugin distribution configuration
	//

	Protocol getFileServerProtocolEnum();

	String getFileServerProtocol();

	Map<String, Object> getFileServerPluginParams(String pluginName, String pluginVersion);

	Map<String, Object> getFileServerAgreementParams();

	String getFileServerHost();

	String getFileServerUsername();

	String getFileServerPassword();

	String getFileServerUrl();

	String getFileServerPluginPath();

	String getFileServerAgreementPath();

	String getFileServerAgentFilePath();

	Integer getFileServerPort();

	FileServerConf getFileServerConf(String jid);

	/**
	 * 
	 * @return hot deployment path which is used to hold plugin files.
	 */
	String getHotDeploymentPath();

	Boolean getMailSendOnTaskCompletion();

	Long getMailCheckTaskCompletionPeriod();

	String getLdapMailNotifierAttributes();

	String getLdapEmailAttribute();

	Boolean getMailSendOnPolicyCompletion();

	Long getMailCheckPolicyCompletionPeriod();
	
	String getCronTaskList();
	
	Integer getEntrySizeLimit();
	
	Integer getCronIntervalEntrySize();
	
	String getAgentLdapRemovedFileName();
	
	String getUserLdapRolesDn();
	
	public String getAdDomainName() ;

	public void setAdDomainName(String adDomainName);

	public String getAdHostName();

	public void setAdHostName(String adHostName);

	public String getAdIpAddress();

	public void setAdIpAddress(String adIpAddress);

	public String getAdAdminPassword();

	public void setAdAdminPassword(String adAdminPassword);
	
	public String getAdAdminUserName();

	public void setAdAdminUserName(String adAdminUserName);

}
