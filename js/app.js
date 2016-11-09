
// Initialize Firebase
var config = {
apiKey: "AIzaSyA4_CxT224itP_cylL8gI-zQcAaOahDju8",
authDomain: "trade-b1ad2.firebaseapp.com",
databaseURL: "https://trade-b1ad2.firebaseio.com",
storageBucket: "trade-b1ad2.appspot.com",
messagingSenderId: "239663430620"
};

firebase.initializeApp(config);
var db = firebase.database();
var userId;
$(document).ready(function(){	

	firebase.auth().onAuthStateChanged(function(user) {
	    if (user){
	    	console.log(user);
	    	userId = user.uid;

			firebase.database().ref('/posts').on('child_added', function (snap) {
				

		        prependPost(snap);
		    });

			firebase.database().ref('/posts').once('value').then(function(snapshot) {
			  console.log(snapshot.val());
			});
	    } else {
	    	window.location.replace('index.html');	
	    }
    });

    $('#share').click(function(){
    	var title = $('#postTitle').val();
    	var price = $('#postPrice').val();
    	var description = $('#postDescription').val();

    	var errField = [];
    	if(title == '' || title == null) {
    		errField.push('Title');
    	}
    	if(price == '' || price == null) {
    		errField.push('Price');
    	}

    	if(description == '' || description == null) {
    		errField.push('Description');
    	}

    	if(errField.length > 0) {
    		alert(errField + ' should not be empty');
    		return;
    	}

    	var timestamp = new Date().getTime();
    	
    	console.log(timestamp);
    	console.log("Snapshot full date: " + new Date(timestamp));

    	var postData = {
		    author: 'username',
		    uid: firebase.auth().currentUser.uid,
	    	body: 'body',
	    	title: title,
	    	price: price,
	    	description: description,
	    	starCount: 0,
	    	timestamp: timestamp
	    	// authorPic: picture
	  	};

	  	console.log(postData);

	  	var postKey = $('#editPostId').val();

	  	if(postKey == "" || postKey == null) {
	  		postKey = firebase.database().ref().child('posts').push().key;
	  	}	

    	var updates = {};
	  	updates['/posts/' + postKey] = postData;
	  	updates['/user-posts/' + firebase.auth().currentUser.uid + '/' + postKey] = postData;

	  	firebase.database().ref().update(updates);

		$('#postTitle').val('');	  	
		$('#postPrice').val('');	
		$('#postDescription').val('');	  	
		$('#txtBtnShare').text('Share');
    	$('#txtBtnCancel').addClass('hide');
    });

    function prependPost(post) {
    	var key = post.key;
    	console.log(key);
    	post = post.val();
    	console.log(firebase.auth().currentUser.uid);
    	console.log(post);

    	// var date = new Date(post.timestamp);
    	var add = "<div class=\"micropost\" id=\""+ key +"\">" +
	    			"<div class=\"content\">" + 
		                "<div class=\"avatar-content\">" +
		                  	"<img src=\"./img/avatar.png\" alt=\"img/avatar.png\">" + 
		                "</div>" + 
		                "<div class=\"post-content\">" +  
		                	"<input type=\"hidden\" id=\"uid-"+ key +"\" value=\"" + post.uid + "\">" +
			                "<span class=\"name\" id=\"name-"+ key +"\">" + post.author + "</span>" +
			                "<span class=\"username\" id=\"username-"+ key +"\">@" + post.author + "</span>" +
			                "<div class=\"post title\" id=\"title-"+ key +"\">" + post.title + "</div>" +
			                "<div class=\"post\" id=\"price-"+ key +"\">&euro;" + post.price + "</div>" +
			                "<div class=\"post\" id=\"description-"+ key +"\">" + post.description + "</div>" +
		                "</div>" +
		                "<div class=\"right-content\">" +
		                  	"<span>" + '20 min' + "</span>" +
		                "</div>" +
	              	"</div>" +
	              	"<div class=\"actions\">" +
	                	"<div class=\"actions-content\">" +
	                		"<a class=\"linkReserve\" id=\""+ key +"\" >" +
		                    	"<i class=\"fa fa-heart\"></i>" +
		                  	"</a>";
		if (post.uid == firebase.auth().currentUser.uid) {
			add = add + "<a href=\"#new-micropost\" class=\"linkUpdate\" id=\""+ key +"\" >" +
		                    	"<i class=\"fa fa-pencil\"></i>" +
		                  	"</a>" +
		                  	"<a class=\"linkDelete\" id=\""+ key +"\" >" +
		                    	"<i class=\"fa fa-trash\"></i>" +
		                  	"</a>";
		}	               
		add = add + "</div>" +
	              	"</div>" +
            	"</div>";            
		                  	
	                	
    	$('#microposts').prepend(add);
    }

    $('#microposts').on('click', 'a.linkDelete', function() {
    	var id = this.id;
		console.log(id);
    	firebase.database().ref('/posts/'+ id).remove();
    	firebase.database().ref('/user-posts/'+ userId + '/' + id).remove();
    });

    $('#microposts').on('click', 'a.linkUpdate', function() {

    	var id = this.id;
    	// var el = $('.micropost#'+id+ ' .post-content');
		// console.log(el.find('.name').text());

		// $()($('#title-'+id).text());
		// console.log($('#price-'+id).text());
		// console.log($('#description-'+id).text());

    	$('#postTitle').val($('#title-'+id).text());
    	$('#postPrice').val($('#price-'+id).text());
    	$('#postDescription').val($('#description-'+id).text());
    	$('#editPostId').val(id);
    	
    	$('#btnCancel').removeClass('hide');
    	$("body").scrollTop(0);
    	$('#txtBtnShare').text('Update');


  //   	var container = $('.container'),
  //   		scrollTo = $('#new-micropost');
  //   	container.animate({
		// 	scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
		// });
    });

    $('#microposts').on('click', 'a.linkReserve', function() {
    	var id = this.id;
		console.log(id);
    	// firebase.database().ref('/posts/'+ id).remove();
    	// firebase.database().ref('/user-posts/'+ userId + '/' + id).remove();

    	var reserveRef = db.ref('/posts/'+ id + '/starCount');
		reserveRef.transaction(function (current_value) {
			if(current_value < 3) {
				console.log(current_value);
				return (current_value || 0) + 1;				
			}
			else {
				alert ('Maximum reservation number has been reached.');
			}
		}).then(function(){
			console.log('lala');
		});

		
    });


    $('#btnCancel').click(function(){

    	$('#postTitle').val('');
    	$('#postPrice').val('');
    	$('#postDescription').val('');
    	$(this).addClass('hide');
    	$('#txtBtnShare').text('Share');
    });

	firebase.database().ref('/posts').on('child_changed', function (snap) {
		console.log(snap);
		var key = snap.key;
		var post = snap.val();

		$('#title-'+key).text(post.title);
		$('#price-'+key).text(post.price);
		$('#description-'+key).text(post.description);
		
	});

	firebase.database().ref('/posts').on('child_removed', function(childSnapshot) {

		console.log(childSnapshot.key);
		console.log(childSnapshot);
	    alert('child removed!');
	    $('.micropost#'+childSnapshot.key).remove();
	});

});


// var bigOne = document.getElementById('bigOne');
// var dbRef = firebase.database().ref().child('text');
// dbRef.on('value', snap => bigOne.innerHTML = "<b>" + snap.val() + "</b>");