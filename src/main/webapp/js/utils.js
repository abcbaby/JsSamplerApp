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
				amount : '80'
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
	
	status : function (title, message, spin) {
		$('#status').removeClass('hide')
		.find('.status-title').text(title ? title : '').end()
		.find('.status-content').text(message ?  message : '').end()
		.find('.status-spinner')[spin===false ? 'addClass' : 'removeClass']('hide');
	},

	clearStatus : function() {
		$('#status').addClass('hide');
	},
	
	timeoutStatus : function (timeout, title, message, spin) {
		ALERT.status(title, message, spin);
		return setTimeout(function() {
			ALERT.clearStatus();
		}, timeout || 0);
	},
	
	statusOnXHR : function(xhrs, title, message, timeout, error) {
		try{
			timeout = timeout >= 0 ? timeout : 750;
			var wait = $.when.apply($, xhrs);
			var to = setTimeout(function(){
				ALERT.status(title);
				wait.done(ALERT.clearStatus).fail(function(){
					ALERT.clearStatus();
					if(error){
						ALERT.error(error);
					}
				});
			}, timeout);
			wait.done(function(){
				clearTimeout(to);
			});
		} catch (e) {
			ALERT.clearStatus();
		}
	}
};
