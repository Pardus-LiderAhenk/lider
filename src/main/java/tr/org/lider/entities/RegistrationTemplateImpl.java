package tr.org.lider.entities;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * Entity class for registration template 
 * 
 * @author <a href="mailto:hasan.kara@pardus.org.tr">Hasan Kara</a>
 *
 */

@Entity
@Table(name = "C_registration_template")
public class RegistrationTemplateImpl implements Serializable{
	
	private static final long serialVersionUID = -241241606291513291L;
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "registration_template_id", unique = true, nullable = false)
	private Long id;

	@Column(name = "unit_id")
	private String unitId;

	@Column(name = "auth_group")
	private String authGroup;

	@Column(name = "parent_dn")
	private String parentDn;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "create_date", nullable = false)
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss")
	@CreationTimestamp
	private Date createDate;

	public RegistrationTemplateImpl() {
	}

	public RegistrationTemplateImpl(Long id, String unitId, String authGroup, String parentDn, Date createDate) {
		this.id = id;
		this.unitId = unitId;
		this.authGroup = authGroup;
		this.parentDn = parentDn;
		this.createDate = createDate;
	}

	public RegistrationTemplateImpl(String unitId, String authGroup, String parentDn) {
		super();
		this.unitId = unitId;
		this.authGroup = authGroup;
		this.parentDn = parentDn;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUnitId() {
		return unitId;
	}

	public void setUnitId(String unitId) {
		this.unitId = unitId;
	}

	public String getAuthGroup() {
		return authGroup;
	}

	public void setAuthGroup(String authGroup) {
		this.authGroup = authGroup;
	}

	public String getParentDn() {
		return parentDn;
	}

	public void setParentDn(String parentDn) {
		this.parentDn = parentDn;
	}

	public Date getCreateDate() {
		return createDate;
	}

	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}

	@Override
	public String toString() {
		return "RegistrationTemplateImpl [id=" + id + ", unitId=" + unitId + ", authGroup=" + authGroup + ", parentDn="
				+ parentDn + ", createDate=" + createDate + "]";
	}
	
}
