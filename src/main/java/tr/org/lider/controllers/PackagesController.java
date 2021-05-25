package tr.org.lider.controllers;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.messaging.enums.DomainType;
import tr.org.lider.models.ConfigParams;
import tr.org.lider.models.PackageInfo;
import tr.org.lider.plugins.RepoSourcesListParser;
import tr.org.lider.services.ConfigurationService;

/**
 * 
 * Return package list from the specified Linux package repository
 * @author <a href="mailto:tuncay.colak@tubitak.gov.tr">Tuncay ÇOLAK</a>
 *
 */

@RestController
@RequestMapping("/packages")
public class PackagesController {

	@Autowired
	ConfigurationService configurationService;

	@RequestMapping(method=RequestMethod.POST ,value = "/list", produces = MediaType.APPLICATION_JSON_VALUE)
	public List<PackageInfo> getPackageList(@RequestParam(value="type") String type,
			@RequestParam(value="url") String url,
			@RequestParam(value="component") String component) {

		List<PackageInfo> resultSet = new ArrayList<PackageInfo>();

		List<PackageInfo> items = RepoSourcesListParser.parseURL(url.trim(), component.split(" ")[0],
				Arrays.copyOfRange(component.split(" "), 1, component.split(" ").length), "amd64",
				type);
		if (items != null && !items.isEmpty())
			resultSet.addAll(items);
		return resultSet;
	}

	@RequestMapping(method=RequestMethod.POST, value = "/update/repoAddress", produces = MediaType.APPLICATION_JSON_VALUE)
	public ConfigParams updateRepoAddrSettings(@RequestParam (value = "pardusRepoAddress", required = true) String pardusRepoAddress,
			@RequestParam (value = "pardusRepoComponent", required = true) String pardusRepoComponent) {
		ConfigParams configParams = configurationService.getConfigParams();
		configParams.setPardusRepoAddress(pardusRepoAddress);
		configParams.setPardusRepoComponent(pardusRepoComponent);
		return configurationService.updateConfigParams(configParams);
	}
}
