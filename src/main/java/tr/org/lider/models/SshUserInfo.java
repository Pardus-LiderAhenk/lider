package tr.org.lider.models;

import com.jcraft.jsch.UserInfo;

public class SshUserInfo implements UserInfo {
	private String passPhrase;
	private String password;
	
	public SshUserInfo() {
		// TODO Auto-generated constructor stub
	}

	public SshUserInfo(String passPhrase, String password) {
		this.passPhrase= passPhrase;
		this.password= password;
	}
	

	@Override
	public String getPassphrase() {
		return passPhrase;
	}

	@Override
	public String getPassword() {
		
		return password;
	}

	@Override
	public boolean promptPassword(String message) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean promptPassphrase(String message) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean promptYesNo(String message) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public void showMessage(String message) {
		// TODO Auto-generated method stub
	}

}
