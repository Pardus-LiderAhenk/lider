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
package tr.org.liderahenk.lider.core.api.persistence.entities;

import java.util.Date;
import java.util.Set;

/**
 * IPolicy entity class is responsible for storing policy records.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Kağan Akkaya</a>
 *
 */
public interface IPolicy extends IEntity {

	/**
	 * 
	 * @return policy label
	 */
	String getLabel();

	/**
	 * 
	 * @return policy description
	 */
	String getDescription();

	/**
	 * 
	 * @return active flag
	 */
	boolean isActive();

	/**
	 * 
	 * @return deleted flag
	 */
	boolean isDeleted();

	/**
	 * 
	 * @return a collection of IProfile instances
	 */
	Set<? extends IProfile> getProfiles();

	/**
	 * Add new IProfile instance to profiles collection
	 * 
	 * @param profile
	 */
	void addProfile(IProfile profile);

	/**
	 * 
	 * @return record modification date
	 */
	Date getModifyDate();

	/**
	 * 
	 * @return version number used to manage policies sent to agents in order to
	 *         be executed.
	 */
	String getPolicyVersion();

	void setPolicyVersion(String policyVersion);
	
	void setcommandOwnerUid(String commandOwnerUid);

}
