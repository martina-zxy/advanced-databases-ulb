var db = firebase.database();
var userId;
$(document).ready(function(){	

	var userdata = null;

	firebase.auth().onAuthStateChanged(function(user) {
	    if (user){
	    	console.log(user);
	    	userId = user.uid;

	    	firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
	    		
				userdata = snapshot.val();
				userdata.key = userId;	
				console.log(userdata);
				
				$('#username-navbar').text(userdata.username);
				$('#username-sidebar').text('@' + userdata.username);
				$('#user-fullname').text(userdata.name);
				$('.img-avatar').each(function() {
				    $(this).attr('src',userdata.picture);
				});
				
			});

			firebase.database().ref('/posts').on('child_added', function (snap) {

		        prependPost(snap);
		    });

			firebase.database().ref('/posts').once('value').then(function(snapshot) {
			  console.log(snapshot.val());
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
		    author: userdata.name,
		    uname: userdata.username,
		    uid: firebase.auth().currentUser.uid,
	    	title: title,
	    	price: price,
	    	currentBid: price,
	    	description: description,
	    	timestamp: firebase.database.ServerValue.TIMESTAMP
	    	
	  	};


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
    	$('#btnCancel').addClass('hide');
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
			                "<span class=\"username\" id=\"username-"+ key +"\"> - @" + post.uname + "</span>" +
			                "<div class=\"post title\" id=\"title-"+ key +"\">" + post.title + "</div>" +
			                "<div class=\"post\" id=\"startPrice-"+ key +"\">Starting Price : &euro;<span>" + post.price + "</span></div>" +
			                "<div class=\"post\" id=\"price-"+ key +"\">Current Bid : &euro;<span>" + post.currentBid + "</span></div>" +
			                "<div class=\"post\" id=\"description-"+ key +"\">" + post.description + "</div>" +
		                "</div>" +
		                // "<div class=\"right-content\">" +
		                //   	"<span>" + '20 min' + "</span>" +
		                // "</div>" +
	              	"</div>" +
	              	"<div class=\"actions\">" +
	                	"<div class=\"actions-content\">";
	                		// "<a class=\"linkBid\" id=\""+ key +"\" >";
		if (post.currentBid > post.price) {
			add = add + "<a class=\"linkBid\" id=\""+ key +"\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Reserved\"> <i class=\"fa fa-bullhorn active\"></i>";
		} else {
			add = add + "<a class=\"linkBid\" id=\""+ key +"\" > <i class=\"fa fa-bullhorn \"></i>";
		}
		    add = add + "</a>";
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


    	$('#postTitle').val($('#title-'+id).text());
    	$('#postPrice').val($('#price-'+id+' span').text());
    	$('#postDescription').val($('#description-'+id).text());
    	$('#editPostId').val(id);
    	
    	$('#btnCancel').removeClass('hide');
    	$("body").scrollTop(0);
    	$('#txtBtnShare').text('Update');

    });

    $('#submitBid').click(function(){
    	var bid = false;
    	var bidAmount = $('#bidAmount').val();

    	if(bidAmount == "" || bidAmount == null) {
    		alert("You have to fill in the bid amount"); 
    		return;
    	}

    	var postId = $('#bidModalPostId').val();
    	
    	var bidRef = db.ref('/posts/'+ postId + '/currentBid');

		bidRef.transaction(function (current_value) {
			if(current_value < bidAmount) {
				bid = true;
				return bidAmount;				
			} else {
				bid = false;
			}
		}).then(function(){
			if (bid) {
				var uid = $('#uid-' + postId).val();
				var updates = {};
				
			  	updates['/user-posts/' + uid + '/' + postId + '/currentBid'] = bidAmount;			

				// push reserving user data
			  	var bidKey = firebase.database().ref().child('posts/'+ postId + '/bid').push().key;

			  	var bidData = {
			  		uid: firebase.auth().currentUser.uid,
			  		uname: userdata.username,
				    name: userdata.name,
				    email: userdata.email,
				    phone: userdata.phone,
				    bidAmount: bidAmount,
			    	timestamp: new Date().getTime()
			  	};
			  	updates['/user-posts/' + uid + '/' + postId + '/bid/' + bidKey] = bidData;
			  	// updates['/posts/'+ postId + '/bid/' + bidKey] = bidData;

			  	firebase.database().ref().update(updates).then(function(){
			  		console.log(updates);
			  	});

				alert('Success!');	
				$('#bidAmount').val('');
				$('#bidModal').modal('hide');
			} else {
				alert("Bidding has failed, check your input");
			}
		});
    });

    $('#microposts').on('click', 'a.linkBid', function() {
    	var id = this.id;
    	$('#bidModalPostId').val(id);
    	$('#bidModalLabel').text($('#title-' + id).text());
    	$('#currentBid').text($('#price-' + id + ' span').text());
    	$('#bidModal').modal('show');
    	return;
    	var reserved = false;
    	var currentHeartCount;

    	if(firebase.auth().currentUser.uid == $('#uid-' + id).val()) {
    		alert("You can not reserve your own post!");
    		return;
    	}

    	var reserveRef = db.ref('/posts/'+ id + '/heartCount');
		reserveRef.transaction(function (current_value) {
			if(current_value < 3) {
				currentHeartCount = current_value;
				console.log(current_value);
				reserved = true;
				return (current_value || 0) + 1;				
			}
			else {
				alert ('Maximum reservation number has been reached.');
				return;
			}
		}).then(function(){
			if (reserved){
				var uid = $('#uid-' + id).val();
				var updates = {};
				
			  	updates['/user-posts/' + uid + '/' + id + '/heartCount'] = currentHeartCount + 1;
			  	updates['/posts/' + id + '/heartCount'] = currentHeartCount + 1;

			  	// push reserving user data
			  	var reservationKey = firebase.database().ref().child('posts/'+ id + '/reservation').push().key;

			  	var reservationData = {
			  		uid: firebase.auth().currentUser.uid,
			  		uname: userdata.username,
				    name: userdata.name,
				    email: userdata.email,
				    phone: userdata.phone,
			    	timestamp: new Date().getTime()
			  	};
			  	updates['/user-posts/' + uid + '/' + id + '/reservation/' + reservationKey] = reservationData;
			  	updates['/posts/'+ id + '/reservation/' + reservationKey] = reservationData;

			  	firebase.database().ref().update(updates).then(function(){
			  		console.log(updates);
			  	});

				alert('Reserved! The user will contact you soon!');
			}
		});

		
    });


    $('#btnCancel').click(function(){

    	$('#postTitle').val('');
    	$('#postPrice').val('');
    	$('#postDescription').val('');
    	$(this).addClass('hide');
    	$('#txtBtnShare').text('Share');
    });

    $('#btnSignout').click(function(){
    	firebase.auth().signOut().then(function() {
		  window.location.replace('index.html');
		}, function(error) {
		  console.error('Sign Out Error', error);
		});

    });

	firebase.database().ref('/posts').on('child_changed', function (snap) {
		console.log(snap);
		var key = snap.key;
		var post = snap.val();

		$('#title-'+key).text(post.title);
		$('#price-'+key+' span').text(post.currentBid);
		$('#startPrice-'+key+' span').text(post.price);
		$('#description-'+key).text(post.description);

		if (post.currentBid > post.price) {
			$('a.linkBid#'+key+' i').addClass('active');	
		} else {
			$('a.linkBid#'+key+' i').removeClass('active');	
		}		
	});

	firebase.database().ref('/posts').on('child_removed', function(childSnapshot) {

		console.log(childSnapshot.key);
		console.log(childSnapshot);
	    alert('Post has been removed!');
	    $('.micropost#'+childSnapshot.key).remove();
	});

});