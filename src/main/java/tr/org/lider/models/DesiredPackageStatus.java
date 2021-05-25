package tr.org.lider.models;

public enum DesiredPackageStatus {
	UNINSTALL, NA;

	/**
	 * Provide i18n message representation of the enum type.
	 * 
	 * @return
	 */
	public DesiredPackageStatus getMessage() {
		if (DesiredPackageStatus.UNINSTALL.toString() != null) {
			return UNINSTALL;		
		}
		else {
			return NA;
		}
	}

}