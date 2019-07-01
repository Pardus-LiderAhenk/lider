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

import tr.org.liderahenk.lider.core.api.persistence.IBaseDao;
import tr.org.liderahenk.lider.core.api.persistence.PropertyOrder;
import tr.org.liderahenk.lider.core.api.persistence.entities.IAgent;
import tr.org.liderahenk.lider.core.api.persistence.entities.IAgreementStatus;

/**
 * Provides agent database operations.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 * @see tr.org.liderahenk.lider.persistence.agent.dao.AgentDaoImpl
 *
 */
public interface IAgentDao extends IBaseDao<IAgent> {

	/**
	 * 
	 * @param agent
	 * @return
	 */
	IAgent save(IAgent agent);

	/**
	 * 
	 * @param agent
	 * @return
	 */
	IAgent update(IAgent agent);

	/**
	 * 
	 * @param agent
	 * @param ipAddresses
	 * @return
	 */
	IAgent update(IAgent agent, String ipAddresses);

	/**
	 * 
	 * @param agentId
	 */
	void delete(Long agentId);

	/**
	 * 
	 * @param agentId
	 * @return
	 */
	IAgent find(Long agentId);

	/**
	 * 
	 * @return
	 */
	List<? extends IAgent> findAll(Class<? extends IAgent> obj, Integer maxResults);

	/**
	 * 
	 * @return
	 */
	List<? extends IAgent> findByProperty(Class<? extends IAgent> obj, String propertyName, Object propertyValue,
			Integer maxResults);

	/**
	 * 
	 * @return
	 */
	List<? extends IAgent> findByProperties(Class<? extends IAgent> obj, Map<String, Object> propertiesMap,
			List<PropertyOrder> orders, Integer maxResults);

	/**
	 * 
	 * @return
	 */
	Map<String, String> getProperties();

	/**
	 * 
	 * @param agreementStatus
	 */
	void addAgreementStatus(IAgreementStatus agreementStatus);

	/**
	 * 
	 * @param dn
	 * @return
	 */
	List<String> findOnlineUsers(String dn);

	/**
	 * 
	 * @return
	 */
	List<Object[]> findAllOnlineUsers();
	
	List<Object[]> findAgentFromOnlineUsers(String userName);
	
	int countOfAgent(String propertyName, String propertyValue, String type);
	
	List<? extends IAgent> listAgentsWithPaging(int firstResult ,int maxResult);
	
	List<? extends IAgent> listFilteredAgentsWithPaging(String propertyName, String propertyValue, String type, int firstResult ,int maxResult);

}
