$(document).ready(()=> {

  $('.delete-recipe').click(() => {
    var id = this.document.activeElement.id;
    var url = '/delete/' + id;
    if(confirm('Delete Recipe?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        success: (result) => {
          console.log('Deleting Recipe...')
          window.location.href="/";
        },
        error: (err) => {
          console.log(err);
        }
      });
    }
  });

  $('.edit-recipe').click(() => {
    $('#edit-form-name').val(this.document.activeElement.dataset.name);
    $('#edit-form-ingredients').val(this.document.activeElement.dataset.ingredients);
    $('#edit-form-directions').val(this.document.activeElement.dataset.directions);
    $('#edit-form-id').val(this.document.activeElement.dataset.id);
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
