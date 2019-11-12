package tr.org.lider.controllers;

import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import tr.org.lider.constant.LiderConstants;
import tr.org.lider.entities.PluginTask;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.models.UserImpl;
import tr.org.lider.services.ConfigurationService;

import tr.org.lider.services.LoginService;
import tr.org.lider.services.PluginService;

@Controller
@RestController()
public class LoginController {
	
	@Autowired
	public LoginService loginService;
	
	
	@Autowired
	public PluginService pluginService;
	
	
	@Autowired
	 public ServletContext servletContext;
	
	@Autowired
	private LDAPServiceImpl ldapService;
	
	
	@Autowired
	private ConfigurationService configService;
	

	@RequestMapping("/")
	@ResponseBody
	public ModelAndView main(Model model) {

		ModelAndView modelAndView = new ModelAndView();
	    modelAndView.setViewName(LiderConstants.Pages.PAGES_LOGIN_PAGE);
	    return modelAndView;
	}
	
	@RequestMapping(value = "/login", method = { RequestMethod.POST })
	public ModelAndView login(@RequestParam(value = "username", required = false) String username,
			@RequestParam(value = "password", required = false) String password, HttpServletRequest request,
			Model model) {
		
		
		ModelAndView modelAndView = new ModelAndView();
		try {

			UserImpl user= loginService.getUser(username, password);

			if (user == null) {
				
				modelAndView.setViewName(LiderConstants.Pages.PAGES_LOGIN_PAGE);
				modelAndView.addObject("message", "User Not Found");
				return  modelAndView;

			} else {
				List<LdapEntry> treeList = ldapService.getLdapMainTree();
				
				List<PluginTask> pluginTaskList= pluginService.findAllPluginTask();

				modelAndView.setViewName(LiderConstants.Pages.PAGES_MAIN_PAGE);
				modelAndView.addObject("user", user);
				modelAndView.addObject("password", password);
				modelAndView.addObject("userNameJid", username+"@"+configService.getXmppServiceName());
				modelAndView.addObject("xmppHost", configService.getXmppHost());
				modelAndView.addObject("ldapTreeList", treeList);
				modelAndView.addObject("pluginTaskList", pluginTaskList);
				
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return modelAndView;
	}
	
	
	
	
}
