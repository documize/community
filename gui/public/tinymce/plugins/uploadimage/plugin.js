(function() {
	tinymce.create('tinymce.plugins.UploadImagePlugin', {
		init: function(ed, url) {
			// Register commands
			ed.addCommand('mceUploadImage', function() {

				var displayImage = function( base64 ) {
					if ( ! base64 ) {
						return false;
					}

					var tpl = '<img src="%s" />';

					ed.insertContent(tpl.replace('%s', base64));

					ed.focus();

					ed.windowManager.close();
				};


				/**
				 * Load Image file (from input)
				 * and get the base64 encoded image data.
				 *
				 * @link http://stackoverflow.com/questions/6978156/get-base64-encode-file-data-from-input-form
				 *
				 * @param  {String}   input    Input ID.
				 * @param  {Function} callback Callback function to call when file has loaded to send it the base64.
				 *
				 * @return {Function}          The callback function result.
				 */
				var getBase64FromInput = function( input, callback ) {

					var filesSelected = document.getElementById( input ).files;

					if ( filesSelected.length > 0 )
					{
						var fileToLoad = filesSelected[0],
							fileReader = new FileReader();

						fileReader.readAsDataURL(fileToLoad);

						fileReader.onload = function(fileLoadedEvent) {

							return callback( fileLoadedEvent.target.result );
						};
					}
					else
					{
						return callback( false );
					}
				};

				ed.windowManager.open({
					title:'Upload Image',
					body:[{
						type:"container",
						html: '<form action="" method="POST" enctype="multipart/form-data">' +
							'<div class="mce-container" hidefocus="1" tabindex="-1">' +
								'<div class="mce-container-body">' +
									'<label>Select a file<br />' +
									'<input type="file" name="file" id="upload-image" accept="image/*" class="mce-textbox mce-placeholder" hidefocus="true">' +
								'</label></div>' +
							'</div>' +
						'</form>'
					}],
					onSubmit: function(){

						getBase64FromInput( 'upload-image', displayImage );

						return false;
					}
				});
			});

			// Register buttons
			ed.addButton('uploadimage', {
				title : 'Upload Image',
				cmd : 'mceUploadImage',
				image : url + '/img/icon.png'
			});
		},
		getInfo: function() {
			return {
				longname : 'Upload Image',
				author : 'François Jacquet',
				authorurl : 'https://github.com/francoisjacquet/tinymce-uploadimage',
				infourl : 'https://github.com/francoisjacquet/tinymce-uploadimage/blob/master/README.md',
				version : '0.1'
			};
		}
	});

	tinymce.PluginManager.add('uploadimage', tinymce.plugins.UploadImagePlugin);
})();

