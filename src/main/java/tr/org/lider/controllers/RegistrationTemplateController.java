package tr.org.lider.controllers;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.entities.RegistrationTemplateImpl;
import tr.org.lider.entities.UserSessionImpl;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.models.UserSessionsModel;
import tr.org.lider.services.RegistrationTemplateService;
import tr.org.lider.services.UserService;

/**
 * Controller for registration template operations
 * 
 * @author <a href="mailto:hasan.kara@pardus.org.tr">Hasan Kara</a>
 * 
 */
@Secured({"ROLE_ADMIN", "ROLE_REGISTRATION_TEMPLATE" })
@RestController
@RequestMapping("/lider/registration_template")
public class RegistrationTemplateController {
	
	@Autowired
	RegistrationTemplateService registrationTemplateService;
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private LDAPServiceImpl ldapService;
	
	@RequestMapping(method=RequestMethod.POST, value = "/list", produces = MediaType.APPLICATION_JSON_VALUE)
	public List<RegistrationTemplateImpl> findAll() {
		return registrationTemplateService.findAll();
	}

	//add new registration template
	@RequestMapping(method=RequestMethod.POST ,value = "/create", produces = MediaType.APPLICATION_JSON_VALUE)
	public RegistrationTemplateImpl createTemplate(@RequestParam(value = "templateText", required=true) String templateText,
			@RequestParam(value = "authorizedUserGroupDN", required=true) String authorizedUserGroupDN,
			@RequestParam(value = "agentCreationDN", required=true) String agentCreationDN) {
		
		return registrationTemplateService.addRegistrationTemplate(
				new RegistrationTemplateImpl(templateText.trim(), 
												authorizedUserGroupDN.trim(), 
												agentCreationDN.trim()));
	}
	
	//delete registration template
	@RequestMapping(method=RequestMethod.POST ,value = "/delete", produces = MediaType.APPLICATION_JSON_VALUE)
	public Boolean deleteTemplate(@RequestParam(value = "id", required=true) Long id) {
		
		try {
			registrationTemplateService.delete(id);
			return true;
		} catch (Exception e) {
			return false;
		}
	}
	
	@RequestMapping(method=RequestMethod.POST, value = "/getUserSessions")
	@ResponseBody
	public List<UserSessionsModel> getUserSessions(LdapEntry user) {
		List<UserSessionsModel> userSessions=null;
		try {
			List<UserSessionImpl> userSessionsDb=	userService.getUserSessions(user.getUid());
			userSessions=new ArrayList<>();
			for (UserSessionImpl userSessionImpl : userSessionsDb) {
				UserSessionsModel model= new UserSessionsModel();
				model.setAgent(userSessionImpl.getAgent());
				model.setCreateDate(userSessionImpl.getCreateDate());
				model.setId(userSessionImpl.getId());
				model.setSessionEvent(userSessionImpl.getSessionEvent());
				model.setUserIp(userSessionImpl.getUserIp());
				model.setUsername(userSessionImpl.getUsername());
				userSessions.add(model);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return userSessions;
	}
	
	@RequestMapping(value = "/getOuDetails")
	public List<LdapEntry> task(LdapEntry selectedEntry) {
		List<LdapEntry> subEntries = null;
		try {
			subEntries = ldapService.findSubEntries(selectedEntry.getUid(), "(objectclass=*)",
					new String[] { "*" }, SearchScope.ONELEVEL);
		} catch (LdapException e) {
			e.printStackTrace();
		}
		Collections.sort(subEntries);
		selectedEntry.setChildEntries(subEntries);
		return subEntries;
	}
	
	@RequestMapping(value = "/getComputers")
	public List<LdapEntry> getComputers() {
		List<LdapEntry> retList = new ArrayList<LdapEntry>();
		retList.add(ldapService.getLdapComputersTree());
		return retList;
	}
	
	@RequestMapping(value = "/getUsers")
	public List<LdapEntry> getUsers() {
		List<LdapEntry> retList = new ArrayList<LdapEntry>();
		retList.add(ldapService.getLdapUserTree());
		return retList;
	}
	
	@RequestMapping(value = "/getGroups")
	public List<LdapEntry> getGroups() {
		List<LdapEntry> retList = new ArrayList<LdapEntry>();
		retList.add(ldapService.getLdapUsersGroupTree());
		return retList;
	}
}