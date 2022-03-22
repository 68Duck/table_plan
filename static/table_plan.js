const tables = document.getElementsByName("table")
const tableDivs = document.getElementsByName('changing_tables_input')
const confirming_changes_displays = document.getElementsByName("confirming_changes_display")
const alertDiv = document.getElementById("alertDiv")
const alert_p = document.getElementById("alert")
const messagesDiv = document.getElementById("messagesDiv")
const message = document.getElementById("message")
const email_input_div = document.getElementById("email_input_div")
const email_sent_message = document.getElementById("email_sent_message")
const changes_table = document.getElementById("changes_table")
const forename_span = document.getElementById("forename_span")
const surname_span = document.getElementById("surname_span")

function submit_pressed(){
  alertDiv.style.display = "none"
  messagesDiv.style.display = "none"

  var tables_data = []
  for (var t=0;t<tables.length;t++){
    table = tables[t]
    var table_data = [];
    for (var a=0;a<tables[0].rows.length;a++){
      var row = []
      for (var b=0;b<tables[0].rows[0].cells.length;b++){
        row.push(null)
      }
      table_data.push(row)
    }
    for (var i=0,row;row=table.rows[i];i++){
      for (var j=0,col;col = row.cells[j];j++){
        if (col != null){
          table_data[i][j] = col.innerHTML
        }
      }
    }
    tables_data.push(table_data)
  }
  find_changes(tables_data)
}

function confirm_changes_pressed(){
  var tables_data = []
  for (var t=0;t<tables.length;t++){
    table = tables[t]
    var table_data = [];
    for (var a=0;a<tables[0].rows.length;a++){
      var row = []
      for (var b=0;b<tables[0].rows[0].cells.length;b++){
        row.push(null)
      }
      table_data.push(row)
    }
    for (var i=0,row;row=table.rows[i];i++){
      for (var j=0,col;col = row.cells[j];j++){
        if (col != null){
          table_data[i][j] = col.innerHTML
        }
      }
    }
    tables_data.push(table_data)
  }
  confirm_changes(tables_data)
}

function back_pressed(){
  alertDiv.style.display = "none"
  messagesDiv.style.display = "none"
  for (var t=0;t<tableDivs.length;t++){
    tableDivs[t].style.display = "block"
  }
  for (var i=0;i<confirming_changes_displays.length;i++){
    confirming_changes_displays[i].style.display="none"
  }
  while (changes_table.firstChild) {
    changes_table.removeChild(changes_table.firstChild)
  }
}

const confirm_changes = async (table_data) => {
  const url = '/table_plan_confirm_changes'; // the URL to send the HTTP request to
  var confirm_changes_data = {
    "table_data":table_data,
    "forename":forename_span.innerHTML,
    "surname":surname_span.innerHTML
  }
  const body = JSON.stringify(confirm_changes_data); // whatever you want to send in the body of the HTTP request
  const headers = {'Content-Type': 'application/json'}; // if you're sending JSON to the server
  const method = 'POST';
  const response = await fetch(url, { method, body, headers });
  const data = await response.text(); // or response.json() if your server returns JSON
  if (data=="All OK"){
    for (var t=0;t<tableDivs.length;t++){
      tableDivs[t].style.display = "block"
    }
    for (var i=0;i<confirming_changes_displays.length;i++){
      confirming_changes_displays[i].style.display="none"
    }
    while (changes_table.firstChild) {
      changes_table.removeChild(changes_table.firstChild)
    }
    messagesDiv.style.display = "block";
    message.innerHTML = "Your changes were made"
  }else{
    alertDiv.style.display="block"
    alert_p.innerHTML = data
  }
}


const find_changes = async (table_data) => {
   const url = '/table_plan_find_changes'; // the URL to send the HTTP request to
   const body = JSON.stringify(table_data); // whatever you want to send in the body of the HTTP request
   const headers = {'Content-Type': 'application/json'}; // if you're sending JSON to the server
   const method = 'POST';
   const response = await fetch(url, { method, body, headers });
   const data = await response.json(); // or response.json() if your server returns JSON

   for (var t=0;t<tableDivs.length;t++){
     tableDivs[t].style.display = "none"
   }
   for (var i=0;i<confirming_changes_displays.length;i++){
     confirming_changes_displays[i].style.display="block"
   }
   const thead = document.createElement("thead")
   var tr = document.createElement("tr")
   var th = document.createElement("th")
   th.innerHTML = "Forename"
   thead.append(th)
   var th = document.createElement("th")
   th.innerHTML = "Surname"
   thead.append(th)
   var th = document.createElement("th")
   th.innerHTML = "Table Number"
   thead.append(th)
   var th = document.createElement("th")
   th.innerHTML = "Seat Number"
   thead.append(th)
   changes_table.append(thead)

   var tbody = document.createElement("tbody")
   for (var i=0;i<data.length;i++){
     var tr = document.createElement("tr")
     for (var j=0;j<data[i].length;j++){
       var td = document.createElement("td")
       td.setAttribute("contenteditable",false)
       td.setAttribute("name","tableItem")
       td.setAttribute("class",".tableItem")
       td.innerHTML = data[i][j]
       tr.append(td)
     }
     tbody.append(tr)
   }
   changes_table.append(tbody)

}
