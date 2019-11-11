package tr.org.lider.controllers;

import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;

import org.hibernate.engine.config.internal.ConfigurationServiceImpl;
import org.jivesoftware.smack.SmackException.NotConnectedException;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import tr.org.lider.constant.LiderConstants;
import tr.org.lider.entities.PluginImpl;
import tr.org.lider.entities.PluginTask;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.messaging.messages.XMPPClientImpl;
import tr.org.lider.models.UserImpl;
import tr.org.lider.services.ConfigurationService;
//import tr.org.liderahenk.lider.login.UserProfileService;
//import tr.org.liderahenk.lider.login.UserService;
//import tr.org.liderahenk.lider.user.model.IUser;
//import tr.org.liderahenk.lider.user.model.PluginImpl;
//import tr.org.liderahenk.lider.user.model.UserImpl;
import tr.org.lider.services.LoginService;
import tr.org.lider.services.PluginService;

@Controller
@RestController()
public class LoginController {
	
	

//	@Autowired
//	private IResponseFactory responseFactory;
	
//	@Autowired
//	private IPluginDao pluginDao;
	
//	@Autowired
//	private IServiceRegistry serviceRegistry;
	
	
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
	
	@Autowired
	private XMPPClientImpl mess;
	
	
//	 @Autowired
//	 public   UserProfileService userProfileService;
//	     
//	 @Autowired
//	 public  UserService userService;


	@RequestMapping("/")
	@ResponseBody
	public ModelAndView main(Model model) {

		ModelAndView modelAndView = new ModelAndView();
	    modelAndView.setViewName(LiderConstants.Pages.PAGES_LOGIN_PAGE);
//	    try {
//			List<LdapEntry>   subEntries=ldapService.findSubEntries("ou=Kullanıcılar,dc=mys,dc=pardus,dc=org", "(!(objectclass=organizationalUnit))",
//					 new String[] { "*" }, SearchScope.ONELEVEL);
//			
//			modelAndView.addObject("subEntries", subEntries);
//			
//		} catch (LdapException e) {
//			e.printStackTrace();
//		}
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
				modelAndView.addObject("userNameJid", username+"@"+configService.getXmppHost());
				modelAndView.addObject("xmppHost", configService.getXmppHost());
				modelAndView.addObject("ldapTreeList", treeList);
				modelAndView.addObject("pluginTaskList", pluginTaskList);
				
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return modelAndView;
	}

//	
////	@RequestMapping(value="/getPluginHtmlPage/{dn}", produces = MediaType.TEXT_HTML_VALUE,  method = { RequestMethod.GET })
//	@RequestMapping(value="/getPluginHtmlPage/{dn}", method = { RequestMethod.GET })
////	@ResponseBody
//	public String getData(@PathVariable("dn") String dn, Model model) {
//
//		InputStream inputStream = null;
//		 String html="";
//		
//		try {
//            inputStream = servletContext.getResourceAsStream("/WEB-INF/views/conky/conky.jsp");
//            
//            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
//            
//            String line;
//            
//            while ((line = bufferedReader.readLine()) != null) {
//				html = html + line;
//			}
//             
//         	System.out.println("");
//			model.addAttribute("deneme", "deneme");
//			model.addAttribute("html", html);
//             
//             
//        }
//		catch(Exception e){
//			e.printStackTrace();
//		}
//		
//		finally {
//            if (inputStream != null) {
//               try {
//				inputStream.close();
//			} catch (IOException e) {
//				// TODO Auto-generated catch block
//				e.printStackTrace();
//			}
//            }
//        }
//		
//	//	IRestResponse resp = responseFactory.createResponse(RestResponseStatus.OK,html);
//		return "conky/conky";
//	}
	
	
//	 private String getPrincipal(){
//	        String userName = null;
//	        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
//	 
//	        if (principal instanceof UserDetails) {
//	            userName = ((UserDetails)principal).getUsername();
//	        } else {
//	            userName = principal.toString();
//	        }
//	        return userName;
//	    }

	
	
	@RequestMapping(value="/getPluginHtmlPage", method = {RequestMethod.POST })
	@ResponseBody
	public ModelAndView getPluginHtmlPage(Model model, PluginTask pluginTask) {

		ModelAndView modelAndView = new ModelAndView();
	    modelAndView.setViewName("plugins/"+pluginTask.getPage());
	    
	    modelAndView.addObject("pluginTask", pluginTask);
	    return modelAndView;
	}
	
	
	@RequestMapping(value="/sendMessage", method = {RequestMethod.POST })
	@ResponseBody
	public String sendMessage(Model model) {
		
		try {
			mess.sendMessage("selamm444","lider_console");
		} catch (NotConnectedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "ok";
	}
}
