var table_name_input = document.getElementById("table_name_choice")
var table = document.getElementById("table")


function open_table(){
  get_table_data(table_name_input.value)

}

function update_table(){
  var table_data = [];
  for (var a=0;a<table.rows.length;a++){
    var row = []
    for (var b=0;b<table.rows[0].cells.length;b++){
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
  console.log(table_data)
  table_open = table_name_input.value
  update_admin_table(table_open,table_data)
}

const update_admin_table = async (table_name,table_data) => {
    table_data.push(table_name)
   const url = '/table_plan_admin_update_table'; // the URL to send the HTTP request to
   const body = JSON.stringify(table_data); // whatever you want to send in the body of the HTTP request
   const headers = {'Content-Type': 'application/json'}; // if you're sending JSON to the server
   const method = 'POST';
   const response = await fetch(url, { method, body, headers });
   const data = await response.json(); // or response.json() if your server returns JSON
}

const get_table_data = async (table_name) => {
   const url = '/table_plan_admin_open_table'; // the URL to send the HTTP request to
   const body = JSON.stringify(table_name); // whatever you want to send in the body of the HTTP request
   const headers = {'Content-Type': 'application/json'}; // if you're sending JSON to the server
   const method = 'POST';
   const response = await fetch(url, { method, body, headers });
   const data = await response.json(); // or response.json() if your server returns JSON

   table.innerHTML = null

   const thead = document.createElement("thead")
   var tr = document.createElement("tr")
   for (var i=0;i<data[0].length;i++){
     var th = document.createElement("th")
     th.innerHTML = data[0][i]
     thead.append(th)
   }
   thead.append(th)
   table.append(thead)

   var tbody = document.createElement("tbody")
   for (var i=1;i<data.length;i++){
     var tr = document.createElement("tr")
     for (var j=0;j<data[i].length;j++){
       var td = document.createElement("td")
       td.setAttribute("contenteditable",true)
       td.setAttribute("name","tableItem")
       td.setAttribute("class",".tableItem")
       td.innerHTML = data[i][j]
       tr.append(td)
     }
     tbody.append(tr)
   }
   table.append(tbody)

}


get_table_data(table_name_input.value)
