package tr.org.lider.controllers;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.entities.OperationType;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.ldap.LdapSearchFilterAttribute;
import tr.org.lider.ldap.SearchFilterEnum;
import tr.org.lider.models.PolicyResponse;
import tr.org.lider.services.AdService;
import tr.org.lider.services.ConfigurationService;
import tr.org.lider.services.OperationLogService;
import tr.org.lider.services.PolicyService;
import tr.org.lider.utils.IRestResponse;
import tr.org.lider.utils.ResponseFactoryService;
import tr.org.lider.utils.RestResponseStatus;

/**
 * 
 * @author M. Edip YILDIZ
 *
 */
@RestController()
@RequestMapping(value = "/ad")
public class AdController {
	Logger logger = LoggerFactory.getLogger(AdController.class);

	@Autowired
	private AdService service;

	@Autowired
	private LDAPServiceImpl ldapService;
	
	@Autowired
	private ConfigurationService configurationService;
	
	@Autowired
	private ResponseFactoryService responseFactoryService;
	
	@Autowired
	private OperationLogService operationLogService; 
	
	@Autowired
	private PolicyService policyService; 
	
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
					+ "(objectclass=user)"
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
	public IRestResponse addUser2AD(HttpServletRequest request, LdapEntry selectedEntry) {
		 logger.info("Adding user to AD. User info : "+ selectedEntry.getDistinguishedName());
		 
		 Map<String, String[]> attributes = new HashMap<String, String[]>();
		
		 attributes.put("objectClass", new String[] {"top","person","organizationalPerson","user"});
		 attributes.put("cn", new String[] {selectedEntry.getCn()});
		 attributes.put("sAMAccountName", new String[] {selectedEntry.getUid()});
		 attributes.put("userPrincipalName", new String[] {selectedEntry.getUid()+"@"+configurationService.getAdDomainName()});
		 attributes.put("givenName", new String[] {selectedEntry.getName()});
		 attributes.put("displayName", new String[] {selectedEntry.getCn()});
		 attributes.put("name", new String[] {selectedEntry.getCn()});
		 attributes.put("mail", new String[] {selectedEntry.getMail()});
		 attributes.put("telephoneNumber", new String[] {selectedEntry.getTelephoneNumber()});
		 attributes.put("streetAddress", new String[] {selectedEntry.getHomePostalAddress()});
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
	        
//	     String uacStr=   Integer.toString(UF_NORMAL_ACCOUNT + UF_PASSWD_NOTREQD + UF_DONT_EXPIRE_PASSWD + UF_ACCOUNTENABLE);
	     String uacStr=   Integer.toString(UF_NORMAL_ACCOUNT + UF_PASSWD_NOTREQD + UF_PASSWORD_EXPIRED + UF_ACCOUNTENABLE);
	     attributes.put("userAccountControl", new String[] {uacStr});
	     attributes.put("pwdLastSet", new String[] {"0"});
	    
		 try {
			String rdn="CN="+selectedEntry.getCn()+","+selectedEntry.getParentName();
			service.addEntry(rdn, attributes);
			
			operationLogService.saveOperationLog(OperationType.CREATE,"Dizin yapısına kullanıcı eklendi.Kullanıcı: "+rdn,null);
			return responseFactoryService.createResponse(RestResponseStatus.OK,"Kullanıcı Başarı ile oluşturuldu.");
			
//			service.updateEntryAddAtribute(rdn, "pwdLastSet", "0");
		} catch (LdapException e) {
			e.printStackTrace();
			String message=e.getLocalizedMessage();
			if(message!=null && message.contains("CONSTRAINT_ATT_TYPE")) {
			return 	responseFactoryService.createResponse(RestResponseStatus.WARNING,"Aynı kullanıcı giriş ismine sahip kullanıcı bulunmaktadır.");
			}
		}
		return null;
	}
	
	@RequestMapping(value = "/addOu2AD")
	public Boolean addOu2AD(HttpServletRequest request, LdapEntry selectedEntry) {
		logger.info("Adding OU to AD. Ou info {} {}", selectedEntry.getDistinguishedName(),selectedEntry.getOu());
		
		Map<String, String[]> attributes = new HashMap<String, String[]>();
		
		attributes.put("objectClass", new String[] {"top","organizationalUnit"});
		attributes.put("ou", new String[] {selectedEntry.getOu()});
	
		try {
			String rdn="OU="+selectedEntry.getOu()+","+selectedEntry.getParentName();
			service.addEntry(rdn, attributes);
			
			operationLogService.saveOperationLog(OperationType.CREATE,"Dizin yapısına organizasyon birimi eklendi. Ou: "+rdn,null);
		} catch (LdapException e) {
			e.printStackTrace();
		}
		return true;
	}
	
	@RequestMapping(value = "/addGroup2AD")
	public Boolean addGroup2AD(HttpServletRequest request, LdapEntry selectedEntry) {
		logger.info("Adding Group to AD. Group info {} {}", selectedEntry.getDistinguishedName(),selectedEntry.getCn());
		
		Map<String, String[]> attributes = new HashMap<String, String[]>();
		
		attributes.put("objectClass", new String[] {"top","group"});
		attributes.put("CN", new String[] {selectedEntry.getCn()});
		attributes.put("sAMAccountName", new String[] {selectedEntry.getCn()});
		
		try {
			String rdn="CN="+selectedEntry.getCn()+","+selectedEntry.getParentName();
			service.addEntry(rdn, attributes);
			operationLogService.saveOperationLog(OperationType.CREATE,"Dizin yapısına grup eklendi. Grup: "+rdn,null);
		} catch (LdapException e) {
			e.printStackTrace();
		}
		return true;
	}
	
	@RequestMapping(value = "/addMember2ADGroup")
	public Boolean addMember2ADGroup(HttpServletRequest request, LdapEntry selectedEntry) {
		logger.info("Adding {} to group. Group info {} ", selectedEntry.getDistinguishedName(),selectedEntry.getParentName());
		
		try {
			service.updateEntryAddAtribute(selectedEntry.getParentName(), "member", selectedEntry.getDistinguishedName());
			operationLogService.saveOperationLog(OperationType.CREATE,"Gruba üye eklendi. Üye: "+selectedEntry.getDistinguishedName(),null);
		} catch (LdapException e) {
			e.printStackTrace();
		}
		return true;
	}
	
	@RequestMapping(value = "/searchEntryUser")
	public List<LdapEntry>  searchEntryUser(HttpServletRequest request,
			@RequestParam(value="searchDn", required=true) String searchDn,
			@RequestParam(value="key", required=true) String key, 
			@RequestParam(value="value", required=true) String value) {
		List<LdapEntry> results=null;
		
		logger.info("Search for key {} value {}  only users ",key, value);
		try {
			if(searchDn.equals("")) {
				searchDn=service.getADDomainName();
			}
			List<LdapSearchFilterAttribute> filterAttributes = new ArrayList<LdapSearchFilterAttribute>();
			filterAttributes.add(new LdapSearchFilterAttribute(key, value, SearchFilterEnum.EQ));
			filterAttributes.add(new LdapSearchFilterAttribute("objectclass", "user", SearchFilterEnum.EQ)); 
			filterAttributes.add(new LdapSearchFilterAttribute("objectclass", "computer", SearchFilterEnum.NOT_EQ)); 
			results = service.search(searchDn,filterAttributes, new String[] {"*"});
		} catch (LdapException e) {
			e.printStackTrace();
		}
		return results;
	}
	@RequestMapping(value = "/searchEntryGroup")
	public List<LdapEntry>  searchEntryGroup(HttpServletRequest request,
			@RequestParam(value="searchDn", required=true) String searchDn,
			@RequestParam(value="key", required=true) String key, 
			@RequestParam(value="value", required=true) String value) {
		List<LdapEntry> results=null;
		
		logger.info("Search for key {} value {}  only groups ",key, value);
		try {
			if(searchDn.equals("")) {
				searchDn=service.getADDomainName();
			}
			List<LdapSearchFilterAttribute> filterAttributes = new ArrayList<LdapSearchFilterAttribute>();
			filterAttributes.add(new LdapSearchFilterAttribute(key, value, SearchFilterEnum.EQ));
			filterAttributes.add(new LdapSearchFilterAttribute("objectclass", "group", SearchFilterEnum.EQ)); 
			results = service.search(searchDn,filterAttributes, new String[] {"*"});
		} catch (LdapException e) {
			e.printStackTrace();
		}
		return results;
	}
	@RequestMapping(value = "/searchEntry")
	public List<LdapEntry>  searchEntry(HttpServletRequest request,
			@RequestParam(value="searchDn", required=true) String searchDn,
			@RequestParam(value="key", required=true) String key, 
			@RequestParam(value="value", required=true) String value) {
		logger.info("Search for key {} value {}   ",key, value);
		List<LdapEntry> results=null;
		try {
			if(searchDn.equals("")) {
				searchDn=service.getADDomainName();
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
						addUserToLDAP(selectedLdapEntryList.get(0).getDistinguishedName(), adUser, sAMAccountName,sAMAccountName);
						operationLogService.saveOperationLog(OperationType.UPDATE,"Kullanıcı Lider LDAP yapısına taşındı. Kullanıcı : "+selectedLdapEntryList.get(0).getDistinguishedName(),null);
					}
					else {
						logger.info("SYNC AD to LDAP.. User exist ="+adUser.getDistinguishedName() );
						existUserList.add(adUser);
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
		return existUserList;
	}
	
	@RequestMapping(method=RequestMethod.POST ,value = "/moveAdUser2Ldap")
	public List<LdapEntry> moveAdUser2Ldap(HttpServletRequest request,@RequestBody LdapEntry selectedLdapDn) {
		
		List<LdapEntry> existUserList= new ArrayList<>();
		try {
			String globalUserOu = configurationService.getUserLdapBaseDn();
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
					
					List<LdapEntry> adUserListForCheck=ldapService.findSubEntries(ldapService.getDomainEntry().getDistinguishedName() 
							, "(uid="+sAMAccountName+")", new String[] { "*" }, SearchScope.SUBTREE);
					
					if(adUserListForCheck!=null && adUserListForCheck.size()==0) {
						String dn=addUserToLDAP(globalUserOu, adUser, sAMAccountName, selectedLdapDn.getUserPassword());
						
						ldapService.updateEntryAddAtribute(dn, "liderPrivilege", "ROLE_USER");
						ldapService.updateEntryAddAtribute(dn, "liderPrivilege", "ROLE_ADMIN");
						
						operationLogService.saveOperationLog(OperationType.UPDATE,"Kullanıcı Lider sistemine taşındı. Kullanıcı : "+dn,null);
					}
					else {
						logger.info("SYNC AD to LDAP.. User exist ="+adUser.getDistinguishedName() );
						existUserList.add(adUser);
					}
				}
			}
		} catch (Exception e) {
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
									String rdn=addUserToLDAP(configurationService.getUserLdapBaseDn(), adUserList.get(0), sAMAccountName,sAMAccountName);
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

	private String addUserToLDAP(String destinationDistinguishedName, LdapEntry adUser, String sAMAccountName, String userPassword)
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
			logger.info("SN not exist " );
			attributes.put("sn", new String[] { " " });
		}
		attributes.put("uid", new String[] { sAMAccountName });
		attributes.put("uidNumber", new String[] { uidNumber });
		attributes.put("loginShell", new String[] { "/bin/bash" });
		attributes.put("userPassword", new String[] { userPassword });
		attributes.put("homePostalAddress", new String[] { adUser.get("streetAddress") });
		attributes.put("employeeType", new String[] { "ADUser" });
		if(adUser.get("telephoneNumber")!=null && adUser.get("telephoneNumber")!="")
			attributes.put("telephoneNumber", new String[] { adUser.get("telephoneNumber") });
		
		String rdn="uid="+sAMAccountName+","+destinationDistinguishedName;
		
		ldapService.addEntry(rdn, attributes);
		
		return rdn;
	}

	/**
	 * update user password
	 * @param selectedEntry
	 * @return
	 */
	@RequestMapping(method=RequestMethod.POST, value = "/updateUserPassword",produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public LdapEntry updateUserPassword(LdapEntry selectedEntry) {
		logger.info("Resetting user password. Dn: {}",selectedEntry.getDistinguishedName());
		try {
			String newPassword =  selectedEntry.getUserPassword();
			     
			     String newQuotedPassword = "\"" + newPassword + "\"";
			     byte[] newUnicodePassword = null;
				try {
					newUnicodePassword = newQuotedPassword.getBytes("UTF-16LE");
				} catch (UnsupportedEncodingException e1) {
					e1.printStackTrace();
				}
			
			if(!"".equals(selectedEntry.getUserPassword())){
				service.updateEntryReplaceAttribute(selectedEntry.getDistinguishedName(),"unicodePwd",new String(newUnicodePassword));
				
				operationLogService.saveOperationLog(OperationType.UPDATE,"Kullanıcı Parolası Değiştirildi. Kullanıcı : "+selectedEntry.getDistinguishedName(),null);
			}
			selectedEntry = service.findSubEntries(selectedEntry.getDistinguishedName(), "(objectclass=*)", new String[] {"*"}, SearchScope.OBJECT).get(0);
			return selectedEntry;
		} catch (LdapException e) {
			e.printStackTrace();
			return null;
		}
	}

	/**
	 * delete entry for ad
	 * @param selectedEntry
	 * @return
	 */
	@RequestMapping(method=RequestMethod.POST, value = "/deleteEntry",produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public LdapEntry deleteEntry(LdapEntry selectedEntry) {
		try {
			logger.info("AD Deleting entry. Dn: {}",selectedEntry.getDistinguishedName());
			service.deleteEntry(selectedEntry.getDistinguishedName());
			
			operationLogService.saveOperationLog(OperationType.DELETE,"Dizin yapısından nesne silindi. Silinen nesne: "+selectedEntry.getDistinguishedName(),null);
			return selectedEntry;
		} catch (LdapException e) {
			e.printStackTrace();
			return null;
		}
	}
	
//	/**
//	 * delete entry for ad
//	 * @param selectedEntry
//	 * @return
//	 */
//	@RequestMapping(method=RequestMethod.POST, value = "/deleteMemberFromGroup",produces = MediaType.APPLICATION_JSON_VALUE)
//	@ResponseBody
//	public LdapEntry deleteMemberFromGroup(LdapEntry selectedEntry) {
//		logger.info("AD Delete member from group. Dn: {} Member {}",selectedEntry.getDistinguishedName());
//		try {
//			service.updateEntryRemoveAttributeWithValue(selectedEntry.getDistinguishedName(),"","");
//			return selectedEntry;
//		} catch (LdapException e) {
//			e.printStackTrace();
//			return null;
//		}
//	}
	
	
	@RequestMapping(method=RequestMethod.POST ,value = "/deleteMemberFromGroup", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public LdapEntry deleteMembersOfGroup(@RequestParam(value="dn", required=true) String dn, 
			@RequestParam(value="dnList[]", required=true) List<String> dnList) {
		//when single dn comes spring boot takes it as multiple arrays
		//so dn must be joined with comma
		//if member dn that will be added to group is cn=agent1,ou=Groups,dn=liderahenk,dc=org
		//spring boot gets this param as array which has size 4
		Boolean checkedArraySizeIsOne = true;
		for (int i = 0; i < dnList.size(); i++) {
			if(dnList.get(i).contains(",")) {
				checkedArraySizeIsOne = false;
				break;
			}
		}
		if(checkedArraySizeIsOne) {
			try {
				service.updateEntryRemoveAttributeWithValue(dn, "member", String.join(",", dnList));
				operationLogService.saveOperationLog(OperationType.DELETE,"Dizin grubundan üye silindi. Grup: "+dn +" Silinen üyeler: "+dnList,null);
				
			} catch (LdapException e) {
				e.printStackTrace();
				return null;
			}
		} else {
			for (int i = 0; i < dnList.size(); i++) {
				try {
					service.updateEntryRemoveAttributeWithValue(dn, "member", dnList.get(i));
					operationLogService.saveOperationLog(OperationType.DELETE,"Dizin grubundan üye silindi. Grup: "+dn +" Silinen üye: "+dnList.get(i),null);
				} catch (LdapException e) {
					e.printStackTrace();
					return null;
				}
			}
		}
		return service.getEntryDetail(dn);
	}
	
	
	/**
	 * getting user policies
	 * @param selectedEntry
	 * @return
	 */
	@RequestMapping(method=RequestMethod.POST, value = "/getUserPolicies",produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public List<PolicyResponse> getUserPolicies(LdapEntry selectedEntry) {
		logger.info("Getting user policies user Dn: {}",selectedEntry.getDistinguishedName());
		try {
			//get user groups
			List<LdapSearchFilterAttribute> filterAttributes = new ArrayList<LdapSearchFilterAttribute>();
			filterAttributes.add(new LdapSearchFilterAttribute("objectClass", "group", SearchFilterEnum.EQ));
			filterAttributes.add(new LdapSearchFilterAttribute("member", selectedEntry.getDistinguishedName(), SearchFilterEnum.EQ));
			List<LdapEntry> groups = service.search(service.getADDomainName(),filterAttributes, new String[] {"*"});

			
			List<PolicyResponse> userPolicies=new ArrayList<PolicyResponse>();
			// find policiy for user groups
			for (LdapEntry ldapEntry : groups) {
				List<PolicyResponse> policies= policyService.getPoliciesForGroup(ldapEntry.getDistinguishedName());
				userPolicies.addAll(policies);
			}
			return userPolicies;
		} catch (LdapException e) {
			e.printStackTrace();
			return null;
		}
	}

	
}
