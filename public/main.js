// main.js

function sendDelete(path, id){
  fetch('/api/' + path + '/' + id, {
    method: 'DELETE'
  })
}

function sendPut(path, id, data){
  fetch('/api/' + path + '/' + id, {
    method: "PUT", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      // "Content-Type": "application/json",
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    // redirect: "follow", // manual, *follow, error
    // referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data)
  })
}

function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function openEditForm(){
  let trigger_element = event.element
  console.log("openEditForm run");

  var el = document.createElement("input");
  el.innerHTML = trigger_element.previousSibling.innerHTML;
  
  
  insertAfter(trigger_element, el);
}
