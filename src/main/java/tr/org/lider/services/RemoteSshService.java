package tr.org.lider.services;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.jcraft.jsch.Channel;
import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;


@Service
public class RemoteSshService {

	Logger logger = LoggerFactory.getLogger(RemoteSshService.class);
	
	private String host;
	private String user;
	private String password;
	
	public RemoteSshService() {
		// TODO Auto-generated constructor stub
	}
	
	public RemoteSshService(String host, String user, String password) {
		super();
		this.host = host;
		this.user = user;
		this.password = password;
	}

	public Session getSession() {
		try {
			java.util.Properties config = new java.util.Properties();
			config.put("StrictHostKeyChecking", "no");
			JSch jsch = new JSch();
			Session session = jsch.getSession(user, host, 22);
			session.setPassword(password);
			session.setConfig(config);
			session.connect();
			
			return session;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}
	
	public void releaseSession(Channel channel,Session session) {
		try {
			if(channel!=null)
			channel.disconnect();
			if(session!=null)
			session.disconnect();
			logger.info("Remote Ssh session closed");
		} catch (Exception e) {
			e.printStackTrace();
			logger.error(e.getMessage(), e);
		}
	}
	
	public String executeCommand(String command) throws Exception {
		logger.info("Remote Ssh execution command {}", command);
		Session session=getSession();
		
		if(session==null) {
			return getHost()+ " Sunucuya Erişilirken Hata oluştu..Lütfen Sunucu Ip veya SSH erişimini kontrol ediniz.. " ;
		}
		
		Channel channel = null;
		String commandResult="";
		
		try {
			channel = session.openChannel("exec");
			
			((ChannelExec) channel).setCommand("sudo -S -p '' " + command);
			channel.setInputStream(null);
			OutputStream out = channel.getOutputStream();
			((ChannelExec) channel).setErrStream(System.err);

			InputStream in = channel.getInputStream();
			((ChannelExec) channel).setPty(true);
			channel.connect();
			out.write((password + "\n").getBytes());
	        out.flush();
			byte[] tmp = new byte[1024];
			while (true) {
				while (in.available() > 0) {
					int i = in.read(tmp, 0, 1024);
					if (i < 0)
						break;
					commandResult += new String(tmp, 0, i);
				}
				if (channel.isClosed()) {
					commandResult += channel.getExitStatus();
					break;
				}
				try {
					Thread.sleep(1000);
				} catch (Exception ee) {
				}
			}
		} catch (JSchException | IOException e) {
			logger.error(e.getMessage(), e);
			e.printStackTrace();
			throw new Exception(e.getMessage());
			
		}
		finally {
			releaseSession(channel,session);
		}
		logger.info("Remote Ssh execution command result {}", commandResult);
		return commandResult;
	}

	public String getHost() {
		return host;
	}

	public void setHost(String host) {
		this.host = host;
	}

	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
}
