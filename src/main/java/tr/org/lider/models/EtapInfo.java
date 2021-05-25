package tr.org.lider.models;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


@JsonIgnoreProperties(ignoreUnknown = true)
public class EtapInfo implements Serializable{

	/**
	 * 
	 */
			
	private static final long serialVersionUID = 7316556153891922277L;

	private String request_type;
	private String mac_id;
	private String result="";
	private String city="";
	private String town="";
	private String school="";
	private String code="";
	private String cpu="";
	private String touch="";
	private String date="";
	
	public EtapInfo() {
		
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	

	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}

	public String getTown() {
		return town;
	}

	public void setTown(String town) {
		this.town = town;
	}

	public String getSchool() {
		return school;
	}

	public void setSchool(String school) {
		this.school = school;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getCpu() {
		return cpu;
	}

	public void setCpu(String cpu) {
		this.cpu = cpu;
	}

	public String getTouch() {
		return touch;
	}

	public void setTouch(String touch) {
		this.touch = touch;
	}

	public String getRequest_type() {
		return request_type;
	}

	public void setRequest_type(String request_type) {
		this.request_type = request_type;
	}

	public String getMac_id() {
		return mac_id;
	}

	public void setMac_id(String mac_id) {
		this.mac_id = mac_id;
	}

	public String getDate() {
		return date;
	}

	public void setDate(String date) {
		this.date = date;
	}



}
