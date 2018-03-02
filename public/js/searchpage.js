$(document).ready(()=> {

	$('.item').click(() => {
		var url = '/search/';
		console.log(url);
		$.ajax({
			url: url,
			method: "GET",
			success: (result) => {
				console.log('Switching to item page...')
				window.location.href="/item";
			},
			error: (err) => {
				console.log(err);
			}
		});
	});
});
