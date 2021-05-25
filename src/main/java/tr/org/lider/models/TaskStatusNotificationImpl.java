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
package tr.org.lider.models;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import tr.org.lider.entities.CommandExecutionImpl;
import tr.org.lider.entities.CommandExecutionResultImpl;

/**
 * Default implementation for {@link ITaskStatusNotification}. This notification
 * will be created when a task status message is received by Task Manager.
 *
 */
@JsonIgnoreProperties(ignoreUnknown = true, value = { "recipient" })
public class TaskStatusNotificationImpl  {

	private static final long serialVersionUID = 6226506876404468113L;

	private NotificationType type = NotificationType.TASK_STATUS;

	/**
	 * Recipient of this notification
	 */
	private String recipient;

	/**
	 * Plugin name to which the task belongs
	 */
	private String pluginName;

	/**
	 * Plugin version to which the task belongs
	 */
	private String pluginVersion;

	/**
	 * Task command ID
	 */
	private String commandClsId;

	/**
	 * Execution record that holds DN and DN type on which the task executed
	 */
	private CommandExecutionImpl commandExecution;

	/**
	 * Actual task result
	 */
	private CommandExecutionResultImpl result;

	/**
	 * Timestamp of notification
	 */
	private Date timestamp;

	public TaskStatusNotificationImpl(String recipient, String pluginName, String pluginVersion, String commandClsId,
			CommandExecutionImpl commandExecution, CommandExecutionResultImpl result, Date timestamp) {
		this.recipient = recipient;
		this.pluginName = pluginName;
		this.pluginVersion = pluginVersion;
		this.commandClsId = commandClsId;
		this.commandExecution = commandExecution;
		this.result = result;
		this.timestamp = timestamp;
	}

	
	public String getPluginName() {
		return pluginName;
	}

	public void setPluginName(String pluginName) {
		this.pluginName = pluginName;
	}

	
	public String getPluginVersion() {
		return pluginVersion;
	}

	public void setPluginVersion(String pluginVersion) {
		this.pluginVersion = pluginVersion;
	}

	
	public String getCommandClsId() {
		return commandClsId;
	}

	public void setCommandClsId(String commandClsId) {
		this.commandClsId = commandClsId;
	}

	
	public NotificationType getType() {
		return type;
	}

	public void setType(NotificationType type) {
		this.type = type;
	}

	
	public String getRecipient() {
		return recipient;
	}

	public void setRecipient(String recipient) {
		this.recipient = recipient;
	}

	
	public Date getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}

	
	public CommandExecutionImpl getCommandExecution() {
		return commandExecution;
	}

	public void setCommandExecution(CommandExecutionImpl commandExecution) {
		this.commandExecution = commandExecution;
	}

	
	public CommandExecutionResultImpl getResult() {
		return result;
	}

	public void setResult(CommandExecutionResultImpl result) {
		this.result = result;
	}

}
