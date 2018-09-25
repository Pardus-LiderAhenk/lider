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
package tr.org.liderahenk.lider.rest.dto;

import java.io.Serializable;
import java.util.Date;

import org.codehaus.jackson.annotate.JsonIgnoreProperties;

import tr.org.liderahenk.lider.core.api.persistence.entities.ITask;

/**
 * This is a specialized class which is used to list executed tasks with some
 * additional info.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 *
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ExecutedTask implements Serializable {

	private static final long serialVersionUID = 911947090772911900L;

	private Long id;

	private String pluginName;

	private String pluginVersion;

	private String commandClsId;

	private Date createDate;

	private Integer successResults;
	
	private Long executions;

	private Integer warningResults;

	private Integer errorResults;

	private Boolean cancelled;

	private Boolean scheduled;

	private Date lastExecutionDate;

	public ExecutedTask(ITask task, Long executions , Integer successResults, Integer warningResults, Integer errorResults, Date lastExecutionDate) {
		super();
		this.id = task.getId();
		this.pluginName = task.getPlugin().getName();
		this.pluginVersion = task.getPlugin().getVersion();
		this.executions=executions;
		this.commandClsId = task.getCommandClsId();
		this.createDate = task.getCreateDate();
		this.successResults = successResults;
		this.warningResults = warningResults;
		this.errorResults = errorResults;
		this.cancelled = task.isDeleted();
		this.scheduled = task.getCronExpression() != null && !task.getCronExpression().isEmpty();
		this.lastExecutionDate = lastExecutionDate;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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

	public Date getCreateDate() {
		return createDate;
	}

	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}

	public Integer getErrorResults() {
		return errorResults;
	}

	public void setErrorResults(Integer errorResults) {
		this.errorResults = errorResults;
	}

	public Integer getSuccessResults() {
		return successResults;
	}

	public void setSuccessResults(Integer successResults) {
		this.successResults = successResults;
	}

	public Integer getWarningResults() {
		return warningResults;
	}

	public void setWarningResults(Integer warningResults) {
		this.warningResults = warningResults;
	}

	public Boolean getCancelled() {
		return cancelled;
	}

	public void setCancelled(Boolean cancelled) {
		this.cancelled = cancelled;
	}

	public Boolean getScheduled() {
		return scheduled;
	}

	public void setScheduled(Boolean scheduled) {
		this.scheduled = scheduled;
	}

	public Date getLastExecutionDate() {
		return lastExecutionDate;
	}

	public void setLastExecutionDate(Date lastExecutionDate) {
		this.lastExecutionDate = lastExecutionDate;
	}

	public Long getExecutions() {
		return executions;
	}

	public void setExecutions(Long executions) {
		this.executions = executions;
	}

}
