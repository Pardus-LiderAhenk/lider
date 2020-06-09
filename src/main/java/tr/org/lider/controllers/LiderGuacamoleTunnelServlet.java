package tr.org.lider.controllers;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.coyote.Response;
import org.apache.guacamole.GuacamoleException;
import org.apache.guacamole.net.GuacamoleSocket;
import org.apache.guacamole.net.GuacamoleTunnel;
import org.apache.guacamole.net.InetGuacamoleSocket;
import org.apache.guacamole.net.SimpleGuacamoleTunnel;
import org.apache.guacamole.protocol.ConfiguredGuacamoleSocket;
import org.apache.guacamole.protocol.GuacamoleConfiguration;
import org.apache.guacamole.servlet.GuacamoleHTTPTunnelServlet;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Controller
public class LiderGuacamoleTunnelServlet extends GuacamoleHTTPTunnelServlet {
	
	private static String PROTOCOL="";
	private static String HOST="";
	private static String PORT="";
	private static String USERNAME="";
	private static String PASSWORD="";

    @Override
    protected GuacamoleTunnel doConnect(HttpServletRequest request)
         {
    	try {
        // Create our configuration
	    	if(PROTOCOL!="" && HOST!="" && PORT!="" && PASSWORD!="") {
		        GuacamoleConfiguration config = new GuacamoleConfiguration();
		        config.setProtocol(PROTOCOL);
		        if(PROTOCOL.equals("ssh")) {
		        	String host= HOST.trim();
		            config.setParameter("hostname", host);
		            config.setParameter("port", PORT);
		            config.setParameter("password", PASSWORD);
		            config.setParameter("username", USERNAME);
		        }
		        else if(PROTOCOL.equals("vnc")) {
		          config.setParameter("hostname", HOST);
		          config.setParameter("port", PORT);
		          config.setParameter("password", PASSWORD);
		        }
		        // Connect to guacd - everything is hard-coded here.
		        GuacamoleSocket socket;
				
					socket = new ConfiguredGuacamoleSocket(new InetGuacamoleSocket("localhost", 4822), config);
				
		        // Return a new tunnel which uses the connected socket
		        return new SimpleGuacamoleTunnel(socket);
		    	}
	    	else {
	    		return null;
    		}
    
    	} catch (GuacamoleException e) {
			e.printStackTrace();
			return null;
		}
    }
    
    @Override
    @RequestMapping(path = "tunnel", method = { RequestMethod.POST, RequestMethod.GET })
    protected void handleTunnelRequest(HttpServletRequest request,
            HttpServletResponse response) throws ServletException {
        super.handleTunnelRequest(request, response);
    }
    
    
    @RequestMapping(value = "/sendremote",method = {RequestMethod.POST})
	public  ResponseEntity<String> getRemote(
			@RequestParam(value="protocol") String protocol,
			@RequestParam(value="host") String host, 
			@RequestParam(value="port") String port,	
			@RequestParam(value="username") String username,	
			@RequestParam(value="password") String password ) {
		
    	LiderGuacamoleTunnelServlet.PROTOCOL=protocol;
    	LiderGuacamoleTunnelServlet.HOST=host;
		LiderGuacamoleTunnelServlet.PORT=port;
		LiderGuacamoleTunnelServlet.USERNAME=username;
		LiderGuacamoleTunnelServlet.PASSWORD=password;
		return new ResponseEntity<String>("OK",HttpStatus.OK);
	}
    @RequestMapping(value = "/remote",method = {RequestMethod.GET,RequestMethod.POST})
    public  String getRemote() {
    	return "guac";
    }
}
