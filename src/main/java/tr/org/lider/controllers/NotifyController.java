package tr.org.lider.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.entities.NotifyTemp;
import tr.org.lider.services.NotifyService;

/**
 * 
 * Return the Notify Template list, saved, edited and deleted notify for ETA
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
	public List<NotifyTemp> notifyList() {
		return notifyService.list();
	}

	@RequestMapping(method=RequestMethod.POST ,value = "/add", produces = MediaType.APPLICATION_JSON_VALUE)
	public NotifyTemp notifyAdd(@RequestBody NotifyTemp file){
		return notifyService.add(file);
	}
	
	@RequestMapping(method=RequestMethod.POST ,value = "/del", produces = MediaType.APPLICATION_JSON_VALUE)
	public NotifyTemp notifyDel(@RequestBody NotifyTemp file){
		return notifyService.del(file);
	}
	
	@RequestMapping(method=RequestMethod.POST ,value = "/update", produces = MediaType.APPLICATION_JSON_VALUE)
	public NotifyTemp notifyUpdate(@RequestBody NotifyTemp file){
		return notifyService.update(file);
	}
}
