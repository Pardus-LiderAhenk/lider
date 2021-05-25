package tr.org.lider.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.jcraft.jsch.Session;

import tr.org.lider.services.RemoteSshService;

/**
 * 
 * execute remote bashscripts on devices given IP
 * @author M. Edip YILDIZ
 *
 */
@RestController()
@RequestMapping("/remoteSsh")
public class RemoteSshController {
	
	private Integer SSH_CON_OK= 1;
	private Integer SSH_CON_FAIL= 0;
	
	@Autowired
	private RemoteSshService sshService;
	
	Logger logger = LoggerFactory.getLogger(RemoteSshService.class);
	
	@RequestMapping(method=RequestMethod.POST ,value = "/executeSshCommand")
	@ResponseBody
	public String executeSshCommand(
				@RequestParam(value="host") String host, 
				@RequestParam(value="username") String user,	
				@RequestParam(value="password") String password,
				@RequestParam(value="command") String command
				) {
			logger.info("Remote Ssh Connection to host {} user {} command {}", host, user, command);
	    	sshService.setHost(host);
	    	sshService.setUser(user);
	    	sshService.setPassword(password);
	    	try {
				 String result =sshService.executeCommand(command);
				 return result;
			} catch (Exception e) {
				e.printStackTrace();
				return e.getMessage();
			}
	}
	@RequestMapping(method=RequestMethod.POST ,value = "/checkSSHConnection")
	@ResponseBody
	public Integer checkSSHConnection(
			@RequestParam(value="host") String host, 
			@RequestParam(value="username") String user,	
			@RequestParam(value="password") String password
			) 
		{
		logger.info("Check Remote Ssh Connection to host {} user {} command {}", host, user);
		sshService.setHost(host);
		sshService.setUser(user);
		sshService.setPassword(password);
		try {
			Session session =sshService.getSession();
			if(session !=null) {
				return SSH_CON_OK;
			}
			else {
				return SSH_CON_FAIL;
			}
			
		} catch (Exception e) {
			e.printStackTrace();
			return SSH_CON_FAIL;
		}
	}
}
