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
package tr.org.liderahenk.lider.persistence.entities;

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

import tr.org.liderahenk.lider.core.api.persistence.entities.IPolicy;
import tr.org.liderahenk.lider.core.api.persistence.entities.IProfile;

/**
 * Entity class for IPolicy objects.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 * @see tr.org.liderahenk.lider.core.api.persistence.entities.IPolicy
 *
 */
@Entity
@Table(name = "C_POLICY")
public class PolicyImpl implements IPolicy {

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
	@Column(name = "CREATE_DATE", nullable = false)
	private Date createDate;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "MODIFY_DATE")
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

	public PolicyImpl(IPolicy policy) {
		this.id = policy.getId();
		this.label = policy.getLabel();
		this.description = policy.getDescription();
		this.active = policy.isActive();
		this.deleted = policy.isDeleted();
		this.createDate = policy.getCreateDate();
		this.modifyDate = policy.getModifyDate();
		this.policyVersion = policy.getPolicyVersion();

		// Convert IProfile to ProfileImpl
		Set<? extends IProfile> tmpProfiles = policy.getProfiles();
		if (tmpProfiles != null) {
			for (IProfile tmpProfile : tmpProfiles) {
				addProfile(tmpProfile);
			}
		}

	}

	@Override
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	@Override
	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	@Override
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@Override
	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	@Override
	public boolean isDeleted() {
		return deleted;
	}

	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}

	@Override
	public Set<ProfileImpl> getProfiles() {
		return profiles;
	}

	public void setProfiles(Set<ProfileImpl> profiles) {
		this.profiles = profiles;
	}

	@Override
	public Date getCreateDate() {
		return createDate;
	}

	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}

	@Override
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

	@Override
	public void addProfile(IProfile profile) {
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

	@Override
	public String getPolicyVersion() {
		return policyVersion;
	}

	@Override
	public void setPolicyVersion(String policyVersion) {
		this.policyVersion = policyVersion;
	}

	
	@Override
	public String toString() {
		return "PolicyImpl [id=" + id + ", label=" + label + ", description=" + description + ", active=" + active
				+ ", deleted=" + deleted + ", profiles=" + profiles + ", createDate=" + createDate + ", modifyDate="
				+ modifyDate + ", policyVersion=" + policyVersion + "]";
	}

	@Override
	public void setcommandOwnerUid(String commandOwnerUid) {
		this.commandOwnerUid = commandOwnerUid;
		
	}

}
