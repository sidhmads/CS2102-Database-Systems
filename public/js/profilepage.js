$(document).ready(()=> {

  $('.delete-item').click(() => {
    var id = this.document.activeElement.id;
    var url = '/deleteItem/' + id;
    if(confirm('Delete Item?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        success: (result) => {
          console.log('Deleting Item...')
          window.location.href="/profile";
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
        $('#TG').prop("checked", true);
    }
    if (category === "Others") {
        $('#Others').prop("checked", true);
    }
    var selfSelection = this.document.activeElement.dataset.selfselection;
    if (selfSelection === 'self') {
      $('#self').prop("checked", true);
    } else {
      $('#auto').prop("checked", true);
    }
  });

  $('.delete-bid').click(() => {
    var id = this.document.activeElement.id;
    var url = '/deleteBid/' + id;
    if(confirm('Delete Bid?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        success: (result) => {
          console.log('Deleting Bi..d.')
          window.location.href="/profile";
        },
        error: (err) => {
          console.log(err);
        }
      });
    }
  });

  $('.edit-bid').click(() => {
    if(confirm('Editing will change the bid time')) {
      $('#edit-form-bid_item_id').val(this.document.activeElement.dataset.bid_item_id);
      $('#edit-form-item_name').val(this.document.activeElement.dataset.item_name);
      $('#edit-form-price_offered').val(this.document.activeElement.dataset.price_offered);
      $('#edit-form-price_offered').attr({
        "min": this.document.activeElement.dataset.minprice
      })
      $('#edit-form-days_requested').val(this.document.activeElement.dataset.days_requested);
      $('#edit-form-days_requested').attr({
        "max": this.document.activeElement.dataset.maxduration
      })
      $('#edit-form-date_of_bid').val(this.document.activeElement.dataset.date_of_bid);
      $('#edit-form-lender_name').val(this.document.activeElement.dataset.nickname);
    }
  });
});
