package tr.org.lider.controllers;

import java.util.List;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.services.CommandService;
import tr.org.lider.services.ConfigurationService;


/**
 * 
 * Getting inner page for menu items.. When menu items clicked dynamic content of div rendered with inner page. 
 * @author M. Edip YILDIZ
 *
 */
@Controller
@RequestMapping("/lider/pages")
public class PagesController {
	@Autowired
	private ConfigurationService configurationService;

	@Autowired
	private LDAPServiceImpl ldapService;
	
	@Autowired
	private CommandService commandService;
	
	@Autowired
	private Environment env;
	
	
	@RequestMapping(value="/getInnerHtmlPage", method = {RequestMethod.POST })
	public ModelAndView getInnerHtmlPage(String innerPage, Model model) {
        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Boolean userAuthenticated =  null != authentication && !("anonymousUser").equals(authentication.getName());
        if(userAuthenticated) {
        	ModelAndView modelAndView = new ModelAndView();
        	modelAndView.setViewName(innerPage);
        	if(innerPage.equals("dashboard")) {
        		
        		//get count of users
        		int countOfLDAPUsers = 0;
        		int countOfComputers = 0;
        		try {
        			List<LdapEntry> ldapUserList = ldapService.findSubEntries(configurationService.getLdapRootDn(), 
        					"(objectclass=pardusAccount)", new String[] { "*" }, SearchScope.SUBTREE);
        			List<LdapEntry> ldapComputerList = ldapService.findSubEntries(configurationService.getLdapRootDn(), 
        					"(objectclass=pardusDevice)", new String[] { "*" }, SearchScope.SUBTREE);
        			countOfLDAPUsers = ldapUserList.size();
        			countOfComputers = ldapComputerList.size();
        		} catch (LdapException e) {
        			e.printStackTrace();
        		}
        		model.addAttribute("totalComputerNumber", countOfComputers);
        		model.addAttribute("totalUserNumber", countOfLDAPUsers);
        		//sent task total number
        		model.addAttribute("totalSentTaskNumber", commandService.getTotalCountOfSentTasks());
        	}
        	/**
        	 * delete and update operations enable by application.properties values
        	 */
        	else if(innerPage.equals("directory-manager")) {
        		String enableDelete4Directory = env.getProperty("lider.enableDelete4Directory");
        		model.addAttribute("enableDeleteUpdate", enableDelete4Directory);
        	}
        	return modelAndView;
        } else {
        	ModelAndView modelAndView = new ModelAndView();
        	modelAndView.setViewName("login");
        	modelAndView.setStatus(HttpStatus.UNAUTHORIZED);
        	return modelAndView;
        }
		
	}
}
 