/**
 * PencilBlue Plugin for Announcements
 * @copyright Thomas H Case 2015 
 * @author Thomas H Case
 * @license This code is licensed under MIT license (see the LICENSE file for details)
 */
module.exports = function AnnouncementsModule(pb){
	//pb dependencies
	var util = pb.util;
	
	/**
	 * Announcements - Constructor
	 * @class Announcements
	 * @constructor
	 */
	function Announcements(){};
	
	/**
     * @private
     * @static
     * @readonly
     * @property ANNOUNCEMENTS_OBJ_TYPENAME
     */
    var ANNOUNCEMENTS_OBJ_TYPENAME = 'Announcements';

    /**
     *@private
     * @static
     * @readonly
     * @property FIELD_TYPE_TEXT
     */
    var FIELD_TYPE_TEXT = Object.freeze({
        field_type: 'text'
    });
    
    /**
     * @private
     * @static
     * @readonly
     * @property FIELD_TYPE_WYSIWYG
     */
    var FIELD_TYPE_WYSIWYG = Object.freeze({
        field_type: 'wysiwyg'
    });
	
	/**
     *@private
     * @static
     * @readonly
     * @property FIELD_TYPE_DATE
     */
    var FIELD_TYPE_DATE = Object.freeze({
        field_type: 'date'
    });
	
    /**
     *@private
     * @static
     * @readonly
     * @property FIELD_TYPE_PEER_OBJECT
     */
    var FIELD_TYPE_PEER_OBJECT = Object.freeze({
        field_type: 'peer_object'
    });
    
	/**
	 * Called when the application is being installed for the first time.
     *
     * @param cb A callback that must be called upon completion.  cb(err, result).
     * The result is ignored
	 */
	Announcements.onInstall = function(cb) {
		var cos = new pb.CustomObjectService();
		//Load Type
        pb.log.debug('Attempting to load Announcements Custom Object');
		cos.loadTypeByName(ANNOUNCEMENTS_OBJ_TYPENAME,function(err,announcementType){
            pb.log.debug('Announcement Custom Object is: %s',JSON.stringify(announcementType));
            if(util.isError(err) || announcementType){
				return cb(err,!util.isError(err));
			}
			//Define Custom Object
			var announcementValues = {
				name: ANNOUNCEMENTS_OBJ_TYPENAME,
				fields: {
					name: FIELD_TYPE_TEXT,
                    author: {
                        field_type: FIELD_TYPE_PEER_OBJECT,
                        object_type: "user"
                    },
                    content: FIELD_TYPE_WYSIWYG,
                    publish_date: FIELD_TYPE_DATE,
					publish_end_date: FIELD_TYPE_DATE,
					tags: FIELD_TYPE_TEXT
				}
			};
			pb.log.debug('Attempting to save Announcements Custom Object');
			// Save (create or update) Object
            cos.saveType(announcementValues,function(err,announcementType){
                pb.log.debug('Saved Custom Object or errors: %s',JSON.stringify(announcementType));
                cb(err,!util.isError(err));
			});
		});
	}
	
	/**
     * Called when the application is uninstalling this plugin.  The plugin should
     * make every effort to clean up any plugin-specific DB items or any in function
     * overrides it makes.
     *
     * @param cb A callback that must be called upon completion.  cb(err, result).
     * The result is ignored
     */
    Announcements.onUninstall = function(cb) {
        cb(null, true);
    };
	
	/**
     * Called when the application is starting up. The function is also called at
     * the end of a successful install. It is guaranteed that all core PB services
     * will be available including access to the core DB.
     *
     * @param cb A callback that must be called upon completion.  cb(err, result).
     * The result is ignored
     */
    Announcements.onStartup = function(cb) {
        cb(null,true);
	}
	
	/**
     * Called when the application is gracefully shutting down.  No guarantees are
     * provided for how much time will be provided the plugin to shut down.
     *
     * @param cb A callback that must be called upon completion.  cb(err, result).
     * The result is ignored
     */
    Announcements.onShutdown = function(cb) {
        cb(null, true);
    };

    //exports
    return Announcements;
}