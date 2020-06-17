Ext.define('GO.timeregistration2.ColumnView',{
	extend: Ext.Panel,
	initComponent: function() {

		// this.tbar = [{
		// 	xtype:'buttongroup',
		// 	items: [{text:'Workweek'},{text:'Week'}]
		// }, {
		// 	xtype:'buttongroup',
		// 	items: [{iconCls:'ic-keyboard-arrow-left'}, {text:'Feb 17 - Feb 23'},{iconCls:'ic-keyboard-arrow-right'}]
		// },'->',new go.modules.business.business.EmployeeCombo()
		// ];

		this.exportMenu = new GO.base.ExportMenuItem({className:'GO\\Timeregistration2\\Export\\CurrentGrid'});

		this.printButton = new Ext.menu.Item({
			iconCls: 'ic-print',
			text: t("Print"),
			overflowText: t("Print"),
			scope: this
		});

		if(go.Modules.isAvailable("legacy", "leavedays")){
			this.addLeavedayButton = new Ext.Button({
				text: t("Add holiday", "leavedays"),
				iconCls: 'ic-add',
				handler: function(){
					GO.mainLayout.openModule('leavedays');
					GO.leavedays.showLeavedayDialog();
				},
				scope: this
			});
		}

		GO.projects2.timerButton = new GO.projects2.TimerButton({
			startTime: GO.projects2.timerStartTime,
			listeners:{
				scope:this,
				beforestoptimer:function(btn){
					return confirm(t("Are you sure you like to stop the timer?", "timeregistration2"));
				}
			}
		});

		this.tbar = [
			this.periodTotal = new Ext.Toolbar.Item({html:t('Total')}),'->',
			this.weekIsClosedField = new go.toolbar.TitleItem({
				text: t("This week is closed", "timeregistration2"),
				hidden: true
			}),
			this.addLeavedayButton || '',
			GO.projects2.timerButton,
			{
				iconCls: 'ic-more-vert',
				menu: [
					this.closeButton = new Ext.menu.Item({ //see setTimeSpan for handler
						text: t("Close week", "timeregistration2"),
						iconCls: 'ic-lock',
						scope: this
					}),
					this.copyWeekButton = new Ext.menu.Item({ //see setTimeSpan for handler
						text: t("Copy to next week", "timeregistration2"),
						iconCls: 'ic-redo',
						scope: this
					}),
					'-',
					this.exportMenu,
					this.printButton
				]}
		];

		this.store = new GO.data.JsonStore({
			url: GO.url('timeregistration2/timeEntry/store'),
			baseParams: {year:2020, week:'3'},
			sortInfo: {field: 'date', direction: "ASC"},
			fields: ['id','units', 'start_time', 'end_time', 'date', 'comments', 'project_name', 'standard_task','task', 'status','status_id', 'day','travel_distance','duration'],
			remoteSort:true
		});

		this.layout = 'fit';
		this.autoScroll = true;
		this.items = [this.view = new Ext.Container({
			autoEl: 'table',
			autoWidth: true,
			autoHeight: true,
			cls: 'tt-weekview card',
			defaults: {xtype:'container'}
		})];

		this.store.on('load', function(store, records) {
			this._weekIsClosed = store.reader.jsonData['is_closed_week'];
			this.closeButton.setDisabled(this._weekIsClosed);
			this.closeButton.setVisible(!this._weekIsClosed);
			if (this.addLeavedayButton) {
				this.addLeavedayButton.setDisabled(this._weekIsClosed);
				this.addLeavedayButton.setVisible(!this._weekIsClosed);
			}
			this.weekIsClosedField.setVisible(this._weekIsClosed);
			this.drawView(this.day, records);
		},this);

		this.callParent();

		// todo: tooltip dialog for time entry
		// new Ext.ToolTip({
		// 	title: '<a href="#">Rich Content Tooltip</a>',
		// 	id: 'content-anchor-tip',
		// 	target: 'newTr',
		// 	anchor: 'left',
		// 	html: 'un built zooi',
		// 	width: 415,
		// 	autoHide: false,
		// 	closable: true,
		// 	//contentEl: 'content-tip', // load content from the page
		// 	listeners: {
		// 		'render': function(){
		// 			this.header.on('click', function(e){
		// 				e.stopEvent();
		// 				Ext.Msg.alert('Link', 'Link to something interesting.');
		// 				Ext.getCmp('content-anchor-tip').hide();
		// 			}, this, {delegate:'a'});
		// 		}
		// 	}
		// });
	},

	drawView: function(curr, timeEntries) {
		this.view.removeAll();
		var now = new Date(),
			dateFormat = function(time) {
				return Date.parseDate(time.date.substring(0,10), go.User.dateFormat).format('Ymd');
			},
			dayComponents = [], i = 0,
			headerComponents = [],
			periodTotal = 0,
			lastEndTimes = {};

		for(var d = 0 ; d < this.dayCount; d++)
		{

			var entryComponents = [],
				time = timeEntries[i];
			while(time && dateFormat(time.data) < curr.format('Ymd')) {
				time = timeEntries[++i]; // next
			}
			var totalTime = 0;
			while(time && dateFormat(time.data) == curr.format('Ymd')) {
				var cls = [], startEnd='', ico ='';
				if(time.data.status_id == 2){
					cls.push('disapproved');
					ico = '<i class="icon">warning</i>';
				}
				if(time.data.status_id == 0){
					cls.push('open');
				}
				if(time.data.start_time) {
					startEnd = time.data.start_time + ' - ' + time.data.end_time;
				}
				entryComponents.push({
					xtype:'box',
					entryData: time,
					cls:cls.join(' '),
					height: (Math.max(60,time.data.duration) / 60) * 66 - 7, // 66 - 7px margin bottom
					listeners: {render: function(me){
						me.getEl()
							.on('dblclick', function() {
								this.showEditDialog(me.entryData.data.id,{},me.entryData);
							},this)
							.on('contextmenu', function(event) {
								this.showContextMenu(event, [me.entryData.data.id], [me.entryData]);
							},this);
					},scope:this},
					html: '<p>'+ (time.data.duration >= 70 ? time.data.comments+ (time.data.comments?'<br>' :'') : '')+
						'<span>'+ico+time.data.project_name+'</span></p><sub>'+time.data.units+'<em>'+startEnd+'</em></sub>'
				});
				totalTime += time.data.duration;

				lastEndTimes[dateFormat(time.data)] = Date.parseDate(time.data.date.split(" ")[0] + " " + time.data.end_time, go.User.dateTimeFormat).format("U");
				time = timeEntries[++i];


			}
			var today = curr.format('Ymd') == now.format('Ymd');
			var clz = [];
			if(today) {clz.push('today')}
			if(curr.format('N') > 5) { clz.push('weekend', 'go-head-tb');} // saturday or sunday
			dayComponents.push({
				autoEl: 'td',
				xtype:'container',
				cls: clz.join(' '),
				items: [{xtype:'container',items:entryComponents}]
			});

			var date = today ? '<b>'+t('Today')+'</b>' : curr.format("D j");
			headerComponents.push({
				autoEl: 'th',
				xtype:'container',
				layout:'toolbar',
				cls: clz.join(' '),
				items: [{xtype:'box',html: date + ' <br><b>'+go.util.Format.duration(totalTime)+'</b>'},{xtype:'tbfill'}, {
					xtype: 'button',
					iconCls: 'ic-add',
					hidden: this._weekIsClosed,
					day: (+curr) / 1000,
					tooltip: t("Add Time", "timeregistration2"),
					handler: function (btn) {
						var start_time = btn.day
						var index = Date.parseDate(start_time, 'U').format("Ymd");
						if(lastEndTimes[index]) {
							 start_time = lastEndTimes[index];
						}

						this.showEditDialog(0, {loadParams: {start_time: start_time}}, {});
					},
					scope: this
				}]
			});
			periodTotal += totalTime;
			curr = curr.add(Date.DAY,1);
		}

		this.periodTotal.update(t('Total')+': '+go.util.Format.duration(periodTotal))

		this.view.add([
			{autoEl: 'tr', items: headerComponents},
			{autoEl: 'tr', items: dayComponents}
		]);

		this.doLayout();
	},

	loadEntries : function(timespan, key, yearnb) {

		this.setTimeSpan(timespan);
		if(timespan === 'week') {
			this.day = new Date(yearnb, 0, (1 + (key - 1) * 7));
			var firstDay = this.day.getDate() - this.day.getDay() + go.User.firstWeekday;
			this.day.setDate(firstDay);
			this.dayCount = 7;
		} else {
			this.day = new Date(yearnb, key-1, 1);
			nextmonth = this.day.add(Date.MONTH,1);
			nextmonth.setDate(0);
			this.dayCount = nextmonth.getDate();
		}


		this.store.baseParams = {'year': yearnb};
		this.store.baseParams[timespan] = key;
		this.store.reload();
	},

	showContextMenu: function(event,ids, records) {

		var contextMenu = new Ext.menu.Menu({
			items: [{
				text: t("Approve", "timeregistration2"),
				iconCls: 'ic-thumb-up',
				hidden: !GO.settings.modules.timeregistration2.write_permission,
				handler: function() {
					GO.request({
						params:{ids: ids},
						url:"timeregistration2/timeEntry/approve",
						success: function(response, options, result){
							this.store.reload();
						},
						scope:this
					});
				},scope:this
			}, {
				text: t("Disapprove", "timeregistration2"),
				iconCls: 'ic-thumb-down',
				hidden: !GO.settings.modules.timeregistration2.write_permission,
				handler: function() {
					GO.request({
						params:{ids: ids},
						url:"timeregistration2/timeEntry/disapprove",
						success: function(response, options, result){
							this.store.reload();
						},
						scope:this
					});
				},scope:this
			},{
				xtype:'menuseparator',
				hidden: !GO.settings.modules.timeregistration2.write_permission
			},{
				text: t("Copy")+'&hellip;',
				iconCls: 'ic-content-copy',
				handler: function() {
					var firstRec = records[0];
					var date = Date.parseDate(firstRec.data.date, go.User.dateTimeFormat);

					var copyEntryDialog = new GO.timeregistration2.CopyEntryDialog();
					copyEntryDialog.timeEntryGridStore = this.store;
					copyEntryDialog.selectedIds = ids;
					copyEntryDialog.show();
					copyEntryDialog.datePicker.setValue(date);
				},scope:this
			},'-',this.deleteButton = new Ext.menu.Item({
				text: t('Delete'),
				iconCls: 'ic-delete',
				handler: function() {
					GO.deleteItems({
						store:this.store,
						params: {delete_keys: Ext.encode(ids) },
						count: ids.length
					});
				},scope:this
			})],
			scope: this
		});


		this.deleteButton.setDisabled(this._weekIsClosed);

		event.stopEvent();
		contextMenu.showAt(event.xy);

	},

	setTimeSpan : function(timespan) {
		if(timespan === 'week') {
			this.closeButton.setHandler(function(){
				GO.request({
					params:{
						year: this.store.baseParams['year'] ,
						week : this.store.baseParams['week']
					},
					url:"timeregistration2/week/close",
					success: function(response, options, result){
						this.store.reload();
						this.mainPanel.weekGrid.store.reload();
						alert(t("All time entries in the current week are closed", "timeregistration2"));
					},
					scope:this
				});
			},this);

			this.copyWeekButton.setHandler(function(){
				GO.request({
					params:{
						year: this.store.baseParams['year'] ,
						week : this.store.baseParams['week']
					},
					url:"timeregistration2/week/copyweek",
					success: function(response, options, result){
						// this.store.reload();
						// this.mainPanel.weekGrid.store.reload();
						if(result.success) {
							Ext.Msg.alert(t("Success"), t("Week has been copied", "timeregistration2"));
						} else {
							Ext.Msg.alert(t("Failure"), t("Week could not be copied", "timeregistration2"));
						}

					},
					scope:this
				});
			},this);

			this.printButton.setHandler(function(){
				window.open(GO.url('timeregistration2/week/print', {
					week: this.store.baseParams['week'],
					year: this.store.baseParams['year']
				}));
			},this);
		} else { // timespan = month
			this.copyWeekButton.setVisible(false);
			this.closeButton.setText(t("Close month", "timeregistration2"));
			this.closeButton.setHandler(function () {
				GO.request({
					params: {
						year: this.store.baseParams['year'],
						month: this.store.baseParams['month']
					},
					url: "timeregistration2/month/close",
					success: function (response, options, result) {
						this.store.reload();
						alert(t("All time entries in the current month are closed", "timeregistration2"));
					},
					scope: this
				});
			}, this);

			this.printButton.setHandler(function () {
				window.open(GO.url('timeregistration2/month/print', {
					'month': this.store.baseParams['month'],
					'year': this.store.baseParams['year']
				}));
			}, this);
		}
	},

	showEditDialog : function(id, config, record){
		if (!this._weekIsClosed || record.data.status_id==2) {
			if(!this.editDialog){
				this.editDialog = new GO.projects2.TimeEntryDialog();
				this.editDialog.on('save', function(){
					this.store.reload();
				}, this);
			}
			this.editDialog.show(id,config);
		} else {
			alert(t("This week is closed", "timeregistration2"));
		}
	}
});