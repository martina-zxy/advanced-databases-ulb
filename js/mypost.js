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
			  $('#username-navbar').text(userdata.username);
			  $('#username-sidebar').text('@' + userdata.username);
			  $('#user-fullname').text(userdata.name);
			  $('.img-avatar').each(function() {
				    $(this).attr('src',userdata.picture);
				});
			});

			firebase.database().ref('/user-posts/' + userId).on('child_added', function (snap) {

		        prependMyPost(snap);
		        var key = snap.key;
		        firebase.database().ref('/user-posts/' + firebase.auth().currentUser.uid + "/" + snap.key + "/bid").on('child_added', function (snapReserver) {
		        	appendBid(key, snapReserver);
			    });

			    firebase.database().ref('/user-posts/' + firebase.auth().currentUser.uid + "/" + snap.key + "/bid").on('child_removed', function(snapReserver) {
				    $('tr#'+snapReserver.key).remove();
				});

		    });
	    } else {
	    	window.location.replace('index.html');	
	    }
    });

    function prependMyPost(post) {
    	var key = post.key;
    	console.log(key);
    	post = post.val();
    	console.log(firebase.auth().currentUser.uid);
    	
    	var obj = post.reservation;
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
			                "<div class=\"post\" id=\"price-"+ key +"\">&euro;<span>" + post.price + "</span></div>" +
			                "<div class=\"post\" id=\"description-"+ key +"\">" + post.description + "</div>" +
		                "</div>" +
	              	"</div>" +
	              	"<div class=\"actions\">" +
	                	"<div class=\"actions-content\">";
	                		// "<a class=\"linkBid\" id=\""+ key +"\" >";
		if (post.currentBid > post.price) {
			add = add + "<a class=\"linkBid\" id=\""+ key +"\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Reserved\"> <i class=\"fa fa-heart active\"></i>";
		} else {
			add = add + "<a class=\"linkBid\" id=\""+ key +"\" > <i class=\"fa fa-heart \"></i>";
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
		add = add + "</div>" ;
		add = add + "<div class=\"actions-content\">" +
                  "<table class=\"table\">" +
                    "<thead>" + 
                      "<tr>" +
                        "<th>Timestamp</th>"+
                        "<th>Name</th>" +
                        "<th>Email</th>" +
                        "<th>Phone</th>" +
                        "<th>Bid Price</th>"+
                        "<th>Action</th>" +
                      "</tr>" +
                    "</thead>" +
                    "<tbody>" +
                    "</tbody>" +
                  "</table>" +
                "</div>";
	    add = add + "</div>" +
            	"</div>";            
		                  	
	                	
    	$('#microposts').prepend(add);
    	
    	console.log("PREPEND DONE");
    }

    function appendBid(key, snapReserver) {
    	// $('.micropost#'+key+' .actions .table tbody').append("<div class=\"actions-content\"><h5>ASD - " + key + "</h5></div>");
    	var reserver = snapReserver.val();
    	$('.micropost#'+key+' .actions .table').prepend("<tr id=\""+snapReserver.key+"\"><td>"+ moment.unix(reserver.timestamp/1000).format("MM/DD/YYYY h:mm:ss a") +"</td><td>"+ reserver.name +"</td><td>"+ reserver.email +"</td><td>"+ reserver.phone +"</td><td>"+ reserver.bidAmount +"</td><td><button id=\""+snapReserver.key+"\" class=\"btnReject\">Reject</button></td></tr>");
    	console.log(snapReserver);
    }

    $('#microposts').on('click', 'button.btnReject', function() {
    	var bidId = this.id;
		var postId = this.closest(".micropost").id; 
    	firebase.database().ref('/posts/'+ postId + "/bid/" + bidId).remove();
    	firebase.database().ref('/user-posts/'+ userId + '/' + postId + "/bid/" + bidId).remove();

  //   	var rejected = false;
  //   	var reserveRef = db.ref('/posts/'+ postId + '/heartCount');
		// reserveRef.transaction(function (current_value) {
		// 	if(current_value >= 1) {
		// 		currentHeartCount = current_value;
		// 		console.log(current_value);
		// 		rejected = true;
		// 		return (current_value || 1) - 1;				
		// 	}
		// 	else {
		// 		alert ('Do not play with the JS!');
		// 		return;
		// 	}
		// }).then(function(){
		// 	if (rejected){

		// 		var updates = {};

		// 	  	updates['/user-posts/' + userId + '/' + postId + '/heartCount'] = currentHeartCount - 1;

		// 	  	firebase.database().ref().update(updates);

		// 		alert('Reservation has been rejected');
		// 	}
		// });
    });

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

    $('#microposts').on('click', 'a.linkBid', function() {

    	var id = this.id;
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

				var updates = {};

			  	updates['/user-posts/' + firebase.auth().currentUser.uid + '/' + id + '/heartCount'] = currentHeartCount + 1;

			  	firebase.database().ref().update(updates);

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
		$('#price-'+key+' span').text(post.price);
		$('#description-'+key).text(post.description);

		if (post.heartCount > 0) {
			$('a.linkBid#'+key+' i').addClass('active');	
		} else {
			$('a.linkBid#'+key+' i').removeClass('active');	
		}
		
		
	});

	firebase.database().ref('/posts').on('child_removed', function(childSnapshot) {

		console.log(childSnapshot.key);
		console.log(childSnapshot);
	    alert('child removed!');
	    $('.micropost#'+childSnapshot.key).remove();
	});

});
