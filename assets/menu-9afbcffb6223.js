jQuery(document).ready(function($){

var windowWidth = document.body.clientWidth;


if(windowWidth >= '991'){

	// jQuery(window).scroll(function(){
	// 	if(jQuery(window).scrollTop() > 170) {
	// 		if (jQuery('.top-bar').hasClass('stiky')) return;
	// 		jQuery('.top-bar').addClass('stiky');
	// 	}
	// 	else {
	// 		if (!jQuery('.top-bar').hasClass('stiky')) return;
	// 		jQuery('.top-bar').removeClass('stiky');
	// 	}
	// });
		jQuery('body').addClass("scrol");
		
		jQuery(window).scroll(function() {
			if (jQuery(window).scrollTop() > 1){
				jQuery('.top-bar').addClass("scrol");
			} else{
				jQuery('.top-bar').removeClass("scrol");
			}
		});
};





	jQuery('a[href="#callback"]').click(function(){
	    ga('send', 'event', 'callback', 'open'); 
	    yaCounter20720524.reachGoal('callback_open');
	});

	jQuery("#callback form").submit(function(event) {
		ga('send', 'event', 'callback', 'send'); 
		yaCounter20720524.reachGoal('callback_send');
	});

	jQuery('a[href="#contact"]').click(function(){
	    ga('send', 'event', 'email', 'open'); 
	    yaCounter20720524.reachGoal('email_open');
	});

	jQuery("#contact form").submit(function(event) {
		ga('send', 'event', 'email', 'send'); 
		yaCounter20720524.reachGoal('email_send');
	});

	jQuery(".form-wrapper form").submit(function(event) {
		ga('send', 'event', 'order', 'send'); 
		yaCounter20720524.reachGoal('order_send');
		console.log("main");
	});
})