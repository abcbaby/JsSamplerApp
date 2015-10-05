var ModalView = Backbone.View.extend({
	el : $('#triggeredModal'),

	modal : function (html) {
		this.$el.find('.modal-content').html(html).end().modal();
		if (!this.handleUndelegate) {
			var that = this;
			this.handleUndelegate = true;
			this.$el.one('hidden.bs.modal', this.onClose.bind(this));
		}
	},

	onClose : function () {
		this.undelegateEvents();
	}
});


var ALERT = {
	error : function (txt, delay) {
		this.msg(txt, 'danger', delay || 9000);
	},

	info : function (txt, delay) {
		this.msg(txt, 'info', delay);
	},

	success : function (txt, delay) {
		this.msg(txt, 'success', delay);
	},

	warning : function (txt, delay) {
		this.msg(txt, 'warning', delay);
	},

	msg : function (txt, type, delay, otherOptions) {
		var options = {
			type : type || 'info',
			delay : delay || 6000,
			offset : {
				from : 'top',
				amount : '110'
			},
			width : 'auto'

		};
		if (otherOptions) {
			for (var name in otherOptions) {
				options[name] = otherOptions[name];
			}
		}
		if($.bootstrapGrowl) {
			$.bootstrapGrowl(txt, options);
		}
	},
	
	_statusId: 0,
	
	status : function (title, message, spin) {
		$('#status').removeClass('hide')
		.find('.status-title').text(title ? title : '').end()
		.find('.status-content').text(message ?  message : '').end()
		.find('.status-spinner')[spin===false ? 'addClass' : 'removeClass']('hide');
		return ++this._statusId;
	},

	clearStatus : function(id) {
		if(id === undefined || id === this._statusId) {
			$('#status').addClass('hide');
			return true;
		}
		return false;
	},
	
	timeoutStatus : function (timeout, title, message, spin) {
		var id = ALERT.status(title, message, spin);
		return setTimeout(function() {
			ALERT.clearStatus(id);
		}, timeout || 0);
	},
	
	statusOnXHR : function(xhrs, title, message, timeout, error) {
		var id;
		try{
			timeout = timeout >= 0 ? timeout : 750;
			var wait = $.when.apply($, xhrs);
			var to = setTimeout(function(){
				id = ALERT.status(title);
				wait.done(ALERT.clearStatus).fail(function(){
					ALERT.clearStatus(id);
					if(error){
						ALERT.error(error);
					}
				});
			}, timeout);
			wait.done(function(){
				clearTimeout(to);
			});
		} catch (e) {
			ALERT.clearStatus(id !== undefined ? id : -1);
		}
	}
};
