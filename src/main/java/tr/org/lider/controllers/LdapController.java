package tr.org.lider.controllers;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.ldap.LdapSearchFilterAttribute;
import tr.org.lider.ldap.SearchFilterEnum;
import tr.org.lider.messaging.messages.XMPPClientImpl;


/**
 * 
 * Getting ldap hierarchy for computers users groups and roles..
 * @author M. Edip YILDIZ
 *
 */
@RestController()
public class LdapController {

	Logger logger = LoggerFactory.getLogger(LdapController.class);

	@Autowired
	private LDAPServiceImpl ldapService;
	
	@Autowired
	private XMPPClientImpl messagingService;

	@RequestMapping(value = "/getOuDetails")
	public List<LdapEntry> task(HttpServletRequest request, Model model, LdapEntry selectedEntry) {

		List<LdapEntry> subEntries = null;
		try {

			subEntries = ldapService.findSubEntries(selectedEntry.getUid(), "(objectclass=*)",
					new String[] { "*" }, SearchScope.ONELEVEL);

		} catch (LdapException e) {
			e.printStackTrace();
		}

		selectedEntry.setChildEntries(subEntries);
		return subEntries;
	}

	@RequestMapping(value = "/getSudoGroups")
	public String getSudoGroups(HttpServletRequest request, Model model) {

		List<LdapEntry> retList = new ArrayList<LdapEntry>();
		retList.add(ldapService.getLdapSudoGroupsTree());

		ObjectMapper mapper = new ObjectMapper();

		String ret = null;
		try {
			ret = mapper.writeValueAsString(retList);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		return ret;
	}
	
	@RequestMapping(value = "/getGroups")
	public String getGroups(HttpServletRequest request, Model model) {
		
		List<LdapEntry> retList = new ArrayList<LdapEntry>();
		retList.add(ldapService.getLdapGroupsTree());
		
		ObjectMapper mapper = new ObjectMapper();
		
		String ret = null;
		try {
			ret = mapper.writeValueAsString(retList);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		return ret;
	}
	
	@RequestMapping(value = "/getUsers")
	public String getUsers(HttpServletRequest request, Model model) {
		
		List<LdapEntry> retList = new ArrayList<LdapEntry>();
		retList.add(ldapService.getLdapUserTree());
		
		ObjectMapper mapper = new ObjectMapper();
		
		String ret = null;
		try {
			ret = mapper.writeValueAsString(retList);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		
		return ret;
	}

	@RequestMapping(value = "/getComputers")
	public String getComputers(HttpServletRequest request, Model model) {
		List<LdapEntry> retList = new ArrayList<LdapEntry>();
		
		retList.add(ldapService.getLdapComputersTree());
		
		ObjectMapper mapper = new ObjectMapper();
		String ret = null;
		try {
			ret = mapper.writeValueAsString(retList);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		return ret;

	}
	
	@RequestMapping(value = "/getAhenks", method = { RequestMethod.POST })
	public String getAhenks(HttpServletRequest request,Model model, @RequestBody LdapEntry[] selectedEntryArr) {
		
		List<LdapEntry> ahenkList=new ArrayList<>();
		
		for (LdapEntry ldapEntry : selectedEntryArr) {
			
			List<LdapSearchFilterAttribute> filterAttributes = new ArrayList<LdapSearchFilterAttribute>();
			
			LdapSearchFilterAttribute fAttr = new LdapSearchFilterAttribute("objectClass", "pardusDevice",	SearchFilterEnum.EQ);
			filterAttributes.add(fAttr);
			
			try {
				List<LdapEntry> retList=ldapService.findSubEntries(ldapEntry.getDistinguishedName(), "(objectclass=pardusDevice)", new String[] { "*" }, SearchScope.SUBTREE);
				
				for (LdapEntry ldapEntry2 : retList) {
					boolean isExist=false;
					for (LdapEntry ldapEntryAhenk : ahenkList) {
						if(ldapEntry2.getEntryUUID().equals(ldapEntryAhenk.getEntryUUID())) {
							isExist=true;
							break;
						}
					}
					if(!isExist) {
						ahenkList.add(ldapEntry2);
					}
				}
			} catch (LdapException e) {
				e.printStackTrace();
			}
		}
		
		ObjectMapper mapper = new ObjectMapper();
		String ret = null;
		try {
			ret = mapper.writeValueAsString(ahenkList);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		return ret;
	}
	
	@RequestMapping(value = "/getOnlyOnlineAhenks", method = { RequestMethod.POST })
	public String getOnlyOnlineAhenks(HttpServletRequest request,Model model, @RequestBody LdapEntry[] selectedEntryArr) {
		
		List<LdapEntry> ahenkList=new ArrayList<>();
		
		for (LdapEntry ldapEntry : selectedEntryArr) {
			
			List<LdapSearchFilterAttribute> filterAttributes = new ArrayList<LdapSearchFilterAttribute>();
			
			LdapSearchFilterAttribute fAttr = new LdapSearchFilterAttribute("objectClass", "pardusDevice",	SearchFilterEnum.EQ);
			filterAttributes.add(fAttr);
			
			try {
				List<LdapEntry> retList=ldapService.findSubEntries(ldapEntry.getDistinguishedName(), "(objectclass=pardusDevice)", new String[] { "*" }, SearchScope.SUBTREE);
				
				for (LdapEntry ldapEntry2 : retList) {
					boolean isExist=false;
					for (LdapEntry ldapEntryAhenk : ahenkList) {
						if(ldapEntry2.getEntryUUID().equals(ldapEntryAhenk.getEntryUUID())) {
							isExist=true;
							break;
						}
					}
					boolean isOnline=false;
					for (String online : messagingService.getOnlineUsers()) {
						if(ldapEntry2.getUid().equals(online)) {
							isOnline=true;
							break;
						}
					}
					if(!isExist && isOnline) {
						ahenkList.add(ldapEntry2);
					}
				}
			} catch (LdapException e) {
				e.printStackTrace();
			}
		}
		
		ObjectMapper mapper = new ObjectMapper();
		String ret = null;
		try {
			ret = mapper.writeValueAsString(ahenkList);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		return ret;
	}

}
