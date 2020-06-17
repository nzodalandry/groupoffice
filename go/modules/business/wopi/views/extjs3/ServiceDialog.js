/* global go */

go.modules.business.wopi.ServiceDialog = Ext.extend(go.form.Dialog, {
	title: t('Service'),
	entityStore: "WopiService",
	width: dp(1000),
	height: dp(800),
	formPanelLayout: "fit",
	resizable: true,
	maximizable: true,
	collapsible: true,
	modal: false,

	initComponent: function() {
		go.modules.business.wopi.ServiceDialog.superclass.initComponent.call(this);

		this.formPanel.on("beforesubmiterror", function(form, success, id, error) {			
			if(error.validationErrors.type) {
				Ext.MessageBox.alert(t("Error"), t("You can only add one service of the same type"));
				return false; //return false to cancel default error message
			}
		}, this);
	},

	initFormItems: function () {

		this.addPanel(new go.permissions.SharePanel());

		return [{
			xtype: 'fieldset',
			layout: "border",
			items: [{
				region: "center",
				xtype: "panel",
				layout: "form",
				defaults: {
					anchor: '100%'
				},
				items: [{
					xtype: 'textfield',
					name: 'url',
					fieldLabel: t("URL"),
					allowBlank: false
				},
				{
					xtype: 'textfield',
					name: 'name',
					fieldLabel: t("Name"),
					allowBlank: false
				}
				]
			}]
		}
		];
	}
});


