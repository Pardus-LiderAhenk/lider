package tr.org.lider.controllers;

import java.io.UnsupportedEncodingException;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.services.TaskService;
import tr.org.lider.utils.ControllerUtils;
import tr.org.lider.utils.IRestResponse;


/**
 *  Task execute
 * @author M. Edip YILDIZ
 *
 */
@RestController()
@RequestMapping("/lider/task")
public class TaskController {
	Logger logger = LoggerFactory.getLogger(TaskController.class);
	
	@Autowired
	public TaskService taskService;
	
	@RequestMapping(value = "/execute", method = { RequestMethod.POST })
	public IRestResponse executeTask(@RequestBody String requestBody, HttpServletRequest request)
			throws UnsupportedEncodingException {
		String requestBodyDecoded = ControllerUtils.decodeRequestBody(requestBody);
		
		
		logger.info("Request received. URL: '/lider/task/execute' Body: {}", requestBodyDecoded.length() 
				> ControllerUtils.MAX_LOG_SIZE ? requestBodyDecoded.substring(0, ControllerUtils.MAX_LOG_SIZE) : requestBodyDecoded);
		
		IRestResponse restResponse = taskService.execute(requestBodyDecoded);
		
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		
		return restResponse;
	}
	
}
