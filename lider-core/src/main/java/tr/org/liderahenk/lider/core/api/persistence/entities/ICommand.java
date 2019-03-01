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
import java.util.List;

import tr.org.liderahenk.lider.core.api.rest.enums.DNType;

/**
 * ICommand entity class is responsible for storing command records.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Kağan Akkaya</a>
 *
 */
public interface ICommand extends IEntity {

	/**
	 * 
	 * @return related policy record (nullable)
	 */
	IPolicy getPolicy();

	/**
	 * 
	 * @return related task record (nullable)
	 */
	ITask getTask();

	/**
	 * 
	 * @return a collection of DN sent from Lider Console
	 */
	List<String> getDnList();

	/**
	 * This UID/JID is used to notify users after command (task or policy)
	 * execution.
	 * 
	 * @return UID of the user who executed this command
	 */
	String getCommandOwnerUid();

	/**
	 * 
	 * @return DN type which subject to command execution
	 */
	DNType getDnType();

	/**
	 * 
	 * @return policy activation date
	 */
	Date getActivationDate();

	/**
	 * 
	 * @return policy expiration date
	 */
	Date getExpirationDate();

	/**
	 * 
	 * @return a collection of ICommandExecution instances
	 */
	List<? extends ICommandExecution> getCommandExecutions();

	/**
	 * Add new ICommandExecution instance to command-executions collection
	 * 
	 * @param commandExecution
	 */
	void addCommandExecution(ICommandExecution commandExecution);

	void setTask(ITask task);
	
	List<String> getUidList();

	boolean isSentMail();
	
	boolean isMailThreadingActive();
	
	void setMailThreadingActive(boolean mailThreadingActive);
	

}
