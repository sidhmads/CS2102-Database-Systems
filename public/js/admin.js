$(document).ready(()=> {

  $('.delete-user').click(() => {
    var id = this.document.activeElement.id;
    var url = '/delete/' + id;
    if(confirm('Delete User?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        success: (result) => {
          console.log('Deleting User...')
          window.location.href="/admin";
        },
        error: (err) => {
          console.log(err);
        }
      });
    }
  });

  $('.edit-user').click(() => {
    $('#edit-form-id').val(this.document.activeElement.dataset.id);
    $('#edit-form-nickname').val(this.document.activeElement.dataset.nickname);
    $('#edit-form-email').val(this.document.activeElement.dataset.email);
    $('#edit-form-number').val(this.document.activeElement.dataset.number);
    if(this.document.activeElement.dataset.isadmin) {
      $('#edit-form-isadmin').prop('checked', true);
    } else {
      $('#edit-form-isadmin').prop('checked', false);
    }
  });

$('#myInput').on("change keyup paste", () => {
    var input, filter, ul, li, a, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
      ul = document.getElementById("users");
    li = ul.getElementsByClassName("well");
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("h4")[0];
        if (a.innerText.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";

        }
    }
  });

});
