// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

document.addEventListener('DOMContentLoaded', () => {
  get_blocks(1);

  $('#newBlockBtn').click(function() {
    $('#newBlockForm .modal-body').html($('#blockFields').html());
    $('#newModal').modal();
  });

  $('#newBlockForm').submit(function() {
    var data = new FormData($(this)[0]);
    $.ajax({url: api_url+'/api/blocks', type: 'post',
      cache: false, contentType: false, processData: false,
      data: data, success: function(block, status){
        if (block.id) {
          $('#newModal').modal('hide');
          show_block(block);
        }
        get_blocks();
      }
    });
    return false;
  });

  $('#editBlockForm').submit(function() {
    var block_id = $(this).data('block-id');
    var data = new FormData($(this)[0]);
    $.ajax({url: api_url+'/api/blocks/'+block_id, type: 'post',
      cache: false, contentType: false, processData: false,
      data: data, success: function(block, status){
        if (block.id) {
          $('#editModal').modal('hide');
          show_block(block);
        }
        get_blocks(current_page, true);
      }
    });
    return false;
  });
});
