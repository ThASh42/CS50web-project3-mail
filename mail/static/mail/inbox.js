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
  document.querySelector('#email-display').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-display').style.display = 'none';

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

    // Show all emails
    for (let x = 0; x < result.length; x++) {

      // Email block
      const newItem = document.createElement('div');
      newItem.classList.add('list-group-item', 'list-group-item-action');
      if (result[x].read == true && mailbox == "inbox") {
        newItem.classList.add("read-background");
      }

      // Append a child
      document.querySelector('#emails-view').appendChild(newItem);
      
      // Create sender and subject divs:
      newItem.innerHTML = `
        <div class="row">
          <div id="sender" class="col-6">${result[x].sender}</div>
          <div id="subject" class="col-6">${result[x].subject}</div>
        </div>
      `

      // Add function
      newItem.addEventListener('click', () => {
        view_email(result[x].id, mailbox)
      })

      /* Result: 
      <a class="list-group-item list-group-item-action">
        <div class="row">
          <div id="sender" class="col-6"></div>
          <div id="subject" class="col-6"></div>
        </div>
      </a>
      */
    }
  })
}

function view_email(email_id, mailbox) {
  fetch(`/emails/${email_id}`,{
    method: 'GET',
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);

    document.querySelector('#email-display-subject').innerHTML = result.subject;
    document.querySelector('#email-display-sender').innerHTML = "From " + result.sender;
    document.querySelector('#email-display-recipients').innerHTML = "To: " + result.recipients;
    document.querySelector('#email-display-timestamp').innerHTML = result.timestamp;
    document.querySelector('#email-display-body').innerHTML = result.body;

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-display').style.display = 'block';
    
    // Update email
    if (!result.read)
    {
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true,
        })
      })
    }

    // * Archive/Unarchive button
    if (mailbox !== 'sent') {
      // Create
      const archiveButton = document.createElement('button');
      archiveButton.innerHTML = result.archived ? "Unarchive" : "Archive";
      
      // Classes
      archiveButton.className = "btn btn-primary";
      
      // Event Listener
      archiveButton.addEventListener('click', () => {
        fetch(`/emails/${email_id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !result.archived,
          }),
        })
        .then(() => {load_mailbox('inbox')});
      });
      
      // Display
      document.querySelector('#email-display-archive-button').innerHTML = '';
      document.querySelector('#email-display-archive-button').append(archiveButton);
    }
  })
}
