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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;


@Service
public class ResponseFactoryService {

	
	public IRestResponse createResponse(RestResponseStatus status, List<String> messages) {
		return new RestResponseImpl(status, messages, null);
	}
	
	
	public IRestResponse createResponse(IRequest request, RestResponseStatus status, List<String> messages) {
		return new RestResponseImpl(status, messages, null);
	}
	
	
	public IRestResponse createResponse(RestResponseStatus status, List<String> messages, Map<String, Object> resultMap) {
		return new RestResponseImpl(status, messages, resultMap);
	}
	
	
	public IRestResponse createResponse(IRequest request, RestResponseStatus status, List<String> messages, Map<String, Object> resultMap) {
		return new RestResponseImpl(status, messages, resultMap);
	}

	
	public IRestResponse createResponse(RestResponseStatus status, String message) {
		List<String> messages = new ArrayList<String>();
		messages.add(message);
		return new RestResponseImpl(status, messages, null);
	}

	
	public IRestResponse createResponse(RestResponseStatus status, String message, Map<String, Object> resultMap) {
		List<String> messages = new ArrayList<String>();
		messages.add(message);
		return new RestResponseImpl(status, messages, resultMap);
	}
	
	
	public IRestResponse createResponse(ICommandResult result) {
		return new RestResponseImpl(result);
	}

}
