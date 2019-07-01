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

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import tr.org.liderahenk.lider.core.api.rest.IResponseFactory;
import tr.org.liderahenk.lider.core.api.rest.processors.IAgentRequestProcessor;
import tr.org.liderahenk.lider.core.api.rest.responses.IRestResponse;
import tr.org.liderahenk.web.controller.utils.ControllerUtils;

/**
 * Controller for agent related operations.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 *
 */
@Controller
@RequestMapping("/lider/agent")
public class AgentController {

	private static Logger logger = LoggerFactory.getLogger(AgentController.class);

	@Autowired
	private IResponseFactory responseFactory;
	@Autowired
	private IAgentRequestProcessor agentProcessor;

	/**
	 * Get count of ahenks for pagination on Ahenk Info Editor 
	 * 
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	@RequestMapping(value = "/count", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public IRestResponse countOfAgents(@RequestParam(value = "propertyName", required = false) String propertyName,
			@RequestParam(value = "propertyValue", required = false) String propertyValue,
			@RequestParam(value = "type", required = false) String type)
			throws UnsupportedEncodingException {
		logger.info("Request received. URL: '/lider/agent/count");
		IRestResponse restResponse = agentProcessor.countOfAgents(propertyName == null ? "" :propertyName, 
				propertyValue == null ? "" : propertyValue, type == null ? "" : type);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}
	
	/**
	 * List agents according to given parameters.
	 * 
	 * @param hostname
	 * @param dn
	 * @param request
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	@RequestMapping(value = "/list", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public IRestResponse listAgents(@RequestParam(value = "hostname", required = false) String hostname,
			@RequestParam(value = "dn", required = false) String dn,
			@RequestParam(value = "uid", required = false) String uid, HttpServletRequest request)
			throws UnsupportedEncodingException {
		logger.info("Request received. URL: '/lider/agent/list?hostname={}&dn={}&uid={}'", new Object[] { hostname, dn, uid });
		IRestResponse restResponse = agentProcessor.list(hostname, dn, uid);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}

	/**
	 * List agents according to given parameters.
	 * 
	 * @param firstResult
	 * @param maxResult
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	@RequestMapping(value = "/list/paging", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public IRestResponse listAgentsWithPaging(
			@RequestParam(value = "propertyName", required = false) String propertyName,
			@RequestParam(value = "propertyValue", required = false) String propertyValue,
			@RequestParam(value = "type", required = false) String type, 
			@RequestParam(value = "firstResult") int firstResult,
			@RequestParam(value = "maxResult") int maxResult,
			HttpServletRequest request)
			throws UnsupportedEncodingException {
		logger.info("Request received. URL: '/lider/agent/list/paging");
		IRestResponse restResponse = agentProcessor.listFilteredAgentsWithPaging(propertyName, propertyValue, type, firstResult, maxResult);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}
	
	/**
	 * Retrieve agent specified by id
	 * 
	 * @param id
	 * @param request
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	@RequestMapping(value = "/{id:[\\d]+}/get", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public IRestResponse getAgent(@PathVariable final long id, HttpServletRequest request)
			throws UnsupportedEncodingException {
		logger.info("Request received. URL: '/lider/agent/{}/get'", id);
		IRestResponse restResponse = agentProcessor.get(id);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}

	/**
	 * List online users of an agent specified by DN.
	 * 
	 * @param dn
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/{dn}/onlineusers", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public IRestResponse getOnlineUsers(@PathVariable final String dn, HttpServletRequest request) {
		logger.info("Request received. URL: '/lider/agent/{}/onlineusers'", dn);
		IRestResponse restResponse = agentProcessor.getOnlineUsers(dn);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}

	/**
	 * List ALL online users.
	 * 
	 * @param dn
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/onlineusers", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public IRestResponse getAllOnlineUsers(HttpServletRequest request) {
		logger.info("Request received. URL: '/lider/agent/onlineusers'");
		IRestResponse restResponse = agentProcessor.getAllOnlineUsers();
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
