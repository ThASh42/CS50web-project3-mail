document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Send new email
  document.querySelector("#compose-form").onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  inbox_loader(mailbox);
}

function send_email() {
  
  // Form values
  const form_recipients = document.querySelector('#compose-recipients').value;
  const form_subject = document.querySelector('#compose-subject').value;
  const form_body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: form_recipients,
      subject: form_subject,
      body: form_body,
    })
  })
  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result);
    load_mailbox('inbox');
  });
  return false;
}

function inbox_loader(mailbox) {
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(result => {

    /*
    <a class="list-group-item list-group-item-action">
      <div class="row">
        <div class="col-6"></div>
        <div class="col-6"></div>
      </div>
    </a>
    */

    // Show all emails
    for (let x = 0; x < result.length; x++) {

      // Email block
      const newItem = document.createElement('a');
      newItem.className = "list-group-item list-group-item-action";
      if (result[x].read = false && mailbox == "inbox") {
        newItem.classList.add("read-background");
      }

      // Email row
      const itemRow = document.createElement('div');
      itemRow.className = "row";

      // Sender text
      const senderDiv = document.createElement('div');
      senderDiv.className = "col-6";
      senderDiv.innerHTML = result[x].sender; 

      // Subject text
      const subjectDiv = document.createElement('div');
      subjectDiv.className = "col-6";
      subjectDiv.innerHTML = result[x].subject; 

      // Append childs
      itemRow.appendChild(senderDiv);
      itemRow.appendChild(subjectDiv);

      newItem.appendChild(itemRow);
      document.querySelector('#emails-view').appendChild(newItem);
    }
  })
}