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
const forename_inputs = document.getElementsByName("forename_input")
const surname_inputs = document.getElementsByName("surname_input")


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

          var test = col.querySelectorAll(".autocomplete_input")
          if (test.length != 0){
            table_data[i][j] = test[0].value
          }
        }
      }
    }
    tables_data.push(table_data)
  }
  console.log(tables_data)
  find_changes(tables_data)
  window.scrollTo({top:0,behaviour:"smooth"})
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

          var test = col.querySelectorAll(".autocomplete_input")
          if (test.length != 0){
            table_data[i][j] = test[0].value
          }
        }
      }
    }
    tables_data.push(table_data)
  }
  confirm_changes(tables_data)
  window.scrollTo({top:0,behaviour:"smooth"})
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
  window.location.reload()
}

const confirm_changes = async (table_data) => {
  const url = '/table_plan_confirm_changes'; // the URL to send the HTTP request to
  var confirm_changes_data = {
    "table_data":table_data,
    "forename":forename_span.innerHTML,
    "surname":surname_span.innerHTML,
    "check_data":original_table_data
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




function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}


for (i=0;i<forename_inputs.length;i++){
  autocomplete(forename_inputs[i],forenames)
}
for (i=0;i<surname_inputs.length;i++){
  autocomplete(surname_inputs[i],surnames)
}
