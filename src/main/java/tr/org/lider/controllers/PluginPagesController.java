package tr.org.lider.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import tr.org.lider.entities.PluginTask;

@Controller
@RestController()
public class PluginPagesController {
	
	@RequestMapping(value="/getPluginTaskHtmlPage", method = {RequestMethod.POST })
	@ResponseBody
	public ModelAndView getPluginTaskHtmlPage(Model model, PluginTask pluginTask) {

		ModelAndView modelAndView = new ModelAndView();
	    modelAndView.setViewName("plugins/task/"+pluginTask.getPage());
	    
	    modelAndView.addObject("pluginTask", pluginTask);
	    return modelAndView;
	}

}
