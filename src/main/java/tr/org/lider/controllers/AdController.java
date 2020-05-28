package tr.org.lider.controllers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.naming.directory.Attribute;
import javax.naming.directory.BasicAttribute;
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
import tr.org.lider.services.AdService;
import tr.org.lider.services.CommandService;

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
	
	
	@RequestMapping(value = "/getUsers")
	public List<LdapEntry> getUsers(HttpServletRequest request,Model model) {
		 String searchBase = "dc=pardus,dc=tr";
		 List<LdapEntry> ret = new ArrayList<>();
		try {
			//"(&(objectClass=user)(objectClass!=computer))"
		String filter="(&(objectClass=user)(!(objectClass=computer)))";
		//String filter="(objectClass=*)";
			
		ret=service.findSubEntries(searchBase, filter ,new String[] { "*" }, SearchScope.SUBTREE);
		 /*
		 
		 // Create the objectclass to add
	        Attribute objClasses = new BasicAttribute("objectClass");
	        objClasses.add("top");
	        objClasses.add("person");
	        objClasses.add("organizationalPerson");
	        objClasses.add("user");
		 
		   String cnValue = new StringBuffer(firstName).append(" ").append(lastName).toString();
	        Attribute cn = new BasicAttribute("cn", cnValue);
	        Attribute sAMAccountName = new BasicAttribute("sAMAccountName", userName);
	        Attribute principalName = new BasicAttribute("userPrincipalName", userName+ "@" + DOMAIN_NAME);
	        Attribute givenName = new BasicAttribute("givenName", firstName);
	        Attribute sn = new BasicAttribute("sn", lastName);
	        Attribute uid = new BasicAttribute("uid", userName);
		 
		 
		 */
		 
//		 Map<String, String[]> attributes = new HashMap<String, String[]>();
//		
//		 attributes.put("objectClass", new String[] {"top","person","organizationalPerson","user"});
//		 attributes.put("cn", new String[] {"hayati zeka"});
//		 attributes.put("sAMAccountName", new String[] {"hayati.zeka"});
//		 attributes.put("userPrincipalName", new String[] {"hayati.zeka@pardus.tr"});
//		 attributes.put("givenName", new String[] {"hayati"});
//		 attributes.put("sn", new String[] {"zeka"});
//		 attributes.put("uid", new String[] {"hayati.zeka"});
//		 
//		 service.addEntry("cn=hayati zeka,cn=Users,dc=pardus,dc=tr", attributes);
		
		 Map<String, String[]> attributes = new HashMap<String, String[]>();
		
		 attributes.put("objectClass", new String[] {"top","organizationalUnit"});
		 attributes.put("ou", new String[] {"YeniKlasor"});
		 
		 service.addEntry("ou=YeniKlasor,dc=pardus,dc=tr", attributes);
		 
	//	 service.deleteEntry("cn=Hasan Kara,cn=Users,dc=pardus,dc=tr");
		 
		} catch (LdapException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return ret;
	}
	
	@RequestMapping(value = "/getDomainEntry")
	public List<LdapEntry> getDomainEntry(HttpServletRequest request) {
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
		List<LdapEntry> oneLevelSubList=null;
		try {
			String filter="(|"
					+ "(objectclass=container)"
					+ "(objectclass=organizationalUnit)"
				//	+ "(objectclass=computer)"
				//	+ "(objectclass=organizationalPerson)"
				//	+ "(objectclass=group)"
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
	
	@RequestMapping(method=RequestMethod.POST ,value = "/syncUserFromAd2Ldap")
	public Boolean syncUserFromAd2Ldap(HttpServletRequest request,@RequestBody LdapEntry selectedLdapDn) {
		
		String filter="(objectClass=organizationalUnit)";
		try {
			//getting ldap ou, userss added this ou
			List<LdapEntry> selectedLdapEntryList=ldapService.findSubEntries(selectedLdapDn.getDistinguishedName() , filter, new String[] { "*" }, SearchScope.OBJECT);
			
			String adfilter="(objectclass=organizationalPerson)";
			
			List<LdapEntry> existUserList= new ArrayList<>();
					
			for (LdapEntry adUserEntry : selectedLdapDn.getChildEntries()) {
				List<LdapEntry> adUserList = service.findSubEntries(adUserEntry.getDistinguishedName(),adfilter,new String[] { "*" }, SearchScope.OBJECT);
				
				if(adUserList !=null && adUserList.size()>0) {
					
					LdapEntry adUser= adUserList.get(0);
					String sAMAccountName= adUser.getAttributesMultiValues().get("sAMAccountName")[0];
					String CN= adUser.getAttributesMultiValues().get("cn")[0];
					
					List<LdapEntry> adUserListForCheck=ldapService.findSubEntries(ldapService.getDomainEntry().getDistinguishedName() 
							, "(uid="+sAMAccountName+")", new String[] { "*" }, SearchScope.SUBTREE);
					
					if(adUserListForCheck!=null && adUserListForCheck.size()==0) {
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
						attributes.put("sn", new String[] { adUser.getSn() });
						attributes.put("uid", new String[] { sAMAccountName });
						attributes.put("uidNumber", new String[] { uidNumber });
						attributes.put("loginShell", new String[] { "/bin/bash" });
						attributes.put("userPassword", new String[] { sAMAccountName });
						attributes.put("homePostalAddress", new String[] { adUser.get("streetAddress") });
						attributes.put("employeeType", new String[] { "ADUser" });
						if(adUser.get("telephoneNumber")!=null && adUser.get("telephoneNumber")!="")
							attributes.put("telephoneNumber", new String[] { adUser.get("telephoneNumber") });

						String rdn="uid="+sAMAccountName+","+selectedLdapEntryList.get(0).getDistinguishedName();

						ldapService.addEntry(rdn, attributes);
					}
					else {
						existUserList.add(adUser);
					}
				}
			}
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return false;
		}
		return true;
	}
}
