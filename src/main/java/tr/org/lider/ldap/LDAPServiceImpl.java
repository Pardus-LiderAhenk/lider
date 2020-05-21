
package tr.org.lider.ldap;

import java.net.Socket;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.Principal;
import java.security.PrivateKey;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.annotation.PreDestroy;
import javax.naming.InvalidNameException;
import javax.naming.ldap.LdapName;
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
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import tr.org.lider.LiderSecurityUserDetails;
import tr.org.lider.messaging.messages.XMPPClientImpl;
import tr.org.lider.services.ConfigurationService;

/**
 * Default implementation for {@link ILDAPService}
 * 
 */

@Service
@Primary
public class LDAPServiceImpl implements ILDAPService {

	private final static Logger logger = LoggerFactory.getLogger(LDAPServiceImpl.class);
	private final static String configOLCDN = "olcDatabase={1}mdb,cn=config";
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

	/**
	 * 
	 * @return new LDAP connection
	 * @throws LdapException
	 */
	@Override
	public LdapConnection getConnection() throws LdapException {
		LdapConnection connection = null;
		try {
			setParams();
			connection = pool.getConnection();
		} catch (Exception e) {
			throw new LdapException(e);
		}
		return connection;
	}

	/**
	 * 
	 * @return new LDAP connection with cn=config user
	 * @throws LdapException
	 */
	public LdapConnection getConnectionForConfig() throws LdapException {
		LdapConnection connection = null;
		try {
			setParamsForConfig();
			connection = pool.getConnection();
		} catch (Exception e) {
			throw new LdapException(e);
		}
		return connection;
	}

	@PreDestroy
	public void destroy() {
		logger.info("Destroying LDAP service...");
		try {
			if(pool != null) {
				pool.close();
			}
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}
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

	public void setParams() throws Exception {
		LdapConnectionConfig lconfig = new LdapConnectionConfig();
		lconfig.setLdapHost(configurationService.getLdapServer());
		lconfig.setLdapPort(Integer.parseInt(configurationService.getLdapPort()));
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication != null && !(authentication instanceof AnonymousAuthenticationToken)) {
			Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
			if ( principal instanceof UserDetails) {
				LiderSecurityUserDetails userDetails = (LiderSecurityUserDetails) principal;
				lconfig.setName(userDetails.getLiderUser().getDn());
				lconfig.setCredentials(userDetails.getLiderUser().getPassword());
			} else {
				lconfig.setName(configurationService.getLdapUsername());
				lconfig.setCredentials(configurationService.getLdapPassword());
			}
		}  else {
			lconfig.setName(configurationService.getLdapUsername());
			lconfig.setCredentials(configurationService.getLdapPassword());
		}

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

	public void setParamsForConfig() throws Exception {
		LdapConnectionConfig lconfig = new LdapConnectionConfig();
		lconfig.setLdapHost(configurationService.getLdapServer());
		lconfig.setLdapPort(Integer.parseInt(configurationService.getLdapPort()));
		lconfig.setName("cn=admin,cn=config");
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
			e.printStackTrace();
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
			logger.info("Deleteting entry with DN: " + dn);
			//updateOLCAccessRulesAfterEntryDelete(dn);
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
			//first entry is itself
			if(entries.size() >= 1) {
				//entries.remove(0);
				for (int i = 0; i < entries.size(); i++) {
					if(entries.get(i).getDistinguishedName().equals(dn)) {
						entries.remove(i);
						break;
					}
				}
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
			updateOLCAccessRulesAfterEntryMove(sourceDN, destinationDN);
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
			updateOLCAccessRulesAfterEntryRename(newName, oldDN);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			throw new LdapException(e);
		} finally {
			releaseConnection(connection);
		}
		return true;
	}
	
	private List<OLCAccessRule> getAllOLCAccessRules() throws LdapException {
		String olcRegex = "\\{([0-9]*)\\}to (dn.base|dn.subtree)=\"(.*)\" by (dn|dn.one|group.exact)=\"(.*)\" (read|write|none) by \\* break";
		LdapConnection connection = null;
		String attribute = "olcAccess";
		List<OLCAccessRule> ruleList = new ArrayList<OLCAccessRule>();
		OLCAccessRule rule = null;

		try {
			connection = getConnectionForConfig();
			Entry entry = null;
			try {
				entry = connection.lookup(configOLCDN);
				if (entry != null) {
					for (Attribute a : entry.getAttributes()) {
						if (a.getId().contains(attribute) || a.getUpId().contains(attribute) || ( a.getAttributeType()!=null && a.getAttributeType().getName().equalsIgnoreCase(attribute))) {
							Iterator<Value<?>> iter = entry.get(a.getId()).iterator();
							while (iter.hasNext()) {
								String value = iter.next().getValue().toString();
								if(Pattern.matches(olcRegex, value)) {
									//get values by pattern
									Pattern pattern = Pattern.compile(olcRegex);
									Matcher matcher = pattern.matcher(value);

									//if matcher is true and group count is 6 then get group values
									if (matcher.find()) {
										if(matcher.groupCount() == 6) {	
											rule = new OLCAccessRule();
											rule.setOrder(Integer.parseInt(matcher.group(1)));
											rule.setAccessDNType(matcher.group(2));
											rule.setAccessDN(matcher.group(3));
											rule.setAssignedDNType(matcher.group(4));
											rule.setAssignedDN(matcher.group(5));
											rule.setAccessType(matcher.group(6));
											ruleList.add(rule);
										}
									}
								}
							}
						}
					}
				}
			} catch (org.apache.directory.api.ldap.model.exception.LdapException e) {
				logger.error(e.getMessage(), e);
				return ruleList;
			}
		} catch (Exception e) {
			logger.error(e.getMessage());
			return ruleList;
		}
		return ruleList;
	}
	
	private List<OLCAccessRule> getAllOLCAccessRulesByDN(String groupDN) throws LdapException {
		String olcRegex = "\\{([0-9]*)\\}to (dn.base|dn.subtree)=\"(.*)\" by (dn|dn.one|group.exact)=\"(" + groupDN + ")\" (read|write|none) by \\* break";
		LdapConnection connection = null;
		String attribute = "olcAccess";
		List<OLCAccessRule> ruleList = new ArrayList<OLCAccessRule>();
		OLCAccessRule rule = null;

		try {
			connection = getConnectionForConfig();
			Entry entry = null;
			try {
				entry = connection.lookup(configOLCDN);
				if (entry != null) {
					for (Attribute a : entry.getAttributes()) {
						if (a.getId().contains(attribute) || a.getUpId().contains(attribute) || ( a.getAttributeType()!=null && a.getAttributeType().getName().equalsIgnoreCase(attribute))) {
							Iterator<Value<?>> iter = entry.get(a.getId()).iterator();
							while (iter.hasNext()) {
								String value = iter.next().getValue().toString();
								if(Pattern.matches(olcRegex, value)) {
									//get values by pattern
									Pattern pattern = Pattern.compile(olcRegex);
									Matcher matcher = pattern.matcher(value);

									//if matcher is true and group count is 6 then get group values
									if (matcher.find()) {
										if(matcher.groupCount() == 6) {	
											rule = new OLCAccessRule();
											rule.setOrder(Integer.parseInt(matcher.group(1)));
											rule.setAccessDNType(matcher.group(2));
											rule.setAccessDN(matcher.group(3));
											rule.setAssignedDNType(matcher.group(4));
											rule.setAssignedDN(matcher.group(5));
											rule.setAccessType(matcher.group(6));
											ruleList.add(rule);
										}
									}
								}
							}
						}
					}
				}
			} catch (org.apache.directory.api.ldap.model.exception.LdapException e) {
				logger.error(e.getMessage(), e);
				return ruleList;
			}
		} catch (Exception e) {
			logger.error(e.getMessage());
			return ruleList;
		}
		return ruleList;
	}

	public List<OLCAccessRule> getSubTreeOLCAccessRules(String groupDN) throws LdapException {
		String olcRegex = "\\{([0-9]*)\\}to (dn.subtree)=\"(.*)\" by (dn|dn.one|group.exact)=\"(" + groupDN + ")\" (read|write|none) by \\* break";
		LdapConnection connection = null;
		String attribute = "olcAccess";
		List<OLCAccessRule> ruleList = new ArrayList<OLCAccessRule>();
		OLCAccessRule rule = null;

		try {
			connection = getConnectionForConfig();
			Entry entry = null;
			try {
				entry = connection.lookup(configOLCDN);
				if (entry != null) {
					for (Attribute a : entry.getAttributes()) {
						if (a.getId().contains(attribute) || a.getUpId().contains(attribute) || ( a.getAttributeType()!=null && a.getAttributeType().getName().equalsIgnoreCase(attribute))) {
							Iterator<Value<?>> iter = entry.get(a.getId()).iterator();
							while (iter.hasNext()) {
								String value = iter.next().getValue().toString();
								if(Pattern.matches(olcRegex, value)) {
									//get values by pattern
									Pattern pattern = Pattern.compile(olcRegex);
									Matcher matcher = pattern.matcher(value);

									//if matcher is true and group count is 6 then get group values
									if (matcher.find()) {
										if(matcher.groupCount() == 6) {	
											rule = new OLCAccessRule();
											rule.setOrder(Integer.parseInt(matcher.group(1)));
											rule.setAccessDNType(matcher.group(2));
											rule.setAccessDN(matcher.group(3));
											rule.setAssignedDNType(matcher.group(4));
											rule.setAssignedDN(matcher.group(5));
											rule.setAccessType(matcher.group(6));
											ruleList.add(rule);
										}
									}
								}
							}
						}
					}
				}
			} catch (org.apache.directory.api.ldap.model.exception.LdapException e) {
				logger.error(e.getMessage(), e);
				return ruleList;
			}
		} catch (Exception e) {
			logger.error(e.getMessage());
			return ruleList;
		}
		return ruleList;
	}

	/*
	 * add new olcAccess rules to config
	 * olcAccessRuleType is type of the tree: computers, users ...
	 */
	public Boolean addOLCAccessRule(OLCAccessRule rule) {
		try {
			//parse access dn to find all father DNs
			LdapName dn = new LdapName(rule.getAccessDN());
			List<String> listOfDNToAddRule = new ArrayList<>();
			List<OLCAccessRule> existingRules = getAllOLCAccessRulesByDN(rule.getAssignedDN());

			if(!isParentGroupDN(rule.getAccessDN())) {
				//find all parent DNs
				for (int i = 1; i <= dn.size(); i++) {
					String parentDN = "";
					for (int j = dn.size()-i; j >= 0; j--) {
						parentDN += dn.get(j) + ',';
					}
					parentDN = parentDN.substring(0,parentDN.length()-1);
					if(isParentGroupDN(parentDN)) {
						break;
					}
					listOfDNToAddRule.add(parentDN);
				}
			} else {
				listOfDNToAddRule.add(rule.getAccessDN());
			}

			//if parentRuleExists is true that means this rule's parent DN has existing rule or rules
			Boolean parentRuleExists = false;
			//if childRuleExists is true that means this rule's child or children has existing rule
			Boolean childRuleExists = false;
			//if sameRuleWithDifferentAccessType is true that means user is trying to update access type(read or write) of
			//same rule that is already in olcRule list
			Boolean sameRuleWithDifferentAccessType = false;
			//if user is trying to add same rule
			Boolean sameRule = false;
			for (int i = 0; i < existingRules.size(); i++) {
				if(existingRules.get(i).getAccessDNType().equals("dn.subtree")) {
					if(rule.getAccessDN().equals(existingRules.get(i).getAccessDN())) {
						if(existingRules.get(i).getAccessType().equals(rule.getAccessType())) {
							sameRule = true;
						} else {
							sameRuleWithDifferentAccessType = true;
						}
					} else if(rule.getAccessDN().contains(existingRules.get(i).getAccessDN())) {
						parentRuleExists = true;
					}  else if(existingRules.get(i).getAccessDN().contains(rule.getAccessDN())) {
						childRuleExists = true;
					}
				}
			}
			
			//if new rule's access type is read it should not have any parent with rules. If this condidition exists do not add new rule
			//if new rule's access type is write 
			//if child of new access DN is added before clean them.
			if(sameRule) {
				logger.error("Same olcAccess rule exists in config node. Rule will not be added.");
				return false;
			}
			if(parentRuleExists) {
				if(rule.getAccessType().equals("write")) {
					//check if any of parent has write access do not add
					for (int i = 0; i < existingRules.size(); i++) {
						if(rule.getAccessDN().contains(existingRules.get(i).getAccessDN())
								&& existingRules.get(i).getAccessType().equals("write")) {
							logger.error("This rule can not be added because it has parent with write access and it covers new rule.");
							return false;
						}
					}
					//add new rules
					OLCAccessRule newRule;

					for (int i = 0; i < listOfDNToAddRule.size(); i++) {
						//before save check if rule is added as dn.base or as dn.subtree
						Boolean isOLCAddedForDN = false;
						for (int j = 0; j < existingRules.size(); j++) {
							if(listOfDNToAddRule.get(i).equals(existingRules.get(j).getAccessDN())) {
								isOLCAddedForDN = true;
							}
						}

						if(!isOLCAddedForDN) {
							newRule = new OLCAccessRule();
							newRule.setOrder(3);
							if(i == 0) {
								newRule.setAccessDNType("dn.subtree");

							} else {
								newRule.setAccessDNType("dn.base");
							}
							newRule.setAccessDN(listOfDNToAddRule.get(i));
							newRule.setAssignedDNType("group.exact");
							newRule.setAssignedDN(rule.getAssignedDN());
							if(i == 0) {
								newRule.setAccessType(rule.getAccessType());
							} else {
								newRule.setAccessType("read");
							}
							saveOLCRulesToConfig(newRule);
						}
					}

				} else {
					//user is trying to change access type from write to read
					//in that case this rule will be covered by parent so delete that rule and allowed parents
					if(sameRuleWithDifferentAccessType) {
						logger.info("This rule and its parent base dns will be deleted till parent rule because it will be covered by the parent");

						for (int i = 0; i < listOfDNToAddRule.size(); i++) {
							existingRules = getAllOLCAccessRulesByDN(rule.getAssignedDN());
							for (int j = 0; j < existingRules.size(); j++) {
								if(existingRules.get(j).getAccessDN().equals(listOfDNToAddRule.get(i))) {
									deleteOLCAccessRule(existingRules.get(j));
									existingRules = getAllOLCAccessRulesByDN(rule.getAssignedDN());
									break;
								}
								else if(existingRules.get(j).getAccessDN().contains(listOfDNToAddRule.get(i))) {
									if(existingRules.get(j).getAccessDNType().equals("dn.base")) {
										deleteOLCAccessRule(existingRules.get(j));
										existingRules = getAllOLCAccessRulesByDN(rule.getAssignedDN());
										break;
									} else if(existingRules.get(j).getAccessDNType().equals("dn.subtree")) {
									}
								}
							}

						}
						return true;

					} else {
						logger.error("This rule can not be added because it's parent( or parents) covers new rule.");
						return false;
					}
				}
			} 
			if(childRuleExists) {
				Boolean finishedDeletingChildren = false;
				while(!finishedDeletingChildren) {
					int deletedItemCount = 0;
					for (int i = 0; i < existingRules.size(); i++) {
						if(existingRules.get(i).getAccessDN().contains(rule.getAccessDN())) {
							//if new rules access type is write delete all child rules because write type will cover all child rules
							if(rule.getAccessType().equals("write")) {
								logger.error("child exists delete: " + existingRules.get(i).getOLCRuleString());
								deletedItemCount++;
								deleteOLCAccessRule(existingRules.get(i));
								break;
							} 
							//if new rules access type is read delete all child rules with read access because new rule will cover child rules
							//delete all child rules with write access
							else {
								if(existingRules.get(i).getAccessType().equals("read")) {
									logger.error("child exist delete: " + existingRules.get(i).getOLCRuleString());
									deletedItemCount++;
									deleteOLCAccessRule(existingRules.get(i));
									break;
								} else {
									//this code is added to delete same rule from write to read
									if(existingRules.get(i).getAccessDN().equals(rule.getAccessDN())) {
										logger.error("Same rule exists but access type will be updated to: " + existingRules.get(i).getOLCRuleString());
										deletedItemCount++;
										deleteOLCAccessRule(existingRules.get(i));
										break;
									}
								}
							}

						}
					}
					if(deletedItemCount == 0) {
						finishedDeletingChildren = true;
						//deleted all children of new accessDN
						//add new access dn as sub tree
						rule.setOrder(3);
						logger.info("Adding new rule : " + rule.getOLCRuleString());
						saveOLCRulesToConfig(rule);
						return true;
					} else {
						//order numbers has changed get existingRules again
						existingRules = getAllOLCAccessRulesByDN(rule.getAssignedDN());
					}
				}
			} 
			if(sameRuleWithDifferentAccessType && !childRuleExists && !parentRuleExists) {
				for (int i = 0; i < existingRules.size(); i++) {
					if(rule.getAccessDN().equals(existingRules.get(i).getAccessDN())) {
						deleteOLCAccessRule(existingRules.get(i));
						rule.setOrder(3);
						saveOLCRulesToConfig(rule);
					}
				}
			} 
			if(!childRuleExists && !parentRuleExists && !sameRuleWithDifferentAccessType && !sameRule){
				//no rules exists add new rule
				//no rule is added for group
				//find all parents till group head
				OLCAccessRule newRule;
				for (int i = 0; i < listOfDNToAddRule.size(); i++) {
					newRule = new OLCAccessRule();
					newRule.setOrder(3);
					if(i == 0) {
						newRule.setAccessDNType("dn.subtree");

					} else {
						newRule.setAccessDNType("dn.base");
					}
					newRule.setAccessDN(listOfDNToAddRule.get(i));
					newRule.setAssignedDNType("group.exact");
					newRule.setAssignedDN(rule.getAssignedDN());
					if(i == 0) {
						newRule.setAccessType(rule.getAccessType());
					} else {
						newRule.setAccessType("read");
					}
					saveOLCRulesToConfig(newRule);
				}
				return true;
			}

			return true;
		} catch (InvalidNameException | LdapException e) {
			logger.info("Error occured while adding olcAccesRule error: " + e.getMessage());
			return false;
		}
	}

	private void saveOLCRulesToConfig(OLCAccessRule rule) {
		LdapConnection connection;
		Entry entry = null;
		ModifyRequest mr = new ModifyRequestImpl();
		try {
			if(ruleExists(rule) == false) {
				connection = getConnectionForConfig();
				entry = connection.lookup(configOLCDN);
				if (entry != null) {
					entry.put("olcAccess", rule.getOLCRuleString());
					mr.setName(new Dn(configOLCDN));
					mr.add("olcAccess", rule.getOLCRuleString());
					logger.info("Adding new olcAccess rule: " + rule.getOLCRuleString());
					connection.modify(mr);
				}
			}
		} catch (LdapException e) {
			logger.info("Error occured while adding olcAccesRule error: " + e.getMessage());
		}
	}

	private Boolean ruleExists(OLCAccessRule rule) {
		String olcRegex = "\\{([0-9]*)\\}to (.*)";
		LdapConnection connection = null;
		String attribute = "olcAccess";

		try {
			connection = getConnectionForConfig();
			Entry entry = null;
			try {
				entry = connection.lookup(configOLCDN);
				if (entry != null) {
					for (Attribute a : entry.getAttributes()) {
						if (a.getId().contains(attribute) || a.getUpId().contains(attribute) || ( a.getAttributeType()!=null && a.getAttributeType().getName().equalsIgnoreCase(attribute))) {
							Iterator<Value<?>> iter = entry.get(a.getId()).iterator();
							while (iter.hasNext()) {
								String value = iter.next().getValue().toString();
								if(Pattern.matches(olcRegex, value) && Pattern.matches(olcRegex, rule.getOLCRuleString())) {
									//get values by pattern
									Pattern pattern = Pattern.compile(olcRegex);
									Matcher matcher = pattern.matcher(value);
									Matcher matcherNewValue = pattern.matcher(rule.getOLCRuleString());
									//if matcher is true and group count is 6 then get group values
									if (matcher.find() && matcherNewValue.find()) {
										if(matcher.groupCount() == 2 && matcherNewValue.groupCount() == 2) {	
											if(matcher.group(2).equals(matcherNewValue.group(2))) {
												return true;
											}
										}
									}
								}
							}
						}
					}
				}
			} catch (org.apache.directory.api.ldap.model.exception.LdapException e) {
				logger.error(e.getMessage(), e);
				return false;
			}
		} catch (Exception e) {
			logger.error(e.getMessage());
			return false;
		}
		return false;
	}

	private  Boolean deleteOLCAccessRule(OLCAccessRule rule) {
		LdapConnection connection = null;
		try {
			connection = getConnectionForConfig();
			Entry entry = null;
			entry = connection.lookup(configOLCDN);
			if (entry != null) {
				logger.info("Rule will be deleted: ");
				logger.info(rule.getOLCRuleString());
				ModifyRequest mr = new ModifyRequestImpl();
				mr.setName(new Dn(configOLCDN));
				mr.remove("olcAccess", rule.getOLCRuleString());
				connection.modify(mr);
				return true;
			}
		}
		catch (Exception e) {
			logger.error(e.getMessage());
			return false;
		}
		return false;
	}


	/*
	 *remove olcAccess rules to config
	 * olcAccessRuleType is type of the tree: computers, users ...
	 */
	public Boolean removeOLCAccessRuleWithParents(OLCAccessRule rule) {
		//parse access dn to find all father DNs

		try {
			LdapName dn = new LdapName(rule.getAccessDN());
			List<String> listOfParentDN = new ArrayList<>();
			List<OLCAccessRule> existingRules = getAllOLCAccessRulesByDN(rule.getAssignedDN());

			if(!isParentGroupDN(rule.getAccessDN())) {
				//find all parent DNs
				for (int i = 1; i <= dn.size(); i++) {
					String parentDN = "";
					for (int j = dn.size()-i; j >= 0; j--) {
						parentDN += dn.get(j) + ',';
					}
					parentDN = parentDN.substring(0,parentDN.length()-1);
					if(isParentGroupDN(parentDN)) {
						break;
					}
					listOfParentDN.add(parentDN);
				}
			} else {
				listOfParentDN.add(rule.getAccessDN());
			}

			//if parentRuleExists is true that means this rule's parent DN has existing rule or rules
			Boolean parentRuleExists = false;
			//if childRuleExists is true that means this rule's child or children has existing rule
			Boolean childRuleExists = false;

			for (int i = 0; i < existingRules.size(); i++) {
				if(existingRules.get(i).getAccessDNType().equals("dn.subtree")) {
					if(!rule.getAccessDN().equals(existingRules.get(i).getAccessDN())) {
						if(rule.getAccessDN().contains(existingRules.get(i).getAccessDN())) {
							parentRuleExists = true;
						}  else if(existingRules.get(i).getAccessDN().contains(rule.getAccessDN())) {
							childRuleExists = true;
						}
					}
				}

			}

			if(childRuleExists) {
				//delete itself and add itself as dn.base
				logger.info("child exists");
				deleteOLCAccessRule(rule);
				//if access dn is was dn.subtree do not add it again as dn.base because all users has access to read this base dn
				if(!isParentGroupDN(rule.getAccessDN())) {
					rule.setOrder(3);
					rule.setAccessDNType("dn.base");
					saveOLCRulesToConfig(rule);
				}

			} else if(parentRuleExists){
				logger.info("parent exists");
				//delete rule and its parent rules till parent who has dn.subtree access type
				//attribute for ending loop when finds father rule with "dn.subtree access
				Boolean foundFatherSubtreeAccessType = false;
				for (int i = 0; i < listOfParentDN.size(); i++) {
					for (int j = 0; j < existingRules.size(); j++) {
						if(listOfParentDN.get(i).equals(existingRules.get(j).getAccessDN())) {
							//delete rule itself
							if(i == 0) {
								deleteOLCAccessRule(existingRules.get(j));
							} else {
								if(existingRules.get(j).getAccessDNType().equals("dn.subtree")) {
									foundFatherSubtreeAccessType = true;
									break;
								} else {
									//if has child
									for (int k = 0; k < existingRules.size(); k++) {
										if((existingRules.get(k).getAccessDN().length() > existingRules.get(j).getAccessDN().length())
												&& (existingRules.get(k).getAccessDN().contains(existingRules.get(j).getAccessDN()))) {
											foundFatherSubtreeAccessType = true;
											break;
										}
									}
									if(foundFatherSubtreeAccessType == false) {
										deleteOLCAccessRule(existingRules.get(j));
										break;
									}
								}
							}
						}
					}
					if(foundFatherSubtreeAccessType) {
						break;
					}
					existingRules = getAllOLCAccessRulesByDN(rule.getAssignedDN());

				}
			} else {
				logger.info("single");
				//delete all entries which does not have child rules

				for (int i = 0; i < listOfParentDN.size(); i++) {
					existingRules = getAllOLCAccessRulesByDN(rule.getAssignedDN());
					for (int j = 0; j < existingRules.size(); j++) {
						if(existingRules.get(j).getAccessDN().equals(listOfParentDN.get(i))) {
							if(i == 0) {
								deleteOLCAccessRule(existingRules.get(j));
							} else {
								Boolean hasChildNode = false;
								for (int k = 0; k < existingRules.size(); k++) {
									if((existingRules.get(k).getAccessDN().length() > existingRules.get(j).getAccessDN().length())
											&& (existingRules.get(k).getAccessDN().contains(existingRules.get(j).getAccessDN()))) {
										hasChildNode = true;
										break;
									}
								}
								if(hasChildNode == false) {
									deleteOLCAccessRule(existingRules.get(j));
									break;
								}
							}
						}
					}
				}
			}

			return true;
		} catch (InvalidNameException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (LdapException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return false;
	}

	//if an entry is renamed check if that entry exists in olcAccess rules
	//if exists update olcAccess rules
	public void updateOLCAccessRulesAfterEntryRename(String newName, String oldEntryDN) {
		try {
			String newEntryDN = newName + ",";
			LdapName dn = new LdapName(oldEntryDN);
			for (int i = dn.size()-2; 0 <= i; i--) {
				newEntryDN += dn.get(i);
				if(i>0) {
					newEntryDN += ",";
				}
			}
			List<OLCAccessRule> existingRules = getAllOLCAccessRules();
			for (int i = 0; i < existingRules.size(); i++) {
				if(existingRules.get(i).getAccessDN().contains(oldEntryDN) || existingRules.get(i).getAssignedDN().contains(oldEntryDN)) {
					deleteOLCAccessRule(existingRules.get(i));
					existingRules.get(i).setAccessDN(existingRules.get(i).getAccessDN().replace(oldEntryDN, newEntryDN));
					existingRules.get(i).setAssignedDN(existingRules.get(i).getAssignedDN().replace(oldEntryDN, newEntryDN));
					saveOLCRulesToConfig(existingRules.get(i));
				}
			}
		} catch (Exception e) {
			logger.error(e.getMessage());
		}
	}

	//if an entry is deleted check if that entry exists in olcAccess rules
	//if exists update olcAccess rules
	public void updateOLCAccessRulesAfterEntryDelete(String deletedDN) {
		try {
			//if deletedDN is a userGroups delete all rules of that group
			LdapEntry entry = getEntryDetail(deletedDN);
			if(entry.getType() == DNType.GROUP) {
				//check if deleted entry is a userGroups
				if(deletedDN.contains(configurationService.getUserGroupLdapBaseDn())) {

					List<OLCAccessRule> existingRules = getAllOLCAccessRulesByDN(deletedDN);
					if(existingRules != null && existingRules.size()> 0) {
						while(true) {
							deleteOLCAccessRule(existingRules.get(0));
							existingRules = getAllOLCAccessRulesByDN(deletedDN);
							if(existingRules.size() == 0) {
								break;
							}
						}
						return;
					}
				}
			} else if(entry.getType() == DNType.ORGANIZATIONAL_UNIT) {
				//check assigned DN part if there is a user group parent deleted
				if(deletedDN.contains(configurationService.getUserGroupLdapBaseDn())) {
					List<OLCAccessRule> existingRules = getAllOLCAccessRules();

					//if assigned DN's parent is deleted, delete all assigned DNs which is child of that deletedDN

					while(true) {
						Boolean deletedAllChild = true;
						for (int i = 0; i < existingRules.size(); i++) {
							if(existingRules.get(i).getAssignedDN().contains(deletedDN)) {
								deleteOLCAccessRule(existingRules.get(i));
								deletedAllChild = false;
								break;
							}
						}
						if(deletedAllChild) {
							break;
						}
						existingRules = getAllOLCAccessRules();
					}

					//clean access dn part

					//delete all child rules of dn 
					while(true) {
						Boolean deletedAllChild = true;
						for (int i = 0; i < existingRules.size(); i++) {
							if(existingRules.get(i).getAccessDN().contains(deletedDN)) {
								deleteOLCAccessRule(existingRules.get(i));
								deletedAllChild = false;
								break;
							}
						}
						if(deletedAllChild) {
							break;
						}
						existingRules = getAllOLCAccessRules();

					}

					//delete if dn has any father with access type dn.base without any children
					//find all parent DNs
					LdapName dn = new LdapName(deletedDN);
					List<String> listOfParentDN = new ArrayList<>();

					if(!isParentGroupDN(deletedDN)) {
						//find all parent DNs
						for (int i = 1; i <= dn.size(); i++) {
							String parentDN = "";
							for (int j = dn.size()-i; j >= 0; j--) {
								parentDN += dn.get(j) + ',';
							}
							parentDN = parentDN.substring(0,parentDN.length()-1);
							if(isParentGroupDN(parentDN)) {
								break;
							}
							listOfParentDN.add(parentDN);
						}
					}
					existingRules = getAllOLCAccessRules();
					Boolean foundFatherSubtreeAccessType = false;
					for (int i = 0; i < listOfParentDN.size(); i++) {
						for (int j = 0; j < existingRules.size(); j++) {
							if(listOfParentDN.get(i).equals(existingRules.get(j).getAccessDN())) {
								//delete rule itself
								if(existingRules.get(j).getAccessDNType().equals("dn.subtree")) {
									foundFatherSubtreeAccessType = true;
									break;
								} else {
									//if has child
									for (int k = 0; k < existingRules.size(); k++) {
										if((existingRules.get(k).getAccessDN().length() > existingRules.get(j).getAccessDN().length())
												&& (existingRules.get(k).getAccessDN().contains(existingRules.get(j).getAccessDN()))) {
											foundFatherSubtreeAccessType = true;
											break;
										}
									}
									if(foundFatherSubtreeAccessType == false) {
										deleteOLCAccessRule(existingRules.get(j));
										break;
									}
								}
							}
						}
						if(foundFatherSubtreeAccessType) {
							break;
						}
						existingRules = getAllOLCAccessRules();
					}
				} else {
					List<OLCAccessRule> existingRules = getAllOLCAccessRules();

					//clean access dn part
					//delete all child rules of dn 
					while(true) {
						Boolean deletedAllChild = true;
						for (int i = 0; i < existingRules.size(); i++) {
							if(existingRules.get(i).getAccessDN().contains(deletedDN)) {
								deleteOLCAccessRule(existingRules.get(i));
								deletedAllChild = false;
								break;
							}
						}
						if(deletedAllChild) {
							break;
						}
						existingRules = getAllOLCAccessRules();
					}

					//delete if dn has any father with access type dn.base without any children
					//find all parent DNs
					LdapName dn = new LdapName(deletedDN);
					List<String> listOfParentDN = new ArrayList<>();

					if(!isParentGroupDN(deletedDN)) {
						//find all parent DNs
						for (int i = 1; i <= dn.size(); i++) {
							String parentDN = "";
							for (int j = dn.size()-i; j >= 0; j--) {
								parentDN += dn.get(j) + ',';
							}
							parentDN = parentDN.substring(0,parentDN.length()-1);
							if(isParentGroupDN(parentDN)) {
								break;
							}
							listOfParentDN.add(parentDN);
						}
					}
					existingRules = getAllOLCAccessRules();
					Boolean foundFatherSubtreeAccessType = false;
					for (int i = 0; i < listOfParentDN.size(); i++) {
						for (int j = 0; j < existingRules.size(); j++) {
							if(listOfParentDN.get(i).equals(existingRules.get(j).getAccessDN())) {
								//delete rule itself
								if(existingRules.get(j).getAccessDNType().equals("dn.subtree")) {
									foundFatherSubtreeAccessType = true;
									break;
								} else {
									//if has child
									for (int k = 0; k < existingRules.size(); k++) {
										if((existingRules.get(k).getAccessDN().length() > existingRules.get(j).getAccessDN().length())
												&& (existingRules.get(k).getAccessDN().contains(existingRules.get(j).getAccessDN()))) {
											foundFatherSubtreeAccessType = true;
											break;
										}
									}
									if(foundFatherSubtreeAccessType == false) {
										deleteOLCAccessRule(existingRules.get(j));
										break;
									}
								}
							}
						}
						if(foundFatherSubtreeAccessType) {
							break;
						}
						existingRules = getAllOLCAccessRules();

					}
				}
			}
		} catch (LdapException e) {
			logger.error("Error occured while updating rules after deleting entry");
		} catch (InvalidNameException e) {
			logger.error("Invalid dn: " + deletedDN);
		}
	}

	//if an entry is moved check if that entry exists in olcAccess rules
	//if exists update olcAccess rules
	public void updateOLCAccessRulesAfterEntryMove(String sourceDN, String destinationDN) {
		try {
			//if deletedDN is a userGroups delete all rules of that group
			LdapEntry entry = getEntryDetail(sourceDN);
			if(entry.getType() == DNType.GROUP) {
				//check if deleted entry is a userGroups
				if(sourceDN.contains(configurationService.getUserGroupLdapBaseDn())) {
					List<OLCAccessRule> existingRulesTemp = getAllOLCAccessRulesByDN(sourceDN);
					//delete all rules with that assingDN
					List<OLCAccessRule> existingRules = getAllOLCAccessRulesByDN(sourceDN);
					if(existingRules != null && existingRules.size()> 0) {
						while(true) {
							logger.info(" DN will be deleted after move" + existingRules.get(0));
							deleteOLCAccessRule(existingRules.get(0));
							existingRules = getAllOLCAccessRulesByDN(sourceDN);
							if(existingRules.size() == 0) {
								break;
							}
						}
						return;
					}
					LdapName dn = new LdapName(sourceDN);
					String newDN = dn.get(dn.size() -1 ) + "," + destinationDN;
					for (int i = 0; i < existingRulesTemp.size(); i++) {
						//get new dn after move
						existingRules.get(i).setAssignedDN(newDN);
						existingRules.get(i).setOrder(3);
						//add new rule to LDAP 
						saveOLCRulesToConfig(existingRules.get(i));
						logger.info("new DN will be added to olc" + newDN);
					}
				}
			} else if(entry.getType() == DNType.ORGANIZATIONAL_UNIT) {
				//check assigned DN part if there is a user group parent deleted
				if(sourceDN.contains(configurationService.getUserGroupLdapBaseDn())) {
					LdapName dn = new LdapName(sourceDN);
					String newDN = dn.get(dn.size() -1 ) + "," + destinationDN;
					List<OLCAccessRule> existingRules = getAllOLCAccessRules();

					List<OLCAccessRule> rulesWillBeUpdated = new ArrayList<>();
					
					if(existingRules != null && existingRules.size()> 0) {
						//first delete all rules containing source dn in their assigned dn part
						while(true) {
							logger.info(" DN will be deleted after move" + existingRules.get(0));
							Boolean deletedAllContainingRules = true;
							for (int i = 0; i < existingRules.size(); i++) {
								if(existingRules.get(i).getAssignedDN().contains(sourceDN)) {
									rulesWillBeUpdated.add(existingRules.get(i));
									System.err.println("deleting for move : " + existingRules.get(i).getOLCRuleString());
									deleteOLCAccessRule(existingRules.get(i));
									deletedAllContainingRules = false;
									break;
								}
							}
							
							if(deletedAllContainingRules) {
								break;
							}
							existingRules = getAllOLCAccessRules();
						}
						//after delete operation add these rules with updated DNs
						for (int i = 0; i < rulesWillBeUpdated.size(); i++) {
							OLCAccessRule r = rulesWillBeUpdated.get(i);
							r.setAssignedDN(r.getAssignedDN().replace(sourceDN, newDN));
							System.err.println(r.getAssignedDN());
							r.setOrder(3);
							System.err.println("adding for move : " + r.getOLCRuleString());
							saveOLCRulesToConfig(r);
						}
					}
				} else {
					//after assigned DN parts are updated now update Access DN parts
					//first check if sourceDN or children of source DN has any child Rule
					List<OLCAccessRule> existingRules = getAllOLCAccessRules();
					List<OLCAccessRule> newRulesForAddingToDestination = new ArrayList<>();
					LdapName dn = new LdapName(sourceDN);
					String newDN = dn.get(dn.size() -1 ) + "," + destinationDN;
					for (OLCAccessRule olcAccessRule : existingRules) {
						if(olcAccessRule.getAccessDNType().equals("dn.subtree")
								&& olcAccessRule.getAccessDN().length() >= sourceDN.length()
								&& olcAccessRule.getAccessDN().contains(sourceDN)) {
							newRulesForAddingToDestination.add(olcAccessRule);
						}
					}
					
					updateOLCAccessRulesAfterEntryDelete(sourceDN);
					
					for (OLCAccessRule rule : newRulesForAddingToDestination) {
						rule.setAccessDN(rule.getAccessDN().replace(sourceDN, newDN));
						addOLCAccessRule(rule);
					}
				}
			}
		} catch (LdapException e) {
			logger.error("Error occured while updating rules after deleting entry");
		} catch (InvalidNameException e) {
			logger.error("Invalid dn: " + sourceDN);
		}
	}

	public Boolean isParentGroupDN(String dn) {
		if(dn.equals(configurationService.getAgentLdapBaseDn()))
			return true;
		else if(dn.equals(configurationService.getAgentLdapBaseDn()))
			return true;
		else if(dn.equals(configurationService.getUserLdapBaseDn()))
			return true;
		else if(dn.equals(configurationService.getAhenkGroupLdapBaseDn()))
			return true;
		else if(dn.equals(configurationService.getUserGroupLdapBaseDn()))
			return true;
		else if(dn.equals(configurationService.getUserLdapRolesDn()))
			return true;
		else 
			return false;
	}
}

