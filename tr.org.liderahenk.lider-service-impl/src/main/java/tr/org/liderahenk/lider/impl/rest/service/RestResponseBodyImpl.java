package tr.org.liderahenk.lider.impl.rest.service;

import java.util.Map;

import org.codehaus.jackson.map.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import tr.org.liderahenk.lider.core.api.rest.IRestResponseBody;

/**
 * Default implementation for {@link IRestResponseBody}
 * 
 * @author <a href="mailto:birkan.duman@gmail.com">Birkan Duman</a>
 *
 */
public class RestResponseBodyImpl implements IRestResponseBody {

	/**
	 * 
	 */
	private static final long serialVersionUID = 3329435461350839639L;

	private static final Logger LOG = LoggerFactory.getLogger(RestResponseBodyImpl.class);

	private String pluginName;
	private String pluginVersion;
	private Map<String, Object> resultMap;
	private String requestId;
	private String[] tasks;

	/**
	 * 
	 */
	public RestResponseBodyImpl() {
		// TODO Auto-generated constructor stub
	}

	/**
	 * 
	 * @param pluginId
	 * @param pluginVersion
	 */
	public RestResponseBodyImpl(String pluginName, String pluginVersion) {
		this.pluginName = pluginName;
		this.pluginVersion = pluginVersion;
	}

	/**
	 * 
	 * @param pluginId
	 * @param pluginVersion
	 * @param resultMap
	 * @param tasks
	 */
	public RestResponseBodyImpl(String pluginName, String pluginVersion, Map<String, Object> resultMap,
			String[] tasks) {
		this(pluginName, pluginVersion);
		this.resultMap = resultMap;
		this.tasks = tasks;
	}

	@Override
	public String getPluginName() {
		return pluginName;
	}

	@Override
	public String getPluginVersion() {
		return pluginVersion;
	}

	@Override
	public Map<String, Object> getResultMap() {
		return resultMap;
	}

	@Override
	public String getRequestId() {
		return requestId;
	}

	public RestResponseBodyImpl fromJson(String json) {
		ObjectMapper mapper = new ObjectMapper();
		try {
			return mapper.readValue(json, RestResponseBodyImpl.class);
		} catch (Exception e) {
			LOG.error("", e);
		}
		return null;
	}

	public void setPluginName(String pluginName) {
		this.pluginName = pluginName;
	}

	public void setPluginVersion(String pluginVersion) {
		this.pluginVersion = pluginVersion;
	}

	@Override
	public String[] getTasks() {
		return tasks;
	}

	public void setTasks(String[] tasks) {
		this.tasks = tasks;
	}

}
