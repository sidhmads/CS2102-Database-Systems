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

  $('.search-box  ').click(() => {
    var searchName = $('.search-result').val();
    var url = '/search/' + searchName;
    $.ajax({
      url: url,
      type: 'GET',
      success: (result) => {
        console.log('fetcthing ' + searchName );
        console.log(result);
      }
    })
  });
});
