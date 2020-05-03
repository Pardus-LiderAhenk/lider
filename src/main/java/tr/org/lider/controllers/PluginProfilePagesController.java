package tr.org.lider.controllers;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import tr.org.lider.entities.PluginProfile;
import tr.org.lider.services.PluginService;

/**
 * Plugin profile pages rendered
 * 
 * @author <a href="mailto:tuncay.colak@tubitak.gov.tr">Tuncay ÇOLAK</a>
 * 
 */

@RestController()
public class PluginProfilePagesController {
	
	Logger logger = LoggerFactory.getLogger(PluginProfilePagesController.class);
	
	@Autowired
	public PluginService pluginService;
	
	@RequestMapping(value="/getPluginProfileHtmlPage", method = {RequestMethod.POST })
	public ModelAndView getPluginProfileHtmlPage(Model model, PluginProfile pluginProfile) {

		logger.info("Getting pluging tas for page : {}", pluginProfile.getPage());
		
		ModelAndView modelAndView = new ModelAndView();
	    modelAndView.setViewName("plugins/profile/"+pluginProfile.getPage());
	    
	    modelAndView.addObject("pluginProfile", pluginProfile);
	    return modelAndView;
	}
	
	
	@RequestMapping(value="/getPluginProfileList", method = {RequestMethod.POST })
	public List<PluginProfile> getPluginTaskList(Model model, PluginProfile pluginProfile) {
		
		logger.info("Getting plugink list ");
		List<PluginProfile>  list = pluginService.findAllPluginProfile();
		return list;
	}

}
