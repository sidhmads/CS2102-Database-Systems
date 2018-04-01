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

  $('.edit-item').click(() => {
    $('#edit-form-id').val(this.document.activeElement.dataset.id);
    $('#edit-form-name').val(this.document.activeElement.dataset.name);
    $('#edit-form-description').val(this.document.activeElement.dataset.description);
    $('#edit-form-minPrice').val(this.document.activeElement.dataset.minprice);
    $('#edit-form-bidDur').val(this.document.activeElement.dataset.biddur);
    $('#edit-form-lendDur').val(this.document.activeElement.dataset.lenddur);
    var category = this.document.activeElement.dataset.category
    if (category === "Electronics") {
        $('#Electronics').prop("checked", true);
    }
    if (category === "Clothes") {
        $('#Clothes').prop("checked", true);
    }
    if (category === "Books") {
        $('#Books').prop("checked", true);
    }
    if (category === "Toys and Games") {
        $('#Toys and Games').prop("checked", true);
    }
    if (category === "Others") {
        $('#Others').prop("checked", true);
    }
    if(this.document.activeElement.dataset.category) {
      $('#edit-form-isadmin').prop('checked', true);
    } else {
      $('#edit-form-isadmin').prop('checked', false);
    }
  });
});
