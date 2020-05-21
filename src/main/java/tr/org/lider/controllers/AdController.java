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
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import tr.org.lider.constant.LiderConstants;
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
}
