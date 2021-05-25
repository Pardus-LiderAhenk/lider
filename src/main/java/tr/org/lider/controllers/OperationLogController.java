package tr.org.lider.controllers;

import java.util.Date;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.entities.CommandExecutionResultImpl;
import tr.org.lider.entities.OperationLogImpl;
import tr.org.lider.entities.OperationType;
import tr.org.lider.services.OperationLogService;

/**
 * 
 * Return the operation log reports
 * @author <a href="mailto:tuncay.colak@tubitak.gov.tr">Tuncay ÇOLAK</a>
 *
 */

@RestController
@RequestMapping("/operation")
public class OperationLogController {

	@Autowired
	private OperationLogService logService;
	
//	lider interface usage history by login console user
	@RequestMapping(method=RequestMethod.POST, value = "/login")
	@ResponseBody
	public Page<OperationLogImpl> loginConsoleUserList(@RequestParam (value = "userId") String userId,
			@RequestParam (value = "pageSize") int pageSize,
			@RequestParam (value = "pageNumber") int pageNumber,
			@RequestParam (value = "operationType") String operationType) {
		return logService.getLoginLogsByLiderConsole(userId, pageNumber, pageSize, operationType);
	}
	
	@RequestMapping(method=RequestMethod.POST, value = "/types")
	@ResponseBody
	public OperationType[] getOperationType() {
		return OperationType.values();
	}
	
//	lider interface usage history by login console user
	@Secured({"ROLE_ADMIN", "ROLE_OPERATION_LOG"})
	@RequestMapping(method=RequestMethod.POST, value = "/logs")
	@ResponseBody
	public Page<OperationLogImpl> operationLogs(@RequestParam (value = "pageNumber") int pageNumber,
			@RequestParam (value = "pageSize") int pageSize,
			@RequestParam (value = "operationType") String operationType,
			@RequestParam (value = "field") String field,
			@RequestParam (value = "searchText") String searchText,
			@RequestParam (value="startDate") @DateTimeFormat(pattern="dd/MM/yyyy HH:mm:ss") Optional<Date> startDate,
			@RequestParam (value="endDate") @DateTimeFormat(pattern="dd/MM/yyyy HH:mm:ss") Optional<Date> endDate) {
		return logService.getOperationLogsByFilter(pageNumber, pageSize, operationType, field, searchText, startDate, endDate);
	}
	
//	lider interface usage history by login console user
	@Secured({"ROLE_ADMIN", "ROLE_OPERATION_LOG"})
	@RequestMapping(method=RequestMethod.POST, value = "/selectedLog")
	@ResponseBody
	public OperationLogImpl selectedOpertaionLog(@RequestParam (value = "id") Long id ) {
		OperationLogImpl log =  logService.getSelectedLogById(id);
		if(log.getRequestData() != null)
			log.setRequestDataStr(new String(log.getRequestData()));
		return logService.getSelectedLogById(id);
	}
	
}