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

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * Entity class for IPolicy objects.
 * 
 */
@Entity
@Table(name = "C_POLICY")
public class PolicyImpl  {

	private static final long serialVersionUID = -4469386148365541028L;

	@Id
	@GeneratedValue
	@Column(name = "POLICY_ID", unique = true, nullable = false)
	private Long id;

	@Column(name = "LABEL", nullable = false)
	private String label;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "ACTIVE")
	private boolean active = true;

	@Column(name = "DELETED")
	private boolean deleted = false;

	@ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.MERGE)
	@JoinTable(name = "C_POLICY_PROFILE", joinColumns = {
			@JoinColumn(name = "POLICY_ID", nullable = false, updatable = false) }, inverseJoinColumns = {
					@JoinColumn(name = "PROFILE_ID", nullable = false, updatable = false) })
	private Set<ProfileImpl> profiles = new HashSet<ProfileImpl>(); // unidirectional

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATE_DATE", nullable = false, updatable = false)
	@CreationTimestamp
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss", timezone="Europe/Istanbul")
	private Date createDate;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "MODIFY_DATE")
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss", timezone="Europe/Istanbul")
	private Date modifyDate;

	@Column(name = "POLICY_VERSION")
	private String policyVersion;

	@Transient
	private String commandOwnerUid;
	
	public PolicyImpl() {
	}

	public PolicyImpl(Long id, String label, String description, boolean active, boolean deleted,
			Set<ProfileImpl> profiles, Date createDate, Date modifyDate, String policyVersion) {
		this.id = id;
		this.label = label;
		this.description = description;
		this.active = active;
		this.deleted = deleted;
		this.profiles = profiles;
		this.createDate = createDate;
		this.modifyDate = modifyDate;
		this.policyVersion = policyVersion;
	}

	public PolicyImpl(PolicyImpl policy) {
		this.id = policy.getId();
		this.label = policy.getLabel();
		this.description = policy.getDescription();
		this.active = policy.isActive();
		this.deleted = policy.isDeleted();
		this.createDate = policy.getCreateDate();
		this.modifyDate = policy.getModifyDate();
		this.policyVersion = policy.getPolicyVersion();

		// Convert IProfile to ProfileImpl
		Set<? extends ProfileImpl> tmpProfiles = policy.getProfiles();
		if (tmpProfiles != null) {
			for (ProfileImpl tmpProfile : tmpProfiles) {
				addProfile(tmpProfile);
			}
		}
	}
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	
	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
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

	
	public Set<ProfileImpl> getProfiles() {
		return profiles;
	}

	public void setProfiles(Set<ProfileImpl> profiles) {
		this.profiles = profiles;
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

	public String getCommandOwnerUid() {
		return commandOwnerUid;
	}

	public void setCommandOwnerUid(String commandOwnerUid) {
		this.commandOwnerUid = commandOwnerUid;
	}

	
	public void addProfile(ProfileImpl profile) {
		if (profiles == null) {
			profiles = new HashSet<ProfileImpl>();
		}
		ProfileImpl profileImpl = null;
		if (profile instanceof ProfileImpl) {
			profileImpl = (ProfileImpl) profile;
		} else {
			profileImpl = new ProfileImpl(profile);
		}
		profiles.add(profileImpl);
	}

	
	public String getPolicyVersion() {
		return policyVersion;
	}

	
	public void setPolicyVersion(String policyVersion) {
		this.policyVersion = policyVersion;
	}

	public String toString() {
		return "PolicyImpl [id=" + id + ", label=" + label + ", description=" + description + ", active=" + active
				+ ", deleted=" + deleted + ", profiles=" + profiles + ", createDate=" + createDate + ", modifyDate="
				+ modifyDate + ", policyVersion=" + policyVersion + "]";
	}
}
