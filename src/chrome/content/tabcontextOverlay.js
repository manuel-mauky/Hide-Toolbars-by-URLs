/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is from "Hide Toolbars by URLs" Addon.
 *
 * The Initial Developer of the Original Code is
 * Manuel Mauky <manuel.mauky@googlemail.com>.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

Components.utils.import("chrome://hideToolbarsByURL/content/hideToolbarsByURL.js");

/**
 * Subclass for the Overlay
 * 
 * @author Manuel Mauky <manuel.mauky@googlemail.com>
 */
hideToolbarsByURL.Overlay = function(){

	
	
	
	//get a reference to the nsIIOService. This is needed to create nsIURI instances
	var ioService = Components.classes["@mozilla.org/network/io-service;1"]
	                                   .getService(Components.interfaces.nsIIOService);
	

	
	//reference to the logging-method
	var log = hideToolbarsByURL.log;
	
	//reference to the database object
	var db = hideToolbarsByURL.Database;
	
	
	
	/*
	 * an array to store the urls that should be hidden
	 * 
	 * because of performance we use an array to store the urls
	 * instead of calling the database every time
	 * 
	 */
	var urlArray = new Array();
	
	
	
	/**
	 * "override" the hideChromeForLocation-function
	 * @see https://developer.mozilla.org/en/Hiding_browser_chrome
	 */
	
	//save a reference to the original hideChrome-function
	var old = XULBrowserWindow.hideChromeForLocation;
	
	//override the hideChrome-funtion with our logic
	XULBrowserWindow.hideChromeForLocation = function(aLocation){
		
		//first get an nsIURI-instance of the aLocation, then get the prePath
		var urlPath = ioService.newURI(aLocation,null,null).prePath;
		
		//If the given URL is in the urlArray then hide the tab (return true)
		if(urlArray.indexOf(urlPath) != -1){
			return true;
		}
		
		//Call the original hideChrome-function 
		return old.call(XULBrowserWindow,aLocation);					
	};
	
	
	
	//A blacklist with urls which should not be hidden like "about:*"
	var blacklist = new Array();
	blacklist.push("about:");
	
	
	/**
	 * hide the current tab
	 */
	var hideTab = function(){		
		
		//first get an nsIURI-instance of the current tab (currentURI)
		//then get the prePath (see https://developer.mozilla.org/en/nsIURI for more information)
		var currentPath = gBrowser.currentURI.prePath;
		
		//verify that the path is not in the blacklist
		for(var i=0 ; i<blacklist.length ; i++){
			if(0 === currentPath.indexOf(blacklist[i])){ 
				return;
			} 
		}
			
		
		
		//When the path is not in the Array
		if(urlArray.indexOf(currentPath) == -1){		
			
			//add the path to the array
			urlArray.push(currentPath);
			
			//add to the database
			db.addNewUrl(currentPath);
		
		}else{
			//when the path is in the array, remove it
			
			//get the index of the given path
			var index = urlArray.indexOf(currentPath);
			
			//remove the element at the index
			urlArray.splice(index, 1);
			
			//remove from the database

			db.removeUrls([currentPath]);
			
		}
		
		
	};
	
	/**
	 * use as callback method when calling the getAllUrls-function from db
	 * 
	 * @param {Array.<string>}
	 */
	var refresh = function(aUrlArray){		
		urlArray = new Array();
			
		aUrlArray.forEach(function(element){
			urlArray.push(element);
		});
		
	};
	
	/**
	 * when loaded the first time, 
	 * get the values from the database and put them to the array
	 */
	var init = function(){
		db.getAllUrls(refresh);		
	}(); //call the function when the jsfile is loaded

	
	
	//public methods
	return{	
		hideTab : hideTab,
		refresh : refresh,
		init : init
	};
	
}();

