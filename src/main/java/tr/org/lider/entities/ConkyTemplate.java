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
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


/**
 * Entity class for Conky template.
 * 
 */
@Entity
@Table(name = "P_CONKY_TEMPLATE")
@JsonIgnoreProperties(ignoreUnknown = true)
public class ConkyTemplate implements Serializable {

	private static final long serialVersionUID = 5867302652909954893L;

	@Id
	@GeneratedValue
	@Column(name = "ID", unique = true, nullable = false)
	private Long id;

	@Column(name = "LABEL", nullable = false, unique = true, length = 255)
	private String label;
	
	@Lob
	@Column(name = "CONTENTS", nullable = false)
	private String contents;
	
	@Lob
	@Column(name = "SETTINGS", nullable = false)
	private String settings;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATE_DATE", nullable = false, updatable = false)
	@CreationTimestamp
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss", timezone="Europe/Istanbul")
	private Date createDate;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "MODIFY_DATE")
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss", timezone="Europe/Istanbul")
	private Date modifyDate;

	public ConkyTemplate() {
	}

	public ConkyTemplate(String label, String contents, String settings, Date createDate, Date modifyDate) {
//		this.id = id;
		this.label = label;
		this.contents = contents;
		this.settings = settings;
		this.createDate = createDate;
		this.modifyDate = modifyDate;
	}

	public String getSettings() {
		return settings;
	}

	public void setSettings(String settings) {
		this.settings = settings;
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

	public String getContents() {
		return contents;
	}

	public void setContents(String contents) {
		this.contents = contents;
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

}

