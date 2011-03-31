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
 * The Original Code is from "Hide Toolbars by URL" Addon.
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


var EXPORTED_SYMBOLS = ["hideToolbarsByURL"];


/**
 * Baseclass for the addon
 * 
 * defines a logging-method and some references to Services
 * 
 * @author Manuel Mauky <manuel.mauky@googlemail.com>
 * 
 */
var hideToolbarsByURL = {
		
		storageService : Components.classes["@mozilla.org/storage/service;1"]
		                        .getService(Components.interfaces.mozIStorageService),
		
		dirService : Components.classes["@mozilla.org/file/directory_service;1"]
				                .getService(Components.interfaces.nsIProperties),
			
		log : function(string){
			Components.classes["@mozilla.org/consoleservice;1"]
	    		              .getService(Components.interfaces.nsIConsoleService)
	    		              .logStringMessage(string);
		}
		
}

/**
 * subclass for the database
 */
hideToolbarsByURL.Database = function(){
	
	//reference to the logging method and Serivces
	var log = hideToolbarsByURL.log;
	var storageService = hideToolbarsByURL.storageService;
	var dirService = hideToolbarsByURL.dirService;
		
	
	/**
	 * the file with the sqlite database
	 * @type{nsIFile}
	 */
	var sqliteFile;	
	
	/**
	 * the database connection object
	 * @type{mozIStorageConnection}
	 */
	var dbConnection;
	
	/**
	 * set up the sqlite-file
	 */
	var init = function(){
	
		var localDir = dirService.get("ProfD",Components.interfaces.nsIFile);
		
		localDir.append("hideToolbarsByURL");
		
		if(!localDir.exists() || !localDir.isDirectory()) {
			localDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE,0774);
		}
				
		sqliteFile = localDir.clone();
		
		sqliteFile.append("hiddenURLs.sqlite");		
	};
	
	/**
	 * open the connection to the database
	 */
	var openDBConnection = function(){
		
		if(typeof(sqliteFile) == "undefined"){
			init();
		}
		
		//get the database connection. If the file does not exists it will be created
		dbConnection = storageService.openDatabase(sqliteFile);
		
		//check if the table exists
		if (!dbConnection.tableExists("hiddenurls")){
			//if not, create the table
			dbConnection.createTable("hiddenurls","id INTEGER PRIMARY KEY, url TEXT");
		}
		
	};
	
	
	/**
	 * remove urls from the database
	 * 
	 * @param {Array.<string>} an Array with Urls represented as Strings
	 */
	var removeUrls = function (aUrlArray){		
		
		if(!Array.isArray(aUrlArray)){
			return;
		}
		
		if(aUrlArray.length == 0){
			return;
		}
		

		if(typeof(dbConnection) == "undefined"){
			openDBConnection();
		}
		
		/**
		 * create database statement
		 * @see https://developer.mozilla.org/en/Storage
		 */
		var statement = dbConnection.createStatement("DELETE FROM hiddenurls WHERE url = :value");

		var params = statement.newBindingParamsArray();
		
		aUrlArray.forEach(function(element){			
			var bindparam = params.newBindingParams();
			bindparam.bindByName("value",element);
			params.addParams(bindparam);
		});
		
		statement.bindParameters(params);		
		
		
		//execute async
		statement.executeAsync();
		
	};
	
	
	/**
	 * add a new URL to the database
	 * 
	 * @param {string} the url as string
	 */
	var addNewUrl = function (aUrl){
		
		if(typeof(aUrl) != "string"){
			log("no URL specified");
			return;
		}
		
		
		if(typeof(dbConnection) == "undefined"){
			openDBConnection();
		}
		
		
		/**
		 * create database statement
		 * @see https://developer.mozilla.org/en/Storage
		 */
		var statement = dbConnection.createStatement("INSERT INTO hiddenurls (url) VALUES(:value)");
				
		statement.params.value = aUrl;
		
		statement.executeAsync();
	};
	
	/**
	 * get all URLs from the Database
	 * 
	 * the method works with an async database call
	 * so there is result returned directly
	 * 
	 * instead a callback function is called when the result is ready
	 * 
	 * @param {function(Array.<string>)} callback function. gets an string-array as param
	 * 
	 */
	var getAllUrls = function(callback){
		
		if(typeof(callback) != "function"){
			return;
		}
		
		if(typeof(dbConnection) == "undefined"){
			openDBConnection();
		}
		
		var urlArray = new Array();		
		
		var statement = dbConnection.createStatement("SELECT * FROM hiddenurls");
		
		statement.executeAsync({
			
			handleResult: function(aResultSet) {
			    for (let row = aResultSet.getNextRow();
			         row;
			         row = aResultSet.getNextRow()) {
	
			      let value = row.getResultByName("url");
			
			      //put the value into the url-array
			      urlArray.push(value);
			      
			    }
		  	},
			
			handleError : function(aError) {
				log("Error: " + aError.message);
			},
			
			handleCompletion : function(aReason) {
				//call the callback method with the urlArray as param
				callback(urlArray);

				
				if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED){
					log("Query canceled or aborted!");
				}
				
			}			
		});
		
	};	
	
	/**
	 * get the sqlite-file
	 * 
	 * @return {nsIFile} the file
	 */
	var getSqliteFile = function(){
		if(typeof(sqliteFile) == "undefined"){
			init();
		}
		
		return sqliteFile;		
	};
	
	//public methods
	return {
		init : init,
		
		removeUrls : removeUrls,
		
		addNewUrl : addNewUrl,
		
		getAllUrls : getAllUrls,
		
		getSqliteFile : getSqliteFile
	}	
}();