package tr.org.lider.services;
//package tr.org.lider.services;
//
//import java.util.HashMap;
//import java.util.Locale;
//import java.util.Map;
//
//import javax.annotation.PostConstruct;
//
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.parsing.Problem;
//import org.springframework.core.env.Environment;
//import org.springframework.stereotype.Service;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//
//import tr.org.lider.messaging.enums.Protocol;
//import tr.org.lider.messaging.messages.FileServerConf;
//
///**
// * This class provides configurations throughout the system.
// *
// */
//@Service
//public class ConfigurationService{
//
//	private static Logger logger = LoggerFactory.getLogger(ConfigurationService.class);
//
//	// Lider configuration
//	private String liderLocale;
//
//	// LDAP configuration
//	private String ldapServer;
//	private String ldapPort;
//	private String ldapUsername;
//	private String ldapPassword;
//	private String ldapRootDn;
//	private Boolean ldapUseSsl;
//	private String ldapSearchAttributes;
//	private Boolean ldapAllowSelfSignedCert;
//	private String ldapMailNotifierAttributes;
//	private String ldapEmailAttribute;
//
//	// XMPP configuration
//	private String xmppHost; // host name/server name
//	private Integer xmppPort;
//	private String xmppUsername;
//	private String xmppPassword;
//	private String xmppResource;
//	private String xmppServiceName; // service name / XMPP domain
//	private int xmppMaxRetryConnectionCount;
//	private int xmppPacketReplayTimeout;
//	private Integer xmppPingTimeout;
//	private Boolean xmppUseSsl;
//	private Boolean xmppAllowSelfSignedCert;
//	private Boolean xmppUseCustomSsl;
//	private Integer xmppPresencePriority;
//
//	// Agent configuration
//	private String agentLdapBaseDn;
//	private String agentLdapIdAttribute;
//	private String agentLdapJidAttribute;
//	private String agentLdapObjectClasses;
//
//	// User configuration
//	private String userLdapBaseDn;
//	private String userLdapUidAttribute;
//	private String userLdapPrivilegeAttribute;
//	private String userLdapObjectClasses;
//	private Boolean userAuthorizationEnabled;
//	private String groupLdapObjectClasses;
//	private String roleLdapObjectClasses;
//	private String userLdapRolesDn;
//	private String groupLdapBaseDn;
//
//	// Task manager configuration
//	private Boolean taskManagerCheckFutureTask;
//	private Long taskManagerFutureTaskCheckPeriod;
//
//	// Alarm configuration
//	private Boolean alarmCheckReport;
//
//	// Mail configuration
//	private String mailAddress;
//	private String mailPassword;
//	private String mailHost;
//	private Integer mailSmtpPort;
//	private Boolean mailSmtpAuth;
//	private Boolean mailSmtpStartTlsEnable;
//	private Boolean mailSmtpSslEnable;
//	private Integer mailSmtpConnTimeout;
//	private Integer mailSmtpTimeout;
//	private Integer mailSmtpWriteTimeout;
//
//	private Boolean mailSendOnTaskCompletion;
//	private Long mailCheckTaskCompletionPeriod;
//
//	private Boolean mailSendOnPolicyCompletion;
//	private Long mailCheckPolicyCompletionPeriod;
//
//	// Hot deployment configuration
//	private String hotDeploymentPath;
//
//	// File server configuration
//	private Protocol fileServerProtocol;
//	private String fileServerHost;
//	private String fileServerUsername;
//	private String fileServerPassword;
//	private String fileServerPluginPath;
//	private String fileServerAgreementPath;
//	private String fileServerAgentFilePath;
//	private String fileServerUrl;
//	private Integer fileServerPort;
//
//	// cron manipluate for performance
//	private String cronTaskList;
//	private Integer entrySizeLimit;
//	private Integer cronIntervalEntrySize;
//	
//	
//	private String adDomainName;
//	private String adHostName;
//	private String adIpAddress;
//	private String adAdminUserName;
//	private String adAdminPassword;
//
//	@Autowired
//	private Environment env;
//
//	private String userGroupLdapBaseDn;
//
//	private String ahenkGroupLdapBaseDn;
//
//	@PostConstruct
//	public void init() throws Exception {
//
//		// Lider configuration
//		liderLocale = env.getProperty("lider.locale");
//
//		// LDAP configuration
//		ldapServer = env.getProperty("ldap.server");
//		ldapPort = env.getProperty("ldap.port");
//		ldapUsername = env.getProperty("ldap.username");
//		ldapPassword = env.getProperty("ldap.password");
//		ldapRootDn = env.getProperty("ldap.root.dn");
//		ldapUseSsl = Boolean.getBoolean(env.getProperty("ldap.use.ssl"));
//		ldapSearchAttributes = env.getProperty("ldap.search.attributes");
//		ldapAllowSelfSignedCert = Boolean.getBoolean(env.getProperty("ldap.allow.self.signed.cert"));
//		ldapMailNotifierAttributes = env.getProperty("ldap.mail.notifier.attributes");
//		ldapEmailAttribute = env.getProperty("ldap.email.attribute");
//
//		// XMPP configuration
//		xmppHost = env.getProperty("xmpp.host");// host name/server name
//		xmppPort = Integer.parseInt(env.getProperty("xmpp.port"));
//		xmppUsername = env.getProperty("xmpp.username");
//		xmppPassword = env.getProperty("xmpp.password");
//		xmppResource = env.getProperty("xmpp.resource");
//		xmppServiceName = env.getProperty("xmpp.service.name"); // service name / XMPP domain
//		xmppMaxRetryConnectionCount = Integer.parseInt(env.getProperty("xmpp.max.retry.connection.count"));
//		xmppPacketReplayTimeout = Integer.parseInt(env.getProperty("xmpp.packet.replay.timeout"));
//		xmppPingTimeout = Integer.parseInt(env.getProperty("xmpp.ping.timeout"));
//		xmppUseSsl = Boolean.getBoolean(env.getProperty("xmpp.use.ssl"));
//		xmppAllowSelfSignedCert = Boolean.getBoolean(env.getProperty("xmpp.allow.self.signed.cert"));
//		xmppUseCustomSsl = Boolean.getBoolean(env.getProperty("xmpp.use.custom.ssl"));
//		xmppPresencePriority = Integer.parseInt(env.getProperty("xmpp.presence.priority"));
//
//		// Agent configuration
//		agentLdapBaseDn = env.getProperty("agent.ldap.base.dn");
//		agentLdapIdAttribute = env.getProperty("agent.ldap.id.attribute");
//		agentLdapJidAttribute = env.getProperty("agent.ldap.jid.attribute");
//		agentLdapObjectClasses = env.getProperty("agent.ldap.object.classes");
//
//		// User configuration
//		userLdapBaseDn = env.getProperty("user.ldap.base.dn");
//		userLdapUidAttribute = env.getProperty("user.ldap.uid.attribute");
//		userLdapPrivilegeAttribute = env.getProperty("user.ldap.privilege.attribute");
//		userLdapObjectClasses = env.getProperty("user.ldap.object.classes");
//		userAuthorizationEnabled = Boolean.getBoolean(env.getProperty("user.authorization.enabled"));
//		groupLdapObjectClasses = env.getProperty("group.ldap.object.classes");
//		roleLdapObjectClasses = env.getProperty("role.ldap.object.classes");
//		
//		setGroupLdapBaseDn(env.getProperty("group.ldap.base.dn"));
//		setUserLdapRolesDn(env.getProperty("user.ldap.roles.dn"));
//		
//		// File server configuration
//		if(env.getProperty("file.server.protocol").equalsIgnoreCase(Protocol.SSH.toString())) {
//			fileServerProtocol = Protocol.SSH;
//		}else if(env.getProperty("file.server.protocol").equalsIgnoreCase(Protocol.HTTP.toString()))
//			fileServerProtocol = Protocol.HTTP;
//		fileServerHost = env.getProperty("file.server.host");
//		fileServerUsername = env.getProperty("file.server.username");
//		fileServerPassword = env.getProperty("file.server.password");
//		fileServerPluginPath = env.getProperty("file.server.plugin.path");
//		fileServerAgreementPath = env.getProperty("file.server.agreement.path");
//		fileServerAgentFilePath = env.getProperty("file.server.agent.file.path");
//		fileServerUrl = env.getProperty("file.server.agent.fileServerUrl");
//		fileServerPort = new Integer(env.getProperty("file.server.port"));
//		
//		setUserGroupLdapBaseDn(env.getProperty("user.group.ldap.base.dn"));
//		setAhenkGroupLdapBaseDn(env.getProperty("agent.group.ldap.base.dn"));
//		
//		
//		// ldap ad configuration
//		
//		 adDomainName = env.getProperty("ad.domainname");
//		 adHostName = env.getProperty("ad.hostname");
//		 adIpAddress= env.getProperty("ad.ipaddress");
//		 adAdminUserName= env.getProperty("ad.adminusername");
//		 adAdminPassword= env.getProperty("ad.adminpassword");
//		
//	}
//
//	public void refresh() {
//		logger.info("Configuration updated using blueprint: {}", prettyPrintConfig());
//	}
//
//	public String prettyPrintConfig() {
//		try {
//			return new ObjectMapper().writerWithDefaultPrettyPrinter().toString();
//		} catch (Exception e) {
//		}
//		return toString();
//	}
//
//	
//	public String getLiderLocale() {
//		return liderLocale;
//	}
//
//	public void setLiderLocale(String liderLocale) {
//		this.liderLocale = liderLocale;
//	}
//
//	
//	public String getLdapServer() {
//		return ldapServer;
//	}
//
//	public void setLdapServer(String ldapServer) {
//		this.ldapServer = ldapServer;
//	}
//
//	
//	public String getLdapPort() {
//		return ldapPort;
//	}
//
//	public void setLdapPort(String ldapPort) {
//		this.ldapPort = ldapPort;
//	}
//
//	
//	public String getLdapUsername() {
//		return ldapUsername;
//	}
//
//	public void setLdapUsername(String ldapUsername) {
//		this.ldapUsername = ldapUsername;
//	}
//
//	
//	public String getLdapPassword() {
//		return ldapPassword;
//	}
//
//	public void setLdapPassword(String ldapPassword) {
//		this.ldapPassword = ldapPassword;
//	}
//
//	
//	public String getLdapRootDn() {
//		return ldapRootDn;
//	}
//
//	public void setLdapRootDn(String ldapRootDn) {
//		this.ldapRootDn = ldapRootDn;
//	}
//
//	
//	public Boolean getLdapUseSsl() {
//		return ldapUseSsl;
//	}
//
//	public void setLdapUseSsl(Boolean ldapUseSsl) {
//		this.ldapUseSsl = ldapUseSsl;
//	}
//
//	
//	public Boolean getLdapAllowSelfSignedCert() {
//		return ldapAllowSelfSignedCert;
//	}
//
//	public void setLdapAllowSelfSignedCert(Boolean ldapAllowSelfSignedCert) {
//		this.ldapAllowSelfSignedCert = ldapAllowSelfSignedCert;
//	}
//
//	
//	public String getXmppHost() {
//		return xmppHost;
//	}
//
//	public void setXmppHost(String xmppHost) {
//		this.xmppHost = xmppHost;
//	}
//
//	
//	public Integer getXmppPort() {
//		return xmppPort;
//	}
//
//	public void setXmppPort(Integer xmppPort) {
//		this.xmppPort = xmppPort;
//	}
//
//	
//	public String getXmppUsername() {
//		return xmppUsername;
//	}
//
//	public void setXmppUsername(String xmppUsername) {
//		this.xmppUsername = xmppUsername;
//	}
//
//	
//	public String getXmppPassword() {
//		return xmppPassword;
//	}
//
//	public void setXmppPassword(String xmppPassword) {
//		this.xmppPassword = xmppPassword;
//	}
//
//	
//	public String getXmppResource() {
//		return xmppResource;
//	}
//
//	public void setXmppResource(String xmppResource) {
//		this.xmppResource = xmppResource;
//	}
//
//	
//	public String getXmppServiceName() {
//		return xmppServiceName;
//	}
//
//	public void setXmppServiceName(String xmppServiceName) {
//		this.xmppServiceName = xmppServiceName;
//	}
//
//	
//	public int getXmppMaxRetryConnectionCount() {
//		return xmppMaxRetryConnectionCount;
//	}
//
//	public void setXmppMaxRetryConnectionCount(int xmppMaxRetryConnectionCount) {
//		this.xmppMaxRetryConnectionCount = xmppMaxRetryConnectionCount;
//	}
//
//	
//	public int getXmppPacketReplayTimeout() {
//		return xmppPacketReplayTimeout;
//	}
//
//	public void setXmppPacketReplayTimeout(int xmppPacketReplayTimeout) {
//		this.xmppPacketReplayTimeout = xmppPacketReplayTimeout;
//	}
//
//	
//	public Integer getXmppPingTimeout() {
//		return xmppPingTimeout;
//	}
//
//	public void setXmppPingTimeout(Integer xmppPingTimeout) {
//		this.xmppPingTimeout = xmppPingTimeout;
//	}
//
//	
//	public Boolean getXmppUseSsl() {
//		return xmppUseSsl;
//	}
//
//	public void setXmppUseSsl(Boolean xmppUseSsl) {
//		this.xmppUseSsl = xmppUseSsl;
//	}
//
//	
//	public Boolean getXmppAllowSelfSignedCert() {
//		return xmppAllowSelfSignedCert;
//	}
//
//	public void setXmppAllowSelfSignedCert(Boolean xmppAllowSelfSignedCert) {
//		this.xmppAllowSelfSignedCert = xmppAllowSelfSignedCert;
//	}
//
//	
//	public Integer getXmppPresencePriority() {
//		return xmppPresencePriority;
//	}
//
//	public void setXmppPresencePriority(Integer xmppPresencePriority) {
//		this.xmppPresencePriority = xmppPresencePriority;
//	}
//
//	
//	public String getAgentLdapBaseDn() {
//		return agentLdapBaseDn;
//	}
//
//	public void setAgentLdapBaseDn(String agentLdapBaseDn) {
//		this.agentLdapBaseDn = agentLdapBaseDn;
//	}
//
//	
//	public String getAgentLdapIdAttribute() {
//		return agentLdapIdAttribute;
//	}
//
//	public void setAgentLdapIdAttribute(String agentLdapIdAttribute) {
//		this.agentLdapIdAttribute = agentLdapIdAttribute;
//	}
//
//	
//	public String getAgentLdapJidAttribute() {
//		return agentLdapJidAttribute;
//	}
//
//	public void setAgentLdapJidAttribute(String agentLdapJidAttribute) {
//		this.agentLdapJidAttribute = agentLdapJidAttribute;
//	}
//
//	
//	public String getAgentLdapObjectClasses() {
//		return agentLdapObjectClasses;
//	}
//
//	public void setAgentLdapObjectClasses(String agentLdapObjectClasses) {
//		this.agentLdapObjectClasses = agentLdapObjectClasses;
//	}
//
//	
//	public String getUserLdapBaseDn() {
//		return userLdapBaseDn;
//	}
//
//	public void setUserLdapBaseDn(String userLdapBaseDn) {
//		this.userLdapBaseDn = userLdapBaseDn;
//	}
//
//	
//	public String getUserLdapUidAttribute() {
//		return userLdapUidAttribute;
//	}
//
//	public void setUserLdapUidAttribute(String userLdapUidAttribute) {
//		this.userLdapUidAttribute = userLdapUidAttribute;
//	}
//
//	
//	public String getUserLdapPrivilegeAttribute() {
//		return userLdapPrivilegeAttribute;
//	}
//
//	public void setUserLdapPrivilegeAttribute(String userLdapPrivilegeAttribute) {
//		this.userLdapPrivilegeAttribute = userLdapPrivilegeAttribute;
//	}
//
//	
//	public String getUserLdapObjectClasses() {
//		return userLdapObjectClasses;
//	}
//
//	public void setUserLdapObjectClasses(String userLdapObjectClasses) {
//		this.userLdapObjectClasses = userLdapObjectClasses;
//	}
//
//	
//	public Boolean getUserAuthorizationEnabled() {
//		return userAuthorizationEnabled;
//	}
//
//	public void setUserAuthorizationEnabled(Boolean userAuthorizationEnabled) {
//		this.userAuthorizationEnabled = userAuthorizationEnabled;
//	}
//
//	
//	public String getGroupLdapObjectClasses() {
//		return groupLdapObjectClasses;
//	}
//
//	public void setGroupLdapObjectClasses(String groupLdapObjectClasses) {
//		this.groupLdapObjectClasses = groupLdapObjectClasses;
//	}
//
//	public String getRoleLdapObjectClasses() {
//		return roleLdapObjectClasses;
//	}
//
//	public void setRoleLdapObjectClasses(String roleLdapObjectClasses) {
//		this.roleLdapObjectClasses = roleLdapObjectClasses;
//	}
//
//	public Boolean getTaskManagerCheckFutureTask() {
//		return taskManagerCheckFutureTask;
//	}
//
//	public void setTaskManagerCheckFutureTask(Boolean taskManagerCheckFutureTask) {
//		this.taskManagerCheckFutureTask = taskManagerCheckFutureTask;
//	}
//
//	
//	public Long getTaskManagerFutureTaskCheckPeriod() {
//		return taskManagerFutureTaskCheckPeriod;
//	}
//
//	public void setTaskManagerFutureTaskCheckPeriod(Long taskManagerFutureTaskCheckPeriod) {
//		this.taskManagerFutureTaskCheckPeriod = taskManagerFutureTaskCheckPeriod;
//	}
//
//	
//	public Boolean getAlarmCheckReport() {
//		return alarmCheckReport;
//	}
//
//	public void setAlarmCheckReport(Boolean alarmCheckReport) {
//		this.alarmCheckReport = alarmCheckReport;
//	}
//
//	
//	public String getLdapSearchAttributes() {
//		return ldapSearchAttributes;
//	}
//
//	public void setLdapSearchAttributes(String ldapSearchAttributes) {
//		this.ldapSearchAttributes = ldapSearchAttributes;
//	}
//
//	
//	public String getMailAddress() {
//		return mailAddress;
//	}
//
//	public void setMailAddress(String mailAddress) {
//		this.mailAddress = mailAddress;
//	}
//
//	
//	public String getMailPassword() {
//		return mailPassword;
//	}
//
//	public void setMailPassword(String mailPassword) {
//		this.mailPassword = mailPassword;
//	}
//
//	
//	public String getMailHost() {
//		return mailHost;
//	}
//
//	public void setMailHost(String mailHost) {
//		this.mailHost = mailHost;
//	}
//
//	
//	public Integer getMailSmtpPort() {
//		return mailSmtpPort;
//	}
//
//	public void setMailSmtpPort(Integer mailSmtpPort) {
//		this.mailSmtpPort = mailSmtpPort;
//	}
//
//	
//	public Boolean getMailSmtpAuth() {
//		return mailSmtpAuth;
//	}
//
//	public void setMailSmtpAuth(Boolean mailSmtpAuth) {
//		this.mailSmtpAuth = mailSmtpAuth;
//	}
//
//	
//	public Boolean getMailSmtpStartTlsEnable() {
//		return mailSmtpStartTlsEnable;
//	}
//
//	public void setMailSmtpStartTlsEnable(Boolean mailSmtpStartTlsEnable) {
//		this.mailSmtpStartTlsEnable = mailSmtpStartTlsEnable;
//	}
//
//	
//	public Boolean getMailSmtpSslEnable() {
//		return mailSmtpSslEnable;
//	}
//
//	public void setMailSmtpSslEnable(Boolean mailSmtpSslEnable) {
//		this.mailSmtpSslEnable = mailSmtpSslEnable;
//	}
//
//	
//	public Integer getMailSmtpConnTimeout() {
//		return mailSmtpConnTimeout;
//	}
//
//	public void setMailSmtpConnTimeout(Integer mailSmtpConnTimeout) {
//		this.mailSmtpConnTimeout = mailSmtpConnTimeout;
//	}
//
//	
//	public Integer getMailSmtpTimeout() {
//		return mailSmtpTimeout;
//	}
//
//	public void setMailSmtpTimeout(Integer mailSmtpTimeout) {
//		this.mailSmtpTimeout = mailSmtpTimeout;
//	}
//
//	
//	public Integer getMailSmtpWriteTimeout() {
//		return mailSmtpWriteTimeout;
//	}
//
//	public void setMailSmtpWriteTimeout(Integer mailSmtpWriteTimeout) {
//		this.mailSmtpWriteTimeout = mailSmtpWriteTimeout;
//	}
//
//	
//	public Boolean getMailSendOnTaskCompletion() {
//		return mailSendOnTaskCompletion;
//	}
//
//	public void setMailSendOnTaskCompletion(Boolean mailSendOnTaskCompletion) {
//		this.mailSendOnTaskCompletion = mailSendOnTaskCompletion;
//	}
//
//	
//	public Long getMailCheckTaskCompletionPeriod() {
//		return mailCheckTaskCompletionPeriod;
//	}
//
//	public void setMailCheckTaskCompletionPeriod(Long mailCheckTaskCompletionPeriod) {
//		this.mailCheckTaskCompletionPeriod = mailCheckTaskCompletionPeriod;
//	}
//
//	
//	public Protocol getFileServerProtocolEnum() {
//		return fileServerProtocol;
//	}
//
//	
//	public String getFileServerProtocol() {
//		return fileServerProtocol != null ? fileServerProtocol.toString() : null;
//	}
//
//	public void setFileServerProtocol(String fileServerProtocol) {
//		this.fileServerProtocol = fileServerProtocol != null
//				? Protocol.valueOf(fileServerProtocol.toUpperCase(Locale.ENGLISH))
//				: null;
//	}
//
//	
//	public Map<String, Object> getFileServerPluginParams(String pluginName, String pluginVersion) {
//		Map<String, Object> params = new HashMap<String, Object>();
//		switch (fileServerProtocol) {
//		case HTTP:
//			String url = fileServerUrl + fileServerPluginPath;
//			url = url.replaceFirst("\\{0\\}", pluginName.toLowerCase(Locale.ENGLISH));
//			url = url.replaceFirst("\\{1\\}", pluginVersion);
//			params.put("url", url);
//			break;
//		case SSH:
//			params.put("host", fileServerHost);
//			params.put("username", fileServerUsername);
//			params.put("password", fileServerPassword);
//			String path = fileServerPluginPath.replaceFirst("\\{0\\}", pluginName.toLowerCase(Locale.ENGLISH));
//			path = path.replaceFirst("\\{1\\}", pluginVersion);
//			params.put("path", path);
//			params.put("port", fileServerPort);
//			break;
//		default:
//			// TODO TORRENT
//		}
//		return params;
//	}
//
//	
//	public Map<String, Object> getFileServerAgreementParams() {
//		Map<String, Object> params = new HashMap<String, Object>();
//		switch (fileServerProtocol) {
//		case HTTP:
//			params.put("url", fileServerUrl + fileServerAgreementPath);
//			break;
//		case SSH:
//			params.put("host", fileServerHost);
//			params.put("username", fileServerUsername);
//			params.put("password", fileServerPassword);
//			params.put("path", fileServerAgreementPath);
//			params.put("port", fileServerPort);
//			break;
//		default:
//			// TODO TORRENT
//		}
//		return params;
//	}
//
//	
//	public FileServerConf getFileServerConf(String jid) {
//		Map<String, Object> params = new HashMap<String, Object>();
//		switch (fileServerProtocol) {
//		case HTTP:
//			params.put("url", fileServerUrl + fileServerAgentFilePath);
//			break;
//		case SSH:
//			params.put("host", fileServerHost);
//			params.put("username", fileServerUsername);
//			params.put("password", fileServerPassword);
//			params.put("path", fileServerAgentFilePath.replaceFirst("\\{0\\}", jid));
//			params.put("port", fileServerPort);
//			break;
//		default:
//			// TODO TORRENT
//		}
//		return new FileServerConf(params, fileServerProtocol);
//	}
//
//	
//	public String getFileServerHost() {
//		return fileServerHost;
//	}
//
//	public void setFileServerHost(String fileServerHost) {
//		this.fileServerHost = fileServerHost;
//	}
//
//	
//	public String getFileServerUsername() {
//		return fileServerUsername;
//	}
//
//	public void setFileServerUsername(String fileServerUsername) {
//		this.fileServerUsername = fileServerUsername;
//	}
//
//	
//	public String getFileServerPassword() {
//		return fileServerPassword;
//	}
//
//	public void setFileServerPassword(String fileServerPassword) {
//		this.fileServerPassword = fileServerPassword;
//	}
//
//	
//	public String getFileServerPluginPath() {
//		return fileServerPluginPath;
//	}
//
//	public void setFileServerPluginPath(String fileServerPluginPath) {
//		this.fileServerPluginPath = fileServerPluginPath;
//	}
//
//	
//	public String getFileServerAgreementPath() {
//		return fileServerAgreementPath;
//	}
//
//	public void setFileServerAgreementPath(String fileServerAgreementPath) {
//		this.fileServerAgreementPath = fileServerAgreementPath;
//	}
//
//	
//	public String getFileServerAgentFilePath() {
//		return fileServerAgentFilePath;
//	}
//
//	public void setFileServerAgentFilePath(String fileServerAgentFilePath) {
//		this.fileServerAgentFilePath = fileServerAgentFilePath;
//	}
//
//	
//	public String getFileServerUrl() {
//		return fileServerUrl;
//	}
//
//	public void setFileServerUrl(String fileServerUrl) {
//		this.fileServerUrl = fileServerUrl;
//	}
//
//	
//	public Integer getFileServerPort() {
//		return fileServerPort;
//	}
//
//	public void setFileServerPort(Integer fileServerPort) {
//		this.fileServerPort = fileServerPort;
//	}
//
//	
//	public String getHotDeploymentPath() {
//		return hotDeploymentPath;
//	}
//
//	public void setHotDeploymentPath(String hotDeploymentPath) {
//		this.hotDeploymentPath = hotDeploymentPath;
//	}
//
//	
//	public Boolean getXmppUseCustomSsl() {
//		return xmppUseCustomSsl;
//	}
//
//	public void setXmppUseCustomSsl(Boolean xmppUseCustomSsl) {
//		this.xmppUseCustomSsl = xmppUseCustomSsl;
//	}
//
//	
//	public String getLdapMailNotifierAttributes() {
//		return ldapMailNotifierAttributes;
//	}
//
//	public void setLdapMailNotifierAttributes(String ldapMailNotifierAttributes) {
//		this.ldapMailNotifierAttributes = ldapMailNotifierAttributes;
//	}
//
//	
//	public String getLdapEmailAttribute() {
//		return ldapEmailAttribute;
//	}
//
//	public void setLdapEmailAttribute(String ldapEmailAttribute) {
//		this.ldapEmailAttribute = ldapEmailAttribute;
//	}
//
//	
//	public Boolean getMailSendOnPolicyCompletion() {
//		return mailSendOnPolicyCompletion;
//	}
//
//	public void setMailSendOnPolicyCompletion(Boolean mailSendOnPolicyCompletion) {
//		this.mailSendOnPolicyCompletion = mailSendOnPolicyCompletion;
//	}
//
//	
//	public Long getMailCheckPolicyCompletionPeriod() {
//		return mailCheckPolicyCompletionPeriod;
//	}
//
//	public void setMailCheckPolicyCompletionPeriod(Long mailCheckPolicyCompletionPeriod) {
//		this.mailCheckPolicyCompletionPeriod = mailCheckPolicyCompletionPeriod;
//	}
//
//	
//	public String getCronTaskList() {
//		return cronTaskList;
//	}
//
//	
//	public Integer getEntrySizeLimit() {
//		return entrySizeLimit;
//	}
//
//	
//	public Integer getCronIntervalEntrySize() {
//
//		return cronIntervalEntrySize;
//	}
//
//	@Override
//	public String toString() {
//		return "ConfigurationService [liderLocale=" + liderLocale + ", ldapServer=" + ldapServer + ", ldapPort="
//				+ ldapPort + ", ldapUsername=" + ldapUsername + ", ldapPassword=" + ldapPassword + ", ldapRootDn="
//				+ ldapRootDn + ", ldapUseSsl=" + ldapUseSsl + ", ldapSearchAttributes=" + ldapSearchAttributes
//				+ ", ldapAllowSelfSignedCert=" + ldapAllowSelfSignedCert + ", ldapMailNotifierAttributes="
//				+ ldapMailNotifierAttributes + ", ldapEmailAttribute=" + ldapEmailAttribute + ", xmppHost=" + xmppHost
//				+ ", xmppPort=" + xmppPort + ", xmppUsername=" + xmppUsername + ", xmppPassword=" + xmppPassword
//				+ ", xmppResource=" + xmppResource + ", xmppServiceName=" + xmppServiceName
//				+ ", xmppMaxRetryConnectionCount=" + xmppMaxRetryConnectionCount + ", xmppPacketReplayTimeout="
//				+ xmppPacketReplayTimeout + ", xmppPingTimeout=" + xmppPingTimeout + ", xmppUseSsl=" + xmppUseSsl
//				+ ", xmppAllowSelfSignedCert=" + xmppAllowSelfSignedCert + ", xmppUseCustomSsl=" + xmppUseCustomSsl
//				+ ", xmppPresencePriority=" + xmppPresencePriority + ", agentLdapBaseDn=" + agentLdapBaseDn
//				+ ", agentLdapIdAttribute=" + agentLdapIdAttribute + ", agentLdapJidAttribute=" + agentLdapJidAttribute
//				+ ", agentLdapObjectClasses=" + agentLdapObjectClasses + ", userLdapBaseDn=" + userLdapBaseDn
//				+ ", userLdapUidAttribute=" + userLdapUidAttribute + ", userLdapPrivilegeAttribute="
//				+ userLdapPrivilegeAttribute + ", userLdapObjectClasses=" + userLdapObjectClasses
//				+ ", userAuthorizationEnabled=" + userAuthorizationEnabled + ", groupLdapObjectClasses="
//				+ groupLdapObjectClasses + ", roleLdapObjectClasses=" + roleLdapObjectClasses + ", userLdapRolesDn="
//				+ userLdapRolesDn + ", groupLdapBaseDn=" + groupLdapBaseDn + ", taskManagerCheckFutureTask="
//				+ taskManagerCheckFutureTask + ", taskManagerFutureTaskCheckPeriod=" + taskManagerFutureTaskCheckPeriod
//				+ ", alarmCheckReport=" + alarmCheckReport + ", mailAddress=" + mailAddress + ", mailPassword="
//				+ mailPassword + ", mailHost=" + mailHost + ", mailSmtpPort=" + mailSmtpPort + ", mailSmtpAuth="
//				+ mailSmtpAuth + ", mailSmtpStartTlsEnable=" + mailSmtpStartTlsEnable + ", mailSmtpSslEnable="
//				+ mailSmtpSslEnable + ", mailSmtpConnTimeout=" + mailSmtpConnTimeout + ", mailSmtpTimeout="
//				+ mailSmtpTimeout + ", mailSmtpWriteTimeout=" + mailSmtpWriteTimeout + ", mailSendOnTaskCompletion="
//				+ mailSendOnTaskCompletion + ", mailCheckTaskCompletionPeriod=" + mailCheckTaskCompletionPeriod
//				+ ", mailSendOnPolicyCompletion=" + mailSendOnPolicyCompletion + ", mailCheckPolicyCompletionPeriod="
//				+ mailCheckPolicyCompletionPeriod + ", hotDeploymentPath=" + hotDeploymentPath + ", fileServerProtocol="
//				+ fileServerProtocol + ", fileServerHost=" + fileServerHost + ", fileServerUsername="
//				+ fileServerUsername + ", fileServerPassword=" + fileServerPassword + ", fileServerPluginPath="
//				+ fileServerPluginPath + ", fileServerAgreementPath=" + fileServerAgreementPath
//				+ ", fileServerAgentFilePath=" + fileServerAgentFilePath + ", fileServerUrl=" + fileServerUrl
//				+ ", fileServerPort=" + fileServerPort + ", cronTaskList=" + cronTaskList + ", entrySizeLimit="
//				+ entrySizeLimit + ", cronIntervalEntrySize=" + cronIntervalEntrySize + ", env=" + env
//				+ ", userGroupLdapBaseDn=" + userGroupLdapBaseDn + ", ahenkGroupLdapBaseDn=" + ahenkGroupLdapBaseDn
//				+ "]";
//	}
//
//	public void setFileServerProtocol(Protocol fileServerProtocol) {
//		this.fileServerProtocol = fileServerProtocol;
//	}
//
//	public void setCronTaskList(String cronTaskList) {
//		this.cronTaskList = cronTaskList;
//	}
//
//	public void setEntrySizeLimit(Integer entrySizeLimit) {
//		this.entrySizeLimit = entrySizeLimit;
//	}
//
//	public void setCronIntervalEntrySize(Integer cronIntervalEntrySize) {
//		this.cronIntervalEntrySize = cronIntervalEntrySize;
//	}
//
//	public String getUserLdapRolesDn() {
//		return userLdapRolesDn;
//	}
//
//	public void setUserLdapRolesDn(String userLdapRolesDn) {
//		this.userLdapRolesDn = userLdapRolesDn;
//	}
//
//	public String getGroupLdapBaseDn() {
//		return groupLdapBaseDn;
//	}
//
//	public void setGroupLdapBaseDn(String groupLdapBaseDn) {
//		this.groupLdapBaseDn = groupLdapBaseDn;
//	}
//
//	public String getUserGroupLdapBaseDn() {
//		return userGroupLdapBaseDn;
//	}
//
//	public void setUserGroupLdapBaseDn(String userGroupLdapBaseDn) {
//		this.userGroupLdapBaseDn = userGroupLdapBaseDn;
//	}
//
//	public String getAhenkGroupLdapBaseDn() {
//		return ahenkGroupLdapBaseDn;
//	}
//
//	public void setAhenkGroupLdapBaseDn(String ahenkGroupLdapBaseDn) {
//		this.ahenkGroupLdapBaseDn = ahenkGroupLdapBaseDn;
//	}
//
//	public String getAdDomainName() {
//		return adDomainName;
//	}
//
//	public void setAdDomainName(String adDomainName) {
//		this.adDomainName = adDomainName;
//	}
//
//	public String getAdHostName() {
//		return adHostName;
//	}
//
//	public void setAdHostName(String adHostName) {
//		this.adHostName = adHostName;
//	}
//
//	public String getAdIpAddress() {
//		return adIpAddress;
//	}
//
//	public void setAdIpAddress(String adIpAddress) {
//		this.adIpAddress = adIpAddress;
//	}
//
//	public String getAdAdminUserName() {
//		return adAdminUserName;
//	}
//
//	public void setAdAdminUserName(String adAdminUserName) {
//		this.adAdminUserName = adAdminUserName;
//	}
//
//	public String getAdAdminPassword() {
//		return adAdminPassword;
//	}
//
//	public void setAdAdminPassword(String adAdminPassword) {
//		this.adAdminPassword = adAdminPassword;
//	}
//
//}
