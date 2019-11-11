package tr.org.lider.controllers;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.ArrayUtils;
import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;

@Controller
@RestController()
public class LdapController {
	
	 Logger logger = LoggerFactory.getLogger(LdapController.class);
	 
	
	@Autowired
	private LDAPServiceImpl ldapService;
	
	@RequestMapping(value = "/getOuDetails")
	public LdapEntry task(HttpServletRequest request,Model model, LdapEntry selectedEntry) {
		
		List<LdapEntry>  subEntries=null;
		
		//ou=Bilgi İşlem Başkanlığı,ou=Kullanıcılar,dc=mys,dc=pardus,dc=org
		String uid=selectedEntry.getUid();
		
		String[] parents=uid.split(",");
		
		ArrayUtils.reverse(parents);
		String parentsStr="";
		for (String pp : parents) {
			if(!pp.startsWith("dc=")) {
				parentsStr +=pp.split("=")[1];	
				parentsStr +=" > ";
			}
		}
		
		parentsStr=parentsStr.substring(0,parentsStr.length()-3);
		selectedEntry.setParentName(parentsStr);
		try {
			subEntries=ldapService.findSubEntries(selectedEntry.getUid(), "(!(objectclass=organizationalUnit))",
					 new String[] { "*" }, SearchScope.SUBTREE);
			
			
		} catch (LdapException e) {
			e.printStackTrace();
		}
		
		selectedEntry.setChildEntries(subEntries);
		
		
//		ModelAndView andView= new ModelAndView("ldap_entry_details");
//		andView.addObject("subEntries", subEntries);<
//		andView.addObject("selectedEntry", selectedEntry);
		
		return selectedEntry;
	}

}
