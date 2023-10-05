// main.js

// //Taken from "https://stackoverflow.com/questions/60521350/handling-delete-operation-in-express-pug-template-engine" on 2023-10-02
// // SOURCE: https://github.com/elvc/node_express_pug_mongo/blob/master/public/js/main.js
// $(document).ready(function(){
//     $('.button.delete-todo').on('click', function(e){
//       e.preventDefault();
//       $target = $(e.target);
//       const id = $target.attr('data-articleid');
  
//       $.ajax({
//         type: 'DELETE',
//         url: '/todos/'+id,
//         success: function (response){
//           // Whatever you want to do after successful delete
//           console.log(response);
//           alert('Deleting article');
//         },
//         error: function(err){
//           // Whatever you want to do after a failed delete
//           console.error(err);
//         }
//       });
//     });
//   });


function sendDelete(path, id){
  fetch('/api/' + path + '/' + id, {
    method: 'DELETE'
  })
}

function openEditForm(){
}
function sendPut(path, id, object){
  fetch('/api/' + path + '/' + id, {
    method: 'PUT',
    
  })
}