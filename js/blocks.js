/*
  Snippets Chrome extension
  file: blocks.js
 */

var api_url = "https://snippets-api.appspot.com";
// var api_url = "http://localhost/projects/gae_projects/snippets-api/public";

var total_pages,
  current_page,
  search_query;

function get_blocks(page, refresh, query) {
  console.log(search_query);
  if(typeof query == "string" && query.trim().length < 2) {
    search_query = null;
    page = current_page;
    refresh = false;
  } else {
    search_query = query || search_query;
  }
  console.log(search_query);
  // Validate page
  page = page || current_page;
  if (page < 1 || (total_pages ? page > total_pages : false) ||
    (refresh ? false : page == current_page)) {
    return false;
  }
  var blocks = $('table.blocks tbody');
  if (! blocks) {return false;}
  blocks.html('');
  // Ajax call
  var data = {page: page, keyword: search_query};
  $.ajax({url: api_url+'/api/blocks', data: data,
    success: function(response, status){
      if (response.data) {
        // Update paging vars
        current_page = response.current_page;
        total_pages = Math.ceil(response.total/response.per_page);
        // Render paging
        render_paging()
        $(response.data).each(function(i, block){
          // build row HTML
          var block_details = $('#block_details').clone().
            find('.block-show').html(block.title);
          var block_actions = $('#block_actions').clone().show();
          var block_row = $('<tr/>').
            append($('<td/>').addClass('col-md-8').
            html(block_details)).
            append($('<td/>').addClass('col-md-4').
            html(block_actions));
          block_row.find('[data-block]').data('block', block.id);
          blocks.append(block_row);

          // Show block
          block_row.find('.block-show').click(function() {
            var block_id = $(this).data('block');
            $.ajax({url: api_url+'/api/blocks/'+block_id,
              success: function(block, status){
                if (block.id) {
                  show_block(block);
                }  
              }
            });
            return false;
          });

          // Edit block
          block_row.find('.block-edit').click(function() {
            edit_block($(this).data('block'));
            return false;
          });

          // Delete block
          block_row.find('.block-delete').click(function() {
            var block_id = $(this).data('block');
            var flag = confirm("Confirm delete?");
            if (flag) $.ajax({url: api_url+'/api/blocks/'+block_id,
              type: 'delete', success: function(response, status){
                get_blocks();
              }
            });
            return false;
          });
        });
      }
    }
  });
}

function block_search(query) {
  return get_blocks(1, true, query);
}

function clear_search() {
  search_query = null; 
  return false;
}

function render_paging() {
  var pagination = $('ul.pagination');
  if (! pagination) {return false;}
  pagination.html('');
  if (total_pages < 1) {return false;}

  var first = $('<li/>').html('<a href="#">&laquo;</a>');
  first.click(function() {
    get_blocks(1); return false;
  });
  pagination.append(first);
  
  var prev = $('<li/>').html('<a href="#">&lsaquo;</a>');
  prev.click(function() {
    get_blocks(current_page-1); return false;
  });
  pagination.append(prev);

  for (var i = 1; i <= total_pages; i++) {
    var block = $('<li/>').html('<a href="#">'+i+'</a>');
    block.data('page', i);
    block.click(function() {
      get_blocks($(this).data('page')); return false;
    });
    if (current_page == i) {
      block.addClass('active');
    }
    pagination.append(block);
  }

  var next = $('<li/>').html('<a href="#">&rsaquo;</a>');
  next.click(function() {
    get_blocks(current_page+1); return false;
  });
  pagination.append(next);
  
  var last = $('<li/>').html('<a href="#">&raquo;</a>');
  last.click(function() {
    get_blocks(total_pages); return false;
  });
  pagination.append(last);
}

function edit_block(block_id) {
  if (block_id) {
    $.ajax({url: api_url+'/api/blocks/'+block_id,
      success: function(block, status){
        if (block.id) {
          $('#editBlockForm .modal-body').html($('#blockFields').html());
          $('#editBlockForm .block-title').val(block.title);
          $('#editBlockForm .block-body').html(block.body);
          $('#editBlockForm .block-tags').val(block.tags);
          $('#editBlockForm').data('block-id', block_id);
          $("#editModal").modal();
        }  
      }
    });
  }
}

function show_block(block, modal) {
  if (block) {
    var show_modal = $("#showModal");
    show_modal.find('.modal-body').html('');
    show_modal.find('.modal-body').
      append($('<h2/>').html(block.title)).
      append(render_tags(block.tags)).
      append($('<article/>').html($('<code/>').html(
        $('<pre/>').
          css('margin-top', '5px').
          html(htmlEncode(block.body))
      )));
    show_modal.modal();
  }
}

function render_tags(tags) {
  var tags_html = $('<p/>');
  if (tags) {
    tags = tags.split(',');
    for (var i = 0; i < tags.length; i++) {
      tags_html.append(
        $('<span/>').
          addClass('badge').
          css('margin-right', '5px').
          html(tags[i].trim())
      );
    }
  }
  return tags_html;
}

function htmlEncode(value){
  return $('<div/>').text(value).html();
}
