package tr.org.lider.entities;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * Entity class for config.
 * 
 */
@Entity
@Table(name = "C_CONFIG")
public class ConfigImpl implements Serializable{


	/**
	 * 
	 */
	private static final long serialVersionUID = -5257006869499426216L;

	@Id
	@GeneratedValue
	@Column(name = "CONFIG_ID", unique = true, nullable = false)
	private Long id;

	@Column(name = "NAME", nullable = false, unique = true)
	private String name;

	@Lob
	@Column(name = "VALUE")
	private String value;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATE_DATE", nullable = false)
	@CreationTimestamp
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss")
	private Date createDate;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "MODIFY_DATE")
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss")
	private Date modifyDate;

	public ConfigImpl() {
		super();
	}

	public ConfigImpl(String name, String value) {
		super();
		this.name = name;
		this.value = value;
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

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
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

	@Override
	public String toString() {
		return "ConfigImpl [id=" + id + ", name=" + name + ", value=" + value + ", createDate=" + createDate
				+ ", modifyDate=" + modifyDate + "]";
	}
}
