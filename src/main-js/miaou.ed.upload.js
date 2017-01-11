// ed is the message editor, managing the user input
// ed.upload handles image upload

miaou(function(ed){

	var TOO_BIG = "This image is way too big for the web. You must reduce its size before upload.",
		BIG = "This image is heavy. You should reduce its size before upload.",
		CHOOSE = "Please choose dimensions :";

	var input = document.getElementById('input');
	if (!input) return;


	ed.handleImageFile = function(file){
		var reader = new FileReader();
		reader.onload = function(e){
			var	imgFile = e.target,
				imgData = imgFile.result,
				img = new Image();
			img.onload = function(){
				console.log("original image size:", e.total);
				var	canBeReduced = img.width>250 || img.height>250,
					isBig = e.total > 200*1024,
					isTooBig = e.total > 1024*1024;
				if (!(isBig && canBeReduced)) {
					return ed.uploadFile(file);
				}
				var propositions = [];
				for (var i=200; i<=1000; i+=100) {
					if (i<img.width*.9) propositions.push({w:i, h:Math.round(i*img.height/img.width)});
					if (i<img.height*.9) propositions.push({h:i, w:Math.round(i*img.width/img.height)});
				}
				var $content = $("<div class=upload-resize-dialog>");
				$(img).addClass("upload-thumb").appendTo($content);
				var $div = $("<div>").appendTo($content);
				$("<p>").text(isTooBig ? TOO_BIG : BIG).appendTo($div);
				var $p = $("<p>").text(CHOOSE).appendTo($div);
				var $select = $("<select>").append(propositions.map(function(p){
					return $("<option>").text(p.w + " x " + p.h);
				})).appendTo($p);
				var dialog = {
					title: isTooBig ? "Image too big for upload" : "Big image",
					content: $content,
					buttons: {
						Cancel: null,
						"Reduce then send": function(){
							var	dim = propositions[$select.prop("selectedIndex")],
								canvas = document.createElement("canvas");
							console.log("reducing to", dim);
							canvas.width = dim.w;
							canvas.height = dim.h;
							var context = canvas.getContext("2d");
							context.drawImage(img, 0, 0, dim.w, dim.h);
							imgData = canvas.toDataURL("image/jpeg");
							console.log("reduced image size:", imgData.length);
							console.log("start of data:", imgData.slice(0, 100));
							ed.uploadFile(imgData);
						}
					}
				};
				if (!isTooBig) dialog.buttons["Send as is"] = function(){
					ed.uploadFile(file);
				}
				miaou.dialog(dialog);
			}
			img.onerror = function(e){
				console.log("File doesn't seem to be an image", e);
			}
			img.src = imgData;

		};
		reader.readAsDataURL(file);
	}

	ed.uploadFile = function(file){
		var fd = new FormData(); // todo: do I really need a formdata ?
		fd.append("file", file);
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "upload");
		function finish(){
			$('#upload-controls,#input-panel').show();
			$('#upload-wait,#upload-panel').hide();
		}
		xhr.onload = function(){
			var ans = JSON.parse(xhr.responseText);
			finish();
			if (ans.image && ans.image.link) $('#input').insertLine(ans.image.link.replace(/^http:/, 'https:'));
			else alert("Hu? didn't exactly work, I think...");
			console.log("Image upload result:", ans);
			document.getElementById('file').value = null;
		}
		xhr.onerror = function(){
			alert("Something didn't work as expected :(");
			document.getElementById('file').value = null;
			finish();
		}
		$('#upload-controls,#input-panel').hide();
		$('#upload-wait,#upload-panel').show();
		xhr.send(fd);
	}

	$('#uploadSend').click(function(){
		var file = document.getElementById('file').files[0];
		if (!file || !/^image\//i.test(file.type)) {
			alert('not a valid image');
			return;
		}
		ed.handleImageFile(file);
	});

});
