// main.js

function sendDelete(path, id) {
  fetch('/api/' + path + '/' + id, {
    method: 'DELETE',
    redirect: "follow"
  })
}

function sendPut(path, id, data) {
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

function openEditForm() {
  let trigger_element = event.target
  console.log("openEditForm run");

  var el = document.createElement("input");
  el.placeholder = trigger_element.previousSibling.value;
  console.log(trigger_element.previousSibling.value)

  insertAfter(trigger_element, el);
}

function buttonclick() {

  // Start loading
  let myButton = document.getElementById("gencode");
  myButton.classList.add('disabled')
  myButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Loading..'

  // Do action 
  fetch('http://localhost:3000/api/code', {
    method: 'POST',
    redirect: "follow"
  }).then(response => {
    if (response.status !== 200) {
      console.log('Looks like there was a problem. Status Code: ' +
        response.status);
      return;
    }
    //Success actions
    function successButton(btnElement = myButton) {
      btnElement.innerHTML = "Review"
      btnElement.classList.remove('disabled')
      btnElement.classList.replace("btn-primary", "btn-success")
    }
    setTimeout(successButton, 2000)

    console.log(response.headers.get("Content-Type"));
    return response.json();
  }
  )
    .then(myJson => {
      console.log(JSON.stringify(myJson));
    })
    .catch(err => {

      //Error actions
      myButton.innerHTML = "X Error"
      myButton.classList.replace("btn-primary", "btn-danger")

      console.log('Fetch Error :-S', err);
    });
}