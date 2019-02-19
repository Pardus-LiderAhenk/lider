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
package tr.org.liderahenk.lider.core.api.rest.processors;

import java.util.Date;
import java.util.List;

import tr.org.liderahenk.lider.core.api.ldap.model.LdapEntry;
import tr.org.liderahenk.lider.core.api.rest.enums.DNType;
import tr.org.liderahenk.lider.core.api.rest.responses.IRestResponse;

/**
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 *
 */
public interface IPolicyRequestProcessor {

	/**
	 * 
	 * @param json
	 * @return
	 */
	IRestResponse execute(String json);

	/**
	 * 
	 * @param json
	 * @return
	 */
	IRestResponse add(String json);

	/**
	 * 
	 * @param json
	 * @return
	 */
	IRestResponse update(String json);

	/**
	 * 
	 * @param label
	 * @param active
	 * @return
	 */
	IRestResponse list(String label, Boolean active);

	/**
	 * 
	 * @param id
	 * @return
	 */
	IRestResponse get(Long id);

	/**
	 * 
	 * @param id
	 * @return
	 */
	IRestResponse delete(Long id);

	/**
	 * 
	 * @param label
	 * @param createDateRangeStart
	 * @param createDateRangeEnd
	 * @param status
	 * @param maxResults
	 * @return
	 */
	IRestResponse listAppliedPolicies(String label, Date createDateRangeStart, Date createDateRangeEnd, Integer status,
			Integer maxResults, String containsPlugin, DNType dnType, String dn);
	

	/**
	 * Returns latest agent policy
	 * @return
	 */
	IRestResponse getLatestAgentPolicy(String uid);
	

	/**
	 * Returns latest user policy
	 * @return
	 */
	IRestResponse getLatestUserPolicy(String uid, List<LdapEntry> groupDns);
	
	/**
	 * Returns latest group policy
	 * @return
	 */
	IRestResponse getLatestGroupPolicy(List<String> dnList);
	
	/**
	 * 
	 * @param policyId
	 * @return
	 */
	IRestResponse listCommands(Long policyId);
	
	/**
	 * Returns command execuiton results of a policy which is applied to a user or to an agent
	 * 
	 * @param policyId
	 * @param uid
	 * @return
	 */
	IRestResponse getCommandExecutionResult(Long policyID, String uid, List<LdapEntry> groupDns);


}
