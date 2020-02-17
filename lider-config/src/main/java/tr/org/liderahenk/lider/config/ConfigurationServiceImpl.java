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
package tr.org.liderahenk.lider.config;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.codehaus.jackson.map.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import tr.org.liderahenk.lider.core.api.configuration.IConfigurationService;
import tr.org.liderahenk.lider.core.api.messaging.enums.Protocol;
import tr.org.liderahenk.lider.core.api.messaging.messages.FileServerConf;

/**
 * This class provides configurations throughout the system. Configurations are
 * read from <code>${KARAF_HOME}/etc/tr.org.liderahenk.cfg</code> file.<br/>
 * 
 * The configuration service is also updated automatically when a configuration
 * property is changed via 'config:edit' or manually.
 * 
 * @author <a href="mailto:bm.volkansahin@gmail.com">volkansahin</a>
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 *
 */
public class ConfigurationServiceImpl implements IConfigurationService {

	private static Logger logger = LoggerFactory.getLogger(ConfigurationServiceImpl.class);

	// Lider configuration
	private String liderLocale;

	// LDAP configuration
	private String ldapServer;
	private String ldapPort;
	private String ldapUsername;
	private String ldapPassword;
	private String ldapRootDn;
	private Boolean ldapUseSsl;
	private String ldapSearchAttributes;
	private Boolean ldapAllowSelfSignedCert;
	private String ldapMailNotifierAttributes;
	private String ldapEmailAttribute;

	// XMPP configuration
	private String xmppHost; // host name/server name
	private Integer xmppPort;
	private String xmppUsername;
	private String xmppPassword;
	private String xmppResource;
	private String xmppServiceName; // service name / XMPP domain
	private int xmppMaxRetryConnectionCount;
	private int xmppPacketReplayTimeout;
	private Integer xmppPingTimeout;
	private Boolean xmppUseSsl;
	private Boolean xmppAllowSelfSignedCert;
	private Boolean xmppUseCustomSsl;
	private Integer xmppPresencePriority;

	// Agent configuration
	private String agentLdapBaseDn;
	private String agentLdapIdAttribute;
	private String agentLdapJidAttribute;
	private String agentLdapObjectClasses;
	private String agentLdapRemovedFileName;

	// User configuration
	private String userLdapBaseDn;
	private String userLdapUidAttribute;
	private String userLdapPrivilegeAttribute;
	private String userLdapObjectClasses;
	private Boolean userAuthorizationEnabled;
	private String groupLdapObjectClasses;
	private String userLdapRolesDn;

	// Task manager configuration
	private Boolean taskManagerCheckFutureTask;
	private Long taskManagerFutureTaskCheckPeriod;

	// Alarm configuration
	private Boolean alarmCheckReport;

	// Mail configuration
	private String mailAddress;
	private String mailPassword;
	private String mailHost;
	private Integer mailSmtpPort;
	private Boolean mailSmtpAuth;
	private Boolean mailSmtpStartTlsEnable;
	private Boolean mailSmtpSslEnable;
	private Integer mailSmtpConnTimeout;
	private Integer mailSmtpTimeout;
	private Integer mailSmtpWriteTimeout;

	private Boolean mailSendOnTaskCompletion;
	private Long mailCheckTaskCompletionPeriod;

	private Boolean mailSendOnPolicyCompletion;
	private Long mailCheckPolicyCompletionPeriod;

	// Hot deployment configuration
	private String hotDeploymentPath;

	// File server configuration
	private Protocol fileServerProtocol;
	private String fileServerHost;
	private String fileServerUsername;
	private String fileServerPassword;
	private String fileServerPluginPath;
	private String fileServerAgreementPath;
	private String fileServerAgentFilePath;
	private String fileServerUrl;
	private Integer fileServerPort;
	
	// cron manipluate for performance
	private String cronTaskList;
	private Integer entrySizeLimit;
	private Integer cronIntervalEntrySize;
	
	private String adDomainName;
	private String adHostName;
	private String adIpAddress;
	private String adAdminUserName;
	private String adAdminPassword;
	

	public void refresh() {
		logger.info("Configuration updated using blueprint: {}", prettyPrintConfig());
	}



	public String prettyPrintConfig() {
		try {
			return new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(this);
		} catch (Exception e) {
		}
		return toString();
	}

	@Override
	public String getLiderLocale() {
		return liderLocale;
	}

	public void setLiderLocale(String liderLocale) {
		this.liderLocale = liderLocale;
	}

	@Override
	public String getLdapServer() {
		return ldapServer;
	}

	public void setLdapServer(String ldapServer) {
		this.ldapServer = ldapServer;
	}

	@Override
	public String getLdapPort() {
		return ldapPort;
	}

	public void setLdapPort(String ldapPort) {
		this.ldapPort = ldapPort;
	}

	@Override
	public String getLdapUsername() {
		return ldapUsername;
	}

	public void setLdapUsername(String ldapUsername) {
		this.ldapUsername = ldapUsername;
	}

	@Override
	public String getLdapPassword() {
		return ldapPassword;
	}

	public void setLdapPassword(String ldapPassword) {
		this.ldapPassword = ldapPassword;
	}

	@Override
	public String getLdapRootDn() {
		return ldapRootDn;
	}

	public void setLdapRootDn(String ldapRootDn) {
		this.ldapRootDn = ldapRootDn;
	}

	@Override
	public Boolean getLdapUseSsl() {
		return ldapUseSsl;
	}

	public void setLdapUseSsl(Boolean ldapUseSsl) {
		this.ldapUseSsl = ldapUseSsl;
	}

	@Override
	public Boolean getLdapAllowSelfSignedCert() {
		return ldapAllowSelfSignedCert;
	}

	public void setLdapAllowSelfSignedCert(Boolean ldapAllowSelfSignedCert) {
		this.ldapAllowSelfSignedCert = ldapAllowSelfSignedCert;
	}

	@Override
	public String getXmppHost() {
		return xmppHost;
	}

	public void setXmppHost(String xmppHost) {
		this.xmppHost = xmppHost;
	}

	@Override
	public Integer getXmppPort() {
		return xmppPort;
	}

	public void setXmppPort(Integer xmppPort) {
		this.xmppPort = xmppPort;
	}

	@Override
	public String getXmppUsername() {
		return xmppUsername;
	}

	public void setXmppUsername(String xmppUsername) {
		this.xmppUsername = xmppUsername;
	}

	@Override
	public String getXmppPassword() {
		return xmppPassword;
	}

	public void setXmppPassword(String xmppPassword) {
		this.xmppPassword = xmppPassword;
	}

	@Override
	public String getXmppResource() {
		return xmppResource;
	}

	public void setXmppResource(String xmppResource) {
		this.xmppResource = xmppResource;
	}

	@Override
	public String getXmppServiceName() {
		return xmppServiceName;
	}

	public void setXmppServiceName(String xmppServiceName) {
		this.xmppServiceName = xmppServiceName;
	}

	@Override
	public int getXmppMaxRetryConnectionCount() {
		return xmppMaxRetryConnectionCount;
	}

	public void setXmppMaxRetryConnectionCount(int xmppMaxRetryConnectionCount) {
		this.xmppMaxRetryConnectionCount = xmppMaxRetryConnectionCount;
	}

	@Override
	public int getXmppPacketReplayTimeout() {
		return xmppPacketReplayTimeout;
	}

	public void setXmppPacketReplayTimeout(int xmppPacketReplayTimeout) {
		this.xmppPacketReplayTimeout = xmppPacketReplayTimeout;
	}

	@Override
	public Integer getXmppPingTimeout() {
		return xmppPingTimeout;
	}

	public void setXmppPingTimeout(Integer xmppPingTimeout) {
		this.xmppPingTimeout = xmppPingTimeout;
	}

	@Override
	public Boolean getXmppUseSsl() {
		return xmppUseSsl;
	}

	public void setXmppUseSsl(Boolean xmppUseSsl) {
		this.xmppUseSsl = xmppUseSsl;
	}

	@Override
	public Boolean getXmppAllowSelfSignedCert() {
		return xmppAllowSelfSignedCert;
	}

	public void setXmppAllowSelfSignedCert(Boolean xmppAllowSelfSignedCert) {
		this.xmppAllowSelfSignedCert = xmppAllowSelfSignedCert;
	}

	@Override
	public Integer getXmppPresencePriority() {
		return xmppPresencePriority;
	}

	public void setXmppPresencePriority(Integer xmppPresencePriority) {
		this.xmppPresencePriority = xmppPresencePriority;
	}

	@Override
	public String getAgentLdapBaseDn() {
		return agentLdapBaseDn;
	}

	public void setAgentLdapBaseDn(String agentLdapBaseDn) {
		this.agentLdapBaseDn = agentLdapBaseDn;
	}

	@Override
	public String getAgentLdapIdAttribute() {
		return agentLdapIdAttribute;
	}

	public void setAgentLdapIdAttribute(String agentLdapIdAttribute) {
		this.agentLdapIdAttribute = agentLdapIdAttribute;
	}

	@Override
	public String getAgentLdapJidAttribute() {
		return agentLdapJidAttribute;
	}

	public void setAgentLdapJidAttribute(String agentLdapJidAttribute) {
		this.agentLdapJidAttribute = agentLdapJidAttribute;
	}

	@Override
	public String getAgentLdapObjectClasses() {
		return agentLdapObjectClasses;
	}

	public void setAgentLdapObjectClasses(String agentLdapObjectClasses) {
		this.agentLdapObjectClasses = agentLdapObjectClasses;
	}

	@Override
	public String getUserLdapBaseDn() {
		return userLdapBaseDn;
	}

	public void setUserLdapBaseDn(String userLdapBaseDn) {
		this.userLdapBaseDn = userLdapBaseDn;
	}

	@Override
	public String getUserLdapUidAttribute() {
		return userLdapUidAttribute;
	}

	public void setUserLdapUidAttribute(String userLdapUidAttribute) {
		this.userLdapUidAttribute = userLdapUidAttribute;
	}

	@Override
	public String getUserLdapPrivilegeAttribute() {
		return userLdapPrivilegeAttribute;
	}

	public void setUserLdapPrivilegeAttribute(String userLdapPrivilegeAttribute) {
		this.userLdapPrivilegeAttribute = userLdapPrivilegeAttribute;
	}

	@Override
	public String getUserLdapObjectClasses() {
		return userLdapObjectClasses;
	}

	public void setUserLdapObjectClasses(String userLdapObjectClasses) {
		this.userLdapObjectClasses = userLdapObjectClasses;
	}

	@Override
	public Boolean getUserAuthorizationEnabled() {
		return userAuthorizationEnabled;
	}

	public void setUserAuthorizationEnabled(Boolean userAuthorizationEnabled) {
		this.userAuthorizationEnabled = userAuthorizationEnabled;
	}

	@Override
	public String getGroupLdapObjectClasses() {
		return groupLdapObjectClasses;
	}

	public void setGroupLdapObjectClasses(String groupLdapObjectClasses) {
		this.groupLdapObjectClasses = groupLdapObjectClasses;
	}

	@Override
	public Boolean getTaskManagerCheckFutureTask() {
		return taskManagerCheckFutureTask;
	}

	public void setTaskManagerCheckFutureTask(Boolean taskManagerCheckFutureTask) {
		this.taskManagerCheckFutureTask = taskManagerCheckFutureTask;
	}

	@Override
	public Long getTaskManagerFutureTaskCheckPeriod() {
		return taskManagerFutureTaskCheckPeriod;
	}

	public void setTaskManagerFutureTaskCheckPeriod(Long taskManagerFutureTaskCheckPeriod) {
		this.taskManagerFutureTaskCheckPeriod = taskManagerFutureTaskCheckPeriod;
	}

	@Override
	public Boolean getAlarmCheckReport() {
		return alarmCheckReport;
	}

	public void setAlarmCheckReport(Boolean alarmCheckReport) {
		this.alarmCheckReport = alarmCheckReport;
	}

	@Override
	public String getLdapSearchAttributes() {
		return ldapSearchAttributes;
	}

	public void setLdapSearchAttributes(String ldapSearchAttributes) {
		this.ldapSearchAttributes = ldapSearchAttributes;
	}

	@Override
	public String getMailAddress() {
		return mailAddress;
	}

	public void setMailAddress(String mailAddress) {
		this.mailAddress = mailAddress;
	}

	@Override
	public String getMailPassword() {
		return mailPassword;
	}

	public void setMailPassword(String mailPassword) {
		this.mailPassword = mailPassword;
	}

	@Override
	public String getMailHost() {
		return mailHost;
	}

	public void setMailHost(String mailHost) {
		this.mailHost = mailHost;
	}

	@Override
	public Integer getMailSmtpPort() {
		return mailSmtpPort;
	}

	public void setMailSmtpPort(Integer mailSmtpPort) {
		this.mailSmtpPort = mailSmtpPort;
	}

	@Override
	public Boolean getMailSmtpAuth() {
		return mailSmtpAuth;
	}

	public void setMailSmtpAuth(Boolean mailSmtpAuth) {
		this.mailSmtpAuth = mailSmtpAuth;
	}

	@Override
	public Boolean getMailSmtpStartTlsEnable() {
		return mailSmtpStartTlsEnable;
	}

	public void setMailSmtpStartTlsEnable(Boolean mailSmtpStartTlsEnable) {
		this.mailSmtpStartTlsEnable = mailSmtpStartTlsEnable;
	}

	@Override
	public Boolean getMailSmtpSslEnable() {
		return mailSmtpSslEnable;
	}

	public void setMailSmtpSslEnable(Boolean mailSmtpSslEnable) {
		this.mailSmtpSslEnable = mailSmtpSslEnable;
	}

	@Override
	public Integer getMailSmtpConnTimeout() {
		return mailSmtpConnTimeout;
	}

	public void setMailSmtpConnTimeout(Integer mailSmtpConnTimeout) {
		this.mailSmtpConnTimeout = mailSmtpConnTimeout;
	}

	@Override
	public Integer getMailSmtpTimeout() {
		return mailSmtpTimeout;
	}

	public void setMailSmtpTimeout(Integer mailSmtpTimeout) {
		this.mailSmtpTimeout = mailSmtpTimeout;
	}

	@Override
	public Integer getMailSmtpWriteTimeout() {
		return mailSmtpWriteTimeout;
	}

	public void setMailSmtpWriteTimeout(Integer mailSmtpWriteTimeout) {
		this.mailSmtpWriteTimeout = mailSmtpWriteTimeout;
	}

	@Override
	public Boolean getMailSendOnTaskCompletion() {
		return mailSendOnTaskCompletion;
	}

	public void setMailSendOnTaskCompletion(Boolean mailSendOnTaskCompletion) {
		this.mailSendOnTaskCompletion = mailSendOnTaskCompletion;
	}

	@Override
	public Long getMailCheckTaskCompletionPeriod() {
		return mailCheckTaskCompletionPeriod;
	}

	public void setMailCheckTaskCompletionPeriod(Long mailCheckTaskCompletionPeriod) {
		this.mailCheckTaskCompletionPeriod = mailCheckTaskCompletionPeriod;
	}

	@Override
	public Protocol getFileServerProtocolEnum() {
		return fileServerProtocol;
	}

	@Override
	public String getFileServerProtocol() {
		return fileServerProtocol != null ? fileServerProtocol.toString() : null;
	}

	public void setFileServerProtocol(String fileServerProtocol) {
		this.fileServerProtocol = fileServerProtocol != null
				? Protocol.valueOf(fileServerProtocol.toUpperCase(Locale.ENGLISH)) : null;
	}

	@Override
	public Map<String, Object> getFileServerPluginParams(String pluginName, String pluginVersion) {
		Map<String, Object> params = new HashMap<String, Object>();
		switch (fileServerProtocol) {
		case HTTP:
			String url = fileServerUrl + fileServerPluginPath;
			url = url.replaceFirst("\\{0\\}", pluginName.toLowerCase(Locale.ENGLISH));
			url = url.replaceFirst("\\{1\\}", pluginVersion);
			params.put("url", url);
			break;
		case SSH:
			params.put("host", fileServerHost);
			params.put("username", fileServerUsername);
			params.put("password", fileServerPassword);
			String path = fileServerPluginPath.replaceFirst("\\{0\\}", pluginName.toLowerCase(Locale.ENGLISH));
			path = path.replaceFirst("\\{1\\}", pluginVersion);
			params.put("path", path);
			params.put("port", fileServerPort);
			break;
		default:
			// TODO TORRENT
		}
		return params;
	}

	@Override
	public Map<String, Object> getFileServerAgreementParams() {
		Map<String, Object> params = new HashMap<String, Object>();
		switch (fileServerProtocol) {
		case HTTP:
			params.put("url", fileServerUrl + fileServerAgreementPath);
			break;
		case SSH:
			params.put("host", fileServerHost);
			params.put("username", fileServerUsername);
			params.put("password", fileServerPassword);
			params.put("path", fileServerAgreementPath);
			params.put("port", fileServerPort);
			break;
		default:
			// TODO TORRENT
		}
		return params;
	}

	@Override
	public FileServerConf getFileServerConf(String jid) {
		Map<String, Object> params = new HashMap<String, Object>();
		switch (fileServerProtocol) {
		case HTTP:
			params.put("url", fileServerUrl + fileServerAgentFilePath);
			break;
		case SSH:
			params.put("host", fileServerHost);
			params.put("username", fileServerUsername);
			params.put("password", fileServerPassword);
			params.put("path", fileServerAgentFilePath.replaceFirst("\\{0\\}", jid));
			params.put("port", fileServerPort);
			break;
		default:
			// TODO TORRENT
		}
		return new FileServerConf(params, fileServerProtocol);
	}

	@Override
	public String getFileServerHost() {
		return fileServerHost;
	}

	public void setFileServerHost(String fileServerHost) {
		this.fileServerHost = fileServerHost;
	}

	@Override
	public String getFileServerUsername() {
		return fileServerUsername;
	}

	public void setFileServerUsername(String fileServerUsername) {
		this.fileServerUsername = fileServerUsername;
	}

	@Override
	public String getFileServerPassword() {
		return fileServerPassword;
	}

	public void setFileServerPassword(String fileServerPassword) {
		this.fileServerPassword = fileServerPassword;
	}

	@Override
	public String getFileServerPluginPath() {
		return fileServerPluginPath;
	}

	public void setFileServerPluginPath(String fileServerPluginPath) {
		this.fileServerPluginPath = fileServerPluginPath;
	}

	@Override
	public String getFileServerAgreementPath() {
		return fileServerAgreementPath;
	}

	public void setFileServerAgreementPath(String fileServerAgreementPath) {
		this.fileServerAgreementPath = fileServerAgreementPath;
	}

	@Override
	public String getFileServerAgentFilePath() {
		return fileServerAgentFilePath;
	}

	public void setFileServerAgentFilePath(String fileServerAgentFilePath) {
		this.fileServerAgentFilePath = fileServerAgentFilePath;
	}

	@Override
	public String getFileServerUrl() {
		return fileServerUrl;
	}

	public void setFileServerUrl(String fileServerUrl) {
		this.fileServerUrl = fileServerUrl;
	}

	@Override
	public Integer getFileServerPort() {
		return fileServerPort;
	}

	public void setFileServerPort(Integer fileServerPort) {
		this.fileServerPort = fileServerPort;
	}

	@Override
	public String getHotDeploymentPath() {
		return hotDeploymentPath;
	}

	public void setHotDeploymentPath(String hotDeploymentPath) {
		this.hotDeploymentPath = hotDeploymentPath;
	}

	@Override
	public Boolean getXmppUseCustomSsl() {
		return xmppUseCustomSsl;
	}

	public void setXmppUseCustomSsl(Boolean xmppUseCustomSsl) {
		this.xmppUseCustomSsl = xmppUseCustomSsl;
	}

	@Override
	public String getLdapMailNotifierAttributes() {
		return ldapMailNotifierAttributes;
	}

	public void setLdapMailNotifierAttributes(String ldapMailNotifierAttributes) {
		this.ldapMailNotifierAttributes = ldapMailNotifierAttributes;
	}

	@Override
	public String getLdapEmailAttribute() {
		return ldapEmailAttribute;
	}

	public void setLdapEmailAttribute(String ldapEmailAttribute) {
		this.ldapEmailAttribute = ldapEmailAttribute;
	}

	@Override
	public Boolean getMailSendOnPolicyCompletion() {
		return mailSendOnPolicyCompletion;
	}

	public void setMailSendOnPolicyCompletion(Boolean mailSendOnPolicyCompletion) {
		this.mailSendOnPolicyCompletion = mailSendOnPolicyCompletion;
	}

	@Override
	public Long getMailCheckPolicyCompletionPeriod() {
		return mailCheckPolicyCompletionPeriod;
	}

	public void setMailCheckPolicyCompletionPeriod(Long mailCheckPolicyCompletionPeriod) {
		this.mailCheckPolicyCompletionPeriod = mailCheckPolicyCompletionPeriod;
	}

	@Override
	public String getCronTaskList() {
		return cronTaskList;
	}

	@Override
	public Integer getEntrySizeLimit() {
		return entrySizeLimit;
	}

	@Override
	public Integer getCronIntervalEntrySize() {
		
		return cronIntervalEntrySize;
	}

	@Override
	public String toString() {
		return "ConfigurationServiceImpl [liderLocale=" + liderLocale + ", ldapServer=" + ldapServer + ", ldapPort="
				+ ldapPort + ", ldapUsername=" + ldapUsername + ", ldapPassword=" + ldapPassword + ", ldapRootDn="
				+ ldapRootDn + ", ldapUseSsl=" + ldapUseSsl + ", ldapSearchAttributes=" + ldapSearchAttributes
				+ ", ldapAllowSelfSignedCert=" + ldapAllowSelfSignedCert + ", ldapMailNotifierAttributes="
				+ ldapMailNotifierAttributes + ", ldapEmailAttribute=" + ldapEmailAttribute + ", xmppHost=" + xmppHost
				+ ", xmppPort=" + xmppPort + ", xmppUsername=" + xmppUsername + ", xmppPassword=" + xmppPassword
				+ ", xmppResource=" + xmppResource + ", xmppServiceName=" + xmppServiceName
				+ ", xmppMaxRetryConnectionCount=" + xmppMaxRetryConnectionCount + ", xmppPacketReplayTimeout="
				+ xmppPacketReplayTimeout + ", xmppPingTimeout=" + xmppPingTimeout + ", xmppUseSsl=" + xmppUseSsl
				+ ", xmppAllowSelfSignedCert=" + xmppAllowSelfSignedCert + ", xmppUseCustomSsl=" + xmppUseCustomSsl
				+ ", xmppPresencePriority=" + xmppPresencePriority + ", agentLdapBaseDn=" + agentLdapBaseDn
				+ ", agentLdapIdAttribute=" + agentLdapIdAttribute + ", agentLdapJidAttribute=" + agentLdapJidAttribute
				+ ", agentLdapObjectClasses=" + agentLdapObjectClasses + ", userLdapBaseDn=" + userLdapBaseDn
				+ ", userLdapUidAttribute=" + userLdapUidAttribute + ", userLdapPrivilegeAttribute="
				+ userLdapPrivilegeAttribute + ", userLdapObjectClasses=" + userLdapObjectClasses
				+ ", userAuthorizationEnabled=" + userAuthorizationEnabled + ", groupLdapObjectClasses="
				+ groupLdapObjectClasses + ", taskManagerCheckFutureTask=" + taskManagerCheckFutureTask
				+ ", taskManagerFutureTaskCheckPeriod=" + taskManagerFutureTaskCheckPeriod + ", alarmCheckReport="
				+ alarmCheckReport + ", mailAddress=" + mailAddress + ", mailPassword=" + mailPassword + ", mailHost="
				+ mailHost + ", mailSmtpPort=" + mailSmtpPort + ", mailSmtpAuth=" + mailSmtpAuth
				+ ", mailSmtpStartTlsEnable=" + mailSmtpStartTlsEnable + ", mailSmtpSslEnable=" + mailSmtpSslEnable
				+ ", mailSmtpConnTimeout=" + mailSmtpConnTimeout + ", mailSmtpTimeout=" + mailSmtpTimeout
				+ ", mailSmtpWriteTimeout=" + mailSmtpWriteTimeout + ", mailSendOnTaskCompletion="
				+ mailSendOnTaskCompletion + ", mailCheckTaskCompletionPeriod=" + mailCheckTaskCompletionPeriod
				+ ", mailSendOnPolicyCompletion=" + mailSendOnPolicyCompletion + ", mailCheckPolicyCompletionPeriod="
				+ mailCheckPolicyCompletionPeriod + ", hotDeploymentPath=" + hotDeploymentPath + ", fileServerProtocol="
				+ fileServerProtocol + ", fileServerHost=" + fileServerHost + ", fileServerUsername="
				+ fileServerUsername + ", fileServerPassword=" + fileServerPassword + ", fileServerPluginPath="
				+ fileServerPluginPath + ", fileServerAgreementPath=" + fileServerAgreementPath
				+ ", fileServerAgentFilePath=" + fileServerAgentFilePath + ", fileServerUrl=" + fileServerUrl
				+ ", fileServerPort=" + fileServerPort + ", cronTaskList=" + cronTaskList + ", entrySizeLimit="
				+ entrySizeLimit + ", cronIntervalEntrySize=" + cronIntervalEntrySize + "]";
	}



	public void setFileServerProtocol(Protocol fileServerProtocol) {
		this.fileServerProtocol = fileServerProtocol;
	}



	public void setCronTaskList(String cronTaskList) {
		this.cronTaskList = cronTaskList;
	}



	public void setEntrySizeLimit(Integer entrySizeLimit) {
		this.entrySizeLimit = entrySizeLimit;
	}



	public void setCronIntervalEntrySize(Integer cronIntervalEntrySize) {
		this.cronIntervalEntrySize = cronIntervalEntrySize;
	}



	public String getAgentLdapRemovedFileName() {
		return agentLdapRemovedFileName;
	}



	public void setAgentLdapRemovedFileName(String agentLdapRemovedFileName) {
		this.agentLdapRemovedFileName = agentLdapRemovedFileName;
	}



	public String getUserLdapRolesDn() {
		return userLdapRolesDn;
	}



	public void setUserLdapRolesDn(String userLdapRolesDn) {
		this.userLdapRolesDn = userLdapRolesDn;
	}


	public String getAdDomainName() {
		return adDomainName;
	}


	public void setAdDomainName(String adDomainName) {
		this.adDomainName = adDomainName;
	}


	public String getAdHostName() {
		return adHostName;
	}


	public void setAdHostName(String adHostName) {
		this.adHostName = adHostName;
	}


	public String getAdIpAddress() {
		return adIpAddress;
	}


	public void setAdIpAddress(String adIpAddress) {
		this.adIpAddress = adIpAddress;
	}


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

}
