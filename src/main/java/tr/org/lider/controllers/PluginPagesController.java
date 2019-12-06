package tr.org.lider.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import tr.org.lider.entities.PluginTask;


/**
 * 
 * Plugin pages rendered with tasks and policies..
 * @author M. Edip YILDIZ
 *
 **/
@RestController()
public class PluginPagesController {
	
	Logger logger = LoggerFactory.getLogger(PluginPagesController.class);
	
	@RequestMapping(value="/getPluginTaskHtmlPage", method = {RequestMethod.POST })
	public ModelAndView getPluginTaskHtmlPage(Model model, PluginTask pluginTask) {

		logger.info("Getting pluging tas for page : {}", pluginTask.getPage());
		
		ModelAndView modelAndView = new ModelAndView();
	    modelAndView.setViewName("plugins/task/"+pluginTask.getPage());
	    
	    modelAndView.addObject("pluginTask", pluginTask);
	    return modelAndView;
	}

}
