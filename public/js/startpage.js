$(document).ready(()=> {

	$('.categories').click(() => {
		var url = '/search/';
		console.log(url);
		$.ajax({
			url: url,
			method: "GET",
			success: (result) => {
				console.log('Switching to search page...')
				window.location.href="/search";
			},
			error: (err) => {
				console.log(err);
			}
		});
	});

	$('.searchbutton').click(() => {
		var url = '/search/';
		console.log(url);
		$.ajax({
			url: url,
			method: "GET",
			success: (result) => {
				console.log('Switching to search page...')
				window.location.href="/search";
			},
			error: (err) => {
				console.log(err);
			}
		});
	});

	$('.profile').click(() => {
		var url = '/profile/';
		console.log(url);
		$.ajax({
			url: url,
			method: "GET",
			success: (result) => {
				console.log('Switching to profile page...')
				window.location.href="/profile";
			},
			error: (err) => {
				console.log(err);
			}
		});
	});

	$('.settings').click(() => {
		var url = '/profile/';
		console.log(url);
		$.ajax({
			url: url,
			method: "GET",
			success: (result) => {
				console.log('Switching to profile page...')
				window.location.href="/profile";
			},
			error: (err) => {
				console.log(err);
			}
		});
	});


});
