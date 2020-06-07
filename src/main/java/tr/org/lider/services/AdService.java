package tr.org.lider.services;

import java.net.Socket;
import java.security.Principal;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.annotation.PreDestroy;
import javax.net.ssl.KeyManager;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509KeyManager;
import javax.net.ssl.X509TrustManager;

import org.apache.commons.pool.impl.GenericObjectPool;
import org.apache.directory.api.ldap.model.cursor.SearchCursor;
import org.apache.directory.api.ldap.model.entry.Attribute;
import org.apache.directory.api.ldap.model.entry.DefaultEntry;
import org.apache.directory.api.ldap.model.entry.Entry;
import org.apache.directory.api.ldap.model.entry.Value;
import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.AddRequest;
import org.apache.directory.api.ldap.model.message.AddRequestImpl;
import org.apache.directory.api.ldap.model.message.AddResponse;
import org.apache.directory.api.ldap.model.message.LdapResult;
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
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import tr.org.lider.LiderSecurityUserDetails;
import tr.org.lider.ldap.DNType;
import tr.org.lider.ldap.ILDAPService;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.ldap.LdapSearchFilterAttribute;


@Service
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
			Boolean useSSL = configurationService.getLdapUseSsl(); 
			Boolean allowSelfSignedCert =configurationService.getLdapAllowSelfSignedCert();
			
			setParams(host,port,userName,password,useSSL, allowSelfSignedCert);
			connection = pool.getConnection();
		} catch (Exception e) {
			e.printStackTrace();
			throw new LdapException(e);
		}
		return connection;
	}

	public void setParams(String host,String port, String userName, String password, Boolean useSSL, Boolean allowSelfSignedCert) throws Exception {
		LdapConnectionConfig lconfig = new LdapConnectionConfig();
		lconfig.setLdapHost(host);
		lconfig.setLdapPort(Integer.parseInt(port));
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication != null && !(authentication instanceof AnonymousAuthenticationToken)) {
				lconfig.setName(userName);
				lconfig.setCredentials(password);
		}  else {
			lconfig.setName(userName);
			lconfig.setCredentials(userName);
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
		} catch (Exception e) {
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
			throw new LdapException(e);
		} finally {
			releaseConnection(connection);
		}
	}

	@Override
	public void updateEntry(String entryDn, String attribute, String value) throws LdapException {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void updateEntryAddAtribute(String entryDn, String attribute, String value) throws LdapException {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void updateEntryRemoveAttribute(String entryDn, String attribute) throws LdapException {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void updateEntryRemoveAttributeWithValue(String entryDn, String attribute, String value)
			throws LdapException {
		// TODO Auto-generated method stub
		
	}

	@Override
	public Entry getRootDSE() throws LdapException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public LdapEntry getEntry(String entryDn, String[] requestedAttributes) throws LdapException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getDN(String baseDn, String attributeName, String attributeValue) throws LdapException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<LdapEntry> search(String baseDn, List<LdapSearchFilterAttribute> filterAttributes,
			String[] returningAttributes) throws LdapException {
		// TODO Auto-generated method stub
		return null;
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
					
					String[] objectClasses= ldapEntry.getAttributesMultiValues().get("objectClass");
					logger.info(objectClasses.toString());
					
					for (int i = 0; i < objectClasses.length; i++) {
						String objClass=objectClasses[i];
						if(objClass.equals("group")) { ldapEntry.setType(DNType.GROUP); break; }
						else if(objClass.equals("container")) { ldapEntry.setType(DNType.CONTAINER); break;  }
						else if(objClass.equals("computer")) { 
							if(ldapEntry.getAttributesMultiValues().get("operatingSystem")[0].contains("linux-gnu") ) {ldapEntry.setType(DNType.AHENK);}
							else if(ldapEntry.getAttributesMultiValues().get("operatingSystem")[0].contains("Windows") ) {ldapEntry.setType(DNType.WIND0WS_AHENK);}
							 break;  
						}
						else if(objClass.equals("organizationalPerson")) { ldapEntry.setType(DNType.USER);  }
						else if(objClass.equals("organizationalUnit")) { ldapEntry.setType(DNType.ORGANIZATIONAL_UNIT);  }
					}
					String dateStr= ldapEntry.get("createTimestamp");
					if(dateStr!=null) {
						
						String year=dateStr.substring(0,4);
						String month=dateStr.substring(4,6);
						String day=dateStr.substring(6,8);
						String hour=dateStr.substring(8,10);
						String min=dateStr.substring(10,12);
						String sec=dateStr.substring(12,14);
						String crtDate=day+"/"+ month+"/"+ year+" "+ hour +":"+min;

						ldapEntry.setCreateDateStr(crtDate);
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

	@Override
	public LdapEntry getDomainEntry() throws LdapException {
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
			logger.error(e.getMessage(), e);
		}
	}
	
	public void syncUserFromAd2Ldap(String selectedLdapDn, String[] adUsersDn) {
		
	}
	

}
