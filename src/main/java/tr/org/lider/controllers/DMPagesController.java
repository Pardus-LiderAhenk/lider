package tr.org.lider.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;
/**
 * 
 * Directory manager pages rendered with tasks and policies..
 * @author M. Edip YILDIZ
 *
 **/
@RestController()
public class DMPagesController {
	
	Logger logger = LoggerFactory.getLogger(DMPagesController.class);
	
	@RequestMapping(value="/getDMInnerPage", method = {RequestMethod.POST })
	public ModelAndView getPluginTaskHtmlPage(Model model, String pageName) {

		logger.info("Getting DM inner page content : {}", pageName);
		 final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
	        Boolean userAuthenticated =  null != authentication && !("anonymousUser").equals(authentication.getName());
	        ModelAndView modelAndView = new ModelAndView();
	        if(userAuthenticated) {
		    modelAndView.setViewName("DM/innerPages/"+pageName);
	        }
			else {
				modelAndView = new ModelAndView();
				modelAndView.setViewName("login");
				modelAndView.setStatus(HttpStatus.UNAUTHORIZED);

			}
	        return modelAndView;
	   
	}
	
	
	

}
