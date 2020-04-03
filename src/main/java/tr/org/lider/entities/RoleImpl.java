package tr.org.lider.entities;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * This model will be used to for roles.
 * 
 * @author <a href="mailto:hasan.kara@pardus.org.tr">Hasan Kara</a>
 * 
 */
@Entity
@Table(name = "ROLE")
public class RoleImpl implements Serializable{

	private static final long serialVersionUID = -134642761371503448L;

	@Id
	@GeneratedValue
	@Column(name = "ROLE_ID", unique = true, nullable = false)
	private Long id;

	@Column(name = "NAME", nullable = false, unique = true)
	private String name;

    @ManyToMany
    private List<MenuImpl> menus = new ArrayList<>();
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATE_DATE", nullable = false)
	@CreationTimestamp
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss")
	private Date createDate;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "MODIFY_DATE")
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss")
	private Date modifyDate;

	public RoleImpl() {
	}

	public RoleImpl(String name, List<MenuImpl> menus) {
		this.name = name;
		this.menus = menus;
	}

	
	public RoleImpl(Long id, String name, List<MenuImpl> menus) {
		this.id = id;
		this.name = name;
		this.menus = menus;
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

	public List<MenuImpl> getMenus() {
		return menus;
	}

	public void setMenus(List<MenuImpl> menus) {
		this.menus = menus;
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

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

}
