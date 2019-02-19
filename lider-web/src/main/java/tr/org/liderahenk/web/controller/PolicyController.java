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
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

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

import tr.org.liderahenk.lider.core.api.configuration.IConfigurationService;
import tr.org.liderahenk.lider.core.api.ldap.ILDAPService;
import tr.org.liderahenk.lider.core.api.ldap.LdapSearchFilterAttribute;
import tr.org.liderahenk.lider.core.api.ldap.enums.SearchFilterEnum;
import tr.org.liderahenk.lider.core.api.ldap.exceptions.LdapException;
import tr.org.liderahenk.lider.core.api.ldap.model.LdapEntry;
import tr.org.liderahenk.lider.core.api.rest.IResponseFactory;
import tr.org.liderahenk.lider.core.api.rest.enums.DNType;
import tr.org.liderahenk.lider.core.api.rest.processors.IPolicyRequestProcessor;
import tr.org.liderahenk.lider.core.api.rest.responses.IRestResponse;
import tr.org.liderahenk.web.controller.utils.ControllerUtils;

/**
 * Controller for policy related operations.
 * 
 * @author <a href="mailto:hasan.kara@pardus.org.tr">Hasan Kara</a>
 *
 */
@Controller
@RequestMapping("/lider/policy")
public class PolicyController {

	private static Logger logger = LoggerFactory.getLogger(PolicyController.class);

	@Autowired
	private IResponseFactory responseFactory;
	@Autowired
	private IPolicyRequestProcessor policyProcessor;

	@Autowired
	private ILDAPService ldapService;
	@Autowired
	private IConfigurationService configurationService;
	/**
	 * Execute policy. 'Execution' means saving policy as command which can be
	 * then queried by agents on user login.
	 * 
	 * @param requestBody
	 * @param request
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	@RequestMapping(value = "/execute", method = { RequestMethod.POST })
	@ResponseBody
	public IRestResponse executePolicy(@RequestBody String requestBody, HttpServletRequest request)
			throws UnsupportedEncodingException {
		String requestBodyDecoded = ControllerUtils.decodeRequestBody(requestBody);
		logger.info("Request received. URL: '/lider/policy/execute' Body: {}",
				requestBodyDecoded.length() > ControllerUtils.MAX_LOG_SIZE
						? requestBodyDecoded.substring(0, ControllerUtils.MAX_LOG_SIZE) : requestBodyDecoded);
		IRestResponse restResponse = policyProcessor.execute(requestBodyDecoded);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}

	/**
	 * Create new policy.
	 * 
	 * @param requestBody
	 * @param request
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	@RequestMapping(value = "/add", method = { RequestMethod.POST })
	@ResponseBody
	public IRestResponse addPolicy(@RequestBody String requestBody, HttpServletRequest request)
			throws UnsupportedEncodingException {
		String requestBodyDecoded = ControllerUtils.decodeRequestBody(requestBody);
		logger.info("Request received. URL: '/lider/policy/add' Body: {}",
				requestBodyDecoded.length() > ControllerUtils.MAX_LOG_SIZE
						? requestBodyDecoded.substring(0, ControllerUtils.MAX_LOG_SIZE) : requestBodyDecoded);
		IRestResponse restResponse = policyProcessor.add(requestBodyDecoded);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}

	/**
	 * Update given policy.
	 * 
	 * @param requestBody
	 * @param request
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	@RequestMapping(value = "/update", method = { RequestMethod.POST })
	@ResponseBody
	public IRestResponse updatePolicy(@RequestBody String requestBody, HttpServletRequest request)
			throws UnsupportedEncodingException {
		String requestBodyDecoded = ControllerUtils.decodeRequestBody(requestBody);
		logger.info("Request received. URL: '/lider/policy/update' Body: {}",
				requestBodyDecoded.length() > ControllerUtils.MAX_LOG_SIZE
						? requestBodyDecoded.substring(0, ControllerUtils.MAX_LOG_SIZE) : requestBodyDecoded);
		IRestResponse restResponse = policyProcessor.update(requestBodyDecoded);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}

	/**
	 * List policies according to given parameters.
	 * 
	 * @param label
	 * @param active
	 * @param request
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	@RequestMapping(value = "/list", method = { RequestMethod.GET })
	@ResponseBody
	public IRestResponse listPolicies(@RequestParam(value = "label", required = false) String label,
			@RequestParam(value = "active", required = false, defaultValue = "true") Boolean active,
			HttpServletRequest request) throws UnsupportedEncodingException {
		logger.info("Request received. URL: '/lider/policy/list?label={}&active={}'", new Object[] { label, active });
		IRestResponse restResponse = policyProcessor.list(label, active);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}

	/**
	 * Retrieve policy specified by id
	 * 
	 * @param id
	 * @param request
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	@RequestMapping(value = "/{id:[\\d]+}/get", method = { RequestMethod.GET })
	@ResponseBody
	public IRestResponse getPolicy(@PathVariable final long id, HttpServletRequest request)
			throws UnsupportedEncodingException {
		logger.info("Request received. URL: '/lider/policy/{}/get'", id);
		IRestResponse restResponse = policyProcessor.get(id);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}

	/**
	 * Delete policy specified by id.
	 * 
	 * @param id
	 * @param request
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	@RequestMapping(value = "/{id:[\\d]+}/delete", method = { RequestMethod.GET })
	@ResponseBody
	public IRestResponse deletePolicy(@PathVariable final long id, HttpServletRequest request)
			throws UnsupportedEncodingException {
		logger.info("Request received. URL: '/lider/policy/{}/delete'", id);
		IRestResponse restResponse = policyProcessor.delete(id);
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
	public IRestResponse listAppliedPolicies(@RequestParam(value = "label", required = false) String label,
			@RequestParam(value = "createDateRangeStart", required = false) Long createDateRangeStart,
			@RequestParam(value = "createDateRangeEnd", required = false) Long createDateRangeEnd,
			@RequestParam(value = "status", required = false) Integer status,
			@RequestParam(value = "containsPlugin", required = false) String containsPlugin,
			@RequestParam(value = "dnType", required = false) DNType dnType,
			@RequestParam(value = "dn", required = false) String dn,
			@RequestParam(value = "maxResults", required = false) Integer maxResults, HttpServletRequest request)
			throws UnsupportedEncodingException {
		logger.info(
				"Request received. URL: '/lider/policy/list/executed?label={}&createDateRangeStart={}&createDateRangeEnd={}&status={}&maxResults={}&containsPlugin={}&dnType={}&dn={}'",
				new Object[] { label, createDateRangeStart, createDateRangeEnd, status, maxResults, containsPlugin,
						dnType, dn });
		IRestResponse restResponse = policyProcessor.listAppliedPolicies(label,
				createDateRangeStart != null ? new Date(createDateRangeStart) : null,
				createDateRangeEnd != null ? new Date(createDateRangeEnd) : null, status, maxResults, containsPlugin,
				dnType, dn);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}

	/**
	 * Get latest agent policy
	 * 
	 * @param uid
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	@RequestMapping(value = "/list/latestagentpolicy", method = { RequestMethod.GET })
	@ResponseBody
	public IRestResponse getLatestAgentPolicy(@RequestParam(value = "uid", required = true) String uid,
			HttpServletRequest request)
			throws UnsupportedEncodingException {
		logger.info(
				"Request received. URL: '/lider/policy/list/latestagentpolicy?uid={}'",
				new Object[] { uid });
		IRestResponse restResponse = policyProcessor.getLatestAgentPolicy(uid);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}
	
	/**
	 * Get latest user policies.
	 * 
	 * @param uid
	 * @return
	 * @throws UnsupportedEncodingException
	 * @throws LdapException 
	 */
	@RequestMapping(value = "/list/latestuserpolicybygroupofnames", method = { RequestMethod.GET })
	@ResponseBody
	public IRestResponse getLatestUserPolicyByCheckingGroupOfNames(
			@RequestParam(value = "uid", required = true) String uid,
			HttpServletRequest request)
			throws UnsupportedEncodingException, LdapException {
		List<LdapEntry> groupsOfUser = null;
		if(uid!= null && !uid.equals("")) {

			// Find LDAP user entry
			String userDn = ldapService.getDN(configurationService.getLdapRootDn(), configurationService.getUserLdapUidAttribute(),
					uid);

			List<LdapSearchFilterAttribute> filterAttributesList = new ArrayList<LdapSearchFilterAttribute>();
			String[] groupLdapObjectClasses = configurationService.getGroupLdapObjectClasses().split(",");
			for (String groupObjCls : groupLdapObjectClasses) {
				filterAttributesList.add(new LdapSearchFilterAttribute("objectClass", groupObjCls, SearchFilterEnum.EQ));
			}
			filterAttributesList.add(new LdapSearchFilterAttribute("member", userDn, SearchFilterEnum.EQ));
			groupsOfUser =  ldapService.search(configurationService.getLdapRootDn(), filterAttributesList, null);
		}
		logger.info(
				"Request received. URL: '/lider/policy/list/latestuserpolicybygroupofnames?uid={}'",
				new Object[] { uid });
		IRestResponse restResponse = policyProcessor.getLatestUserPolicy(uid, groupsOfUser);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}
	
	/**
	 * Get latest group policy
	 * 
	 * @param uid
	 * @return
	 * @throws UnsupportedEncodingException
	 * @throws LdapException 
	 */
	@RequestMapping(value = "/list/latestgrouppolicy", method = { RequestMethod.GET })
	@ResponseBody
	public IRestResponse getLatestGroupPolicy(@RequestParam(value = "dn", required = true) String dn,
			HttpServletRequest request)
			throws UnsupportedEncodingException, LdapException {
		logger.info(
				"Request received. URL: '/lider/policy/list/latestgrouppolicy?dn={}'",
				new Object[] { dn });
		List<String> listParent = getParents(dn);
		if(listParent != null) {
			IRestResponse restResponse = policyProcessor.getLatestGroupPolicy(listParent);
			logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
			return restResponse;
		}
		else {
			logger.debug("PolicyController failed to parse DN to find parent DN's.");
			return null;
		}

	}
	
	/**
	 * Get latest user policy's executed command results
	 * 
	 * @param uid
	 * @return
	 * @throws UnsupportedEncodingException
	 * @throws LdapException 
	 */
	@RequestMapping(value = "/list/getexecutedcommandrequest", method = { RequestMethod.GET })
	@ResponseBody
	public IRestResponse getCommandExecutionResult(
			@RequestParam(value = "policyID", required = true) Long policyID,
			@RequestParam(value = "uid", required = false) String uid,
			HttpServletRequest request)
			throws UnsupportedEncodingException, LdapException {
		List<LdapEntry> groupsOfUser = null;
		if(uid!= null && !uid.equals("")) {

			// Find LDAP user entry
			String userDn = ldapService.getDN(configurationService.getLdapRootDn(), configurationService.getUserLdapUidAttribute(),
					uid);

			
			List<LdapSearchFilterAttribute> filterAttributesList = new ArrayList<LdapSearchFilterAttribute>();
			String[] groupLdapObjectClasses = configurationService.getGroupLdapObjectClasses().split(",");
			for (String groupObjCls : groupLdapObjectClasses) {
				filterAttributesList.add(new LdapSearchFilterAttribute("objectClass", groupObjCls, SearchFilterEnum.EQ));
			}
			filterAttributesList.add(new LdapSearchFilterAttribute("member", userDn, SearchFilterEnum.EQ));
			groupsOfUser =  ldapService.search(configurationService.getLdapRootDn(), filterAttributesList, null);
		}
		logger.info(
				"Request received. URL: '/lider/policy/list/getExecutedCommandRequest?policyID={}&uid={}'",
				new Object[] { policyID, uid });
		IRestResponse restResponse = policyProcessor.getCommandExecutionResult(policyID, uid, groupsOfUser);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		return restResponse;
	}
	
	/**
	 * Retrieve command related to policy specified policy id.
	 * 
	 * @param id
	 * @param request
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	@RequestMapping(value = "/command/{id:[\\d]+}/get", method = { RequestMethod.GET })
	@ResponseBody
	public IRestResponse listCommands(@PathVariable final Long id, HttpServletRequest request)
			throws UnsupportedEncodingException {
		logger.info("Request received. URL: '/lider/policy/command/{}/get'", id);
		IRestResponse restResponse = policyProcessor.listCommands(id);
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

	/*
	 * Parse a dn to find parent of that dn
	 */
	public List<String> getParents(String dn) {
		if(!dn.contains("ou=")) {
			return null;
		}
		String[] parsedString = dn.split("ou=");
		
		List<String> listParent = new ArrayList<>();
		String base = "";
		for (int i = parsedString.length -1; i >= 0; i--) {
			if(!parsedString[i].equals("")) {
				if(i == parsedString.length) {
					if(!parsedString[i].contains("cn=")) {
						base = "ou=" + parsedString[i];
					}
					else {
						base = parsedString[i];
					}
					listParent.add("[\"" + parsedString[i] + "\"]");
				}
				else {
					if(!parsedString[i].contains("cn=")) {
						base = "ou=" + parsedString[i] + base;
					}
					else {
						base = parsedString[i] + base;
					}
					listParent.add("[\"" + base + "\"]");
				}
			}
		}
		return listParent;
	}
}
