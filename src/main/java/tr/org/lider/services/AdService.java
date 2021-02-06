package tr.org.lider.services;

import java.net.Socket;
import java.security.Principal;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import tr.org.lider.ldap.DNType;
import tr.org.lider.ldap.ILDAPService;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.ldap.LdapSearchFilterAttribute;
import tr.org.lider.ldap.SearchFilterEnum;


@Service
@Qualifier("AdImpl")
public class AdService implements ILDAPService{
	
	
	private final static Logger logger = LoggerFactory.getLogger(AdService.class);
	
	
	@Autowired
	private ConfigurationService configurationService;
	
	private LdapConnectionPool pool;

	@Override
	public LdapConnection getConnection() throws LdapException {
		LdapConnection connection = null;
		try {
			String host = configurationService.getAdIpAddress();
			String port = configurationService.getAdPort();
			String userName = configurationService.getAdAdminUserFullDN();
			String password = configurationService.getAdAdminPassword();
			Boolean useSSL = configurationService.getAdUseSSL(); 
			Boolean useTLS =configurationService.getAdUseTLS();
			Boolean allowSelfSignedCert =configurationService.getAdAllowSelfSignedCert();
			
			
			setParams(host,port,userName,password,useSSL, allowSelfSignedCert,useTLS);
			connection = pool.getConnection();
		} catch (Exception e) {
			e.printStackTrace();
			throw new LdapException(e);
		}
		return connection;
	}

	public void setParams(String host,String port, String userName, String password, Boolean useSSL, Boolean allowSelfSignedCert, Boolean useTLS) throws Exception {
		LdapConnectionConfig lconfig = new LdapConnectionConfig();
		lconfig.setLdapHost(host);
		lconfig.setLdapPort(Integer.parseInt(port));
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication != null && !(authentication instanceof AnonymousAuthenticationToken)) {
				lconfig.setName(userName);
				lconfig.setCredentials(password);
		}  else {
			lconfig.setName(userName);
			lconfig.setCredentials(password);
		}

		if (useSSL) {
			lconfig.setUseSsl(true);
			if (allowSelfSignedCert) {
				lconfig.setKeyManagers(createCustomKeyManagers());
				lconfig.setTrustManagers(createCustomTrustManager());
			}
		} else {
			lconfig.setUseSsl(false);
		}
		
		if (allowSelfSignedCert) {
			lconfig.setKeyManagers(createCustomKeyManagers());
			lconfig.setTrustManagers(createCustomTrustManager());
		}

		lconfig.setUseTls(useTLS);
		// Create connection pool
		PoolableLdapConnectionFactory factory = new PoolableLdapConnectionFactory(lconfig);
		pool = new LdapConnectionPool(factory);
		pool.setTestOnBorrow(true);
		pool.setMaxActive(-1);
		pool.setMaxWait(3000);
		pool.setWhenExhaustedAction(GenericObjectPool.WHEN_EXHAUSTED_BLOCK);
		logger.debug(this.toString());
	}
	
	@Override
	public void releaseConnection(LdapConnection ldapConnection) {
		try {
			pool.releaseConnection(ldapConnection);
			if(pool != null) {
				pool.close();
			}
		} catch (Exception e) {
			e.printStackTrace();
			logger.error(e.getMessage(), e);
		}
	}

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

	@Override
	public void deleteEntry(String dn) throws LdapException {
		LdapConnection connection = getConnection();
		try {
			connection.delete(new Dn(dn));
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			e.printStackTrace();
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
			e.printStackTrace();
			logger.error(e.getMessage(), e);
			throw new LdapException(e);
		} finally {
			releaseConnection(connection);
		}
	
	}

	public void updateEntryReplaceAttribute(String entryDn, String attribute, String value) throws LdapException {
	   
		LdapConnection connection = null;
		connection = getConnection();
		Entry entry = null;
		try {
			entry = connection.lookup(entryDn);
			if (entry != null) {
				List<Modification> modificationListForRemove = new ArrayList<Modification>();
				modificationListForRemove.add(new DefaultModification( ModificationOperation.REPLACE_ATTRIBUTE, attribute, value ));
				Modification[] modifications = new Modification[modificationListForRemove.size()];
				for (int i = 0; i < modificationListForRemove.size(); i++) {
					modifications[i] = modificationListForRemove.get(i);
				}
				connection.modify(entry.getDn(), modifications);
			}
		} catch (Exception e) {
			e.printStackTrace();
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
			e.printStackTrace();
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
			e.printStackTrace();
			logger.error(e.getMessage(), e);
			throw new LdapException(e);
		} finally {
			releaseConnection(connection);
		}
	
	}

	@Override
	public void updateEntryRemoveAttributeWithValue(String entryDn, String attribute, String value)	throws LdapException {
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
					if (a.contains(value)) {
						isAttributeExist=true;
						Iterator<Value<?>> iter = entry.get(a.getId()).iterator();
						while (iter.hasNext()) {
							String val = iter.next().getValue().toString();
							if(value.equals(val)) {
								modificationListForRemove.add(new DefaultModification( ModificationOperation.REMOVE_ATTRIBUTE, a.getId(), val ));
							}
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
			e.printStackTrace();
			logger.error(e.getMessage(), e);
			throw new LdapException(e);
		} finally {
			releaseConnection(connection);
		}
	}

	@Override
	public Entry getRootDSE() throws LdapException {
		LdapConnection connection = getConnection();
		Entry entry = null;
		try {
			entry = connection.getRootDse();
		} catch (org.apache.directory.api.ldap.model.exception.LdapException e) {
			e.printStackTrace();
			logger.error(e.getMessage(), e);
			throw new LdapException(e);
		} finally {
			releaseConnection(connection);
		}
		return entry;
	}

	@Override
	public LdapEntry getEntry(String entryDn, String[] requestedAttributes) throws LdapException {
		// TODO Auto-generated method stub
		return null;
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
			e.printStackTrace();
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
				if(filterAttr.getOperator().equals(SearchFilterEnum.EQ)) {
				searchFilterStr = searchFilterStr + "(" + filterAttr.getAttributeName()
				+ filterAttr.getOperator().getOperator() + filterAttr.getAttributeValue() + ")";
				}
				else if(filterAttr.getOperator().equals(SearchFilterEnum.NOT_EQ)) {
					searchFilterStr = searchFilterStr + "(!(" + filterAttr.getAttributeName()
					+ "=" + filterAttr.getAttributeValue() + "))";
				}
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
						if(attr !=null && attr.get()!=null) {
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
					}

					LdapEntry ldapEntry= new LdapEntry(entry.getDn().toString(), attrs,attributesMultiValues, priviliges,convertObjectClass2DNType(entry.get("objectClass")));

					result.add(ldapEntry);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			logger.error(e.getMessage());
			throw new LdapException(e);
		} finally {
			releaseConnection(connection);
		}
		return result;
	}

	@Override
	public List<LdapEntry> search(List<LdapSearchFilterAttribute> filterAttributes, String[] returningAttributes)
			throws LdapException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<LdapEntry> search(String attributeName, String attributeValue, String[] returningAttributes)
			throws LdapException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<LdapEntry> findSubEntries(String filter, String[] returningAttributes, SearchScope scope)
			throws LdapException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<LdapEntry> findSubEntries(String dn, String filter, String[] returningAttributes, SearchScope scope)
			throws LdapException {

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
					LdapEntry ldapEntry= new LdapEntry(entry.getDn().toString(), attrs,attributesMultiValues, null,convertObjectClass2DNType(entry.get("objectClass")));
					result.add(ldapEntry);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			logger.error(e.getMessage());
			throw new LdapException(e);
		} finally {
			releaseConnection(connection);
		}
		return result;
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

	@Override
	public LdapEntry getLdapTree(LdapEntry ldapEntry) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean isAhenk(LdapEntry entry) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean isUser(LdapEntry entry) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public List<LdapEntry> findTargetEntries(List<String> dnList, DNType dnType) {
		// TODO Auto-generated method stub
		return null;
	}

	public String getADDomainName() {
		String domainName = configurationService.getAdDomainName();
		String domainNameStr="";
		if(domainName!=null && !domainName.equals("")) {
			String[] domainNameArr=  domainName.split("\\.");
			if(domainNameArr.length>0) {
				for (int i = 0; i < domainNameArr.length; i++) {
					domainNameStr += "DC="+domainNameArr[i];
					if(i!=domainNameArr.length-1) {
						domainNameStr += ",";
					}
				}
			}
		}
		return domainNameStr;
	}
	
	@Override
	public LdapEntry getDomainEntry() throws LdapException {
		String  domainNameStr=getADDomainName();
		
		logger.info("Searching on AD for DN: "+domainNameStr);
		LdapEntry domainEntry = null;
		try {
			List<LdapEntry> list = findSubEntries(domainNameStr, "(objectclass=*)",new String[] { "*" }, SearchScope.OBJECT);

			if (list.size() > 0) {
				domainEntry = list.get(0);
				domainEntry.setExpandedUser("FALSE");
			}

		} catch (LdapException e) {
			e.printStackTrace();
		}
		return domainEntry;
	}

	@Override
	public Boolean renameEntry(String oldDN, String newName) throws LdapException {
		// TODO Auto-generated method stub
		return null;
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
	
	@PreDestroy
	public void destroy() {
		logger.info("Destroying AD service...");
		try {
			if(pool != null) {
				pool.close();
			}
		} catch (Exception e) {
			e.printStackTrace();
			logger.error(e.getMessage(), e);
		}
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
}
