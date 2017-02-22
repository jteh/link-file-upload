angular.module('ukgovupload', []);
angular.module('ukgovupload').directive('linkFileUpload', ['loadResourcesSrv', function (loadResourcesSrv) {
    'use strict';
    return {
    	scope: {
    		endpoint: '=',
    		text: '=',
    		id: '=',
    		parentId: '=parentId'
    	},
    	templateUrl: '/' + loadResourcesSrv.getTemplateUrlRoot() + '/resources/js/shared/link-file-upload/link-file-upload.html',
    	controllerAs: 'ctrl',
    	controller:['$rootScope', '$scope', 'Upload', function($rootScope, $scope, Upload){
    		var ctrl = this;
    		
    		ctrl.acceptedFileTypes = "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document," +
    								 "application/rtf,application/vnd.oasis.opendocument.formula,text/plain,application/vnd.ms-excel," +
    								 "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png,docx,xlsx," +
									 "application/vnd.openxmlformats-officedocument.presentationml.presentation," +
									 "image/tiff," +
			                         "application/vnd.ms-powerpointtd," +
									 "message/rfc822," +
				                     "application/CDFV2-corrupt," +
									 "image/svg+xml";

			ctrl.acceptedFileExtensions = "msg";
    		ctrl.text = $scope.text;
    		ctrl.id = $scope.id;
    		ctrl.parentId = $scope.parentId;
    		ctrl.showUpload = false;
    		ctrl.fileTypeError = false;


            ctrl.isfileCategorySpecifiable = loadResourcesSrv.isfileCategorySpecifiable();
    		loadResourcesSrv.initializeFileCategories();
    		ctrl.fileCategories = loadResourcesSrv.fileCategories;


    	    ctrl.upload = function(){
    	    	Upload.upload({
    	    		 url : $scope.endpoint,
                     fields : {
                         'category': ctrl.fileCategory,
                         'description': ctrl.fileDescription
                     },
                     file : ctrl.file
    	    	}
    	    	).success(function(data, status, headers, config) {
    	    		ctrl.showUpload = false;
    	    		ctrl.fileCategory = '';
    	    		ctrl.fileDescription = '';
    	    		ctrl.filename = '';
    	    		$rootScope.$broadcast("reload");
    			}).error(function(data, status, headers, config) {
					alert("There was an error during the upload. The document you are trying to upload is either corrupt or malicious. Please upload a different document.");
				});
    	    };

    	    $scope.fileChanged = function(files) {
    	    	ctrl.file = files[0];
    	    	if(ctrl.file){
    	    		ctrl.invalidFileType();
    	    		ctrl.filename = ctrl.file.name;
    	    	}
    		};
    		
    		ctrl.invalidForm = function(){
    			if(ctrl.file === undefined) return true;
    			if(ctrl.isfileCategorySpecifiable && (ctrl.fileCategory === undefined || ctrl.fileCategory.trim() === '')) return true;
    			if(ctrl.fileDescription === undefined || ctrl.fileDescription.trim() === '') return true;
    			if(ctrl.invalidFileType()) return true;   			
    			return false;
    		};

			/*
				For .msg files the ctrl.file.type is not set, hence validation based on mime type is not possible.
				In such case extension based validation will be performed.
			 */
			ctrl.isOnlyForExtensionBasedValidation = function(fileName) {
				if (!fileName)
					return false;

				var fileExt = fileName.split('.').pop();
				return (ctrl.acceptedFileExtensions.indexOf(fileExt) >= 0);
			};

			ctrl.isExtensionValidForUpload = function(fileName) {
				if (!fileName)
					return false;

				var fileExt = fileName.split('.').pop();
				return (ctrl.acceptedFileExtensions.indexOf(fileExt) >= 0);
			}

    		ctrl.invalidFileType = function(){
    			var result = false;

    			if(ctrl.file) {
					if (ctrl.isOnlyForExtensionBasedValidation(ctrl.file.name))
						result = !ctrl.isExtensionValidForUpload(ctrl.file.name);
					else
						result = (!(ctrl.acceptedFileTypes.indexOf(ctrl.file.type) >= 0) || ctrl.file.type === "");
				}
    			
    			ctrl.fileTypeError = result;
    			
    			return result;
    		};
    	}]
    };
}]);