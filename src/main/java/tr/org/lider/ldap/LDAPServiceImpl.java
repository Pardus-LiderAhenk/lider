
package tr.org.lider.ldap;

import java.net.Socket;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.Principal;
import java.security.PrivateKey;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.net.ssl.KeyManager;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509KeyManager;
import javax.net.ssl.X509TrustManager;

import org.apache.commons.pool.impl.GenericObjectPool;
import org.apache.directory.api.ldap.model.cursor.EntryCursor;
import org.apache.directory.api.ldap.model.cursor.SearchCursor;
import org.apache.directory.api.ldap.model.entry.Attribute;
import org.apache.directory.api.ldap.model.entry.DefaultEntry;
import org.apache.directory.api.ldap.model.entry.DefaultModification;
import org.apache.directory.api.ldap.model.entry.Entry;
import org.apache.directory.api.ldap.model.entry.Modification;
import org.apache.directory.api.ldap.model.entry.ModificationOperation;
import org.apache.directory.api.ldap.model.entry.Value;
import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.AddRequest;
import org.apache.directory.api.ldap.model.message.AddRequestImpl;
import org.apache.directory.api.ldap.model.message.AddResponse;
import org.apache.directory.api.ldap.model.message.LdapResult;
import org.apache.directory.api.ldap.model.message.ModifyRequest;
import org.apache.directory.api.ldap.model.message.ModifyRequestImpl;
import org.apache.directory.api.ldap.model.message.Response;
import org.apache.directory.api.ldap.model.message.ResultCodeEnum;
import org.apache.directory.api.ldap.model.message.SearchRequest;
import org.apache.directory.api.ldap.model.message.SearchRequestImpl;
import org.apache.directory.api.ldap.model.message.SearchResultEntry;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.apache.directory.api.ldap.model.name.Dn;
import org.apache.directory.ldap.client.api.LdapConnection;
import org.apache.directory.ldap.client.api.LdapConnectionConfig;
import org.apache.directory.ldap.client.api.LdapConnectionPool;
import org.apache.directory.ldap.client.api.PoolableLdapConnectionFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.messaging.messages.XMPPClientImpl;
import tr.org.lider.services.ConfigurationService;


//import tr.org.liderahenk.lider.core.api.caching.ICacheService;
//import tr.org.liderahenk.lider.core.api.configuration.IConfigurationService;
//import tr.org.liderahenk.lider.core.api.ldap.ILDAPService;
//import tr.org.liderahenk.lider.core.api.ldap.LdapSearchFilterAttribute;
//import tr.org.liderahenk.lider.core.api.ldap.enums.SearchFilterEnum;
//import tr.org.liderahenk.lider.core.api.ldap.exceptions.LdapException;
//import tr.org.liderahenk.lider.core.api.ldap.model.IReportPrivilege;
//import tr.org.liderahenk.lider.core.api.ldap.model.ITaskPrivilege;
//import tr.org.liderahenk.lider.core.api.ldap.model.IUser;
//import tr.org.liderahenk.lider.ldap.model.ReportPrivilegeImpl;
//import tr.org.liderahenk.lider.ldap.model.TaskPrivilegeImpl;
//import tr.org.liderahenk.lider.ldap.model.UserImpl;

/**
 * Default implementation for {@link ILDAPService}
 * 
 */

@Service
public class LDAPServiceImpl implements ILDAPService {

	private final static Logger logger = LoggerFactory.getLogger(LDAPServiceImpl.class);
	
	
	

	@Autowired
	private ConfigurationService configurationService;
	//private ICacheService cacheService;
	
	
	@Autowired
	private XMPPClientImpl xmppClientImpl;
	
//	@Autowired
//	private Environment env;

	private LdapConnectionPool pool;

	/**
	 * Pattern for task privileges (e.g. [TASK:dc=mys,dc=pardus,dc=org:ALL],
	 * [TASK:dc=mys,dc=pardus,dc=org:EXECUTE_SCRIPT] )
	 */
	private static Pattern taskPriviligePattern = Pattern.compile("\\[TASK:(.+):(.+)\\]");

	/**
	 * Pattern for report privileges (e.g. [REPORT:ONLINE-USERS-REPORT] ,
	 * [REPORT:ALL] )
	 */
	private static Pattern reportPriviligePattern = Pattern.compile("\\[REPORT:([a-zA-Z0-9-,]+)\\]");

	@PostConstruct
	public void init() throws Exception {


		LdapConnectionConfig lconfig = new LdapConnectionConfig();
		lconfig.setLdapHost(configurationService.getLdapServer());
		lconfig.setLdapPort(Integer.parseInt(configurationService.getLdapPort()));
		lconfig.setName(configurationService.getLdapUsername());
		lconfig.setCredentials(configurationService.getLdapPassword());
		
		
		if (configurationService.getLdapUseSsl()) {
			lconfig.setUseSsl(true);
			if (configurationService.getLdapAllowSelfSignedCert()) {
				lconfig.setKeyManagers(createCustomKeyManagers());
				lconfig.setTrustManagers(createCustomTrustManager());
			}
		} else {
			lconfig.setUseSsl(false);
		}
		
		// Create connection pool
		PoolableLdapConnectionFactory factory = new PoolableLdapConnectionFactory(lconfig);
		pool = new LdapConnectionPool(factory);
		pool.setTestOnBorrow(true);
		pool.setMaxActive(-1);
		pool.setMaxWait(3000);
		pool.setWhenExhaustedAction(GenericObjectPool.WHEN_EXHAUSTED_BLOCK);
		logger.debug(this.toString());
	}

	private TrustManager createCustomTrustManager() {
		return new X509TrustManager() {
			public X509Certificate[] getAcceptedIssuers() {
				return new X509Certificate[0];
			}

			public void checkClientTrusted(X509Certificate[] chain, String authType) {
			}

			public void checkServerTrusted(X509Certificate[] chain, String authType) {
			}
		};
	}

	private KeyManager[] createCustomKeyManagers() {
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
		return bypassKeyManagers;
	}
	
	@PreDestroy
	public void destroy() {
		logger.info("Destroying LDAP service...");
		try {
			pool.close();
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}
	}

	/**
	 * 
	 * @return new LDAP connection
	 * @throws LdapException
	 */
	@Override
	public LdapConnection getConnection() throws LdapException {
		LdapConnection connection = null;
		try {
			connection = pool.getConnection();
		} catch (Exception e) {
			throw new LdapException(e);
		}
		return connection;
	}

	/**
	 * Try to release specified connection
	 * 
	 * @param ldapConnection
	 */
	@Override
	public void releaseConnection(LdapConnection ldapConnection) {
		try {
			pool.releaseConnection(ldapConnection);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}
	}

	/**
	 * Find user LDAP entry from given DN parameter. Use this method only if you
	 * want to <b>read his/her (task and report) privileges</b>, otherwise use
	 * getEntry() or search() methods since they are more efficient.
	 * 
	 * @param userDn
	 * @return
	 * @throws LdapException
	 */
//	@Override
//	public LiderUser getUser(String userDn) throws LdapException {
//
//		LdapConnection connection = null;
//		LiderUser user = null;
//
////		user = (LiderUser) cacheService.get("ldap:getuser:" + userDn);
//
////		if (user != null) {
////			logger.debug("Cache hit. User DN: {}", userDn);
////			return user;
////		}
////		logger.debug("Cache miss: user DN: {}, doing ldap search", userDn);
//		try {
//			connection = getConnection();
//			Entry resultEntry = connection.lookup(userDn);
//			if (null != resultEntry) {
//				user = new LiderUser();
//
//				if (null != resultEntry.get(configurationService.getUserLdapUidAttribute())) {
//					// Set user's UID/JID
//					user.setUid(resultEntry.get(configurationService.getUserLdapUidAttribute()).getString());
//				}
//
//				if (null != resultEntry.get(configurationService.getUserLdapPrivilegeAttribute())) {
//					// Set task & report privileges
////					user.setTaskPrivileges(new ArrayList<ITaskPrivilege>());
////					user.setReportPrivileges(new ArrayList<IReportPrivilege>());
//					
////					Iterator<Value<?>> iter = resultEntry.get(configurationService.getUserLdapPrivilegeAttribute())
////							.iterator();
////					while (iter.hasNext()) {
////						String privilege = iter.next().getValue().toString();
////						addUserPrivilege(user, privilege);
////					}
//
//					// Find group privileges if this user belongs to a group
//					LdapConnection connection2 = null;
//					EntryCursor cursor = null;
//
//					try {
//						connection2 = getConnection();
//
//						String filter = "(&(objectClass=pardusLider)(member=$1))".replace("$1", userDn);
//						cursor = connection2.search(configurationService.getLdapRootDn(), filter, SearchScope.SUBTREE);
//						while (cursor.next()) {
//							Entry entry = cursor.get();
//							if (null != entry) {
//								logger.debug("Found user group: {}", entry.getDn());
//								if (null != entry.get("liderPrivilege")) {
//									Iterator<Value<?>> iter2 = entry.get("liderPrivilege").iterator();
//									while (iter2.hasNext()) {
//										String privilege = iter2.next().getValue().toString();
//										addUserPrivilege(user, privilege);
//									}
//								} else {
//									logger.debug("No privilege found in group => {}", entry.getDn());
//								}
//							}
//						}
//						logger.debug("Finished processing group privileges for user {}", userDn);
//					} catch (Exception e) {
//						logger.error(e.getMessage(), e);
//						throw new LdapException(e);
//					} finally {
//						if (cursor != null) {
//							cursor.close();
//						}
//						releaseConnection(connection2);
//					}
//				}
//
////				logger.debug("Putting user to cache: user DN: {}", userDn);
////				cacheService.put("ldap:getuser:" + userDn, user);
//
//				return user;
//			}
//
//			return null;
//		} catch (Exception e) {
//			logger.error(e.getMessage(), e);
//			throw new LdapException(e);
//		} finally {
//			releaseConnection(connection);
//		}
//
//	}

//	private void addUserPrivilege(UserImpl user, String privilege) {
//		String[] privBlocks = privilege != null ? privilege.split("\\|") : null;
//		logger.debug("Found privilege: {}", privilege);
//		if (privBlocks != null) {
//			for (String privBlock : privBlocks) {
//				Matcher tMatcher = taskPriviligePattern.matcher(privBlock);
//				Matcher rMatcher = reportPriviligePattern.matcher(privBlock);
//				if (tMatcher.matches()) { // Task privilege
//					String targetEntry = tMatcher.group(1);
//					String[] taskCodes = tMatcher.group(2).split(",");
//					for (String taskCode : taskCodes) {
//						user.getTaskPrivileges().add(new TaskPrivilegeImpl(targetEntry, taskCode));
//					}
//				} else if (rMatcher.matches()) { // Report privilege
//					String[] reportCodes = rMatcher.group(1).split(",");
//					for (String reportCode : reportCodes) {
//						user.getReportPrivileges().add(new ReportPrivilegeImpl(reportCode));
//					}
//				} else {
//					logger.warn("Invalid pattern in privilege => {}", privBlock);
//				}
//			}
//		}
//	}

	/**
	 * Create new LDAP entry
	 */
	@Override
	public void addEntry(String newDn, Map<String, String[]> attributes) throws LdapException {

		LdapConnection connection = null;

		try {
			connection = getConnection();

			Dn dn = new Dn(newDn);
			Entry entry = new DefaultEntry(dn);

			for (Map.Entry<String, String[]> Entry : attributes.entrySet()) {
				String[] entryValues = Entry.getValue();
				for (String value : entryValues) {
					entry.add(Entry.getKey(), value);
				}
			}

			AddRequest addRequest = new AddRequestImpl();
			addRequest.setEntry(entry);

			AddResponse addResponse = connection.add(addRequest);
			LdapResult ldapResult = addResponse.getLdapResult();

			if (ResultCodeEnum.SUCCESS.equals(ldapResult.getResultCode())) {
				return;
			} else {
				logger.error("Could not create LDAP entry: {}", ldapResult.getDiagnosticMessage());
				throw new LdapException(ldapResult.getDiagnosticMessage());
			}
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			throw new LdapException(e);
		} finally {
			releaseConnection(connection);
		}
	}

	/**
	 * Delete specified LDAP entry
	 * 
	 * @param dn
	 * @throws LdapException
	 */
	@Override
	public void deleteEntry(String dn) throws LdapException {
		LdapConnection connection = getConnection();
		try {
			connection.delete(new Dn(dn));
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			throw new LdapException(e);
		} finally {
			releaseConnection(connection);
		}
	}

	@Override
	public void updateEntry(String entryDn, String attribute, String value) throws LdapException {
		logger.info("Replacing attribute " + attribute + " value " + value);
		LdapConnection connection = null;

		connection = getConnection();
		Entry entry = null;
		try {
			entry = connection.lookup(entryDn);
			if (entry != null) {
				if (entry.get(attribute) != null) {
					Value<?> oldValue = entry.get(attribute).get();
					entry.remove(attribute, oldValue);
				}
				entry.add(attribute, value);
				connection.modify(entry, ModificationOperation.REPLACE_ATTRIBUTE);
			}
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			throw new LdapException(e);
		} finally {
			releaseConnection(connection);
		}
	}

	@Override
	public void updateEntryAddAtribute(String entryDn, String attribute, String value) throws LdapException {
		logger.info("Adding attribute " + attribute + " value " + value);
		LdapConnection connection = null;

		connection = getConnection();
		Entry entry = null;
		try {
			entry = connection.lookup(entryDn);
			if (entry != null) {
				entry.put(attribute, value);

				ModifyRequest mr = new ModifyRequestImpl();
				mr.setName(new Dn(entryDn));
				mr.add(attribute, value);

				connection.modify(mr);
			}
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			throw new LdapException(e);
		} finally {
			releaseConnection(connection);
		}
	}


	@Override
	public void updateEntryRemoveAttribute(String entryDn, String attribute) throws LdapException {
		logger.info("Removing attribute: {}", attribute);
		LdapConnection connection = null;
		List<Modification> modificationListForRemove = new ArrayList<Modification>();
		connection = getConnection();
		Entry entry = null;
		try {
			entry = connection.lookup(entryDn);
			if (entry != null) {
				boolean isAttributeExist=false;
				for (Attribute a : entry.getAttributes()) {
					if (a.getId().contains(attribute) || a.getUpId().contains(attribute) || ( a.getAttributeType()!=null && a.getAttributeType().getName().equalsIgnoreCase(attribute))) {
						isAttributeExist=true;
						Iterator<Value<?>> iter = entry.get(a.getId()).iterator();
						while (iter.hasNext()) {
							String value = iter.next().getValue().toString();
							System.err.println(value);
							modificationListForRemove.add(new DefaultModification( ModificationOperation.REMOVE_ATTRIBUTE, a.getId(), value ));
						}
					}
				}
				if(isAttributeExist) {
					Modification[] modifications = new Modification[modificationListForRemove.size()];
					for (int i = 0; i < modificationListForRemove.size(); i++) {
						modifications[i] = modificationListForRemove.get(i);
					}
					connection.modify(entryDn, modifications);
				}
			}
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			throw new LdapException(e);
		} finally {
			releaseConnection(connection);
		}
	}

	@Override
	public void updateEntryRemoveAttributeWithValue(String entryDn, String attribute, String value)
			throws LdapException {

		logger.info("Removing attribute: {}", attribute);
		LdapConnection connection = null;

		connection = getConnection();
		Entry entry = null;
		try {
			entry = connection.lookup(entryDn);
			if (entry != null) {

				for (Attribute a : entry.getAttributes()) {
					if (a.contains(value)) {
						a.remove(value);
					}
				}

				
//				if (entry.get(attribute) != null) {
//					Value<?> oldValue = entry.get(attribute).get();
//					entry.remove(attribute, oldValue);
//				}
//				entry.add(attribute, value);
				
				connection.modify(entry, ModificationOperation.REPLACE_ATTRIBUTE);
			}
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			throw new LdapException(e);
		} finally {
			releaseConnection(connection);
		}

	}

	/**
	 * @return LDAP root DN
	 */
	@Override
	public Entry getRootDSE() throws LdapException {
		LdapConnection connection = getConnection();
		Entry entry = null;
		try {
			entry = connection.getRootDse();
		} catch (org.apache.directory.api.ldap.model.exception.LdapException e) {
			logger.error(e.getMessage(), e);
			throw new LdapException(e);
		} finally {
			releaseConnection(connection);
		}
		return entry;
	}

	@Override
	public LdapEntry getEntry(String entryDn, String[] returningAttributes) throws LdapException {

		LdapConnection conn = null;
		EntryCursor cursor = null;

		try {
			conn = getConnection();

			// Add 'objectClass' to requested attributes to determine entry type
			Set<String> requestAttributeSet = new HashSet<String>();
			requestAttributeSet.add("objectClass");
			if (returningAttributes != null) {
				requestAttributeSet.addAll(Arrays.asList(returningAttributes));
			}

			// Search for entries
			cursor = conn.search(entryDn, "(objectClass=*)", SearchScope.OBJECT,
					requestAttributeSet.toArray(new String[requestAttributeSet.size()]));
			if (cursor.next()) {
				Entry entry = cursor.get();
				Map<String, String> attributes = new HashMap<String, String>();
				for (String attr : returningAttributes) {
					try {
						attributes.put(attr, entry.get(attr).getString());
					} catch (Exception e) {
						logger.error("Cannot find attribute: {} in entry: {}", new Object[] { attr, entry.getDn() });
					}
				}
				return new LdapEntry(entryDn, attributes,null,null, convertObjectClass2DNType(entry.get("objectClass")));
			} else {
				return null;
			}
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			throw new LdapException(e);
		} finally {
			if (cursor != null) {
				cursor.close();
			}
			releaseConnection(conn);
		}
	}

	@Override
	public String getDN(String baseDn, String attributeName, String attributeValue) throws LdapException {

		LdapConnection connection = null;
		EntryCursor cursor = null;

		String filter = "(" + attributeName + "=" + attributeValue + ")";

		try {
			connection = getConnection();
			cursor = connection.search(baseDn, filter, SearchScope.SUBTREE);
			while (cursor.next()) {
				return cursor.get().getDn().getName();
			}
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			throw new LdapException(e);
		} finally {
			if (cursor != null) {
				cursor.close();
			}
			releaseConnection(connection);
		}

		return null;
	}

	/**
	 * Main search method for LDAP entries.
	 * 
	 * @param baseDn
	 *            search base DN
	 * @param filterAttributes
	 *            filtering attributes used to construct query condition
	 * @param returningAttributes
	 *            returning attributes
	 * @return list of LDAP entries
	 * @throws LdapException
	 */
	@Override
	public List<LdapEntry> search(String baseDn, List<LdapSearchFilterAttribute> filterAttributes,
			String[] returningAttributes) throws LdapException {

		List<LdapEntry> result = new ArrayList<LdapEntry>();
		LdapConnection connection = null;

		Map<String, String> attrs = null;
		Map<String, String[]> attributesMultiValues = null;

		try {
			connection = getConnection();

			SearchRequest req = new SearchRequestImpl();
			req.setScope(SearchScope.SUBTREE);

			// Add 'objectClass' to requested attributes to determine entry type
			Set<String> requestAttributeSet = new HashSet<String>();
			requestAttributeSet.add("objectClass");
			if (returningAttributes != null) {
				requestAttributeSet.addAll(Arrays.asList(returningAttributes));
			}
			req.addAttributes(requestAttributeSet.toArray(new String[requestAttributeSet.size()]));
			req.addAttributes("+");
			// Construct filter expression
			String searchFilterStr = "(&";
			for (LdapSearchFilterAttribute filterAttr : filterAttributes) {
				searchFilterStr = searchFilterStr + "(" + filterAttr.getAttributeName()
						+ filterAttr.getOperator().getOperator() + filterAttr.getAttributeValue() + ")";
			}
			searchFilterStr = searchFilterStr + ")";
			req.setFilter(searchFilterStr);

			req.setTimeLimit(0);
			baseDn = baseDn.replace("+", " ");
			req.setBase(new Dn(baseDn));

			SearchCursor searchCursor = connection.search(req);
			while (searchCursor.next()) {
				Response response = searchCursor.get();
				attrs = new HashMap<String, String>();
				attributesMultiValues = new HashMap<String, String[]>();
				if (response instanceof SearchResultEntry) {
					Entry entry = ((SearchResultEntry) response).getEntry();
					if (returningAttributes != null) {
						for (String attr : returningAttributes) {
							attrs.put(attr, entry.get(attr) != null ? entry.get(attr).getString() : "");
						}
					}
					List<String> priviliges=null;
					if (null != entry.get("liderPrivilege")) {
						
						priviliges=new ArrayList<>();
						Iterator<Value<?>> iter2 = entry.get("liderPrivilege").iterator();
						while (iter2.hasNext()) {
							String privilege = iter2.next().getValue().toString();
							priviliges.add(privilege);
						}
					} else {
						logger.debug("No privilege found in group => {}", entry.getDn());
					}
					
					for (Iterator iterator = entry.getAttributes().iterator(); iterator.hasNext();) {
						Attribute attr = (Attribute) iterator.next();
						String attrName= attr.getUpId();
						String value=attr.get().getString();

						if(attr.size() > 1) {
							Iterator<Value<?>> iter2 = entry.get(attrName).iterator();
							String [] values = new String[attr.size()];
							int counter = 0;
							while (iter2.hasNext()) {
								value = iter2.next().getValue().toString();
								values[counter++] = value;
							}
							attributesMultiValues.put(attrName, values);
						} else {
							attrs.put(attrName, value);
							attributesMultiValues.put(attrName, new String[] {value});
						}
					}

					LdapEntry ldapEntry= new LdapEntry(entry.getDn().toString(), attrs,attributesMultiValues, priviliges,convertObjectClass2DNType(entry.get("objectClass")));
					
					if(ldapEntry.getType()==DNType.AHENK) {
						ldapEntry.setOnline(xmppClientImpl.isRecipientOnline(ldapEntry.getUid()));
					}
					result.add(ldapEntry);
									}
			}
		} catch (Exception e) {
			logger.error(e.getMessage());
			throw new LdapException(e);
		} finally {
			releaseConnection(connection);
		}
		return result;
	}

	/**
	 * Convenience method for main search method
	 */
	@Override
	public List<LdapEntry> search(List<LdapSearchFilterAttribute> filterAttributes, String[] returningAttributes)
			throws LdapException {
		return search(configurationService.getLdapRootDn(), filterAttributes, returningAttributes);
	}

	/**
	 * Yet another convenience method for main search method
	 */
	@Override
	public List<LdapEntry> search(String attributeName, String attributeValue, String[] returningAttributes)
			throws LdapException {
		List<LdapSearchFilterAttribute> filterAttributes = new ArrayList<LdapSearchFilterAttribute>();
		filterAttributes.add(new LdapSearchFilterAttribute(attributeName, attributeValue, SearchFilterEnum.EQ));
		return search(configurationService.getLdapRootDn(), filterAttributes, returningAttributes);
	}
	
	/**
	 * 
	 */
	@Override
	public List<LdapEntry> findSubEntries(String filter, String[] returningAttributes,SearchScope scope) throws LdapException {
		
		return	findSubEntries(configurationService.getLdapRootDn(), filter, returningAttributes, scope);
	}
	
	/**
	 * 
	 */
	@Override
	public List<LdapEntry> findSubEntries(String dn, String filter, String[] returningAttributes,SearchScope scope) throws LdapException {
		List<LdapEntry> result = new ArrayList<LdapEntry>();
		LdapConnection connection = null;
		Map<String, String> attrs = null;
		Map<String, String[]> attributesMultiValues = null;
		try {
			connection = getConnection();
			SearchRequest request= new SearchRequestImpl();
			if(dn==null)return new ArrayList<>();
			dn = dn.replace("+", " ");
			request.setBase(new Dn(dn));
			request.setScope(scope);
			request.setFilter(filter);  //"(objectclass=*)"
			
			for (String attr : returningAttributes) {
				request.addAttributes(attr);
			}
			
		//	request.addAttributes("*");
			request.addAttributes("+");

			SearchCursor searchCursor = connection.search(request);
			
			while (searchCursor.next()) {
				Response response = searchCursor.get();
				attrs = new HashMap<String, String>();
				attributesMultiValues = new HashMap<String, String[]>();
				if (response instanceof SearchResultEntry) {
					
					Entry entry = ((SearchResultEntry) response).getEntry();
					
//					if (returningAttributes != null) {
//						for (String attr : returningAttributes) {
//							attrs.put(attr, entry.get(attr) != null ? entry.get(attr).getString() : "");
//						}
//					}
					List<String> priviliges=null;
					
					if (null != entry.get("liderPrivilege")) {
						
						priviliges=new ArrayList<>();
						Iterator<Value<?>> iter2 = entry.get("liderPrivilege").iterator();
						while (iter2.hasNext()) {
							String privilege = iter2.next().getValue().toString();
							priviliges.add(privilege);
						}
						
						
					} else {
						logger.debug("No privilege found in group => {}", entry.getDn());
					}
					
					for (Iterator iterator = entry.getAttributes().iterator(); iterator.hasNext();) {
						Attribute attr = (Attribute) iterator.next();
						String attrName= attr.getUpId();
						String value=attr.get().getString();

						if(attr.size() > 1) {
							Iterator<Value<?>> iter2 = entry.get(attrName).iterator();
							String [] values = new String[attr.size()];
							int counter = 0;
							while (iter2.hasNext()) {
								value = iter2.next().getValue().toString();
								values[counter++] = value;
							}
							attributesMultiValues.put(attrName, values);
						} else {
							attrs.put(attrName, value);
							attributesMultiValues.put(attrName, new String[] {value});
						}
					}
					
					LdapEntry ldapEntry= new LdapEntry(entry.getDn().toString(), attrs,attributesMultiValues, priviliges,convertObjectClass2DNType(entry.get("objectClass")));
					
					String dateStr= ldapEntry.get("createTimestamp");
					String year=dateStr.substring(0,4);
					String month=dateStr.substring(4,6);
					String day=dateStr.substring(6,8);
					String hour=dateStr.substring(8,10);
					String min=dateStr.substring(10,12);
					String sec=dateStr.substring(12,14);
					String crtDate=day+"/"+ month+"/"+ year+" "+ hour +":"+min;
					
					ldapEntry.setCreateDateStr(crtDate);
					if(ldapEntry.getType()==DNType.AHENK) {
						ldapEntry.setOnline(xmppClientImpl.isRecipientOnline(ldapEntry.getUid()));
					}
					result.add(ldapEntry);
				}
			}
		} catch (Exception e) {
			logger.error(e.getMessage());
			throw new LdapException(e);
		} finally {
			releaseConnection(connection);
		}
		return result;
	}
	
	
	
	public LdapEntry getLdapTree(LdapEntry ldapEntry)  {
		
		if(ldapEntry.getChildEntries()!=null){
			return ldapEntry;
		}
		else{
			
			try {
				List<LdapEntry> entries=findSubEntries(ldapEntry.getDistinguishedName(),"(objectclass=*)",
						new String[]{"*"}, SearchScope.SUBTREE);
				
				ldapEntry.setChildEntries(entries);
//				for (LdapEntry ldapEntry2 : entries) {
//					ldapEntry2.setParent(ldapEntry.getEntryUUID());
//					ldapEntry2.setParentName(ldapEntry.getName());
//					getLdapTree(ldapEntry2);
//				}
			} 
			
			catch (Exception e) {
				e.printStackTrace();
			}
		}
		return ldapEntry;
	}
	
	
	
	@Override
	public LdapEntry getDomainEntry() throws LdapException {
		
		LdapEntry domainEntry= null;
		List<LdapEntry> entries = findSubEntries(configurationService.getLdapRootDn(), "(objectclass=*)", new String[]{"*"}, SearchScope.OBJECT);
		if(entries.size()>0) domainEntry=entries.get(0);
		return domainEntry;
	}
	

	@Override
	public boolean isAhenk(LdapEntry entry) {
		return entry.getType() == DNType.AHENK;
	}

	@Override
	public boolean isUser(LdapEntry entry) {
		return entry.getType() == DNType.USER;
	}

	/**
	 * Find target entries which subject to command execution from provided DN
	 * list.
	 * 
	 * @param dnList
	 *            a collection of DN strings. Each DN may point to AGENT, USER,
	 *            GROUP or ORGANIZATIONAL_UNIT
	 * @param dnType
	 *            indicates which types to search for. (possible values: AGENT,
	 *            USER, GROUP, ALL)
	 * @return
	 */
	@Override
	public List<LdapEntry> findTargetEntries(List<String> dnList, DNType dnType) {
		List<LdapEntry> entries = null;
		if (dnList != null && !dnList.isEmpty() && dnType != null) {
			// Determine returning attributes
			// User LDAP privilege is used during authorization and agent JID
			// attribute is used during task execution
			String[] returningAttributes = new String[] { configurationService.getUserLdapPrivilegeAttribute(),
					configurationService.getAgentLdapJidAttribute() };
			if (configurationService.getLdapMailNotifierAttributes() != null) {
				Set<String> attrs = new HashSet<String>();
				attrs.add(configurationService.getUserLdapPrivilegeAttribute());
				attrs.add(configurationService.getAgentLdapJidAttribute());
				String[] attrArr = configurationService.getLdapMailNotifierAttributes().split(",");
				for (String attr : attrArr) {
					attrs.add(attr.trim());
				}
				returningAttributes = attrs.toArray(new String[attrs.size()]);
			}

			// Construct filtering attributes
			String objectClasses = convertDNType2ObjectClass(dnType);
			logger.debug("Object classes: {}", objectClasses);
			List<LdapSearchFilterAttribute> filterAttributes = new ArrayList<LdapSearchFilterAttribute>();
			// There may be multiple object classes
			String[] objectClsArr = objectClasses.split(",");
			for (String objectClass : objectClsArr) {
				LdapSearchFilterAttribute fAttr = new LdapSearchFilterAttribute("objectClass", objectClass,
						SearchFilterEnum.EQ);
				filterAttributes.add(fAttr);
			}
			logger.debug("Filtering attributes: {}", filterAttributes);

			entries = new ArrayList<LdapEntry>();

			// For each DN, find its target (child) entries according to desired
			// DN type:
			for (String dn : dnList) {
				try {
					List<LdapEntry> result = this.search(dn, filterAttributes, returningAttributes);
					if (result != null && !result.isEmpty()) {
						for (LdapEntry entry : result) {
							if (isValidType(entry.getType(), dnType)) {
								entries.add(entry);
							}
						}
					}
				} catch (LdapException e) {
					logger.error(e.getMessage(), e);
				}
			}
		}

		logger.debug("Target entries: {}", entries);
		return entries;
	}

	/**
	 * 
	 * @param type
	 * @param desiredType
	 *            possible values: AGENT, USER, GROUP, ALL
	 * @return true if provided type is desired type (or its child), false
	 *         otherwise.
	 */
	private boolean isValidType(DNType type, DNType desiredType) {
		return type == desiredType
				|| (desiredType == DNType.ALL && (type == DNType.AHENK || type == DNType.USER || type == DNType.GROUP));
	}

	/**
	 * Determine and return object classes to be used according to provided DN
	 * type.
	 * 
	 * @param dnType
	 * @return
	 */
	private String convertDNType2ObjectClass(DNType dnType) {

		if (DNType.AHENK == dnType) {
			return configurationService.getAgentLdapObjectClasses();
		} else if (DNType.USER == dnType) {
			return configurationService.getUserLdapObjectClasses();
		} else if (DNType.GROUP == dnType) {
			return configurationService.getGroupLdapObjectClasses();
		} else if (DNType.ALL == dnType) {
			return "*";
		} else {
			throw new IllegalArgumentException("DN type was invalid.");
		}
	
	}

	/**
	 * Determine DN type for given objectClass attribute
	 * 
	 * @param attribute
	 * @return
	 */
	private DNType convertObjectClass2DNType(Attribute objectClass) {

		if(objectClass== null) return null;
		// Check if agent
		String agentObjectClasses = configurationService.getAgentLdapObjectClasses();
		boolean isAgent = objectClass.contains(agentObjectClasses.split(","));
		if (isAgent) {
			return DNType.AHENK;
		}
		// Check if user
		String userObjectClasses = configurationService.getUserLdapObjectClasses();
		boolean isUser = objectClass.contains(userObjectClasses.split(","));
		if (isUser) {
			return DNType.USER;
		}
		// Check if group
		String groupObjectClasses = configurationService.getGroupLdapObjectClasses();
		boolean isGroup = objectClass.contains(groupObjectClasses.split(","));
		if (isGroup) {
			return DNType.GROUP;
		}
		boolean isOrganizationalGroup = objectClass.contains("organizationalUnit");
		if (isOrganizationalGroup) {
			return DNType.ORGANIZATIONAL_UNIT;
		}
		
		boolean isRoleGroup = objectClass.contains("sudoRole");
		if (isRoleGroup) {
			return DNType.ROLE;
		}
		return null;
	}

	
	public List<LdapEntry> getLdapMainTree() {
			
			LdapEntry domainBaseEntry;
			List<LdapEntry> treeList=null;
			
			
			try {
				domainBaseEntry = getDomainEntry();
			
	
			getLdapTree(domainBaseEntry); // fill domain base entry 
	
			treeList = new ArrayList<>();
			
			 createTreeList(domainBaseEntry, treeList);
			
			} catch (LdapException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			
			return treeList;
	}
	
	
	public List<LdapEntry> getLdapTree(String baseEntry) {
		
		LdapEntry domainBaseEntry;
		List<LdapEntry> treeList=null;
		try {
			domainBaseEntry = getDomainEntry();
			getLdapTree(domainBaseEntry); // fill domain base entry 
			
			treeList = new ArrayList<>();
			
			createTreeList(domainBaseEntry, treeList);
			
		} catch (LdapException e) {
			e.printStackTrace();
		}
		
		return treeList;
	}
	


	public void createTreeList(LdapEntry entry, List<LdapEntry> treeList) {
		
		if(entry.getType()!=null && entry.getType().equals(DNType.USER)) {
			entry.setIconPath("checked-user-32.png");
		}
		else if(entry.getType()!=null && entry.getType().equals(DNType.ORGANIZATIONAL_UNIT)) {
			entry.setIconPath("folder.png");
		}
		else if(entry.getType()!=null && entry.getType().equals(DNType.AHENK)) {
			entry.setIconPath("linux.png");
		}
		else {
			entry.setIconPath("file.png");
		}
		
		if (entry.getChildEntries()!=null && entry.getChildEntries().size() == 0) {
			treeList.add(entry);
	
		} else if (entry!=null && entry.getChildEntries()!=null){
			treeList.add(entry);
	
			for (LdapEntry ldapEntry : entry.getChildEntries()) {
	
				createTreeList(ldapEntry, treeList);
			}
		}
	}
	
	public LdapEntry getLdapUserTree() {
		String globalUserOu = configurationService.getUserLdapBaseDn(); //"ou=Kullanıcılar,dc=mys,dc=pardus,dc=org";
		LdapEntry usersDn = null;
		try {
			List<LdapEntry> usersEntrylist = findSubEntries(globalUserOu, "(objectclass=*)",
					new String[] { "*" }, SearchScope.OBJECT);

			if (usersEntrylist.size() > 0) {
				usersDn = usersEntrylist.get(0);
				usersDn.setExpandedUser("FALSE");
			}
			

		} catch (LdapException e) {
			e.printStackTrace();
		}
		return usersDn;
		
	}
	
	public LdapEntry getLdapUsersGroupTree() {
		String globalUserOu = configurationService.getUserGroupLdapBaseDn(); 
		LdapEntry usersGroupDn = null;
		try {
			List<LdapEntry> usersGroupEntrylist = findSubEntries(globalUserOu, "(objectclass=*)", new String[] { "*" }, SearchScope.OBJECT);
			if (usersGroupEntrylist.size() > 0) {
				usersGroupDn = usersGroupEntrylist.get(0);
				usersGroupDn.setExpandedUser("FALSE");
			}
		} catch (LdapException e) {
			e.printStackTrace();
		}
		return usersGroupDn;
	}
	
	public LdapEntry getLdapComputersTree() {
		LdapEntry computersDn = null;
		try {
			String globalUserOu =  configurationService.getAgentLdapBaseDn(); 
			logger.info("Getting computers");
			List<LdapEntry> retList = findSubEntries(globalUserOu, "(objectclass=*)",
					new String[] { "*" }, SearchScope.OBJECT);

			logger.info("Ldap Computers Node listed.");
			if (retList.size() > 0) {
				computersDn = retList.get(0);
				computersDn.setExpandedUser("FALSE");
			}

		} catch (LdapException e) {
			e.printStackTrace();
		}
		return computersDn;
	}
	
	/*
	 * returns just organizational units under given node
	 */
	public LdapEntry getOUTree(String dn) {
		LdapEntry computersDn = null;
		try {
			String globalUserOu =  configurationService.getAgentLdapBaseDn(); 
			logger.info("Getting computers");
			List<LdapEntry> retList = findSubEntries(globalUserOu, "(objectClass=organizationalUnit)",
					new String[] { "*" }, SearchScope.OBJECT);

			logger.info("Ldap OUs under Computers Node listed.");
			if (retList.size() > 0) {
				computersDn = retList.get(0);
				computersDn.setExpandedUser("FALSE");
			}

		} catch (LdapException e) {
			e.printStackTrace();
		}
		return computersDn;
	}
	
	public LdapEntry getLdapAgentsGroupTree() {
		LdapEntry computersGroupDn = null;
		try {
			String globalUserOu =  configurationService.getAhenkGroupLdapBaseDn(); 
			logger.info("Getting computers group");
			List<LdapEntry> retList = findSubEntries(globalUserOu, "(objectclass=*)",
					new String[] { "*" }, SearchScope.OBJECT);
			
			logger.info("Ldap Computers Group Node listed.");
			if (retList.size() > 0) {
				computersGroupDn = retList.get(0);
				computersGroupDn.setExpandedUser("FALSE");
			}
			
		} catch (LdapException e) {
			e.printStackTrace();
		}
		return computersGroupDn;
	}
	
	public LdapEntry getEntryDetail(String dn) {
		LdapEntry ouEntry = null;
		try {
			logger.info("Getting ou detail");
			List<LdapEntry> retList = findSubEntries(dn, "(objectclass=*)",
					new String[] { "*" }, SearchScope.OBJECT);
			
			logger.info("Ldap Computers Group Node listed.");
			if (retList.size() > 0) {
				ouEntry = retList.get(0);
				ouEntry.setExpandedUser("FALSE");
			}
			List<LdapEntry> entries=findSubEntries(dn, "(objectclass=*)",
					new String[]{"*"}, SearchScope.SUBTREE);
			
			ouEntry.setChildEntries(entries);
			
		} catch (LdapException e) {
			e.printStackTrace();
		}
		return ouEntry;
	}
	
	public LdapEntry getOuAndOuSubTreeDetail(String dn) {
		LdapEntry ouEntry = null;
		try {
			logger.info("Getting ou detail");
			List<LdapEntry> retList = findSubEntries(dn, "(objectclass=*)",
					new String[] { "*" }, SearchScope.OBJECT);
			
			logger.info("Ldap Computers Group Node listed.");
			if (retList.size() > 0) {
				ouEntry = retList.get(0);
				ouEntry.setExpandedUser("FALSE");
			}
			List<LdapEntry> entries=findSubEntries(dn, "(objectclass=*)",
					new String[]{"*"}, SearchScope.SUBTREE);
			//first entrie is itself
			if(entries.size() >= 1) {
				entries.remove(0);
			}
			
			ouEntry.setChildEntries(entries);
			
		} catch (LdapException e) {
			e.printStackTrace();
		}
		return ouEntry;
	}
	
	public LdapEntry getLdapGroupsTree() {
		
		List<LdapEntry> allGorups = null;
		
		LdapEntry groupDn= new LdapEntry("Gruplar",null,null,null,DNType.ORGANIZATIONAL_UNIT);
	
		try {
			String globalUserOu =  configurationService.getLdapRootDn(); 
			
			allGorups = findSubEntries(globalUserOu, "(objectclass=groupOfNames)",new String[] { "*" }, SearchScope.SUBTREE);
			
			groupDn.setChildEntries(allGorups);
			
		} catch (LdapException e) {
			e.printStackTrace();
		}
		
		return groupDn;
	}
	
	
	public LdapEntry getLdapSudoGroupsTree() {
		LdapEntry rolesDn = null;
		List<LdapEntry> roleList=null;
		try {
			String roles =  configurationService.getUserLdapRolesDn();
			logger.info("Getting computers");
			List<LdapEntry> retList = findSubEntries(roles, "(objectclass=*)",new String[] { "*" }, SearchScope.OBJECT);
			
			logger.info("Ldap Computers Node listed.");
			if (retList.size() > 0) {
				rolesDn = retList.get(0);
				roleList=findSubEntries(roles, "(objectclass=sudoRole)",new String[] { "*" }, SearchScope.SUBTREE);
				rolesDn.setChildEntries(roleList);
			}

		} catch (LdapException e) {
			e.printStackTrace();
		}
		return rolesDn;
	}
	
//	//gets tree of groups of names which just has agent members
//	public LdapEntry getLdapAgentGroupsTree() {
//		List<LdapEntry> allGorups = null;
//		LdapEntry groupDn= new LdapEntry("İstemci Grupları",null,DNType.ORGANIZATIONAL_UNIT);
//		try {
//			String globalUserOu =  configurationService.getAhenkGroupLdapBaseDn(); 
//			allGorups = findSubEntries(globalUserOu, "(|(objectClass=organizationalUnit)(&(objectClass=groupOfNames)(liderGroupType=AHENK)))",new String[] { "*" }, SearchScope.ONELEVEL);
//			groupDn.setChildEntries(allGorups);
//		} catch (LdapException e) {
//			e.printStackTrace();
//		}
//		return groupDn;
//	}
//	
//	//gets tree of groups of names which just has user members
//	public LdapEntry getLdapUserGroupsTree() {
//		List<LdapEntry> allGorups = null;
//		LdapEntry groupDn= new LdapEntry("Kullanıcı Grupları",null,DNType.ORGANIZATIONAL_UNIT);
//		try {
//			String globalUserOu =  configurationService.getUserGroupLdapBaseDn(); 
//			allGorups = findSubEntries(globalUserOu, "(|(objectClass=organizationalUnit)(&(objectClass=groupOfNames)(liderGroupType=USER)))",new String[] { "*" }, SearchScope.ONELEVEL);
//			groupDn.setChildEntries(allGorups);
//		} catch (LdapException e) {
//			e.printStackTrace();
//		}
//		return groupDn;
//	}

	private static final int SALT_LENGTH = 4;

	public static String generateSSHA(byte[] password)
	        throws NoSuchAlgorithmException {
	    SecureRandom secureRandom = new SecureRandom();
	    byte[] salt = new byte[SALT_LENGTH];
	    secureRandom.nextBytes(salt);

	    MessageDigest crypt = MessageDigest.getInstance("SHA-1");
	    crypt.reset();
	    crypt.update(password);
	    crypt.update(salt);
	    byte[] hash = crypt.digest();

	    byte[] hashPlusSalt = new byte[hash.length + salt.length];
	    System.arraycopy(hash, 0, hashPlusSalt, 0, hash.length);
	    System.arraycopy(salt, 0, hashPlusSalt, hash.length, salt.length);

	    return new StringBuilder().append("{SSHA}")
	            .append(Base64.getEncoder().encodeToString(hashPlusSalt))
	            .toString();
	}
	
	public void moveEntry(String sourceDN, String destinationDN) throws LdapException {
		logger.info("Moving entryDn :" + sourceDN + "  newSuperiorDn " + destinationDN);
		LdapConnection connection = null;
		connection = getConnection();
		try {
			connection.move(sourceDN,destinationDN);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			throw new LdapException(e);
		} finally {
			releaseConnection(connection);
		}
	}
	
	public Boolean deleteNodes(LdapEntry entry) {
		if(entry.getHasSubordinates().equals("FALSE")) {
			try {
				deleteEntry(entry.getDistinguishedName());
				return true;
			} catch (LdapException e) {
				e.printStackTrace();
				return false;
			}
		}
		while(true) {
			for(LdapEntry child : entry.getChildEntries()){
				if(child.getHasSubordinates().equals("FALSE")) {
					try {
						deleteEntry(child.getDistinguishedName());
					} catch (LdapException e) {
						e.printStackTrace();
						return false;
					}
				}
		    }
			entry = getOuAndOuSubTreeDetail(entry.getDistinguishedName());
			if(entry.getChildEntries() == null || entry.getChildEntries().size() == 0) {
				try {
					deleteEntry(entry.getDistinguishedName());
				} catch (LdapException e) {
					e.printStackTrace();
				}
				return true;
			}
		}
	}
	
	@Override
	public Boolean renameEntry(String oldDN, String newName) throws LdapException {
		logger.info("Rename DN  Old Name :" + oldDN + " New Name " + newName);
		LdapConnection connection = null;
		connection = getConnection();
		Entry entry = null;
		try {
			entry = connection.lookup(oldDN);
			org.apache.directory.api.ldap.model.name.Rdn rdn= new org.apache.directory.api.ldap.model.name.Rdn(newName);
			connection.rename(entry.getDn(), rdn, true);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			throw new LdapException(e);
		} finally {
			releaseConnection(connection);
		}
		return true;
	}
}
