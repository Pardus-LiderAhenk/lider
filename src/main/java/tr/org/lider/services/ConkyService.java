package tr.org.lider.services;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import javax.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.ConkyTemplate;
import tr.org.lider.entities.OperationType;
import tr.org.lider.repositories.ConkyRepository;

@Service
public class ConkyService {

	@Autowired
	private ConkyRepository conkyRepository;
	
	@Autowired
	private OperationLogService operationLogService;
	
	@PostConstruct
	private void init() {
		if (conkyRepository.count() == 0) {
			String label = "Bilgisayar Bilgisi";
			String contents = "Bilgisayar Adi: ${nodename}\n" + 
					"\n" + 
					"IP Adresi: ${addrs enp0s3} - ${addrs enp0s8}\n" + 
					"MAC Addresi: $color${execi 99999 cat /sys/class/net/enp0s3/address }";
			
			String settings = "# VARSAYILAN\n" + 
					"background yes\n" + 
					"own_window yes\n" + 
					"own_window_type normal\n" + 
					"own_window_class conky\n" + 
					"own_window_hints undecorated,skip_taskbar,skip_pager,sticky,below\n" + 
					"own_window_argb_visual yes\n" + 
					"own_window_transparent yes\n" + 
					"draw_shades no\n" + 
					"use_xft yes\n" + 
					"xftfont Monospace:size=10\n" + 
					"xftalpha 0.1\n" + 
					"alignment top_right\n" + 
					"TEXT\n" + 
					"${voffset 0}\n" + 
					"${font Ubuntu:style=Medium:pixelsize=35}${time %H:%M}${font}\n" + 
					"${voffset 0}\n" + 
					"${font Ubuntu:style=Medium:pixelsize=13}${time %A %d %B %Y}${font}\n" + 
					"${hr}${font Ubuntu:style=Medium:pixelsize=18}\n" + 
					"";
			conkyRepository.save(new ConkyTemplate(label, contents, settings, new Date(), null));
		}
	}

	public List<ConkyTemplate> list(){
		return conkyRepository.findAll();
	}

	public ConkyTemplate add(ConkyTemplate file) {
		ArrayList<String> conky = new ArrayList<String>();
		conky.add(file.getSettings());
		conky.add(file.getContents());
		ConkyTemplate conkyFile = conkyRepository.save(file);
		try {
			operationLogService.saveOperationLog(OperationType.CREATE, "Sistem Gözlemcisi Tanımı oluşturuldu.", conky.toString().getBytes());
		} catch (Exception e) {
			e.printStackTrace();
		}
		return conkyFile;
	}

	public ConkyTemplate del(ConkyTemplate file) {
		ConkyTemplate existFile = conkyRepository.findOne(file.getId());
		ArrayList<String> conky = new ArrayList<String>();
		conky.add(existFile.getSettings());
		conky.add(existFile.getContents());
		conkyRepository.deleteById(file.getId());
		try {
			operationLogService.saveOperationLog(OperationType.DELETE, "Sistem Gözlemcisi Tanımı silindi.", conky.toString().getBytes());
		} catch (Exception e) {
			e.printStackTrace();
		}
		return file;
	}
	
	public ConkyTemplate update(ConkyTemplate file) {
		file.setModifyDate(new Date());
		ArrayList<String> conky = new ArrayList<String>();
		conky.add(file.getSettings());
		conky.add(file.getContents());
		ConkyTemplate conkyFile = conkyRepository.save(file);
		try {
			operationLogService.saveOperationLog(OperationType.UPDATE, "Sistem Gözlemcisi Tanımı güncellendi.", conky.toString().getBytes());
		} catch (Exception e) {
			e.printStackTrace();
		}
		return conkyFile;
	}
}