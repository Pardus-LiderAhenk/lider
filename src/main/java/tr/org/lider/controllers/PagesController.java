package tr.org.lider.controllers;

import java.util.List;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.springframework.beans.factory.annotation.Autowired;
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
import tr.org.lider.services.AgentService;
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
	private AgentService agentService;
	
	@Autowired
	private LDAPServiceImpl ldapService;
	
	@Autowired
	private CommandService commandService;
	
	@RequestMapping(value="/getInnerHtmlPage", method = {RequestMethod.POST })
	public ModelAndView getInnerHtmlPage(String innerPage, Model model) {
        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Boolean userAuthenticated =  null != authentication && !("anonymousUser").equals(authentication.getName());
        if(userAuthenticated) {
        	ModelAndView modelAndView = new ModelAndView();
        	modelAndView.setViewName(innerPage);
        	if(innerPage.equals("dashboard")) {
        		model.addAttribute("totalComputerNumber", agentService.count());
        		//get count of users
        		int countOfLDAPUsers = 0;
        		try {
        			List<LdapEntry> retList=ldapService.findSubEntries(configurationService.getLdapRootDn(), "(objectclass=pardusAccount)", new String[] { "*" }, SearchScope.SUBTREE);
        			countOfLDAPUsers = retList.size();
        		} catch (LdapException e) {
        			// TODO Auto-generated catch block
        			e.printStackTrace();
        		}
        		model.addAttribute("totalUserNumber", countOfLDAPUsers);
        		//sent task total number
        		
        		model.addAttribute("totalSentTaskNumber", commandService.getTotalCountOfSentTasks());
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
 