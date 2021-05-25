package tr.org.lider.entities;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
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
@Table(name = "C_FORGOT_PASSWORD")
public class ForgotPasswordImpl implements Serializable{

	private static final long serialVersionUID = -4161109015743582012L;

	@Id
	@GeneratedValue
	@Column(name = "FORGOT_PASSWORD_ID", unique = true, nullable = false)
	private Long id;

	@Column(name = "USERNAME", nullable = false, unique = true)
	private String username;

	@Column(name = "RESET_UID")
	private String resetUID;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATE_DATE", nullable = false)
	@CreationTimestamp
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss")
	private Date createDate;

	public ForgotPasswordImpl() {
		super();
	}

	public ForgotPasswordImpl(Long id, String username, String resetUID, Date createDate) {
		super();
		this.id = id;
		this.username = username;
		this.resetUID = resetUID;
		this.createDate = createDate;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getResetUID() {
		return resetUID;
	}

	public void setResetUID(String resetUID) {
		this.resetUID = resetUID;
	}

	public Date getCreateDate() {
		return createDate;
	}

	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}

}
