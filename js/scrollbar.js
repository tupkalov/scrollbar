$.fn.makeScroll = function(){
	return this.each(function(){
		$(this).data('scrollbar', new Scrollbar({el : this}));
	});
}

Scrollbar = function(opts){
	this.$el = $(this.el = opts.el);
	this.$el
		.addClass('scrollbar__container')
		.before(
			this.$wrapper = $('<div class="scrollbar" />')
		)
		.appendTo(this.$wrapper)

	if(isTouchDevice()){
		this.$wrapper.addClass('scrollbar_mode_mobile');

	}else{
		this.$el.after( 
			this.$track = $('<div class="scrollbar__track" />').append(
				this.$handle = $('<div class="scrollbar__handle" />')
			)
		);	

		this.refresh();
		this.bindHandle();
		this.bindWheel();
		this.bindScrollTap();
		//this.bindTouch();

		this.$el.on('scroll', this.refresh.bind(this));
	}
};

Scrollbar.prototype = {
	refresh : function(){
		var height = this.el.offsetHeight,
			scrollHeight = this.el.scrollHeight,
			trackHeight = this.$track.height();

		this.$handle
			.height(height*100/scrollHeight + '%')
			.css('top', (this.handleTop = (this.el.scrollTop / this.el.scrollHeight * trackHeight)) + 'px');
	},

	bindHandle : function(){
		this.$handle.on('mousedown', function(e){
			this.startHandleMove({position : e.pageY});
			return false;
		}.bind(this));

		$(this).on({
			startMove : function(){
				this.$wrapper.addClass('scrollbar_state_move');
			},
			stopMove : function(){
				this.$wrapper.removeClass('scrollbar_state_move');	
			}
		});
	},
	startHandleMove : function(opts){
		$(this).trigger('startMove');
		$(window)

			.on('mousemove.scrollbarMove', function(e){
				var movement = e.originalEvent.webkitMovementY || (e.pageY - opts.position),
					trackHeight = this.$track.height(),
					percentMovement = movement / trackHeight,
					scrollHeight = this.el.scrollHeight,
					scrollMovement = scrollHeight * percentMovement;

				opts.position = e.pageY;
				this.$el.scrollTop (this.$el.scrollTop() + scrollMovement);
				//this.refresh();
			}.bind(this))

			.on('mouseup.scrollbarMove blur.scrollbarMove', function(){
				$(window).off('.scrollbarMove');
				$(this).trigger('stopMove');
			}.bind(this));
	},

	wheelStep : 30,
	bindWheel : function(){
		this.$wrapper.on('mousewheel', function(e){
			this.$el.scrollTop(this.$el.scrollTop() - e.deltaY * this.wheelStep);
		}.bind(this));
	},

	bindScrollTap : function(){
		this.$track.on('mousedown', function(e){
			if(e.target !== this.$track[0]) return;
			var value = (e.offsetY > this.handleTop) ? 1 : -1;
			this.tapTimer(value)
			e.preventDefault();
			$(document).on('blur.tap mouseup.tap mouseleave.tap', function(){
				$(document).off('.tap');
				clearTimeout(this._tapTimer);
			}.bind(this));
		}.bind(this));
	},
	tapTimeout : 200,
	tapTimer : function(value){
		this.tap(value);
		this._tapTimer = setTimeout(this.tapTimer.bind(this, value), this.tapTimeout);
	},
	tap : function(c){
		this.$el.scrollTop(this.el.scrollTop + this.el.offsetHeight * c);
	}/*,

	bindTouch : function(){
		if(!isTouchDevice()) return;

		$(this).trigger('startMove');
		this.$wrapper.on('touchstart', function(e){
			this.startTouchMove({position : e.originalEvent.touches[0].pageY});
			e.preventDefault();
		}.bind(this));
	},
	startTouchMove : function(opts){
		$(window).on('touchmove.touch', function(e){
			var movement = e.originalEvent.touches[0].pageY - opts.position;
			opts.position = e.originalEvent.touches[0].pageY;
			this.$el.scrollTop(this.$el.scrollTop() - movement);

			$(window).on('touchend.touch touchcancel.touch', function(){
				$(window).off('.touch');
				$(this).trigger('stopMove');
			}.bind(this));
		}.bind(this));
	}*/
};

function isTouchDevice(){
	try{
		document.createEvent("TouchEvent");
		return true;
	}catch(e){
		return false;
	}
};