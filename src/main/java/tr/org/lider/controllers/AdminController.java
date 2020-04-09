package tr.org.lider.controllers;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import tr.org.lider.constant.LiderConstants;

/**
 * 
 * @author M. Edip YILDIZ
 *
 */
@RestController()
@RequestMapping(value = "/admin")
public class AdminController {
	
	 Logger logger = LoggerFactory.getLogger(AdminController.class);
	@RequestMapping(value = "")
	public ModelAndView getAdminLoginPage(HttpServletRequest request,Model model) {
		
		ModelAndView modelAndView = new ModelAndView();
	    modelAndView.setViewName(LiderConstants.Pages.ADMIN_LOGIN_PAGE);
	    return modelAndView;
	}
	
	
	@RequestMapping(value = "/login")
	public ModelAndView getAdmin(HttpServletRequest request,Model model) {
		
		ModelAndView modelAndView = new ModelAndView();
		modelAndView.setViewName(LiderConstants.Pages.ADMIN_PAGE);
		return modelAndView;
	}

}
