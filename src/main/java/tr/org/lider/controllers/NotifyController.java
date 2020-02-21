package tr.org.lider.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.entities.NotifyFile;
import tr.org.lider.services.NotifyService;

/**
 * 
 * Return the ETA-Notify list, saved, edited and deleted notify
 * @author <a href="mailto:tuncay.colak@tubitak.gov.tr">Tuncay ÇOLAK</a>
 *
 */
@RestController
@RequestMapping("/notify")
public class NotifyController {

	@Autowired
	private NotifyService notifyService;
	
//	get notify list
	@RequestMapping(method=RequestMethod.POST ,value = "/list", produces = MediaType.APPLICATION_JSON_VALUE)
	public List<NotifyFile> notifyList() {
		return notifyService.list();
	}

	@RequestMapping(method=RequestMethod.POST ,value = "/add", produces = MediaType.APPLICATION_JSON_VALUE)
	public NotifyFile notifyAdd(@RequestBody NotifyFile file){
		return notifyService.add(file);
	}
	
	@RequestMapping(method=RequestMethod.POST ,value = "/del", produces = MediaType.APPLICATION_JSON_VALUE)
	public NotifyFile notifyDel(@RequestBody NotifyFile file){
		return notifyService.del(file);
	}
	
	@RequestMapping(method=RequestMethod.POST ,value = "/update", produces = MediaType.APPLICATION_JSON_VALUE)
	public NotifyFile notifyUpdate(@RequestBody NotifyFile file){
		return notifyService.update(file);
	}
}
