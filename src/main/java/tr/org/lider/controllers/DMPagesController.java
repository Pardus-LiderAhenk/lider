package tr.org.lider.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
		
		ModelAndView modelAndView = new ModelAndView();
	    modelAndView.setViewName("DM/innerPages/"+pageName);
	    
	    return modelAndView;
	}
	
	
	

}
