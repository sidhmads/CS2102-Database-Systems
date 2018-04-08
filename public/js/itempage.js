$(document).ready(()=> {

  if(this.document.getElementById('not_expired').value !== "") {
    var countDownDate = new Date(this.document.getElementById('bid_start_date').value);
    countDownDate.setDate(countDownDate.getDate() + parseInt(this.document.getElementById('bid_duration').value));
    countDownDate = countDownDate.getTime();

    // Update the count down every 1 second
    var x = setInterval(function() {

        // Get todays date and time
        var now = new Date().getTime();

        // Find the distance between now an the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Output the result in an element with id="demo"
        document.getElementById("countdown").innerHTML = days + "d " + hours + "h "
        + minutes + "m " + seconds + "s ";

        // If the count down is over, write some text
        if (distance < 0) {
            clearInterval(x);
            url = $(location).attr('href');
            document.getElementById("countdown").innerHTML = "EXPIRED";
            $.ajax({
              type: "GET",
              url: url,
              success: (result) => {
                window.location.href="/item/expired/".concat(url.substring(url.lastIndexOf('/') + 1));
              },
              error: (err) => {
                console.log(err);
              }
            });
        }
    }, 1000);
  } else {
    document.getElementById("countdown").innerHTML = "EXPIRED";
  }

});
