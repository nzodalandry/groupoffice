go.modules.business.newsletters.SystemSettingsPanel = Ext.extend(Ext.Panel, {
	itemId: "newsletters", //will make it routable.
	iconCls: 'ic-email',
	title: t("Newsletters"),
	initComponent: function () {

		this.items = [
			this.smtpAccountGrid = new go.smtp.GridPanel({
				module: {package: "business", name: "newsletters"}
			})
		];
		
		go.modules.business.newsletters.SystemSettingsPanel.superclass.initComponent.call(this);
	}
});
