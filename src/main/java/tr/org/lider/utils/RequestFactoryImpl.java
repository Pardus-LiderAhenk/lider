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
package tr.org.lider.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.models.TaskRequestImpl;

//import tr.org.liderahenk.lider.core.api.persistence.entities.IRegistrationTemplate;
//import tr.org.liderahenk.lider.core.api.rest.IRequestFactory;
//import tr.org.liderahenk.lider.core.api.rest.requests.IMailManagementRequest;
//import tr.org.liderahenk.lider.core.api.rest.requests.IPolicyExecutionRequest;
//import tr.org.liderahenk.lider.core.api.rest.requests.IPolicyRequest;
//import tr.org.liderahenk.lider.core.api.rest.requests.IProfileRequest;
//import tr.org.liderahenk.lider.core.api.rest.requests.IReportGenerationRequest;
//import tr.org.liderahenk.lider.core.api.rest.requests.IReportTemplateRequest;
//import tr.org.liderahenk.lider.core.api.rest.requests.IReportViewRequest;
//import tr.org.liderahenk.lider.core.api.rest.requests.ISearchGroupRequest;
//import tr.org.liderahenk.lider.core.api.rest.requests.ITaskRequest;
//import tr.org.liderahenk.lider.service.requests.MailManagementRequestImpl;
//import tr.org.liderahenk.lider.service.requests.PolicyExecutionRequestImpl;
//import tr.org.liderahenk.lider.service.requests.PolicyRequestImpl;
//import tr.org.liderahenk.lider.service.requests.ProfileRequestImpl;
//import tr.org.liderahenk.lider.service.requests.RegistrationTemplateReqImpl;
//import tr.org.liderahenk.lider.service.requests.ReportGenerationRequestImpl;
//import tr.org.liderahenk.lider.service.requests.ReportTemplateRequestImpl;
//import tr.org.liderahenk.lider.service.requests.ReportViewRequestImpl;
//import tr.org.liderahenk.lider.service.requests.SearchGroupRequestImpl;
//import tr.org.liderahenk.lider.service.requests.TaskRequestImpl;

/**
 * Default implementation for {@link IRequestFactory}.
 * 
 */

@Service
public class RequestFactoryImpl {

	private static Logger logger = LoggerFactory.getLogger(RequestFactoryImpl.class);
	
	
	public ITaskRequest createTaskCommandRequest(String json) throws Exception {
		logger.debug("Creating TaskRequestImpl instance from json: {}", json);
		return new ObjectMapper().readValue(json, TaskRequestImpl.class);
	}
	
//
//	@Override
//	public IProfileRequest createProfileRequest(String json) throws Exception {
//		logger.debug("Creating ProfileRequestImpl instance from json: {}", json);
//		return new ObjectMapper().readValue(json, ProfileRequestImpl.class);
//	}
//
//	@Override
//	public IPolicyRequest createPolicyRequest(String json) throws Exception {
//		logger.debug("Creating ProfileRequestImpl instance from json: {}", json);
//		return new ObjectMapper().readValue(json, PolicyRequestImpl.class);
//	}
//
//	@Override
//	public IPolicyExecutionRequest createPolicyExecutionRequest(String json) throws Exception {
//		logger.debug("Creating PolicyExecutionImpl instance from json: {}", json);
//		return new ObjectMapper().readValue(json, PolicyExecutionRequestImpl.class);
//	}
//
//	
//
//	@Override
//	public IReportTemplateRequest createReportTemplateRequest(String json) throws Exception {
//		logger.debug("Creating ReportTemplateRequestImpl instance from json: {}", json);
//		return new ObjectMapper().readValue(json, ReportTemplateRequestImpl.class);
//	}
//
//	@Override
//	public IReportGenerationRequest createReportGenerationRequest(String json) throws Exception {
//		logger.debug("Creating ReportGenerationRequestImpl instance from json: {}", json);
//		return new ObjectMapper().readValue(json, ReportGenerationRequestImpl.class);
//	}
//
//	@Override
//	public IReportViewRequest createReportViewRequest(String json) throws Exception {
//		logger.debug("Creating ReportViewRequestImpl instance from json: {}", json);
//		return new ObjectMapper().readValue(json, ReportViewRequestImpl.class);
//	}
//
//	@Override
//	public ISearchGroupRequest createSearchGroupRequest(String json) throws Exception {
//		logger.debug("Creating SearchGroupRequestImpl instance from json: {}", json);
//		return new ObjectMapper().readValue(json, SearchGroupRequestImpl.class);
//	}
//	
//	@Override
//	public IMailManagementRequest createMailManagementRequest(String json) throws Exception {
//		logger.debug("Creating IMailManagementRequest instance from json: {}", json);
//		return new ObjectMapper().readValue(json, MailManagementRequestImpl.class);
//	}
//	
//	@Override
//	public IRegistrationTemplate createRegistrationTemplateRequest(String json) throws Exception {
//		logger.debug("Creating IRegistrationTemplate instance from json: {}", json);
//		return new ObjectMapper().readValue(json, RegistrationTemplateReqImpl.class);
//	}
	
}
