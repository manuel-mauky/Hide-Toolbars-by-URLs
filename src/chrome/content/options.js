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
 * Subclass for the options panel
 * 
 * @author Manuel Mauky <manuel.mauky@googlemail.com>
 * 
 */
hideToolbarsByURL.Options = function(){
	
	//reference to the logging-method
	var log = hideToolbarsByURL.log;
	
	//reference to the database object
	var db = hideToolbarsByURL.Database;
	
	
	//get a reference to the nsIIOService. This is needed to create nsIURI instances
	var ioService = Components.classes["@mozilla.org/network/io-service;1"]
	                                   .getService(Components.interfaces.nsIIOService);
	
	
	/**
	 * set up the listbox with the data from the sqlite-db
	 * 
	 * the listbox is dynamically created with a xul-template
	 * but the datasources-propertie has to be set at runtime
	 */
	var init = function(){	
		var list = document.getElementById("hiddentoolbarsList");
		
		//get the sqlite-file (nsIFile)
		var file = db.getSqliteFile();
		
		//create nsIURI from sqlitefile
		var uri = ioService.newFileURI(file);
				
		//update the datasources
		list.datasources = "file:" + uri.path;
		
		list.builder.rebuild();	
	};
	
	
	/**
	 * remove urls from the sqlite-database
	 */	
	var removeUrls = function(){
	
		var list = document.getElementById("hiddentoolbarsList");
		
		var urlArray = new Array();
		
		//put the labels for every listitem in the urlArray
		list.selectedItems.forEach(function(element){
			urlArray.push(element.label);
		});
		
		db.removeUrls(urlArray);
		
		//if the overlay-jsfile is correctly loaded...
		if(typeof(hideToolbarsByURL.Overlay) != "undefined"){
			//...refresh the url-array
			db.getAllUrls(hideToolbarsByURL.Overlay.refresh);
		}
		
		//there is a bug on windows. The rebuild only work when you click the button 2 times. Don't know why.
		list.builder.rebuild();	
	
	};
	

	// public methods
	return {
		init : init,		
		removeUrls : removeUrls
	};	
}();