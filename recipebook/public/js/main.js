$(document).ready(()=> {
  $('.delete-recipe').on('click', () => {
    var id = $(this).data('id');
    var url = '/delete/' + id;
    if(confirm('Delete Recipe?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        success: (result) => {
          console.log('Deleting Recipe...')
          // window.location.href="/";
        },
        error: (err) => {
          console.log(err);
        }
      });
    }
  })
});
