package tr.org.lider.models;

import java.util.ArrayList;
import java.util.List;

//import tr.org.liderahenk.lider.ldap.IReportPrivilege;
//import tr.org.liderahenk.lider.ldap.ITaskPrivilege;

/**
 * Default implementation for {@link IUser}
 * 
 */
public class UserImpl {
	
	private String username;
	
	private String password;

	/**
	 * 
	 */
	private String name;

	/**
	 * 
	 */
	private String surname;

	/**
	 * 
	 */
	private String uid;

//	/**
//	 * Collection of task privileges. Each privilege indicates whether the user
//	 * can execute operation on the indicated LDAP entry or not.
//	 */
//	private List<ITaskPrivilege> taskPrivileges = new ArrayList<ITaskPrivilege>(0);
//
//	/**
//	 * Collection of report privileges. Each privilege indicates whether the
//	 * user can view/generate the indicated report or not.
//	 */
//	private List<IReportPrivilege> reportPrivileges = new ArrayList<IReportPrivilege>(0);

	
	public void setName(String name) {
		this.name = name;
	}

	public String getName() {
		return name;
	}

	
	public String getSurname() {
		return surname;
	}

	
	public void setSurname(String surname) {
		this.surname = surname;
	}

	
	public String getUid() {
		return uid;
	}

	public void setUid(String uid) {
		this.uid = uid;
	}

	
//	public List<ITaskPrivilege> getTaskPrivileges() {
//		return taskPrivileges;
//	}
//
//	public void setTaskPrivileges(List<ITaskPrivilege> taskPrivileges) {
//		this.taskPrivileges = taskPrivileges;
//	}
//
//	
//	public List<IReportPrivilege> getReportPrivileges() {
//		return reportPrivileges;
//	}
//
//	public void setReportPrivileges(List<IReportPrivilege> reportPrivileges) {
//		this.reportPrivileges = reportPrivileges;
//	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

}
