const email_input = document.getElementById("email_input")
const alertDiv = document.getElementById("alertDiv")
const alert_p = document.getElementById("alert")
const messagesDiv = document.getElementById("messagesDiv")
const message = document.getElementById("message")
const email_input_div = document.getElementById("email_input_div")
const email_sent_message = document.getElementById("email_sent_message")

function submit_pressed(){
  email = email_input.value
  send_email(email)
}


const send_email = async (email) => {
   const url = '/table_plan_login_email'; // the URL to send the HTTP request to
   const body = JSON.stringify(email); // whatever you want to send in the body of the HTTP request
   const headers = {'Content-Type': 'application/json'}; // if you're sending JSON to the server
   const method = 'POST';
   const response = await fetch(url, { method, body, headers });
   const data = await response.text(); // or response.json() if your server returns JSON
   if (data == "Email sent"){
     alertDiv.style.display = "none";
     messagesDiv.style.display = "block";
     message.innerHTML = data;
     email_sent_message.style.display="block"
     email_input_div.style.display="none"
   }else{
     messagesDiv.style.display = "none";
     alertDiv.style.display = "block";
     alert_p.innerHTML = data;
   }
   email_input.innerHTML = ""

}

document.addEventListener("keypress", function onEvent(event) {
    if (event.key === "Enter") {
        submit_pressed()
    }
});
