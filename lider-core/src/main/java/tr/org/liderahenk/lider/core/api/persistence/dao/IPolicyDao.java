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
package tr.org.liderahenk.lider.core.api.persistence.dao;

import java.util.List;
import java.util.Map;

import tr.org.liderahenk.lider.core.api.ldap.model.LdapEntry;
import tr.org.liderahenk.lider.core.api.persistence.IBaseDao;
import tr.org.liderahenk.lider.core.api.persistence.PropertyOrder;
import tr.org.liderahenk.lider.core.api.persistence.entities.IPolicy;

public interface IPolicyDao extends IBaseDao<IPolicy> {

	/**
	 * 
	 * @param policy
	 * @return
	 */
	IPolicy save(IPolicy policy);

	/**
	 * 
	 * @param policy
	 * @return
	 */
	IPolicy update(IPolicy policy);

	/**
	 * 
	 * @param policyId
	 */
	void delete(Long policyId);

	/**
	 * 
	 * @param policyId
	 * @return
	 */
	IPolicy find(Long policyId);

	/**
	 * 
	 * @return
	 */
	List<? extends IPolicy> findAll(Class<? extends IPolicy> obj, Integer maxResults);

	/**
	 * 
	 * @return
	 */
	List<? extends IPolicy> findByProperty(Class<? extends IPolicy> obj, String propertyName, Object propertyValue,
			Integer maxResults);

	/**
	 * 
	 * @return
	 */
	List<? extends IPolicy> findByProperties(Class<? extends IPolicy> obj, Map<String, Object> propertiesMap,
			List<PropertyOrder> orders, Integer maxResults);

	/**
	 * 
	 * @param uid
	 * @param groupsOfUser
	 * @return latest executed user policy with execution command ID.
	 */
	List<Object[]> getLatestUserPolicy(String uid, List<LdapEntry> groupsOfUser);

	/**
	 * 
	 * @param uid
	 * @return latest executed agent policy with execution command ID.
	 */
	List<Object[]> getLatestAgentPolicy(String uid);

}