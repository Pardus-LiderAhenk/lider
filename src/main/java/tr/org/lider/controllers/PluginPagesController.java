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

import tr.org.lider.entities.PluginTask;
import tr.org.lider.services.PluginService;


/**
 * 
 * Plugin pages rendered with tasks and policies..
 * @author M. Edip YILDIZ
 *
 **/
@RestController()
public class PluginPagesController {
	
	Logger logger = LoggerFactory.getLogger(PluginPagesController.class);
	
	@Autowired
	public PluginService pluginService;
	
	@RequestMapping(value="/getPluginTaskHtmlPage", method = {RequestMethod.POST })
	public ModelAndView getPluginTaskHtmlPage(Model model, PluginTask pluginTask) {
		ModelAndView modelAndView = new ModelAndView();
	    modelAndView.setViewName("plugins/task/" + pluginTask.getPage());
	    modelAndView.addObject("pluginTask", pluginTask);
	    return modelAndView;
	}
	
	@RequestMapping(value="/getPluginTaskList", method = {RequestMethod.POST })
	public List<PluginTask> getPluginTaskList(Model model, PluginTask pluginTask) {
		List<PluginTask>  list = pluginService.findAllPluginTask();
		return list;
	}

}
