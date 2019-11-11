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
package tr.org.lider.entities;

import java.io.IOException;
import java.io.Serializable;
import java.util.Date;
import java.util.Map;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@JsonIgnoreProperties({ "parameterMapBlob" })
@Entity
@Table(name = "c_task")
public class TaskImpl implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "task_id", unique = true, nullable = false)
	private Long id;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "plugin_id", nullable = false)
	private PluginImpl plugin; // unidirectional

	@Column(name = "command_cls_id")
	private String commandClsId;

	@Lob
	@Column(name = "parameter_map")
	private byte[] parameterMapBlob;

	@Transient
	private Map<String, Object> parameterMap;

	@Column(name = "deleted")
	private boolean deleted = false;

	@Column(name = "cron_expression")
	private String cronExpression;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "create_date", nullable = false)
	private Date createDate;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "modify_date")
	private Date modifyDate;

	
	@Column(name = "is_mail_send")
	private boolean isMailSend = false;
	
	public TaskImpl() {
	}

	public TaskImpl(Long id, PluginImpl plugin, String commandClsId, Map<String, Object> parameterMap, boolean deleted,
			String cronExpression, Date createDate, Date modifyDate) {
		this.id = id;
		this.plugin = plugin;
		this.commandClsId = commandClsId;
		setParameterMap(parameterMap);
		this.deleted = deleted;
		this.cronExpression = cronExpression;
		this.createDate = createDate;
		this.modifyDate = modifyDate;
	}
//
//	public TaskImpl(ITask task) {
//		this.id = task.getId();
//		this.commandClsId = task.getCommandClsId();
//		setParameterMap(task.getParameterMap());
//		this.deleted = task.isDeleted();
//		this.cronExpression = task.getCronExpression();
//		this.createDate = task.getCreateDate();
//		this.modifyDate = task.getModifyDate();
//		if (task.getPlugin() instanceof PluginImpl) {
//			this.plugin = (PluginImpl) task.getPlugin();
//		}
//	}

	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	
	public PluginImpl getPlugin() {
		return plugin;
	}

	public void setPlugin(PluginImpl plugin) {
		this.plugin = plugin;
	}

	
	public String getCommandClsId() {
		return commandClsId;
	}

	public void setCommandClsId(String commandClsId) {
		this.commandClsId = commandClsId;
	}

	
	public byte[] getParameterMapBlob() {
		if (parameterMapBlob == null && parameterMap != null) {
			try {
				this.parameterMapBlob = new ObjectMapper().writeValueAsBytes(parameterMap);
			} catch (JsonGenerationException e) {
				e.printStackTrace();
			} catch (JsonMappingException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return parameterMapBlob;
	}

	public void setParameterMapBlob(byte[] parameterMapBlob) {
		this.parameterMapBlob = parameterMapBlob;
		try {
			this.parameterMap = new ObjectMapper().readValue(parameterMapBlob,
					new TypeReference<Map<String, Object>>() {
					});
		} catch (JsonParseException e) {
			e.printStackTrace();
		} catch (JsonMappingException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	
	public Map<String, Object> getParameterMap() {
		if (parameterMap == null && parameterMapBlob != null) {
			try {
				this.parameterMap = new ObjectMapper().readValue(parameterMapBlob,
						new TypeReference<Map<String, Object>>() {
						});
			} catch (JsonParseException e) {
				e.printStackTrace();
			} catch (JsonMappingException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return parameterMap;
	}

	public void setParameterMap(Map<String, Object> parameterMap) {
		this.parameterMap = parameterMap;
		try {
			this.parameterMapBlob = new ObjectMapper().writeValueAsBytes(parameterMap);
		} catch (JsonGenerationException e) {
			e.printStackTrace();
		} catch (JsonMappingException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	
	public boolean isDeleted() {
		return deleted;
	}

	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}

	
	public String getCronExpression() {
		return cronExpression;
	}

	public void setCronExpression(String cronExpression) {
		this.cronExpression = cronExpression;
	}

	
	public Date getCreateDate() {
		return createDate;
	}

	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}

	
	public Date getModifyDate() {
		return modifyDate;
	}

	public void setModifyDate(Date modifyDate) {
		this.modifyDate = modifyDate;
	}

	
	public String toJson() {
		ObjectMapper mapper = new ObjectMapper();
		try {
			return mapper.writeValueAsString(this);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	
	public String toString() {
		return "TaskImpl [id=" + id + ", plugin=" + plugin + ", commandClsId=" + commandClsId + ", parameterMap="
				+ parameterMap + "]";
	}

	public boolean isMailSend() {
		return isMailSend;
	}

	public void setMailSend(boolean isMailSend) {
		this.isMailSend = isMailSend;
	}

}
