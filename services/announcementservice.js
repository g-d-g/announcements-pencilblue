/**
 * PencilBlue Plugin Announcements Service
 * @copyright Thomas H Case 2015 
 * @author Thomas H Case
 * @license This code is licensed under MIT license (see the LICENSE file for details)
 */
var async = require('async');

module.exports = function(pb){
    
	//pb dependencies
    var util    = pb.util;
    var cos 	= new pb.CustomObjectService();
	
	/**
     * AnnouncementService 
     * CustomObjectService to perform the CRUD operations.
     * @class BSCarouselService
     * @constructor
     */
	function AnnouncementService() {};
    
	/**
     * The name of the Custom Object Type
     * @private
     * @static
     * @readonly
     * @property TYPE
     * @type {String}
     */
    var CUSTOM_OBJ_TYPENAME = 'Announcements';
    
    /**
     * The name the service
     * @private
     * @static
     * @readonly
     * @property SERVICE_NAME
     * @type {String}
     */
    var SERVICE_NAME = 'AnnouncementService';
    
    /**
     * @private
     * @static
     * @readonly
     * @property TYPE
     * @type {String}
     */
    var TYPE = 'Announcements';
    
    /**
	 * Init function required by PencilBlue
	 **/ 
	AnnouncementService.init = function(cb) {
		 pb.log.debug(SERVICE_NAME + ": Initialized");
		 cb(null,true);
	}
    
    /**
     * A service interface function designed to allow developers to name the handle 
     * to the service object what ever they desire. The function must return a 
     * valid string and must not conflict with the names of other services for the 
     * plugin that the service is associated with.
     *
     * @static
     * @method getName
     * @return {String} The service name
     */
	AnnouncementService.getName = function() {
        return SERVICE_NAME;
    };
    
    /**
     * Retrieves Array of Announcement Items
     * @method getItems
     * @returns array of announcement item documents
     * @param {object} options Query Options for results 
     */
    AnnouncementService.getItems = function(options,cb) {
        var self = this;
        if(util.isFunction(options)) {
            cb      = options;
            options = {};
        } else if (!util.isObject(options)) {
            options = {};
        }
        self.getType(function(err,objType){
           if(util.isError(err)){
               pb.log.debug('Error found when trying to get Announcements list Object Type');
               cb(err,null);
           } 
           pb.log.debug('Querying for Announcement items with options [%s] and object type [%s]',JSON.stringify(options),JSON.stringify(objType));
           cos.findByType(objType,options,function(err,result){
               if(util.isError(err)){
                   pb.log.debug('Error when querying for announcement items');
                   cb(err,null);
               }
               pb.log.debug('Found [%s] announcement items',result.length);
               cb(null,result);
           })
        });
    };
    
    /**
     * Retrieves Individual Announcement Item By Id
     * @method getItemById
     * @param id Id of Announcement
     * @param {function}cb Call Back function to return Announcement
     */
    AnnouncementService.getItemById = function(id,cb) {
        var self = this;
        var options = {};
        cos.loadById(id,options,function(err,announcement){
           if(util.isError(err)){
               cb(err,null);
           } 
           cb(null,announcement);
        });
    };
    
    /**
     * Returns formatted Item using HTML Template
     * @method renderAnnouncement
     * @returns formatted Item using HTML Template
     * @param {object}item individual announcement item
     * @param {bool}limitContent whether to limit content length to 255 characters
     * @param {object}context Curent PencilBlue Context
     * @param {object}ls Current PencilBlue Location Service
     * @param {function}cb callback function to return result
     */
    AnnouncementService.renderAnnouncement = function(item,limitContent,context,ls,cb) {
        var userService = new pb.UserService(context);
        var authorId = item.author;
        userService.getFullName(authorId,function(err,authorFullName){
            if(util.isError(err)){
                cb(err,null);
            }
            var ats = new pb.TemplateService(ls);
            ats.registerLocal('Announcement_Id',item._id)
            ats.registerLocal('Announcement_Name',item.name);
            ats.registerLocal('Announcement_Author',authorFullName);
            var datePublished = new Date(item.published);
            ats.registerLocal('Announcement_Published',datePublished.toLocaleString());
            
            if(limitContent && item.content.length > 255) {
                var lastSpaceBeforeBreak = item.content.lastIndexOf(' ',251);
                var limitedContent = item.content.substring(0,lastSpaceBeforeBreak) + ' ...';
                ats.registerLocal('Announcement_Content',new pb.TemplateValue(limitedContent,false));
            } else {
                ats.registerLocal('Announcement_Content',new pb.TemplateValue(item.content,false));
            }
            ats.load('announcement_item',function(err,template){
                if(util.isError(err)) {
                    cb(err,'');
                } else {
                    cb(null,template);
                }
            });
        });
    };
    
    /**
     * Returns formatted list of Announcements using HTML Template
     * @method renderAnnouncements
     * @param items Array of Announcement items
     * @param {bool} limitContent Flag on whether to limit annoucement content
     * @param {object} context Current PencilBlue context
     * @param {object} ls Current PencilBlue Localization Service
     * @param {Function} cb Callback function (err,result)
     */
    AnnouncementService.renderAnnouncements = function(items,limitContent,context,ls,cb) {
        var self = this;
        var ats = new pb.TemplateService(ls);
        ats.registerLocal('Announcements',function(flag,cb){
           if(util.isArray(items) && items.length > 0){
               var tasks = util.getTasks(items,function(items,i){
                  return function(callback) {
                      self.renderAnnouncement(items[i],limitContent,context,ls,callback);
                  } 
               });
               async.parallel(tasks,function(err,result){
                  cb(err,new pb.TemplateValue(result.join(''),false)) 
               });
           } else {
               cb(null,new pb.TemplateValue('No announcements found',false));
           }
        });
        ats.load('announcement_list',function(err,template){
           if(util.isError(err)) {
               cb(err,'');
           } else {
               cb(null,template);
           }
        });
    };
    
    /**
     * Retrieves actual Object Type from CustomObjectService
     * @method getType
     * @param {function} cb
     */
    AnnouncementService.getType = function(cb) {
      cos.loadTypeByName(CUSTOM_OBJ_TYPENAME,function(err,customObject){
	      if(err){
		      cb(err,null);
	      }
	      pb.log.debug('Found Custom Object: %s',JSON.stringify(customObject));
	      cb(null,customObject);
      });
    };
    
    //exports
    return AnnouncementService;
}