package tr.org.lider.entities;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.CascadeType;
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
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * This model will be used to add pages to roles. This model will be static and values will be assigned in controller
 * 
 * @author <a href="mailto:hasan.kara@pardus.org.tr">Hasan Kara</a>
 * 
 */
@Entity
@Table(name = "MENU")
//@JsonIgnoreProperties({"roles"})
public class MenuImpl implements Serializable{

	private static final long serialVersionUID = -7792162854334518089L;

	@Id
	@GeneratedValue
	@Column(name = "MENU_ID", unique = true, nullable = false)
	private Long id;
	
	//name to show to lider console user ex: Istemci Yonetimi
	@Column(name = "MENU_NAME")
	private String menuName;
	
	//name for page name used in html ex: computers
	@Column(name = "MENU_PAGE_NAME", unique = true, nullable = false)
	private String menuPageName;
	
	//name for page name used in html ex: computers
	@Column(name = "PARENT_MENU_PAGE_NAME")
	private String parentMenuPageName;
	
	@JsonIgnore
    @ManyToMany(mappedBy = "menus",cascade = CascadeType.ALL)
    private List<RoleImpl> roles = new ArrayList<>();;
    
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATE_DATE", nullable = false)
	@CreationTimestamp
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss")
	private Date createDate;

    
	public MenuImpl() {
	}
	
	public MenuImpl(String menuName, String menuPageName, String parentMenuPageName) {
		this.menuName = menuName;
		this.menuPageName = menuPageName;
		this.parentMenuPageName = parentMenuPageName;
	}
	
	public MenuImpl(Long id, String menuName, String menuPageName, String parentMenuPageName) {
		this.id = id;
		this.menuName = menuName;
		this.menuPageName = menuPageName;
		this.parentMenuPageName = parentMenuPageName;
	}

	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}

	public String getMenuName() {
		return menuName;
	}

	public void setMenuName(String menuName) {
		this.menuName = menuName;
	}

	public String getMenuPageName() {
		return menuPageName;
	}

	public void setMenuPageName(String menuPageName) {
		this.menuPageName = menuPageName;
	}

	public String getParentMenuPageName() {
		return parentMenuPageName;
	}

	public void setParentMenuPageName(String parentMenuPageName) {
		this.parentMenuPageName = parentMenuPageName;
	}

	public Date getCreateDate() {
		return createDate;
	}

	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}
	
}
