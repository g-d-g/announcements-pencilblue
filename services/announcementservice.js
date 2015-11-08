/**
 * PencilBlue Plugin Announcements Service
 * @copyright Thomas H Case 2015 
 * @author Thomas H Case
 * @license This code is licensed under MIT license (see the LICENSE file for details)
 */
module.exports = function(pb){
    
    //Node dependencies
    var async = require('async');

	//pb dependencies
    var BaseObjectService = pb.BaseObjectService;
    var util    = pb.util;
	
	/**
     * AnnouncementService 
     * CustomObjectService to perform the CRUD operations.
     * @class BSCarouselService
     * @constructor
     */
	function AnnouncementService(context) {
        if(!util.isObject(context)) {
            context = {};
        }
        context.type = TYPE;
        AnnouncementService.super_.call(this,context);
        
        /**
         * @property userService
         * @type {UserService}
         */
        this.userService = new pb.UserService(context);
        
        /**
         * @property customObjectService
         * @type {CustomObjectService}
         */
        this.cos = new pb.CustomObjectService(); 
        
        // Check whether localization Service present
        if(!util.isObject(context.ls)) {
            throw new Error('The context.ls (Location Service object) is missing');
        }
        /**
         * @property ls 
         * @type {LocalizationService}
         */
        this.ls = context.ls;
        
        if(!!util.isObject(context.ts)) {
            throw new Error('The context.ls (Location Service object) is missing');
        }
        /**
         * @property ts Template Service
         * @type {TemplateService}
         */
        this.ts = context.ts;
	};
    util.inherits(AnnouncementService,BaseObjectService);
	
	/**
     * The name of the Custom Object Type
     * @private
     * @static
     * @readonly
     * @property TYPE
     * @type {String}
     */
    var CUSTOM_OBJ_TYPENAME = 'announcements';
    
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
    var TYPE = 'announcement';
    
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
           self.cos.findByType(objType,options,function(err,result){
               if(util.isError(err)){
                   pb.log.debug('Error when querying for announcement items');
                   cb(err,null);
               }
               pb.log.debug('Found [%s] announcement items',result.length);
               cb(null,result);
           })
        });
    }
    
    /**
     *  Retrieves Array of Current Announcement Items
     *      Items with publish date <= current date
     *      and publish end date >= current date
     *      Sorted either ascending or descending by Publish Date
     *  @method getCurrentItems
     *  @returns array of current announcement item documents
     *  @param sortOrder Order to sort results (0 = Ascending, 1 = Descending)
     */
    AnnouncementService.getCurrentItems = function(order,cb) {
        var self = this;
        var err = null;
        if(typeof order != 'number') {
            pb.log.debug('AnnouncementService.getCurrentItems: order passed not a number, value was [%s]',JSON.stringify(order));
            err = new Error('order must be a number');
            cb(err,null);
        }else if (order != 0 || order != 1){
            pb.log.debug('AnnouncementService.getCurrentItems: order passed not a number, value was [%s]',order);
            err = new Error('order must be either 0 or 1');
            cb(err,null);
        }
        var options = {order:{publish_date:order}};
        self.getItems(options,function(err,result){
            if(util.isError(err)){
                cb(err,null);
            };
            cb(null,result);
        });
    }
    
    /**
     * Returns items formatted as HTML for Template Value
     * @method getItemsAsTemplateValue
     * @returns string HTML formatted list of items for using with templates
     * @param items array of announcement items to render
     * @param cb {function} Callback function to pass back results and/or error {err,result}
     */
    AnnouncementService.formatItemsAsHTML = function(items,cb) {
        var self = this;
        var tasks = util.getTasks(items,function(item,i){
            return function(callback){
                self.UserService.getFullName(item.author,function(err,author){
                    if(util.isError(err)){
                        callback(err,null);
                    }
                    var ats = new pb.TemplateService(self.ls);
                    ats.registerLocal('Announcement_Name',item.name);
                    ats.registerLocal('Announcement_Author',author);
                    ats.registerLocal('Announcement_Published',item.publish_date);
                    ats.registerLocal('Announcement_Content',item.content);
                    ats.load('announcement_item',function(err,template){
                       if(util.isError(err)) {
                           callback(err,'');
                       } else {
                           callback(null,template);
                       }
                    });
                });
            }
        });
        async.parallel(tasks,function(err,results){
           cb(err,new pb.TemplateValue(results.join(''),false)); 
        });
    }
    
    /**
     * Retrieves actual Object Type from CustomObjectService
     * @method getType
     * @param {function} cb
     */
    AnnouncementService.getType = function(cb) {
      this.cos.loadTypeByName(CUSTOM_OBJ_TYPENAME,function(err,customObject){
	      if(err){
		      cb(err,null);
	      }
	      pb.log.debug('Found Custom Object: %s',JSON.stringify(customObject));
	      cb(null,customObject);
      });
    }
    
    //exports
    return AnnouncementService;
}