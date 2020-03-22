package tr.org.lider.entities;

import java.util.HashMap;
import java.util.Map;

import org.hibernate.engine.config.spi.ConfigurationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import tr.org.lider.messaging.enums.Protocol;
import tr.org.lider.messaging.messages.FileServerConf;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ConfigParams {
	private static Logger logger = LoggerFactory.getLogger(ConfigurationService.class);

	// Lider configuration
	private String liderLocale;

	// LDAP configuration"
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

	// Agent configuration
	private String agentLdapBaseDn;
	private String agentLdapIdAttribute;
	private String agentLdapJidAttribute;
	private String agentLdapObjectClasses;

	// User configuration
	private String userLdapBaseDn;
	private String userLdapUidAttribute;
	private String userLdapPrivilegeAttribute;
	private String userLdapObjectClasses;
	private Boolean userAuthorizationEnabled;
	private String groupLdapObjectClasses;
	private String roleLdapObjectClasses;
	private String userLdapRolesDn;
	private String groupLdapBaseDn;
	private String userGroupLdapBaseDn;
	private String ahenkGroupLdapBaseDn;

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



	// cron manipluate for performance
	private String cronTaskList;
	private Integer entrySizeLimit;
	private Integer cronIntervalEntrySize;

	public ConfigParams() {
		super();
	}


	public ConfigParams(String liderLocale, String ldapServer, String ldapPort, String ldapUsername,
			String ldapPassword, String ldapRootDn, Boolean ldapUseSsl, String ldapSearchAttributes,
			Boolean ldapAllowSelfSignedCert, String ldapMailNotifierAttributes, String ldapEmailAttribute,
			String agentLdapBaseDn, String agentLdapIdAttribute, String agentLdapJidAttribute,
			String agentLdapObjectClasses, String userLdapBaseDn, String userLdapUidAttribute,
			String userLdapPrivilegeAttribute, String userLdapObjectClasses, Boolean userAuthorizationEnabled,
			String groupLdapObjectClasses, String roleLdapObjectClasses, String userLdapRolesDn, String groupLdapBaseDn,
			String xmppHost, Integer xmppPort, String xmppUsername, String xmppPassword, String xmppResource,
			String xmppServiceName, int xmppMaxRetryConnectionCount, int xmppPacketReplayTimeout,
			Integer xmppPingTimeout, Boolean xmppUseSsl, Boolean xmppAllowSelfSignedCert, Boolean xmppUseCustomSsl,
			Integer xmppPresencePriority, Protocol fileServerProtocol, String fileServerHost, String fileServerUsername,
			String fileServerPassword, String fileServerPluginPath, String fileServerAgreementPath,
			String fileServerAgentFilePath, String fileServerUrl, Integer fileServerPort,
			Boolean taskManagerCheckFutureTask, Long taskManagerFutureTaskCheckPeriod, Boolean alarmCheckReport,
			String mailAddress, String mailPassword, String mailHost, Integer mailSmtpPort, Boolean mailSmtpAuth,
			Boolean mailSmtpStartTlsEnable, Boolean mailSmtpSslEnable, Integer mailSmtpConnTimeout,
			Integer mailSmtpTimeout, Integer mailSmtpWriteTimeout, Boolean mailSendOnTaskCompletion,
			Long mailCheckTaskCompletionPeriod, Boolean mailSendOnPolicyCompletion,
			Long mailCheckPolicyCompletionPeriod, String hotDeploymentPath, String cronTaskList, Integer entrySizeLimit,
			Integer cronIntervalEntrySize, String userGroupLdapBaseDn, String ahenkGroupLdapBaseDn) {
		super();
		this.liderLocale = liderLocale;
		this.ldapServer = ldapServer;
		this.ldapPort = ldapPort;
		this.ldapUsername = ldapUsername;
		this.ldapPassword = ldapPassword;
		this.ldapRootDn = ldapRootDn;
		this.ldapUseSsl = ldapUseSsl;
		this.ldapSearchAttributes = ldapSearchAttributes;
		this.ldapAllowSelfSignedCert = ldapAllowSelfSignedCert;
		this.ldapMailNotifierAttributes = ldapMailNotifierAttributes;
		this.ldapEmailAttribute = ldapEmailAttribute;
		this.agentLdapBaseDn = agentLdapBaseDn;
		this.agentLdapIdAttribute = agentLdapIdAttribute;
		this.agentLdapJidAttribute = agentLdapJidAttribute;
		this.agentLdapObjectClasses = agentLdapObjectClasses;
		this.userLdapBaseDn = userLdapBaseDn;
		this.userLdapUidAttribute = userLdapUidAttribute;
		this.userLdapPrivilegeAttribute = userLdapPrivilegeAttribute;
		this.userLdapObjectClasses = userLdapObjectClasses;
		this.userAuthorizationEnabled = userAuthorizationEnabled;
		this.groupLdapObjectClasses = groupLdapObjectClasses;
		this.roleLdapObjectClasses = roleLdapObjectClasses;
		this.userLdapRolesDn = userLdapRolesDn;
		this.groupLdapBaseDn = groupLdapBaseDn;
		this.xmppHost = xmppHost;
		this.xmppPort = xmppPort;
		this.xmppUsername = xmppUsername;
		this.xmppPassword = xmppPassword;
		this.xmppResource = xmppResource;
		this.xmppServiceName = xmppServiceName;
		this.xmppMaxRetryConnectionCount = xmppMaxRetryConnectionCount;
		this.xmppPacketReplayTimeout = xmppPacketReplayTimeout;
		this.xmppPingTimeout = xmppPingTimeout;
		this.xmppUseSsl = xmppUseSsl;
		this.xmppAllowSelfSignedCert = xmppAllowSelfSignedCert;
		this.xmppUseCustomSsl = xmppUseCustomSsl;
		this.xmppPresencePriority = xmppPresencePriority;
		this.fileServerProtocol = fileServerProtocol;
		this.fileServerHost = fileServerHost;
		this.fileServerUsername = fileServerUsername;
		this.fileServerPassword = fileServerPassword;
		this.fileServerPluginPath = fileServerPluginPath;
		this.fileServerAgreementPath = fileServerAgreementPath;
		this.fileServerAgentFilePath = fileServerAgentFilePath;
		this.fileServerUrl = fileServerUrl;
		this.fileServerPort = fileServerPort;
		this.taskManagerCheckFutureTask = taskManagerCheckFutureTask;
		this.taskManagerFutureTaskCheckPeriod = taskManagerFutureTaskCheckPeriod;
		this.alarmCheckReport = alarmCheckReport;
		this.mailAddress = mailAddress;
		this.mailPassword = mailPassword;
		this.mailHost = mailHost;
		this.mailSmtpPort = mailSmtpPort;
		this.mailSmtpAuth = mailSmtpAuth;
		this.mailSmtpStartTlsEnable = mailSmtpStartTlsEnable;
		this.mailSmtpSslEnable = mailSmtpSslEnable;
		this.mailSmtpConnTimeout = mailSmtpConnTimeout;
		this.mailSmtpTimeout = mailSmtpTimeout;
		this.mailSmtpWriteTimeout = mailSmtpWriteTimeout;
		this.mailSendOnTaskCompletion = mailSendOnTaskCompletion;
		this.mailCheckTaskCompletionPeriod = mailCheckTaskCompletionPeriod;
		this.mailSendOnPolicyCompletion = mailSendOnPolicyCompletion;
		this.mailCheckPolicyCompletionPeriod = mailCheckPolicyCompletionPeriod;
		this.hotDeploymentPath = hotDeploymentPath;
		this.cronTaskList = cronTaskList;
		this.entrySizeLimit = entrySizeLimit;
		this.cronIntervalEntrySize = cronIntervalEntrySize;
		this.userGroupLdapBaseDn = userGroupLdapBaseDn;
		this.ahenkGroupLdapBaseDn = ahenkGroupLdapBaseDn;
	}


	public void setDefaultParams() {
		this.liderLocale = "tr";
		this.ldapUseSsl = false;
		this.ldapSearchAttributes = "cn,objectClass,uid,liderPrivilege";
		this.ldapAllowSelfSignedCert = false;
		this.ldapMailNotifierAttributes = "cn, mail, departmentNumber, uid";
		this.ldapEmailAttribute = "mail";

		// Agent configuration
		this.agentLdapBaseDn= "ou=Ahenkler," + this.ldapRootDn;
		this.agentLdapIdAttribute = "cn";
		this.agentLdapJidAttribute = "uid";
		this.agentLdapObjectClasses = "pardusDevice,device";
		this.ahenkGroupLdapBaseDn = "ou=Ahenk," + this.groupLdapBaseDn;
		
		// User configuration
		this.userLdapBaseDn= "ou=People," + this.ldapRootDn ;
		this.userLdapUidAttribute  ="uid";
		this.userLdapPrivilegeAttribute = "liderPrivilege";
		this.userLdapObjectClasses = "pardusAccount,pardusLider";
		this.userAuthorizationEnabled = true;
		this.groupLdapObjectClasses = "groupOfNames";
		this.roleLdapObjectClasses = "sudoRole";
		this.userLdapRolesDn = "ou=Roles," + this.ldapRootDn;
		this.groupLdapBaseDn = "ou=Gruplar," + this.ldapRootDn;
		this.userGroupLdapBaseDn = "ou=People," + this.groupLdapBaseDn;
		
		// XMPP configuration
		this.xmppResource = "Smack";
		this.xmppServiceName = "im.liderahenk.org"; // service name / XMPP domain
		this.xmppMaxRetryConnectionCount = 5;
		this.xmppPacketReplayTimeout = 10000;
		this.xmppPingTimeout = 300;
		this.xmppUseSsl = false;
		this.xmppAllowSelfSignedCert = false;
		this.xmppUseCustomSsl = false;
		this.xmppPresencePriority = 1;

		// File server configuration
		this.fileServerPluginPath = "/plugins/ahenk-{0}_{1}_amd64.deb";
		this.fileServerAgreementPath = "/home/pardus/sample-agreement.txt";
		this.fileServerAgentFilePath = "/home/pardus/dev/agent-files/{0}/";


	}

	public String getLiderLocale() {
		return liderLocale;
	}

	public void setLiderLocale(String liderLocale) {
		this.liderLocale = liderLocale;
	}

	public String getLdapServer() {
		return ldapServer;
	}

	public void setLdapServer(String ldapServer) {
		this.ldapServer = ldapServer;
	}

	public String getLdapPort() {
		return ldapPort;
	}

	public void setLdapPort(String ldapPort) {
		this.ldapPort = ldapPort;
	}

	public String getLdapUsername() {
		return ldapUsername;
	}

	public void setLdapUsername(String ldapUsername) {
		this.ldapUsername = ldapUsername;
	}

	public String getLdapPassword() {
		return ldapPassword;
	}

	public void setLdapPassword(String ldapPassword) {
		this.ldapPassword = ldapPassword;
	}

	public String getLdapRootDn() {
		return ldapRootDn;
	}

	public void setLdapRootDn(String ldapRootDn) {
		this.ldapRootDn = ldapRootDn;
	}

	public Boolean getLdapUseSsl() {
		return ldapUseSsl;
	}

	public void setLdapUseSsl(Boolean ldapUseSsl) {
		this.ldapUseSsl = ldapUseSsl;
	}

	public String getLdapSearchAttributes() {
		return ldapSearchAttributes;
	}

	public void setLdapSearchAttributes(String ldapSearchAttributes) {
		this.ldapSearchAttributes = ldapSearchAttributes;
	}

	public Boolean getLdapAllowSelfSignedCert() {
		return ldapAllowSelfSignedCert;
	}

	public void setLdapAllowSelfSignedCert(Boolean ldapAllowSelfSignedCert) {
		this.ldapAllowSelfSignedCert = ldapAllowSelfSignedCert;
	}

	public String getLdapMailNotifierAttributes() {
		return ldapMailNotifierAttributes;
	}

	public void setLdapMailNotifierAttributes(String ldapMailNotifierAttributes) {
		this.ldapMailNotifierAttributes = ldapMailNotifierAttributes;
	}

	public String getLdapEmailAttribute() {
		return ldapEmailAttribute;
	}

	public void setLdapEmailAttribute(String ldapEmailAttribute) {
		this.ldapEmailAttribute = ldapEmailAttribute;
	}

	public String getXmppHost() {
		return xmppHost;
	}

	public void setXmppHost(String xmppHost) {
		this.xmppHost = xmppHost;
	}

	public Integer getXmppPort() {
		return xmppPort;
	}

	public void setXmppPort(Integer xmppPort) {
		this.xmppPort = xmppPort;
	}

	public String getXmppUsername() {
		return xmppUsername;
	}

	public void setXmppUsername(String xmppUsername) {
		this.xmppUsername = xmppUsername;
	}

	public String getXmppPassword() {
		return xmppPassword;
	}

	public void setXmppPassword(String xmppPassword) {
		this.xmppPassword = xmppPassword;
	}

	public String getXmppResource() {
		return xmppResource;
	}

	public void setXmppResource(String xmppResource) {
		this.xmppResource = xmppResource;
	}

	public String getXmppServiceName() {
		return xmppServiceName;
	}

	public void setXmppServiceName(String xmppServiceName) {
		this.xmppServiceName = xmppServiceName;
	}

	public int getXmppMaxRetryConnectionCount() {
		return xmppMaxRetryConnectionCount;
	}

	public void setXmppMaxRetryConnectionCount(int xmppMaxRetryConnectionCount) {
		this.xmppMaxRetryConnectionCount = xmppMaxRetryConnectionCount;
	}

	public int getXmppPacketReplayTimeout() {
		return xmppPacketReplayTimeout;
	}

	public void setXmppPacketReplayTimeout(int xmppPacketReplayTimeout) {
		this.xmppPacketReplayTimeout = xmppPacketReplayTimeout;
	}

	public Integer getXmppPingTimeout() {
		return xmppPingTimeout;
	}

	public void setXmppPingTimeout(Integer xmppPingTimeout) {
		this.xmppPingTimeout = xmppPingTimeout;
	}

	public Boolean getXmppUseSsl() {
		return xmppUseSsl;
	}

	public void setXmppUseSsl(Boolean xmppUseSsl) {
		this.xmppUseSsl = xmppUseSsl;
	}

	public Boolean getXmppAllowSelfSignedCert() {
		return xmppAllowSelfSignedCert;
	}

	public void setXmppAllowSelfSignedCert(Boolean xmppAllowSelfSignedCert) {
		this.xmppAllowSelfSignedCert = xmppAllowSelfSignedCert;
	}

	public Boolean getXmppUseCustomSsl() {
		return xmppUseCustomSsl;
	}

	public void setXmppUseCustomSsl(Boolean xmppUseCustomSsl) {
		this.xmppUseCustomSsl = xmppUseCustomSsl;
	}

	public Integer getXmppPresencePriority() {
		return xmppPresencePriority;
	}

	public void setXmppPresencePriority(Integer xmppPresencePriority) {
		this.xmppPresencePriority = xmppPresencePriority;
	}

	public String getAgentLdapBaseDn() {
		return agentLdapBaseDn;
	}

	public void setAgentLdapBaseDn(String agentLdapBaseDn) {
		this.agentLdapBaseDn = agentLdapBaseDn;
	}

	public String getAgentLdapIdAttribute() {
		return agentLdapIdAttribute;
	}

	public void setAgentLdapIdAttribute(String agentLdapIdAttribute) {
		this.agentLdapIdAttribute = agentLdapIdAttribute;
	}

	public String getAgentLdapJidAttribute() {
		return agentLdapJidAttribute;
	}

	public void setAgentLdapJidAttribute(String agentLdapJidAttribute) {
		this.agentLdapJidAttribute = agentLdapJidAttribute;
	}

	public String getAgentLdapObjectClasses() {
		return agentLdapObjectClasses;
	}

	public void setAgentLdapObjectClasses(String agentLdapObjectClasses) {
		this.agentLdapObjectClasses = agentLdapObjectClasses;
	}

	public String getUserLdapBaseDn() {
		return userLdapBaseDn;
	}

	public void setUserLdapBaseDn(String userLdapBaseDn) {
		this.userLdapBaseDn = userLdapBaseDn;
	}

	public String getUserLdapUidAttribute() {
		return userLdapUidAttribute;
	}

	public void setUserLdapUidAttribute(String userLdapUidAttribute) {
		this.userLdapUidAttribute = userLdapUidAttribute;
	}

	public String getUserLdapPrivilegeAttribute() {
		return userLdapPrivilegeAttribute;
	}

	public void setUserLdapPrivilegeAttribute(String userLdapPrivilegeAttribute) {
		this.userLdapPrivilegeAttribute = userLdapPrivilegeAttribute;
	}

	public String getUserLdapObjectClasses() {
		return userLdapObjectClasses;
	}

	public void setUserLdapObjectClasses(String userLdapObjectClasses) {
		this.userLdapObjectClasses = userLdapObjectClasses;
	}

	public Boolean getUserAuthorizationEnabled() {
		return userAuthorizationEnabled;
	}

	public void setUserAuthorizationEnabled(Boolean userAuthorizationEnabled) {
		this.userAuthorizationEnabled = userAuthorizationEnabled;
	}

	public String getGroupLdapObjectClasses() {
		return groupLdapObjectClasses;
	}

	public void setGroupLdapObjectClasses(String groupLdapObjectClasses) {
		this.groupLdapObjectClasses = groupLdapObjectClasses;
	}

	public String getRoleLdapObjectClasses() {
		return roleLdapObjectClasses;
	}

	public void setRoleLdapObjectClasses(String roleLdapObjectClasses) {
		this.roleLdapObjectClasses = roleLdapObjectClasses;
	}

	public String getUserLdapRolesDn() {
		return userLdapRolesDn;
	}

	public void setUserLdapRolesDn(String userLdapRolesDn) {
		this.userLdapRolesDn = userLdapRolesDn;
	}

	public String getGroupLdapBaseDn() {
		return groupLdapBaseDn;
	}

	public void setGroupLdapBaseDn(String groupLdapBaseDn) {
		this.groupLdapBaseDn = groupLdapBaseDn;
	}

	public Boolean getTaskManagerCheckFutureTask() {
		return taskManagerCheckFutureTask;
	}

	public void setTaskManagerCheckFutureTask(Boolean taskManagerCheckFutureTask) {
		this.taskManagerCheckFutureTask = taskManagerCheckFutureTask;
	}

	public Long getTaskManagerFutureTaskCheckPeriod() {
		return taskManagerFutureTaskCheckPeriod;
	}

	public void setTaskManagerFutureTaskCheckPeriod(Long taskManagerFutureTaskCheckPeriod) {
		this.taskManagerFutureTaskCheckPeriod = taskManagerFutureTaskCheckPeriod;
	}

	public Boolean getAlarmCheckReport() {
		return alarmCheckReport;
	}

	public void setAlarmCheckReport(Boolean alarmCheckReport) {
		this.alarmCheckReport = alarmCheckReport;
	}

	public String getMailAddress() {
		return mailAddress;
	}

	public void setMailAddress(String mailAddress) {
		this.mailAddress = mailAddress;
	}

	public String getMailPassword() {
		return mailPassword;
	}

	public void setMailPassword(String mailPassword) {
		this.mailPassword = mailPassword;
	}

	public String getMailHost() {
		return mailHost;
	}

	public void setMailHost(String mailHost) {
		this.mailHost = mailHost;
	}

	public Integer getMailSmtpPort() {
		return mailSmtpPort;
	}

	public void setMailSmtpPort(Integer mailSmtpPort) {
		this.mailSmtpPort = mailSmtpPort;
	}

	public Boolean getMailSmtpAuth() {
		return mailSmtpAuth;
	}

	public void setMailSmtpAuth(Boolean mailSmtpAuth) {
		this.mailSmtpAuth = mailSmtpAuth;
	}

	public Boolean getMailSmtpStartTlsEnable() {
		return mailSmtpStartTlsEnable;
	}

	public void setMailSmtpStartTlsEnable(Boolean mailSmtpStartTlsEnable) {
		this.mailSmtpStartTlsEnable = mailSmtpStartTlsEnable;
	}

	public Boolean getMailSmtpSslEnable() {
		return mailSmtpSslEnable;
	}

	public void setMailSmtpSslEnable(Boolean mailSmtpSslEnable) {
		this.mailSmtpSslEnable = mailSmtpSslEnable;
	}

	public Integer getMailSmtpConnTimeout() {
		return mailSmtpConnTimeout;
	}

	public void setMailSmtpConnTimeout(Integer mailSmtpConnTimeout) {
		this.mailSmtpConnTimeout = mailSmtpConnTimeout;
	}

	public Integer getMailSmtpTimeout() {
		return mailSmtpTimeout;
	}

	public void setMailSmtpTimeout(Integer mailSmtpTimeout) {
		this.mailSmtpTimeout = mailSmtpTimeout;
	}

	public Integer getMailSmtpWriteTimeout() {
		return mailSmtpWriteTimeout;
	}

	public void setMailSmtpWriteTimeout(Integer mailSmtpWriteTimeout) {
		this.mailSmtpWriteTimeout = mailSmtpWriteTimeout;
	}

	public Boolean getMailSendOnTaskCompletion() {
		return mailSendOnTaskCompletion;
	}

	public void setMailSendOnTaskCompletion(Boolean mailSendOnTaskCompletion) {
		this.mailSendOnTaskCompletion = mailSendOnTaskCompletion;
	}

	public Long getMailCheckTaskCompletionPeriod() {
		return mailCheckTaskCompletionPeriod;
	}

	public void setMailCheckTaskCompletionPeriod(Long mailCheckTaskCompletionPeriod) {
		this.mailCheckTaskCompletionPeriod = mailCheckTaskCompletionPeriod;
	}

	public Boolean getMailSendOnPolicyCompletion() {
		return mailSendOnPolicyCompletion;
	}

	public void setMailSendOnPolicyCompletion(Boolean mailSendOnPolicyCompletion) {
		this.mailSendOnPolicyCompletion = mailSendOnPolicyCompletion;
	}

	public Long getMailCheckPolicyCompletionPeriod() {
		return mailCheckPolicyCompletionPeriod;
	}

	public void setMailCheckPolicyCompletionPeriod(Long mailCheckPolicyCompletionPeriod) {
		this.mailCheckPolicyCompletionPeriod = mailCheckPolicyCompletionPeriod;
	}

	public String getHotDeploymentPath() {
		return hotDeploymentPath;
	}

	public void setHotDeploymentPath(String hotDeploymentPath) {
		this.hotDeploymentPath = hotDeploymentPath;
	}

	public Protocol getFileServerProtocol() {
		return fileServerProtocol;
	}

	public void setFileServerProtocol(Protocol fileServerProtocol) {
		this.fileServerProtocol = fileServerProtocol;
	}

	public String getFileServerHost() {
		return fileServerHost;
	}

	public void setFileServerHost(String fileServerHost) {
		this.fileServerHost = fileServerHost;
	}

	public String getFileServerUsername() {
		return fileServerUsername;
	}

	public void setFileServerUsername(String fileServerUsername) {
		this.fileServerUsername = fileServerUsername;
	}

	public String getFileServerPassword() {
		return fileServerPassword;
	}

	public void setFileServerPassword(String fileServerPassword) {
		this.fileServerPassword = fileServerPassword;
	}

	public String getFileServerPluginPath() {
		return fileServerPluginPath;
	}

	public void setFileServerPluginPath(String fileServerPluginPath) {
		this.fileServerPluginPath = fileServerPluginPath;
	}

	public String getFileServerAgreementPath() {
		return fileServerAgreementPath;
	}

	public void setFileServerAgreementPath(String fileServerAgreementPath) {
		this.fileServerAgreementPath = fileServerAgreementPath;
	}

	public String getFileServerAgentFilePath() {
		return fileServerAgentFilePath;
	}

	public void setFileServerAgentFilePath(String fileServerAgentFilePath) {
		this.fileServerAgentFilePath = fileServerAgentFilePath;
	}

	public String getFileServerUrl() {
		return fileServerUrl;
	}

	public void setFileServerUrl(String fileServerUrl) {
		this.fileServerUrl = fileServerUrl;
	}

	public Integer getFileServerPort() {
		return fileServerPort;
	}

	public void setFileServerPort(Integer fileServerPort) {
		this.fileServerPort = fileServerPort;
	}

	public String getCronTaskList() {
		return cronTaskList;
	}

	public void setCronTaskList(String cronTaskList) {
		this.cronTaskList = cronTaskList;
	}

	public Integer getEntrySizeLimit() {
		return entrySizeLimit;
	}

	public void setEntrySizeLimit(Integer entrySizeLimit) {
		this.entrySizeLimit = entrySizeLimit;
	}

	public Integer getCronIntervalEntrySize() {
		return cronIntervalEntrySize;
	}

	public void setCronIntervalEntrySize(Integer cronIntervalEntrySize) {
		this.cronIntervalEntrySize = cronIntervalEntrySize;
	}

	public String getUserGroupLdapBaseDn() {
		return userGroupLdapBaseDn;
	}

	public void setUserGroupLdapBaseDn(String userGroupLdapBaseDn) {
		this.userGroupLdapBaseDn = userGroupLdapBaseDn;
	}

	public String getAhenkGroupLdapBaseDn() {
		return ahenkGroupLdapBaseDn;
	}

	public void setAhenkGroupLdapBaseDn(String ahenkGroupLdapBaseDn) {
		this.ahenkGroupLdapBaseDn = ahenkGroupLdapBaseDn;
	}

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
}
