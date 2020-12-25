package tr.org.lider.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.entities.OperationLogImpl;
import tr.org.lider.services.OperationLogService;

/**
 * 
 * Return the operation log reports
 * @author <a href="mailto:tuncay.colak@tubitak.gov.tr">Tuncay ÇOLAK</a>
 *
 */

@RestController
@RequestMapping("/log")
public class OperationLogController {

	@Autowired
	private OperationLogService logService;
	
//	lider interface usage history by logon console user
//	@Secured({"ROLE_ADMIN", "ROLE_COMPUTERS" })
	@RequestMapping(method=RequestMethod.POST, value = "/login")
	@ResponseBody
	public Page<OperationLogImpl> loginConsoleUserList(@RequestParam (value = "userId") String userId,
			@RequestParam (value = "pageSize") int pageSize,
			@RequestParam (value = "pageNumber") int pageNumber,
			@RequestParam (value = "operationType") String operationType) {
		return logService.getLoginLogsByLiderConsole(userId, pageNumber, pageSize, operationType);
	}
}