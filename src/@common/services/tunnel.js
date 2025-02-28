

export default {
	client : null,
	connected : false,
	online : true,
	strength : function(){
		if(!this.online) return 0;
		return 0 + (this.connected ? 1 : 0) + (this.online ? 2 : 0);
	},
	init : function (options) {
	  if(!this.client){
		let THAT = this;
		this.client =  window.tunnelClient.config({
			user : window.CONST.APP_USER,
			context : window.CONST.APP_CONTEXT,
			options : {...options}
		});
		window.__onsocket_disconnect__  = function(error, reconnect){
			console.log("tunnel:__onsocket_disconnect__",error);
			if(error.type == "CLOSED"){
				THAT.connected = false;
				reconnect();
			}
		};
		window.__onsocket_connect__  = function(error, reconnect){
			console.log("tunnel:__onsocket_connect__",error);
			THAT.connected = true
		};
		window.addEventListener('offline', function(e) { 
			console.log('tunnel:offline'); 
			THAT.online = !!navigator.onLine
			THAT.client.global.ping();
			THAT.online = !!navigator.onLine
			THAT.client.triggerChange('offline',e);
		});
		window.addEventListener('online', function(e) { 
			console.log('tunnel:online'); 
			THAT.online = !!navigator.onLine
			THAT.client.global.ping();
			THAT.online = !!navigator.onLine
			THAT.client.triggerChange('online',e);
		});
		THAT.client.global.on("/stomp/tunnel/health" , function(greeting,h,g) {
			console.log("health:",greeting,h,g.headers.subscription);
		});
	  }
	  this.online = !!navigator.onLine;
	  return this.client;
	},
	instance : function () {
		return this.client.instance()
	},
	pipe : function () {
		return this.init().instance()
	}
}