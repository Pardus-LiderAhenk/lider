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

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.UniqueConstraint;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


/**
 * Entity class for IPlugin objects.
 * 
 */
@JsonIgnoreProperties({ "profiles", "distroParamsBlob","pluginTaskList" })
@Entity
@Table(name = "c_plugin", uniqueConstraints = @UniqueConstraint(columnNames = { "PLUGIN_NAME", "PLUGIN_VERSION" }))
public class PluginImpl implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	@Column(name = "PLUGIN_ID", unique = true, nullable = false)
	private Long id;

	@Column(name = "PLUGIN_NAME", nullable = false)
	private String name;

	@Column(name = "PLUGIN_VERSION", nullable = false)
	private String version;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "ACTIVE")
	private boolean active = true;

	@Column(name = "DELETED")
	private boolean deleted = false;

	@Column(name = "MACHINE_ORIENTED_PLUGIN")
	private boolean machineOriented;

	@Column(name = "USER_ORIENTED_PLUGIN")
	private boolean userOriented;

	@Column(name = "POLICY_PLUGIN")
	private boolean policyPlugin;

	@Column(name = "TASK_PLUGIN")
	private boolean taskPlugin;

	@Column(name = "USES_FILE_TRANSFER")
	private boolean usesFileTransfer;

	@Column(name = "X_BASED")
	private boolean xBased;

	@OneToMany(mappedBy = "plugin", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = false)
	@Fetch(value = FetchMode.SUBSELECT)
	private List<ProfileImpl> profiles = new ArrayList<ProfileImpl>(); // bidirectional

	
	@OneToMany(mappedBy = "plugin", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = false)
	@Fetch(value = FetchMode.SUBSELECT)
	private List<PluginTask> pluginTaskList = new ArrayList<PluginTask>(); // bidirectional
//	
//	
//	@OneToMany(mappedBy = "plugin", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = false)
//	private List<MailAddressImpl> mailAddresses = new ArrayList<MailAddressImpl>(); // bidirectional

	
//	@Temporal(TemporalType.TIMESTAMP)
//	@Column(name = "CREATE_DATE", nullable = false)
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATE_DATE", nullable = false)
	@CreationTimestamp
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss")
	private Date createDate;

//	@Temporal(TemporalType.TIMESTAMP)
//	@Column(name = "MODIFY_DATE")
	
	private Date modifyDate;
	
	public PluginImpl() {
	}
	
	public PluginImpl(String name, String version, String description, boolean active, boolean deleted, boolean machineOriented, boolean userOriented,
			boolean policyPlugin, boolean taskPlugin, boolean usesFileTransfer, boolean xBased) {
		// TODO Auto-generated constructor stub
		this.name = name;
		this.version = version;
		this.description = description;
		this.active = active;
		this.machineOriented = machineOriented;
		this.userOriented = userOriented;
		this.policyPlugin = policyPlugin;
		this.taskPlugin = taskPlugin;
		this.usesFileTransfer = usesFileTransfer;
		this.xBased = xBased;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	
	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	
	public List<ProfileImpl> getProfiles() {
		return profiles;
	}

	public void setProfiles(List<ProfileImpl> profiles) {
		this.profiles = profiles;
	}

	
	public boolean isActive() {
		return active;
	}

	
	public boolean isDeleted() {
		return deleted;
	}

	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	
	public boolean isMachineOriented() {
		return machineOriented;
	}

	public void setMachineOriented(boolean machineOriented) {
		this.machineOriented = machineOriented;
	}

	
	public boolean isUserOriented() {
		return userOriented;
	}

	public void setUserOriented(boolean userOriented) {
		this.userOriented = userOriented;
	}

	
	public boolean isPolicyPlugin() {
		return policyPlugin;
	}

	public void setPolicyPlugin(boolean policyPlugin) {
		this.policyPlugin = policyPlugin;
	}

	
	public boolean isxBased() {
		return xBased;
	}

	public void setxBased(boolean xBased) {
		this.xBased = xBased;
	}

//	public void addProfile(ProfileImpl profile) {
//		if (profiles == null) {
//			profiles = new ArrayList<ProfileImpl>();
//		}
//		ProfileImpl profImpl = null;
//		if (profile instanceof ProfileImpl) {
//			profImpl = (ProfileImpl) profile;
//		} else {
//			profImpl = new ProfileImpl(profile);
//		}
//		if (profImpl.getPlugin() != this) {
//			profImpl.setPlugin(this);
//		}
//		profiles.add(profImpl);
//	}

	
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

	
	public boolean isTaskPlugin() {
		return taskPlugin;
	}

	public void setTaskPlugin(boolean taskPlugin) {
		this.taskPlugin = taskPlugin;
	}

	
	public boolean isUsesFileTransfer() {
		return usesFileTransfer;
	}

	public void setUsesFileTransfer(boolean usesFileTransfer) {
		this.usesFileTransfer = usesFileTransfer;
	}

	
//	public String toString() {
//		return "PluginImpl [id=" + id + ", name=" + name + ", version=" + version + ", description=" + description
//				+ ", active=" + active + ", deleted=" + deleted + ", machineOriented=" + machineOriented
//				+ ", userOriented=" + userOriented + ", policyPlugin=" + policyPlugin + ", taskPlugin=" + taskPlugin
//				+ ", xBased=" + xBased + ", usesFileTransfer=" + usesFileTransfer + ", profiles=" + profiles
//				+ ", createDate=" + createDate + ", modifyDate=" + modifyDate + "]";
//	}

//	public List<MailAddressImpl> getMailAddresses() {
//		return mailAddresses;
//	}
//
//	public void setMailAddresses(List<MailAddressImpl> mailAddresses) {
//		this.mailAddresses = mailAddresses;
//	}
	
	public List<PluginTask> getPluginTaskList() {
		return pluginTaskList;
	}



	public void setPluginTaskList(List<PluginTask> pluginTaskList) {
		this.pluginTaskList = pluginTaskList;
	}


}
