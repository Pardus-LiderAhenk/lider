package tr.org.lider.controllers;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.naming.directory.Attribute;
import javax.naming.directory.BasicAttribute;
import javax.naming.directory.DirContext;
import javax.naming.directory.ModificationItem;
import javax.servlet.http.HttpServletRequest;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import tr.org.lider.constant.LiderConstants;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.ldap.LdapSearchFilterAttribute;
import tr.org.lider.ldap.SearchFilterEnum;
import tr.org.lider.services.AdService;
import tr.org.lider.services.CommandService;
import tr.org.lider.services.ConfigurationService;

/**
 * 
 * @author M. Edip YILDIZ
 *
 */
@RestController()
@RequestMapping(value = "/ad")
public class AdController {
	Logger logger = LoggerFactory.getLogger(AdminController.class);

	@Autowired
	private AdService service;

	@Autowired
	private LDAPServiceImpl ldapService;
	
	@Autowired
	private ConfigurationService configurationService;
	
	@RequestMapping(value = "/getDomainEntry")
	public List<LdapEntry> getDomainEntry(HttpServletRequest request) {
		logger.info("Getting AD base DN ");
		List<LdapEntry> retList =null;
		try {
			retList= new ArrayList<LdapEntry>();
			LdapEntry domainEntry=service.getDomainEntry();
			if(domainEntry ==null)
			{
				return null;
			}
			domainEntry.setName(domainEntry.getDistinguishedName());
			retList.add(domainEntry);
		} catch (LdapException e) {
			e.printStackTrace();
		}
		return retList;
	}
	
	@RequestMapping(value = "/getChildEntriesOu")
	public List<LdapEntry> getChildEntriesOu(HttpServletRequest request, LdapEntry selectedEntry) {
		logger.info("Getting AD child OU entries for dn = "+ selectedEntry.getDistinguishedName());
		List<LdapEntry> oneLevelSubList=null;
		try {
			String filter="(|"
					+ "(objectclass=container)"
					+ "(objectclass=organizationalUnit)"
					+ "(objectclass=computer)"
					+ "(objectclass=organizationalPerson)"
					+ "(objectclass=group)"
					+ "(objectclass=*)"
					+")";
			
			oneLevelSubList= new ArrayList<>();
			oneLevelSubList = service.findSubEntries(selectedEntry.getDistinguishedName(),filter,new String[] { "*" }, SearchScope.ONELEVEL);
		} catch (LdapException e) {
			e.printStackTrace();
		}
		return oneLevelSubList;
	}
	
	@RequestMapping(value = "/getChildEntries")
	public List<LdapEntry> getChildEntries(HttpServletRequest request, LdapEntry selectedEntry) {
		logger.info("Getting AD child entries for dn = "+ selectedEntry.getDistinguishedName());
		List<LdapEntry> oneLevelSubList=null;
		try {
			String filter="(|"
					+ "(objectclass=container)"
					+ "(objectclass=organizationalUnit)"
						+ "(objectclass=computer)"
						+ "(objectclass=organizationalPerson)"
						+ "(objectclass=group)"
					+")";
			
			oneLevelSubList= new ArrayList<>();
			oneLevelSubList = service.findSubEntries(selectedEntry.getDistinguishedName(),filter,new String[] { "*" }, SearchScope.ONELEVEL);
		} catch (LdapException e) {
			e.printStackTrace();
		}
		return oneLevelSubList;
	}
	@RequestMapping(value = "/addUser2AD")
	public Boolean addUser2AD(HttpServletRequest request, LdapEntry selectedEntry) {
		logger.info("Adding user to AD. User info"+ selectedEntry.getDistinguishedName());
		
		 Map<String, String[]> attributes = new HashMap<String, String[]>();
		
		 attributes.put("objectClass", new String[] {"top","person","organizationalPerson","user"});
		 attributes.put("cn", new String[] {selectedEntry.getCn()});
		 attributes.put("sAMAccountName", new String[] {selectedEntry.getUid()});
		 attributes.put("userPrincipalName", new String[] {selectedEntry.getUid()+"@"+configurationService.getAdDomainName()});
		 attributes.put("givenName", new String[] {selectedEntry.getName()});
		 attributes.put("displayName", new String[] {selectedEntry.getCn()});
		 attributes.put("name", new String[] {selectedEntry.getCn()});
		 attributes.put("sn", new String[] {selectedEntry.getSn()});
//		 attributes.put("userpassword", new String[] {selectedEntry.getUserPassword()});
		 String newQuotedPassword = "\"" + selectedEntry.getUserPassword() + "\"";
		 
		 byte[] newUnicodePassword =null;
		 try {
			 newUnicodePassword	= newQuotedPassword.getBytes("UTF-16LE");
				attributes.put("unicodePwd", new String[] {new String(newUnicodePassword)});
		 } 
		 catch (UnsupportedEncodingException e1) {
				e1.printStackTrace();
		}

		 //mods[0] = new ModificationItem(DirContext.REPLACE_ATTRIBUTE, new BasicAttribute("unicodePwd", newUnicodePassword));
		 
		// some useful constants from lmaccess.h
		 int UF_ACCOUNTENABLE = 0x0001;   
		 int UF_ACCOUNTDISABLE = 0x0002;
	     int UF_PASSWD_NOTREQD = 0x0020;
	       int UF_PASSWD_CANT_CHANGE = 0x0040;
	        int UF_NORMAL_ACCOUNT = 0x0200;
	        int UF_DONT_EXPIRE_PASSWD = 0x10000;
	        int UF_PASSWORD_EXPIRED = 0x800000;
	        
	     String uacStr=   Integer.toString(UF_NORMAL_ACCOUNT + UF_PASSWD_NOTREQD + UF_DONT_EXPIRE_PASSWD + UF_ACCOUNTENABLE);
	     attributes.put("userAccountControl", new String[] {uacStr});
	     attributes.put("userpassword", new String[] {uacStr});
		 try {
			 
			String rdn="CN="+selectedEntry.getCn()+","+selectedEntry.getParentName();
			service.addEntry(rdn, attributes);
			
//			service.updateEntry(rdn, "unicodePwd",new String(newUnicodePassword) );
			
		} catch (LdapException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return true;
	}
	
	@RequestMapping(value = "/searchEntry")
	public List<LdapEntry>  searchEntry(HttpServletRequest request,
			@RequestParam(value="searchDn", required=true) String searchDn,
			@RequestParam(value="key", required=true) String key, 
			@RequestParam(value="value", required=true) String value) {
		List<LdapEntry> results=null;
		try {
			if(searchDn.equals("")) {
				searchDn=configurationService.getAdDomainName();
			}
			List<LdapSearchFilterAttribute> filterAttributes = new ArrayList<LdapSearchFilterAttribute>();
			filterAttributes.add(new LdapSearchFilterAttribute(key, value, SearchFilterEnum.EQ));
			results = service.search(searchDn,filterAttributes, new String[] {"*"});
		} catch (LdapException e) {
			e.printStackTrace();
		}
		return results;
	}
	
	@RequestMapping(method=RequestMethod.POST ,value = "/syncUserFromAd2Ldap")
	public List<LdapEntry> syncUserFromAd2Ldap(HttpServletRequest request,@RequestBody LdapEntry selectedLdapDn) {
		logger.info("SYNC AD to LDAP starting.. Sync to LDAP OU ="+selectedLdapDn.getDistinguishedName() );
		String filter="(objectClass=organizationalUnit)";
		List<LdapEntry> existUserList= new ArrayList<>();
		try {
			//getting ldap ou, userss added this ou
			List<LdapEntry> selectedLdapEntryList=ldapService.findSubEntries(selectedLdapDn.getDistinguishedName() , filter, new String[] { "*" }, SearchScope.OBJECT);
			
			String adfilter="(objectclass=organizationalPerson)";
			/**
			 *  selectedLdapDn.getChildEntries() holds users that they will add to ldap
			 */
			for (LdapEntry adUserEntry : selectedLdapDn.getChildEntries()) {
				//getting users from AD
				List<LdapEntry> adUserList = service.findSubEntries(adUserEntry.getDistinguishedName(),adfilter,new String[] { "*" }, SearchScope.OBJECT);
				
				if(adUserList !=null && adUserList.size()>0) {
					LdapEntry adUser= adUserList.get(0);
					String sAMAccountName= adUser.getAttributesMultiValues().get("sAMAccountName")[0];
					String CN= adUser.getAttributesMultiValues().get("cn")[0];
					
					List<LdapEntry> adUserListForCheck=ldapService.findSubEntries(ldapService.getDomainEntry().getDistinguishedName() 
							, "(uid="+sAMAccountName+")", new String[] { "*" }, SearchScope.SUBTREE);
					
					if(adUserListForCheck!=null && adUserListForCheck.size()==0) {
						addUser(selectedLdapEntryList.get(0).getDistinguishedName(), adUser, sAMAccountName);
					}
					else {
						logger.info("SYNC AD to LDAP.. User exist ="+adUser.getDistinguishedName() );
						existUserList.add(adUser);
					}
				}
			}
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}
		return existUserList;
	}
	
	@RequestMapping(method=RequestMethod.POST ,value = "/syncGroupFromAd2Ldap")
	public List<LdapEntry> syncGroupFromAd2Ldap(HttpServletRequest request,@RequestBody LdapEntry selectedLdapDn) {
		logger.info("SYNC GROUP AD to LDAP starting.. Sync to LDAP OU ="+selectedLdapDn.getDistinguishedName() );
		
		List<LdapEntry> existGroupList= new ArrayList<>();
		String filter="(objectClass=organizationalUnit)";
		try {
			//getting ldap ou, userss added this ou
			List<LdapEntry> selectedLdapEntryList=ldapService.findSubEntries(selectedLdapDn.getDistinguishedName() , filter, new String[] { "*" }, SearchScope.OBJECT);
			String destinationDnLdap=selectedLdapEntryList.get(0).getDistinguishedName();
			String adGroupfilter="(objectclass=group)";
			
			for (LdapEntry adGroupEntry : selectedLdapDn.getChildEntries()) {
				List<LdapEntry> adGroupList = service.findSubEntries(adGroupEntry.getDistinguishedName(),adGroupfilter,new String[] { "*" }, SearchScope.OBJECT);
				
				if(adGroupList !=null && adGroupList.size()>0) {
					
					LdapEntry adGroup= adGroupList.get(0);
					String cn=adGroup.get("cn");
					String filterLdapSearch="(&(objectClass=groupOfNames)(cn="+cn+"))";
					List<LdapEntry> adGroupListForCheck=ldapService.findSubEntries(ldapService.getDomainEntry().getDistinguishedName(), filterLdapSearch , new String[] { "*" }, SearchScope.SUBTREE);
					
					if(adGroupListForCheck!=null && adGroupListForCheck.size()==0) {
						
					
 						
						// find users of selected member and add this users to ldap user folder( ou=Users).. 
						String[] memberArr=adGroup.getAttributesMultiValues().get("member");
						// create temp list to add members for ldap adding
						List<String> memberDistinguishedNameArr= new ArrayList<>();
						if(memberArr.length>0) {
							for (int i = 0; i < memberArr.length; i++) {
								String memberDistinguishedName=memberArr[i];
								String adUserfilter="(objectclass=organizationalPerson)";
								/**
								 * getting ad group member details from AD
								 */
								List<LdapEntry> adUserList = service.findSubEntries(memberDistinguishedName,adUserfilter,new String[] { "*" }, SearchScope.OBJECT);
								
								String sAMAccountName=adUserList.get(0).get("sAMAccountName");
								
								List<LdapEntry> adUserListForCheck=ldapService.findSubEntries(ldapService.getDomainEntry().getDistinguishedName(), "(uid="+sAMAccountName+")", new String[] { "*" }, SearchScope.SUBTREE);
								/**
								 * if user isn't in ldap, user can add ldap
								 */
								if(adUserListForCheck!=null && adUserListForCheck.size()==0) {
									String rdn=addUser(configurationService.getUserLdapBaseDn(), adUserList.get(0), sAMAccountName);
									memberDistinguishedNameArr.add(rdn);
								}
								else {
									memberDistinguishedNameArr.add(adUserListForCheck.get(0).getDistinguishedName());
								}
							}
						}
						// add selected AD group to LDAP
						Map<String, String[]> attributes = new HashMap<String, String[]>();
						attributes.put("objectClass", new String[] { "top", "groupOfNames", "pardusLider"});
						attributes.put("cn", new String[] { adGroup.get("cn") });
						attributes.put("liderGroupType", new String[] { "USER" });
						attributes.put("description", new String[] { "ADGROUP" });
						attributes.put("member", memberDistinguishedNameArr.stream().toArray(String[]::new));
						
						String rdn="cn="+adGroup.get("cn")+","+destinationDnLdap;
						ldapService.addEntry(rdn, attributes);
					}
					else {
						logger.info("SYNC AD to LDAP.. Group already exist ="+adGroup.getDistinguishedName() );
						existGroupList.add(adGroup);
					}
				}
			}
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}
		return existGroupList;
	}

	private String addUser(String destinationDistinguishedName, LdapEntry adUser, String sAMAccountName)
			throws LdapException {
		String gidNumber="9000";
		int randomInt = (int)(1000000.0 * Math.random());
		String uidNumber= Integer.toString(randomInt);
		
		String home="/home/"+adUser.get("sAMAccountName"); 
		
		Map<String, String[]> attributes = new HashMap<String, String[]>();
		
		attributes.put("objectClass", new String[] { "top", "posixAccount",	"person","pardusLider","pardusAccount","organizationalPerson","inetOrgPerson"});
		attributes.put("cn", new String[] { adUser.get("givenName") });
		attributes.put("mail", new String[] { adUser.get("mail") });
		attributes.put("gidNumber", new String[] { gidNumber });
		attributes.put("homeDirectory", new String[] { home });
		if(adUser.get("sn") !=null &&  adUser.get("sn")!="" ) {
			attributes.put("sn", new String[] { adUser.get("sn") });
		}else {
			logger.info("SN not exist ="+adUser.getDistinguishedName() );
			attributes.put("sn", new String[] { " " });
		}
		attributes.put("uid", new String[] { sAMAccountName });
		attributes.put("uidNumber", new String[] { uidNumber });
		attributes.put("loginShell", new String[] { "/bin/bash" });
		attributes.put("userPassword", new String[] { sAMAccountName });
		attributes.put("homePostalAddress", new String[] { adUser.get("streetAddress") });
		attributes.put("employeeType", new String[] { "ADUser" });
		if(adUser.get("telephoneNumber")!=null && adUser.get("telephoneNumber")!="")
			attributes.put("telephoneNumber", new String[] { adUser.get("telephoneNumber") });
		
		String rdn="uid="+sAMAccountName+","+destinationDistinguishedName;
		
		ldapService.addEntry(rdn, attributes);
		
		return rdn;
	}
}
