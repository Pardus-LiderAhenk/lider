package tr.org.lider;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.authentication.logout.SimpleUrlLogoutSuccessHandler;

import tr.org.lider.entities.OperationType;
import tr.org.lider.services.OperationLogService;

public class LiderLogoutSuccessHandler extends SecurityContextLogoutHandler  {
	
	@Autowired
	private OperationLogService operationLogService; 
//	@Override
//	public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
//			throws IOException, ServletException {
//		
//		if(authentication!=null) {
//			operationLogService.saveOperationLog(OperationType.LOGOUT,"Lider Arayüzden Çıkıldı.",null);
//		}
//        
//	}
	 @Override
	public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
		// TODO Auto-generated method stub
		 
			if(authentication!=null) {
			operationLogService.saveOperationLog(OperationType.LOGOUT,"Lider Arayüzden Çıkıldı.",null);
		}
		super.logout(request, response, authentication);
	}
	
}
