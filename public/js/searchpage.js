$(document).ready(()=> {

	$('#myInput').on("change keyup paste", () => {
	    var input, filter, ul, li, a, i;
	    input = document.getElementById("myInput");
	    filter = input.value.toUpperCase();
	    ul = document.getElementById("items");
	    li = ul.getElementsByClassName("item");
	    for (i = 0; i < li.length; i++) {
	        a = li[i].getElementsByTagName("h4")[0];
		        if (a.innerText.toUpperCase().indexOf(filter) > -1) {
		            li[i].style.display = "";
		        } else {
	            li[i].style.display = "none";
	        }
	    }
	  });

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
