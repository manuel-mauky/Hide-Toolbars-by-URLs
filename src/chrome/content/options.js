
hidetoolbarsforapptabs.Options = function(){
	
	var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
	                                        .getService(Components.interfaces.nsIConsoleService);
	
	var test = function(){
		consoleService.logStringMessage("test");
		
		
		
		
	};
	
	
	return {
		test : test
		
	};	
}();