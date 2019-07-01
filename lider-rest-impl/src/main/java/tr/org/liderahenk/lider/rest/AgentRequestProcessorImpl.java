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
package tr.org.liderahenk.lider.rest;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import tr.org.liderahenk.lider.core.api.persistence.dao.IAgentDao;
import tr.org.liderahenk.lider.core.api.persistence.entities.IAgent;
import tr.org.liderahenk.lider.core.api.rest.IResponseFactory;
import tr.org.liderahenk.lider.core.api.rest.enums.RestResponseStatus;
import tr.org.liderahenk.lider.core.api.rest.processors.IAgentRequestProcessor;
import tr.org.liderahenk.lider.core.api.rest.responses.IRestResponse;
import tr.org.liderahenk.lider.rest.dto.OnlineUser;

/**
 * Processor class for handling/processing agent data.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 *
 */
public class AgentRequestProcessorImpl implements IAgentRequestProcessor {

	private static Logger logger = LoggerFactory.getLogger(AgentRequestProcessorImpl.class);

	private IAgentDao agentDao;
	private IResponseFactory responseFactory;

	@Override
	public IRestResponse list(String hostname, String dn, String uid) {
		// Build search criteria
		Map<String, Object> propertiesMap = new HashMap<String, Object>();
		if (hostname != null && !hostname.isEmpty()) {
			propertiesMap.put("hostname", hostname);
		}
		if (dn != null && !dn.isEmpty()) {
			propertiesMap.put("dn", dn);
		}
		if (uid != null && !uid.isEmpty()) {
			propertiesMap.put("jid", uid);
		}

		// Find desired agents
		List<? extends IAgent> agents = agentDao.findByProperties(IAgent.class, propertiesMap, null, null);
		logger.debug("Found agents: {}", agents);

		// Construct result map
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			resultMap.put("agents", agents);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}

		return responseFactory.createResponse(RestResponseStatus.OK, "Records listed.", resultMap);
	}

	@Override
	public IRestResponse get(Long id) {
		if (id == null) {
			throw new IllegalArgumentException("ID was null.");
		}
		IAgent agent = agentDao.find(id);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("agent", agent);
		return responseFactory.createResponse(RestResponseStatus.OK, "Record retrieved.", resultMap);
	}

	@Override
	public IRestResponse getOnlineUsers(String dn) {
		if (dn == null) {
			throw new IllegalArgumentException("DN was null.");
		}
		// Find online users
		List<String> onlineUsers = agentDao.findOnlineUsers(dn);
		logger.debug("Found online users: {}", onlineUsers);

		// Construct result map
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			resultMap.put("onlineUsers", onlineUsers);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}

		return responseFactory.createResponse(RestResponseStatus.OK, "Records listed.", resultMap);
	}

	@Override
	public IRestResponse getAllOnlineUsers() {
		// Find online users
		List<Object[]> resultList = agentDao.findAllOnlineUsers();
		List<OnlineUser> onlineUsers = null;
		// Convert SQL result to collection of tasks.
		if (resultList != null) {
			onlineUsers = new ArrayList<OnlineUser>();
			for (Object[] arr : resultList) {
				if (arr.length != 6) {
					continue;
				}
				OnlineUser policy = new OnlineUser((Long) arr[0], (String) arr[1], (String) arr[2], (String) arr[3],
						(String) arr[4], (Date) arr[5], null);
				onlineUsers.add(policy);
			}
		}

		// Construct result map
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			resultMap.put("onlineUsers", onlineUsers);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}

		return responseFactory.createResponse(RestResponseStatus.OK, "Records listed.", resultMap);
	}

	public void setAgentDao(IAgentDao agentDao) {
		this.agentDao = agentDao;
	}

	public void setResponseFactory(IResponseFactory responseFactory) {
		this.responseFactory = responseFactory;
	}

	@Override
	public IRestResponse countOfAgents(String propertyName, String propertyValue, String type) {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("countOfAgents", agentDao.countOfAgent(propertyName, propertyValue, type));		
		return responseFactory.createResponse(RestResponseStatus.OK, "Records listed.", resultMap);
	}

	@Override
	public IRestResponse listAgentsForPaging(int firstResult, int maxResult) {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("agents", agentDao.listAgentsWithPaging(firstResult, maxResult));	
		return responseFactory.createResponse(RestResponseStatus.OK, "Records listed.", resultMap);
	}

	@Override
	public IRestResponse listFilteredAgentsWithPaging(String propertyName, String propertyValue, String type,
			int firstResult, int maxResult) {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("agents", agentDao.listFilteredAgentsWithPaging(propertyName, propertyValue, type, firstResult, maxResult));	
		return responseFactory.createResponse(RestResponseStatus.OK, "Records listed.", resultMap);
	}

}
