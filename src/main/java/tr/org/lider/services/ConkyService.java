package tr.org.lider.services;

import java.util.Date;
import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.ConkyTemplate;
import tr.org.lider.repositories.ConkyRepository;

@Service
public class ConkyService {

	@Autowired
	private ConkyRepository conkyRepository;
	
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
		return conkyRepository.save(file);
	}

	public ConkyTemplate del(ConkyTemplate file) {
		conkyRepository.deleteById(file.getId());
		return file;
	}
	
	public ConkyTemplate update(ConkyTemplate file) {
		file.setModifyDate(new Date());
		return conkyRepository.save(file);
	}
}