/*
*
*    Copyright © 2015-2016 Tübitak ULAKBIM
*
*    This file is part of Lider Ahenk.
*
*    Lider Ahenk is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    Lider Ahenk is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with Lider Ahenk.  If not, see <http://www.gnu.org/licenses/>.
*/
package tr.org.liderahenk.web.controller;

import java.io.UnsupportedEncodingException;
import java.util.Date;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import tr.org.liderahenk.lider.core.api.rest.IResponseFactory;
import tr.org.liderahenk.lider.core.api.rest.processors.ITaskRequestProcessor;
import tr.org.liderahenk.lider.core.api.rest.responses.IRestResponse;
import tr.org.liderahenk.web.controller.utils.ControllerUtils;

/**
 * Controller for task related operations.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 *
 */
@Controller
@RequestMapping("/lider/task")
public class TaskController {

	private static Logger logger = LoggerFactory.getLogger(TaskController.class);

	@Autowired
	private IResponseFactory responseFactory;
	@Autowired
	private ITaskRequestProcessor taskProcessor;

	@RequestMapping(value = "/execute", method = { RequestMethod.POST })
	@ResponseBody
	public IRestResponse executeTask(@RequestBody String requestBody, HttpServletRequest request)
			throws UnsupportedEncodingException {
		String requestBodyDecoded = ControllerUtils.decodeRequestBody(requestBody);
		logger.info("Request received. URL: '/lider/task/execute' Body: {}", requestBodyDecoded.length() > ControllerUtils.MAX_LOG_SIZE ? requestBodyDecoded.substring(0, ControllerUtils.MAX_LOG_SIZE) : requestBodyDecoded);
		IRestResponse restResponse = taskProcessor.execute(requestBodyDecoded);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}

	@RequestMapping(value = "/{id:[\\d]+}/cancel", method = { RequestMethod.GET })
	@ResponseBody
	public IRestResponse cancelTask(@PathVariable final long id, HttpServletRequest request)
			throws UnsupportedEncodingException {
		logger.info("Request received. URL: '/lider/task/{}/cancel'", id);
		IRestResponse restResponse = taskProcessor.cancelTask(id);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}

	@RequestMapping(value = "/{id:[\\d]+}/reschedule", method = { RequestMethod.GET })
	@ResponseBody
	public IRestResponse rescheduleTask(@PathVariable final long id,
			@RequestParam(value = "cronExpression", required = true) String cronExpression, HttpServletRequest request)
			throws UnsupportedEncodingException {
		logger.info("Request received. URL: '/lider/task/{}/reschedule?cronExpression={}'",
				new Object[] { id, cronExpression });
		IRestResponse restResponse = taskProcessor.rescheduleTask(id, cronExpression);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}

	/**
	 * List commands according to given parameters.
	 * 
	 * @param pluginName
	 * @param pluginVersion
	 * @param createDateRangeStart
	 * @param createDateRangeEnd
	 * @param status
	 * @param maxResults
	 * @param request
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	@RequestMapping(value = "/list/executed", method = { RequestMethod.GET })
	@ResponseBody
	public IRestResponse listExecutedTasks(@RequestParam(value = "pluginName", required = false) String pluginName,
			@RequestParam(value = "onlyFutureTasks", required = false, defaultValue = "false") Boolean onlyFutureTasks,
			@RequestParam(value = "onlyScheduledTasks", required = false, defaultValue = "false") Boolean onlyScheduledTasks,
			@RequestParam(value = "createDateRangeStart", required = false) Long createDateRangeStart,
			@RequestParam(value = "createDateRangeEnd", required = false) Long createDateRangeEnd,
			@RequestParam(value = "status", required = false) Integer status,
			@RequestParam(value = "maxResults", required = false) Integer maxResults, HttpServletRequest request)
			throws UnsupportedEncodingException {
		logger.debug(
				"Request received. URL: '/lider/task/list/executed?pluginName={}&onlyFutureTasks={}&onlyScheduledTasks={}&createDateRangeStart={}&createDateRangeEnd={}&status={}&maxResults={}'",
				new Object[] { pluginName, onlyFutureTasks, onlyScheduledTasks, createDateRangeStart,
						createDateRangeEnd, status, maxResults });
		IRestResponse restResponse = taskProcessor.listExecutedTasks(pluginName, onlyFutureTasks, onlyScheduledTasks,
				createDateRangeStart != null ? new Date(createDateRangeStart) : null,
				createDateRangeEnd != null ? new Date(createDateRangeEnd) : null, status, maxResults);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}

	/**
	 * Retrieve command related to task specified by task id.
	 * 
	 * @param id
	 * @param request
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	@RequestMapping(value = "/command/{id:[\\d]+}/get", method = { RequestMethod.GET })
	@ResponseBody
	public IRestResponse getCommand(@PathVariable final Long id, HttpServletRequest request)
			throws UnsupportedEncodingException {
		logger.info("Request received. URL: '/lider/task/command/{}/get'", id);
		IRestResponse restResponse = taskProcessor.getCommand(id);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}

	@RequestMapping(value = "/command/list", method = { RequestMethod.GET })
	@ResponseBody
	public IRestResponse listCommands(@RequestParam(value = "maxResults", required = false) Integer maxResults,
			HttpServletRequest request) throws UnsupportedEncodingException {
		logger.info("Request received. URL: '/lider/task/command/list?maxResults={}'", maxResults);
		IRestResponse restResponse = taskProcessor.listCommands(maxResults);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}

	@RequestMapping(value = "/responsedata/{id:[\\d]+}/get", method = { RequestMethod.GET })
	@ResponseBody
	public IRestResponse getResponseData(@PathVariable final Long id, HttpServletRequest request)
			throws UnsupportedEncodingException {
		logger.info("Request received. URL: '/lider/task/responsedata/{}/get'", id);
		IRestResponse restResponse = taskProcessor.getResponseData(id);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}

	@RequestMapping(value = "/list/executeddevicetask", method = { RequestMethod.GET })
	@ResponseBody
	public IRestResponse listExecutedDeviceTasks(@RequestParam(value = "uid", required = true) String uid,
			HttpServletRequest request) throws UnsupportedEncodingException {
		logger.info("Request received. URL: '/lider/task/list/executeddevicetask?uid={}'", uid);
		IRestResponse restResponse = taskProcessor.listExecutedDeviceTasks(uid);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}
	
	/**
	 * Handle predefined exceptions that we did not write and did not throw.
	 * 
	 * @param e
	 * @return IRestResponse instance which holds exception message with ERROR
	 *         status
	 */
	@ExceptionHandler(Exception.class)
	public IRestResponse handleAllException(Exception e) {
		return ControllerUtils.handleAllException(e, responseFactory);
	}

}

