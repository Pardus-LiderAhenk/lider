package tr.org.lider.entities;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OrderBy;
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
	
	@Column(name = "value", nullable = false, unique = true)
	private String value;

	@OrderBy
	@Column(name = "ORDER_NUMBER")
	private int orderNumber;
	
//    @ManyToMany(fetch = FetchType.EAGER)
//    private List<MenuImpl> menus = new ArrayList<>();
	
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

	public RoleImpl(String name, String value, int orderNumber) {
		this.name = name;
		this.value = value;
		this.orderNumber = orderNumber;
	}
	
	public RoleImpl(Long id, String name, String value) {
		this.id = id;
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

	public int getOrderNumber() {
		return orderNumber;
	}

	public void setOrderNumber(int orderNumber) {
		this.orderNumber = orderNumber;
	}


}
