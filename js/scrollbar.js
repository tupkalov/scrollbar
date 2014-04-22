(function(){
	$.fn.makeScroll = function(opts){
		return this.each(function(){
			$(this).data('scrollbar', new Scrollbar($.extend({el : this}, opts)));
		});
	};

	$.fn.getScroll = function(){
		return $(this).data('scrollbar');
	};

	Scrollbar = function(opts){
		this.$el = $(this.el = opts.el);
		this.$el.addClass('scrollbar__container')

		if(isTouchDevice()){
			this.$el.addClass('scrollbar__container_mode_mobile');

		}else{
			this.$track = $('<div class="scrollbar__track" />').append(
				this.$handle = $('<div class="scrollbar__handle" />')
			);

			this.appendScrollbar(opts.renderTo);

			this.bind();
			this.bindHandle();
			this.bindWheel();
			this.bindScrollTap();
		}
	};

	Scrollbar.prototype = {
		appendScrollbar : function(renderTo){
			if(typeof renderTo == "function")
				renderTo.call(this, this.$track);
			else if(typeof renderTo == "object")
				this.$track.appendTo(renderTo);
			else
				this.$track.insertAfter(this.el);
		},

		refresh : function(){
			var height = this.el.offsetHeight,
				scrollHeight = this.el.scrollHeight,
				trackHeight = this.$track.height(),

				handleHeight;

			if(height >= scrollHeight){
				this.$track.addClass('scrollbar__track_scroll_no');
			}else{
				this.$track.removeClass('scrollbar__track_scroll_no');
				this.$handle[0].style.height = height/scrollHeight*100 + '%';

				var handleHeight = this.$handle[0].offsetHeight;
				this.$handle[0].style.top = (this.handleTop = (this.el.scrollTop / (scrollHeight - height) * (trackHeight - handleHeight))) + 'px';
			}
		},

		/* MAIN */
		bind : function(){
			this.$el.on('scroll', this.refresh.bind(this));
			this._debouncedRefresh = debounce(50, this.refresh, this);
			this.debouncedRefresh = function(){
				if(this.hovered) this._debouncedRefresh();
			}.bind(this)

			this.$el.on('DOMSubtreeModified DOMNodeRemoved DOMNodeInserted propertychange', this.debouncedRefresh);
			$(window).resize(this.debouncedRefresh);
			this.debouncedRefresh();

			this.$el.add(this.$track).on({
				mouseenter : function(e){
					this.hovered = true;
					this.refresh();
					this.$track.addClass('scrollbar__track_state_hover');
				}.bind(this),
				mouseleave : function(e){
					this.hovered = false;
					this.$track.removeClass('scrollbar__track_state_hover')
				}.bind(this)
			});
		},

		/* HANDLE */
		bindHandle : function(){
			this.$handle.on('mousedown', function(e){
				this.startHandleMove({position : e.pageY});
				return false;
			}.bind(this));

			$(this).on({
				startMove : function(){
					this.$track.addClass('scrollbar__track_state_move');
				},
				stopMove : function(){
					this.$track.removeClass('scrollbar__track_state_move');	
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

		/* WHEEL */
		wheelStep : 30,
		bindWheel : function(){
			this.$el.add(this.$track).on('mousewheel', function(e){
				this.$el.scrollTop(this.$el.scrollTop() - e.deltaY * e.deltaFactor);
				return false;
			}.bind(this));
		},

		/* TAP */
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
		}
	};

	function isTouchDevice(){
		try{
			document.createEvent("TouchEvent");
			return true;
		}catch(e){
			return false;
		}
	};

	function debounce (wait, func, scope) {
	    var timeout, result;
	    return function() {
	    	var args = arguments,
	    		later = function() {
		        	timeout = null;
		        	result = func.apply(scope, args);
		      	};

	      	clearTimeout(timeout);
	      	timeout = setTimeout(later, wait);
	      	return result;
	    };
	} 
})();