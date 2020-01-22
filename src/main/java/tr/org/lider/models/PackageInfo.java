package tr.org.lider.models;

import java.io.Serializable;

public class PackageInfo implements Serializable {

	private static final long serialVersionUID = 5165756804600495682L;

	private String packageName;
	private String priority;
	private String section;
	private String installedSize;
	private String maintainer;
	private String architecture;
	private String source;
	private String version;
	private String depends;
	private String recommends;
	private String breaks;
	private String filename;
	private String size;
	private String md5Sum;
	private String sha1;
	private String sha256;
	private String description;
	private String tag;
	private String descriptionMd5;
	private String homepage;
	private String conflicts;
	private String suggests;
	private String multiArch;
	private String replaces;
	private String provides;
	private String preDepends;
	// Indicates whether the package is installed or not
	private boolean installed;
	// Desired status of the package (INSTALL, UNINSTALL or NA)
	private DesiredPackageStatus desiredStatus;

	public String getPackageName() {
		return packageName;
	}

	public void setPackageName(String packageName) {
		this.packageName = packageName;
	}

	public String getPriority() {
		return priority;
	}

	public void setPriority(String priority) {
		this.priority = priority;
	}

	public String getSection() {
		return section;
	}

	public void setSection(String section) {
		this.section = section;
	}

	public String getInstalledSize() {
		return installedSize;
	}

	public void setInstalledSize(String installedSize) {
		this.installedSize = installedSize;
	}

	public String getMaintainer() {
		return maintainer;
	}

	public void setMaintainer(String maintainer) {
		this.maintainer = maintainer;
	}

	public String getArchitecture() {
		return architecture;
	}

	public void setArchitecture(String architecture) {
		this.architecture = architecture;
	}

	public String getSource() {
		return source;
	}

	public void setSource(String source) {
		this.source = source;
	}

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public String getDepends() {
		return depends;
	}

	public void setDepends(String depends) {
		this.depends = depends;
	}

	public String getRecommends() {
		return recommends;
	}

	public void setRecommends(String recommends) {
		this.recommends = recommends;
	}

	public String getBreaks() {
		return breaks;
	}

	public void setBreaks(String breaks) {
		this.breaks = breaks;
	}

	public String getFilename() {
		return filename;
	}

	public void setFilename(String filename) {
		this.filename = filename;
	}

	public String getSize() {
		return size;
	}

	public void setSize(String size) {
		this.size = size;
	}

	public String getMd5Sum() {
		return md5Sum;
	}

	public void setMd5Sum(String md5Sum) {
		this.md5Sum = md5Sum;
	}

	public String getSha1() {
		return sha1;
	}

	public void setSha1(String sha1) {
		this.sha1 = sha1;
	}

	public String getSha256() {
		return sha256;
	}

	public void setSha256(String sha256) {
		this.sha256 = sha256;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getTag() {
		return tag;
	}

	public void setTag(String tag) {
		this.tag = tag;
	}

	public String getDescriptionMd5() {
		return descriptionMd5;
	}

	public void setDescriptionMd5(String descriptionMd5) {
		this.descriptionMd5 = descriptionMd5;
	}

	public String getHomepage() {
		return homepage;
	}

	public void setHomepage(String homepage) {
		this.homepage = homepage;
	}

	public String getConflicts() {
		return conflicts;
	}

	public void setConflicts(String conflicts) {
		this.conflicts = conflicts;
	}

	public String getSuggests() {
		return suggests;
	}

	public void setSuggests(String suggests) {
		this.suggests = suggests;
	}

	public String getMultiArch() {
		return multiArch;
	}

	public void setMultiArch(String multiArch) {
		this.multiArch = multiArch;
	}

	public String getReplaces() {
		return replaces;
	}

	public void setReplaces(String replaces) {
		this.replaces = replaces;
	}

	public String getProvides() {
		return provides;
	}

	public void setProvides(String provides) {
		this.provides = provides;
	}

	public String getPreDepends() {
		return preDepends;
	}

	public void setPreDepends(String preDepends) {
		this.preDepends = preDepends;
	}

	public boolean isInstalled() {
		return installed;
	}

	public void setInstalled(boolean installed) {
		this.installed = installed;
	}

	public DesiredPackageStatus getDesiredStatus() {
		return desiredStatus;
	}

	public void setDesiredStatus(DesiredPackageStatus desiredStatus) {
		this.desiredStatus = desiredStatus;
	}

	@Override
	public String toString() {
		return "PackageInfo [packageName=" + packageName + ", version=" + version + ", installed=" + installed
				+ ", desiredStatus=" + desiredStatus + "]";
	}

}