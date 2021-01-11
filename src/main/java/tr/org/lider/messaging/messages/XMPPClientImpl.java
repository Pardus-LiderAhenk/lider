/*
 *
t *    Copyright © 2015-2016 Tübitak ULAKBIM
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

import java.io.IOException;
import java.io.OutputStream;
import java.net.Socket;
import java.security.NoSuchAlgorithmException;
import java.security.Principal;
import java.security.PrivateKey;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.net.ssl.KeyManager;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509KeyManager;
import javax.net.ssl.X509TrustManager;

//import org.codehaus.jackson.JsonGenerationException;
//import org.codehaus.jackson.map.JsonMappingException;
//import org.codehaus.jackson.map.ObjectMapper;
import org.jivesoftware.smack.ConnectionConfiguration.SecurityMode;
import org.jivesoftware.smack.ReconnectionManager;
import org.jivesoftware.smack.ReconnectionManager.ReconnectionPolicy;
import org.jivesoftware.smack.SmackConfiguration;
import org.jivesoftware.smack.SmackException;
import org.jivesoftware.smack.SmackException.NoResponseException;
import org.jivesoftware.smack.SmackException.NotConnectedException;
import org.jivesoftware.smack.SmackException.NotLoggedInException;
import org.jivesoftware.smack.XMPPException;
import org.jivesoftware.smack.XMPPException.XMPPErrorException;
import org.jivesoftware.smack.packet.Message;
import org.jivesoftware.smack.packet.Presence;
import org.jivesoftware.smack.packet.Presence.Mode;
import org.jivesoftware.smack.packet.Presence.Type;
import org.jivesoftware.smack.roster.Roster;
import org.jivesoftware.smack.tcp.XMPPTCPConnection;
import org.jivesoftware.smack.tcp.XMPPTCPConnectionConfiguration;
import org.jivesoftware.smack.tcp.XMPPTCPConnectionConfiguration.Builder;
import org.jivesoftware.smackx.bytestreams.socks5.Socks5BytestreamManager;
import org.jivesoftware.smackx.bytestreams.socks5.Socks5BytestreamSession;
import org.jivesoftware.smackx.iqregister.AccountManager;
import org.jivesoftware.smackx.muc.MultiUserChat;
import org.jivesoftware.smackx.muc.MultiUserChatManager;
import org.jivesoftware.smackx.ping.PingManager;
import org.jivesoftware.smackx.receipts.DeliveryReceiptManager;
import org.jivesoftware.smackx.receipts.DeliveryReceiptManager.AutoReceiptMode;
import org.jivesoftware.smackx.xdata.Form;
import org.jivesoftware.smackx.xdata.packet.DataForm;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.messaging.listeners.OnlineRosterListener;
import tr.org.lider.messaging.listeners.PacketListener;
import tr.org.lider.messaging.listeners.PolicyListener;
import tr.org.lider.messaging.listeners.PolicyStatusListener;
//import tr.org.liderahenk.lider.messaging.listeners.AgreementStatusListener;
//import tr.org.liderahenk.lider.messaging.listeners.MissingPluginListener;
//import tr.org.liderahenk.lider.messaging.listeners.OnlineRosterListener;
//import tr.org.liderahenk.lider.messaging.listeners.PolicyListener;
//import tr.org.liderahenk.lider.messaging.listeners.PolicyStatusListener;
//import tr.org.liderahenk.lider.messaging.listeners.RegistrationListener;
//import tr.org.liderahenk.lider.messaging.listeners.RequestAgreementListener;
//import tr.org.liderahenk.lider.messaging.listeners.ScriptResultListener;
//import tr.org.liderahenk.lider.messaging.listeners.TaskStatusListener;
//import tr.org.liderahenk.lider.messaging.listeners.UserSessionListener;
import tr.org.lider.messaging.listeners.RegistrationListener;
import tr.org.lider.messaging.listeners.TaskStatusListener;
import tr.org.lider.messaging.listeners.UserSessionListener;
import tr.org.lider.messaging.listeners.XMPPConnectionListener;
import tr.org.lider.messaging.subscribers.IPolicyStatusSubscriber;
import tr.org.lider.messaging.subscribers.IPolicySubscriber;
import tr.org.lider.messaging.subscribers.IPresenceSubscriber;
import tr.org.lider.messaging.subscribers.IRegistrationSubscriber;
import tr.org.lider.messaging.subscribers.ITaskStatusSubscriber;
import tr.org.lider.messaging.subscribers.IUserSessionSubscriber;
import tr.org.lider.services.ConfigurationService;

/**
 * This class works as an XMPP client which listens to incoming packets and
 * provides XMPP utility methods such as sending messages and reading roster.
 * 
 */
@Service
public class XMPPClientImpl {

	private static Logger logger = LoggerFactory.getLogger(XMPPClientImpl.class);

	/**
	 * Connection and settings parameters are got from tr.org.liderahenk.cfg
	 */
	private String username;
	private String password;
	private String serviceName; // Service name / XMPP domain
	private String host; // Host name / Server name
	private Integer port; // Default 5222
	private int maxRetryConnectionCount;
	private int retryCount = 0;
	private int packetReplyTimeout; // milliseconds
	private int pingTimeout; // milliseconds

	/**
	 * Connection & packet listeners/filters
	 */
	private XMPPConnectionListener connectionListener;
	private OnlineRosterListener onlineRosterListener;
	private PacketListener packetListener;
	private TaskStatusListener taskStatusListener;

	private PolicyStatusListener policyStatusListener;
	private RegistrationListener registrationListener;
	private UserSessionListener userSessionListener;
	private PolicyListener policyListener;
	//	private RequestAgreementListener reqAggrementListener;
	//	private AgreementStatusListener aggrementStatusListener;
	//	private ScriptResultListener scriptResultListener;
	//	private MissingPluginListener missingPluginListener;

	/**
	 * Packet subscribers
	 */

	@Autowired
	private List<ITaskStatusSubscriber> taskStatusSubscribers;

	@Autowired
	private List<IPresenceSubscriber> presenceSubscribers;

	@Autowired
	private List<IPolicyStatusSubscriber> policyStatusSubscribers;

	@Autowired
	private IUserSessionSubscriber userSessionSubscriber;
	//	private IMissingPluginSubscriber missingPluginSubscriber;
	@Autowired
	private IPolicySubscriber policySubscriber;
	//	private IRequestAgreementSubscriber reqAggrementSubscriber;

	@Autowired
	private IRegistrationSubscriber registrationSubscriber;
	//	private IAgreementStatusSubscriber aggrementStatusSubscriber;
	//	private IScriptResultSubscriber scriptResultSubscriber;
	//	private IRegistrationSubscriber defaultRegistrationSubscriber;

	/**
	 * Lider services
	 */
	@Autowired
	private ConfigurationService configurationService;

	private XMPPTCPConnection connection;
	private XMPPTCPConnectionConfiguration config;



	@PostConstruct
	public void init() throws Exception {
		if(connection == null && configurationService.isConfigurationDone()) {
			logger.info("XMPP service initialization is started");
			setParameters();
			createXmppTcpConfiguration();
			connect();
			login();
			setServerSettings();
			addListeners();
			logger.info("XMPP service initialized");
		}
	}

	public void initXMPPClient() throws Exception  {
		logger.info("XMPP service initialization is started");
		setParameters();
		createXmppTcpConfiguration();
		connect();
		login();
		setServerSettings();
		addListeners();
		logger.info("XMPP service initialized");
	}
	
	/**
	 * Sets XMPP client parameters.
	 */
	private void setParameters() {
		this.username = configurationService.getXmppUsername();
		this.password = configurationService.getXmppPassword();
		this.serviceName = configurationService.getXmppServiceName();
		this.host = configurationService.getXmppHost();
		this.port = configurationService.getXmppPort();
		this.maxRetryConnectionCount = configurationService.getXmppMaxRetryConnectionCount();
		this.packetReplyTimeout = configurationService.getXmppPacketReplayTimeout();
		this.pingTimeout = configurationService.getXmppPingTimeout();
		logger.info("XMPP parameters are initialized");
		//logger.info(this.toString());
	}

	/**
	 * Configures XMPP connection parameters.
	 * 
	 * @throws NoSuchAlgorithmException
	 */
	private void createXmppTcpConfiguration() throws NoSuchAlgorithmException {
		PingManager.setDefaultPingInterval(pingTimeout);
		ReconnectionManager.setEnabledPerDefault(true);
		if (configurationService.getXmppUseCustomSsl()) {
			config = XMPPTCPConnectionConfiguration.builder().setServiceName(serviceName).setHost(host).setPort(port)
					.setSecurityMode(SecurityMode.ifpossible).setDebuggerEnabled(logger.isDebugEnabled())
					.setCustomSSLContext(createCustomSslContext()).build();
		} else {
			Builder builder = XMPPTCPConnectionConfiguration.builder().setServiceName(serviceName).setHost(host)
					.setPort(port).setDebuggerEnabled(logger.isDebugEnabled());
			if (configurationService.getXmppUseSsl()) {
				builder.setSecurityMode(SecurityMode.required);
				if (configurationService.getXmppAllowSelfSignedCert()) {
					builder.setCustomSSLContext(createCustomSslContext());
				}
			} else {
				builder.setSecurityMode(SecurityMode.disabled);
			}
			config = builder.build();
		}
		//logger.debug("XMPP configuration finished: {}", config.toString());
	}

	/**
	 * Connects to XMPP server
	 */
	private void connect() {
		connection = new XMPPTCPConnection(config);
		logger.info("XMPP configuration packetReplyTimeout : " + packetReplyTimeout);
		connection.setPacketReplyTimeout(packetReplyTimeout);

		// Retry connection if it fails.
		while (!connection.isConnected() && retryCount < maxRetryConnectionCount) {
			retryCount++;
			try {
				try {
					connection.connect();
				} catch (SmackException e) {
					e.printStackTrace();
				} catch (IOException e) {
					e.printStackTrace();
				}
			} catch (XMPPException e) {
				logger.error("Cannot connect to XMPP server.");
			}
		}
		retryCount = 0;
		logger.debug("Successfully connected to XMPP server.");
	}

	/**
	 * Login to connected XMPP server via provided username-password.
	 * 
	 * @param username
	 * @param password
	 */
	private void login() {
		if (connection != null && connection.isConnected()) {
			try {
				// Use resource if it is provided! Otherwise default resource is
				// 'smack'
				if (configurationService.getXmppResource() != null
						&& !configurationService.getXmppResource().isEmpty()) {
					connection.login(username, password, configurationService.getXmppResource() );
				} else {
					connection.login(username, password);
				}
				Presence p = new Presence(Type.available, "ONLINE", configurationService.getXmppPresencePriority(),
						Mode.available);
				connection.sendStanza(p);
				logger.debug("Successfully logged in to XMPP server: {}", username);
			} catch (XMPPException e) {
				logger.error(e.getMessage(), e);
			} catch (SmackException e) {
				logger.error(e.getMessage(), e);
			} catch (IOException e) {
				logger.error(e.getMessage(), e);
			}
		}
	}

	/**
	 * Configure XMPP connection to use provided ping timeout and reply timeout.
	 */
	private void setServerSettings() {
		// Enable auto-connect
		ReconnectionManager.getInstanceFor(connection).enableAutomaticReconnection();
		// Set reconnection policy to increasing delay
		ReconnectionManager.getInstanceFor(connection)
		.setReconnectionPolicy(ReconnectionPolicy.RANDOM_INCREASING_DELAY);
		// Set ping interval
		PingManager.getInstanceFor(connection).setPingInterval(pingTimeout);
		// Specifies when incoming message delivery receipt requests
		// should be automatically acknowledged with a receipt.
		DeliveryReceiptManager.getInstanceFor(connection).setAutoReceiptMode(AutoReceiptMode.always);
		SmackConfiguration.setDefaultPacketReplyTimeout(packetReplyTimeout);
		//logger.debug("Successfully set server settings: {} - {}", new Object[] { pingTimeout, packetReplyTimeout });
	}
	
	/**
	 * Hook packet and connection listeners
	 */
	private void addListeners() {
		// Hook listener for connection
		connectionListener = new XMPPConnectionListener(configurationService);
		connection.addConnectionListener(connectionListener);
		PingManager.getInstanceFor(connection).registerPingFailedListener(connectionListener);
		connection.addAsyncStanzaListener(connectionListener, connectionListener);

		// Hook listener for roster changes
		onlineRosterListener = new OnlineRosterListener(connection);
		onlineRosterListener.setPresenceSubscribers(presenceSubscribers);
		Roster.getInstanceFor(connection).addRosterListener(onlineRosterListener);

		// Hook listener for incoming packets
		packetListener = new PacketListener();
		connection.addAsyncStanzaListener(packetListener, packetListener);

		// Hook listener for task status messages
		taskStatusListener = new TaskStatusListener();
		taskStatusListener.setSubscribers(taskStatusSubscribers);
		connection.addAsyncStanzaListener(taskStatusListener, taskStatusListener);
		// Hook listener for get-policy messages
		policyListener = new PolicyListener(this);
		policyListener.setSubscriber(policySubscriber);
		connection.addAsyncStanzaListener(policyListener, policyListener);
		// Hook listener for policy status messages
		policyStatusListener = new PolicyStatusListener();
		policyStatusListener.setSubscribers(policyStatusSubscribers);
		connection.addAsyncStanzaListener(policyStatusListener, policyStatusListener);
		// Hook listener for registration messages
		registrationListener = new RegistrationListener(this);
		registrationListener.setSubscriber(registrationSubscriber);
		//registrationListener.setDefaultSubcriber(defaultRegistrationSubscriber);
		connection.addAsyncStanzaListener(registrationListener, registrationListener);
		// Hook listener for user session messages
		userSessionListener = new UserSessionListener(this);
		userSessionListener.setSubscriber(userSessionSubscriber);
		connection.addAsyncStanzaListener(userSessionListener, userSessionListener);
		//		
		//		// Hook listener for missing plugin messages
		//		missingPluginListener = new MissingPluginListener(this);
		//		missingPluginListener.setSubscriber(missingPluginSubscriber);
		//		connection.addAsyncStanzaListener(missingPluginListener, missingPluginListener);
		//		
		//		// Hook listener for agreement messages
		//		reqAggrementListener = new RequestAgreementListener(this);
		//		reqAggrementListener.setSubscriber(reqAggrementSubscriber);
		//		connection.addAsyncStanzaListener(reqAggrementListener, reqAggrementListener);
		//		aggrementStatusListener = new AgreementStatusListener();
		//		aggrementStatusListener.setSubscriber(aggrementStatusSubscriber);
		//		connection.addAsyncStanzaListener(aggrementStatusListener, aggrementStatusListener);
		//		
		//		// Hook listener for script result messages
		//		scriptResultListener = new ScriptResultListener();
		//		scriptResultListener.setSubscriber(scriptResultSubscriber);
		//		connection.addAsyncStanzaListener(scriptResultListener, scriptResultListener);

		logger.debug("Successfully added listeners for connection: {}", connection.toString());
	}

	/**
	 * Delete specific user
	 * 
	 * @param jid
	 * @param password
	 */
	public void deleteUser(String jid, String password) {
		XMPPTCPConnection tempConnection = null;
		try {
			tempConnection = new XMPPTCPConnection(this.host, this.port.toString());
			tempConnection.login(jid, password);

			AccountManager accountManager = AccountManager.getInstance(tempConnection);
			accountManager.deleteAccount();
			tempConnection.disconnect();
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}
	}

	@PreDestroy
	public void destroy() {
		logger.debug("Destroying XMPP Service");
		this.disconnect();
	}

	/**
	 * Remove all connection & packet listeners and disconnect XMPP connection.
	 */
	public void disconnect() {
		if (null != connection && connection.isConnected()) {
			// Remove listeners
			Roster.getInstanceFor(connection).removeRosterListener(onlineRosterListener);

			connection.removeConnectionListener(connectionListener);

			connection.removeAsyncStanzaListener(packetListener);
			connection.removeAsyncStanzaListener(taskStatusListener);
			connection.removeAsyncStanzaListener(connectionListener);


			//			connection.removeAsyncStanzaListener(policyStatusListener);
			//			connection.removeAsyncStanzaListener(registrationListener);
			//			connection.removeAsyncStanzaListener(userSessionListener);
			//			connection.removeAsyncStanzaListener(missingPluginListener);
			//			connection.removeAsyncStanzaListener(policyListener);
			//			
			//			connection.removeAsyncStanzaListener(reqAggrementListener);
			//			connection.removeAsyncStanzaListener(aggrementStatusListener);
			//			connection.removeAsyncStanzaListener(scriptResultListener);

			logger.debug("Listeners are removed.");
			PingManager.getInstanceFor(connection).setPingInterval(-1);
			logger.debug("Disabled ping manager");
			connection.disconnect();
			logger.info("Successfully closed XMPP connection.");
		}
	}

	/**
	 * Send provided message to provided JID. Message type is always NORMAL.
	 * 
	 * @param message
	 * @param jid
	 * @throws NotConnectedException
	 */
	public void sendMessage(String message, String jid) throws NotConnectedException {

		try{
			String jidFinal = getFullJid(jid);
			//logger.info("Sending message: {} to user: {}", new Object[] { message, jidFinal });
			Message msg = new Message(jidFinal, Message.Type.normal);
			msg.setBody(message);
			connection.sendStanza(msg);
			logger.info("Successfully sent message to user: {}", jidFinal);}
		catch(NotConnectedException ex){
			ex.printStackTrace();

			try {
				logger.debug("Tring again to connect..");
				initXMPPClient();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}
	/**
	 * Send provided message to provided JID. Message type is always NORMAL.
	 * 
	 * @param message
	 * @param jid
	 * @throws NotConnectedException
	 */
	public void sendChatMessage(String message, String jid) throws NotConnectedException {

		try{
			String jidFinal = getFullJid(jid);
			logger.info("Sending message: {} to user: {}", new Object[] { message, jidFinal });
			Message msg = new Message(jidFinal, Message.Type.chat);
			msg.setBody(message);
			connection.sendStanza(msg);
			logger.info("Successfully sent message to user: {}", jidFinal);}
		catch(NotConnectedException ex){
			ex.printStackTrace();

			try {
				logger.debug("Tring again to connect..");
				initXMPPClient();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}

	/**
	 * Convenience method for ILiderMessage instances.
	 * 
	 * @param obj
	 *            message to be sent
	 * @throws NotConnectedException
	 * @throws IOException
	 * @throws JsonMappingException
	 * @throws JsonGenerationException
	 */
	public void sendMessage(ILiderMessage message)
			throws NotConnectedException, JsonGenerationException, JsonMappingException, IOException {

		ObjectMapper mapper = new ObjectMapper();
		mapper.setDateFormat(new SimpleDateFormat("dd-MM-yyyy HH:mm"));

		String msgStr = mapper.writeValueAsString(message);
		String jid = message.getRecipient();
		sendMessage(msgStr, getFullJid(jid));
	}

	/**
	 * Check if given recipient is whether online or not.
	 * 
	 * @param jid
	 * @return true iff the provided JID is not null or empty and it is online.
	 */
	public boolean isRecipientOnline(String jid) {
		boolean isOnline = false;
		if (jid != null && !jid.isEmpty()) {
			String jidFinal = getFullJid(jid);
			Presence presence = Roster.getInstanceFor(connection).getPresence(jidFinal);
			if (presence != null) {
				isOnline = presence.isAvailable();
			}
		}
		return isOnline;
	}

	/**
	 * Send invites to clients for joining multi user chat room
	 * 
	 * @param muc
	 * @param userList
	 * @param inviteMessage
	 */
	public void sendRoomInvite(MultiUserChat muc, ArrayList<String> userList, String inviteMessage) {

		if (muc != null && muc.getRoom() != null && !muc.getRoom().isEmpty()) {

			if (userList != null && !userList.isEmpty()) {
				for (String user : userList) {
					try {
						muc.invite(user, inviteMessage);
					} catch (NotConnectedException e) {
						e.printStackTrace();
					}
				}
				logger.info(userList.size() + " clients were invited to room(" + muc.getRoom() + ")");
			}
		} else {
			logger.info("There is no available room for invitation");
		}
	}

	/**
	 * Create new multi user chat jid ex: room1@conference.localhost
	 * 
	 * @param roomJid
	 * @param nickName
	 * @return
	 */
	public MultiUserChat createRoom(String roomJid, String nickName) {
		MultiUserChat muc = MultiUserChatManager.getInstanceFor(connection).getMultiUserChat(roomJid);
		try {
			muc.create(nickName);
			muc.sendConfigurationForm(new Form(DataForm.Type.submit));
		} catch (NoResponseException e) {
			e.printStackTrace();
		} catch (XMPPErrorException e) {
			e.printStackTrace();
		} catch (SmackException e) {
			e.printStackTrace();
		}

		return muc;
	}

	/**
	 * Send message to room
	 * 
	 * @param muc
	 * @param message
	 */
	public void sendMessageToRoom(MultiUserChat muc, String message) {
		try {
			if (muc != null && muc.getMembers() != null && message != null && !message.isEmpty()) {
				muc.sendMessage(message);
			}
		} catch (NotConnectedException e) {
			e.printStackTrace();
		} catch (NoResponseException e) {
			e.printStackTrace();
		} catch (XMPPErrorException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Create new user with the provided password.
	 * 
	 * @param username
	 * @param password
	 * @return true if user created successfully, false otherwise
	 * @throws NotConnectedException
	 * @throws XMPPErrorException
	 * @throws NoResponseException
	 */
	public void createAccount(String username, String password)
			throws NoResponseException, XMPPErrorException, NotConnectedException {
		AccountManager.sensitiveOperationOverInsecureConnectionDefault(true);
		AccountManager accountManager = AccountManager.getInstance(connection);
		if (accountManager.supportsAccountCreation()) {
			accountManager.createAccount(username, password);
		}
	}

	/**
	 * Send file to provided JID via a SOCKS5 Bytestream session (XEP-0065).
	 * 
	 * @param file
	 * @param jid
	 * @throws SmackException
	 * @throws InterruptedException
	 * @throws IOException
	 * @throws XMPPException
	 */
	public void sendFile(byte[] file, String jid)
			throws XMPPException, IOException, InterruptedException, SmackException {
		String jidFinal = getFullJid(jid);
		jidFinal += "/receiver";
		Socks5BytestreamManager bytestreamManager = Socks5BytestreamManager.getBytestreamManager(connection);
		OutputStream outputStream = null;
		try {
			Socks5BytestreamSession session = bytestreamManager.establishSession(jidFinal);
			outputStream = session.getOutputStream();
			outputStream.write(file);
			outputStream.flush();
		} finally {
			if (outputStream != null) {
				try {
					outputStream.close();
				} catch (IOException e) {
					logger.error(e.getMessage(), e);
				}
			}
		}
	}

	/**
	 * Get full JID in format:<br/>
	 * "jid@$serviceName"
	 * 
	 * @param jid
	 * @return JID full name (jid + service name)
	 */
	public String getFullJid(String jid) {
		String jidFinal = jid;
		if (jid.indexOf("@") < 0) {
			jidFinal = jid + "@" + serviceName;
		}
		return jidFinal;
	}

	/***
	 * 
	 * @return custom SSL context with x509 trust manager.
	 */
	public SSLContext createCustomSslContext() {
		try {
			TrustManager[] bypassTrustManagers = new TrustManager[] { new X509TrustManager() {
				public X509Certificate[] getAcceptedIssuers() {
					return new X509Certificate[0];
				}

				public void checkClientTrusted(X509Certificate[] chain, String authType) {
				}

				public void checkServerTrusted(X509Certificate[] chain, String authType) {
				}
			} };
			KeyManager[] bypassKeyManagers = new KeyManager[] { new X509KeyManager() {

				@Override
				public String chooseClientAlias(String[] arg0, Principal[] arg1, Socket arg2) {
					return null;
				}

				@Override
				public String chooseServerAlias(String arg0, Principal[] arg1, Socket arg2) {
					return null;
				}

				@Override
				public X509Certificate[] getCertificateChain(String arg0) {
					return null;
				}

				@Override
				public String[] getClientAliases(String arg0, Principal[] arg1) {
					return null;
				}

				@Override
				public PrivateKey getPrivateKey(String arg0) {
					return null;
				}

				@Override
				public String[] getServerAliases(String arg0, Principal[] arg1) {
					return null;
				}

			} };
			SSLContext context = SSLContext.getInstance("TLS");
			context.init(bypassKeyManagers, bypassTrustManagers, new SecureRandom());
			return context;
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}
		return null;
	}

	/**
	 * 
	 * @param configurationService
	 */
	public void setConfigurationService(ConfigurationService configurationService) {
		this.configurationService = configurationService;
	}

	/**
	 * 
	 * @param presenceSubscribers
	 */
	public void setPresenceSubscribers(List<IPresenceSubscriber> presenceSubscribers) {
		this.presenceSubscribers = presenceSubscribers;
		logger.info("Presence subscribers updated: {}",
				presenceSubscribers != null ? presenceSubscribers.size() : "empty");
		if (onlineRosterListener != null) {
			onlineRosterListener.setPresenceSubscribers(presenceSubscribers);
		}
	}

	/**
	 * 
	 * @param taskStatusSubscribers
	 */
	public void setTaskStatusSubscribers(List<ITaskStatusSubscriber> taskStatusSubscribers) {
		this.taskStatusSubscribers = taskStatusSubscribers;
		logger.info("Task status subscribers updated: {}",
				taskStatusSubscribers != null ? taskStatusSubscribers.size() : "empty");
		if (taskStatusListener != null) {
			taskStatusListener.setSubscribers(taskStatusSubscribers);
		}
	}

	public void addTaskStatusSubscribers(ITaskStatusSubscriber taskStatusSubscriber) {
		logger.info("Task status subscribers adding new subscriber");
		if (taskStatusSubscriber != null && taskStatusSubscribers!=null) {
			taskStatusSubscribers.add(taskStatusSubscriber);
		}
		taskStatusListener.setSubscribers(taskStatusSubscribers);
	}
	//
	//	/**
	//	 * 
	//	 * @param policyStatusSubscribers
	//	 */
	//	public void setPolicyStatusSubscribers(List<IPolicyStatusSubscriber> policyStatusSubscribers) {
	//		this.policyStatusSubscribers = policyStatusSubscribers;
	//		logger.info("Policy status subscribers updated: {}",
	//				policyStatusSubscribers != null ? policyStatusSubscribers.size() : "empty");
	//		if (policyStatusListener != null) {
	//			policyStatusListener.setSubscribers(policyStatusSubscribers);
	//		}
	//	}
	//
	//	/**
	//	 * 
	//	 * @param userSessionSubscriber
	//	 */
	//	public void setUserSessionSubscriber(IUserSessionSubscriber userSessionSubscriber) {
	//		this.userSessionSubscriber = userSessionSubscriber;
	//		logger.info("User session subscriber updated: {}", userSessionSubscriber != null);
	//		if (userSessionListener != null) {
	//			userSessionListener.setSubscriber(userSessionSubscriber);
	//		}
	//	}
	//
	//	/**
	//	 * 
	//	 * @param missingPluginSubscriber
	//	 */
	//	public void setMissingPluginSubscriber(IMissingPluginSubscriber missingPluginSubscriber) {
	//		this.missingPluginSubscriber = missingPluginSubscriber;
	//		logger.info("Missing plugin subscriber updated: {}", missingPluginSubscriber != null);
	//		if (missingPluginListener != null) {
	//			missingPluginListener.setSubscriber(missingPluginSubscriber);
	//		}
	//	}
	//
	//	/**
	//	 * 
	//	 * @param policySubscriber
	//	 */
	//	public void setPolicySubscriber(IPolicySubscriber policySubscriber) {
	//		this.policySubscriber = policySubscriber;
	//		logger.info("Policy subscriber updated: {}", policySubscriber != null);
	//		if (policyListener != null) {
	//			policyListener.setSubscriber(policySubscriber);
	//		}
	//	}
	//
	//	/**
	//	 * 
	//	 * @param reqAggrementSubscriber
	//	 */
	//	public void setReqAggrementSubscriber(IRequestAgreementSubscriber reqAggrementSubscriber) {
	//		this.reqAggrementSubscriber = reqAggrementSubscriber;
	//		logger.info("Request agreement subscriber updated: {}", reqAggrementSubscriber != null);
	//		if (reqAggrementListener != null) {
	//			reqAggrementListener.setSubscriber(reqAggrementSubscriber);
	//		}
	//	}
	//
	//	/**
	//	 * 
	//	 * @param registrationSubscriber
	//	 */
	//	public void setRegistrationSubscriber(IRegistrationSubscriber registrationSubscriber) {
	//		this.registrationSubscriber = registrationSubscriber;
	//		logger.info("Registration subscriber updated: {}", registrationSubscriber != null);
	//		if (registrationListener != null) {
	//			registrationListener.setSubscriber(registrationSubscriber);
	//		}
	//	}
	//
	//	/**
	//	 * 
	//	 * @param aggrementStatusSubscriber
	//	 */
	//	public void setAggrementStatusSubscriber(IAgreementStatusSubscriber aggrementStatusSubscriber) {
	//		this.aggrementStatusSubscriber = aggrementStatusSubscriber;
	//		logger.info("Agreement status subscriber updated: {}", aggrementStatusSubscriber != null);
	//		if (aggrementStatusListener != null) {
	//			aggrementStatusListener.setSubscriber(aggrementStatusSubscriber);
	//		}
	//	}
	//
	//	/**
	//	 * 
	//	 * @param scriptResultSubscriber
	//	 */
	//	public void setScriptResultSubscriber(IScriptResultSubscriber scriptResultSubscriber) {
	//		this.scriptResultSubscriber = scriptResultSubscriber;
	//		logger.info("Script result subscriber updated: {}", scriptResultSubscriber != null);
	//		if (scriptResultListener != null) {
	//			scriptResultListener.setSubscriber(scriptResultSubscriber);
	//		}
	//	}
	//
	//	/**
	//	 * 
	//	 * @param defaultRegistrationSubscriber
	//	 */
	//	public void setDefaultRegistrationSubscriber(IRegistrationSubscriber defaultRegistrationSubscriber) {
	//		this.defaultRegistrationSubscriber = defaultRegistrationSubscriber;
	//		if (registrationListener != null) {
	//			registrationListener.setDefaultSubcriber(defaultRegistrationSubscriber);
	//		}
	//	}

	/**
	 * 
	 * @return
	 */
	public List<String> getOnlineUsers() {
		return onlineRosterListener.getOnlineUsers();
	}

	/**
	 * 
	 * @return
	 */
	public List<String> getOfflineUsers() {
		return onlineRosterListener.getOfflineUsers();
	}

	/**
	 * 
	 * @return
	 */
	public XMPPTCPConnection getConnection() {
		return connection;
	}
	
	public void addClientToRoster(String jid) {

		Roster roster = Roster.getInstanceFor(connection);
		if (!roster.isLoaded())
			try {
				roster.reloadAndWait();
			} catch (SmackException.NotLoggedInException e) {
				e.printStackTrace();
			} catch (SmackException.NotConnectedException e) {
				e.printStackTrace();
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		try {
			roster.createEntry(jid, jid, null);
			roster.setSubscriptionMode(Roster.SubscriptionMode.accept_all);
		} catch (NotLoggedInException | NoResponseException | XMPPErrorException | NotConnectedException e) {
			e.printStackTrace();
		}
	}

}
