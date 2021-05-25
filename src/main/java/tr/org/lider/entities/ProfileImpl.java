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
import java.util.Date;
import java.util.Map;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;


/**
 * Entity class for IProfile objects.
 * 
 */
@JsonIgnoreProperties({ "profileDataBlob" })
@Entity
@Table(name = "C_PROFILE")
public class ProfileImpl  {

	private static final long serialVersionUID = -2350478758850736003L;

	@Id
	@GeneratedValue
	@Column(name = "PROFILE_ID", unique = true, nullable = false)
	private Long id;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "PLUGIN_ID", nullable = false)
	private PluginImpl plugin; // bidirectional

	@Column(name = "LABEL", nullable = false)
	private String label;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "OVERRIDABLE")
	private boolean overridable = true;

	@Column(name = "ACTIVE")
	private boolean active = true;

	@Column(name = "DELETED")
	private boolean deleted = false;

	@Lob
	@Column(name = "PROFILE_DATA")
	private byte[] profileDataBlob;

	@Transient
	private Map<String, Object> profileData;
	
	@Transient
	private String pluginName;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATE_DATE", nullable = false, updatable = false)
	@CreationTimestamp
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss", timezone="Europe/Istanbul")
	private Date createDate;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "MODIFY_DATE")
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss", timezone="Europe/Istanbul")
	private Date modifyDate;

	public ProfileImpl() {
	}

	public ProfileImpl(Long id, PluginImpl plugin, String label, String description, boolean overridable,
			boolean active, boolean deleted, Map<String, Object> profileData, Date createDate, Date modifyDate) {
		this.id = id;
		this.plugin = plugin;
		this.label = label;
		this.description = description;
		this.overridable = overridable;
		this.active = active;
		this.deleted = deleted;
		setProfileData(profileData);
		this.createDate = createDate;
		this.modifyDate = modifyDate;
	}
	
	public ProfileImpl(ProfileImpl profile) {
		this.id = profile.getId();
		this.label = profile.getLabel();
		this.description = profile.getDescription();
		this.overridable = profile.isOverridable();
		this.active = profile.isActive();
		this.deleted = profile.isDeleted();
		setProfileData(profile.getProfileData());
		this.createDate = profile.getCreateDate();
		this.modifyDate = profile.getModifyDate();
		if (profile.getPlugin() instanceof PluginImpl) {
			this.plugin = (PluginImpl) profile.getPlugin();
		}
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	
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

	
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	
	public boolean isOverridable() {
		return overridable;
	}

	public void setOverridable(boolean overridable) {
		this.overridable = overridable;
	}

	
	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	
	public boolean isDeleted() {
		return deleted;
	}

	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}
	
	
	public byte[] getProfileDataBlob() {
		if (profileDataBlob == null && profileData != null) {
			try {
				this.profileDataBlob = new ObjectMapper().writeValueAsBytes(profileData);
			} catch (JsonGenerationException e) {
				e.printStackTrace();
			} catch (JsonMappingException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return profileDataBlob;
	}

	public void setProfileDataBlob(byte[] profileDataBlob) {
		this.profileDataBlob = profileDataBlob;
		try {
			this.profileData = new ObjectMapper().readValue(profileDataBlob, new TypeReference<Map<String, Object>>() {
			});
		} catch (JsonParseException e) {
			e.printStackTrace();
		} catch (JsonMappingException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	public Map<String, Object> getProfileData() {
		if (profileData == null && profileDataBlob != null) {
			try {
				this.profileData = new ObjectMapper().readValue(profileDataBlob,
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
		return profileData;
	}

	public void setProfileData(Map<String, Object> profileData) {
		this.profileData = profileData;
		try {
			this.profileDataBlob = new ObjectMapper().writeValueAsBytes(profileData);
		} catch (JsonGenerationException e) {
			e.printStackTrace();
		} catch (JsonMappingException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public String getPluginName() {
		return pluginName;
	}

	public void setPluginName(String pluginName) {
		this.pluginName = pluginName;
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

	
	public String toString() {
		return "ProfileImpl [id=" + id + ", plugin=" + (plugin != null) + ", label=" + label + ", description="
				+ description + ", overridable=" + overridable + ", active=" + active + ", deleted=" + deleted
				+ ", profileData=" + profileData + ", createDate=" + createDate + ", modifyDate=" + modifyDate + "]";
	}

}
