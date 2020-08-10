package tr.org.lider.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;


/**
 * 
 * Getting inner page for menu items.. When menu items clicked dynamic content of div rendered with inner page. 
 * @author M. Edip YILDIZ
 *
 */
@Controller
@RequestMapping("/lider/pages")
public class PagesController {

	@RequestMapping(value="/getInnerHtmlPage", method = {RequestMethod.POST })
	public ModelAndView getInnerHtmlPage(String innerPage, Model model) {
        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Boolean userAuthenticated =  null != authentication && !("anonymousUser").equals(authentication.getName());
        if(userAuthenticated) {
        	ModelAndView modelAndView = new ModelAndView();
        	modelAndView.setViewName(innerPage);
        	return modelAndView;
        } else {
        	ModelAndView modelAndView = new ModelAndView();
        	modelAndView.setViewName("login");
        	modelAndView.setStatus(HttpStatus.UNAUTHORIZED);
        	return modelAndView;
        }
		
	}
}
 