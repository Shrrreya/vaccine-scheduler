// Get a column of the data as an array
const arrayColumn = (arr, n) => arr.map((x) => x[n]);

// Function for displaying the data as table
function showData(columnNames, dataArray) {
    var table = document.createElement('table');
    document.body.appendChild(table);

    // Row for Headings 
    var tableHeadRow = document.createElement('tr');
    table.appendChild(tableHeadRow);
    for (var i = 0; i < columnNames.length; i++) {
        var th = document.createElement('th'),
            thText = document.createTextNode(columnNames[i]);
        th.appendChild(thText);
        tableHeadRow.appendChild(th);
    }

    // Rows for all entries
    for (var i = 0; i < dataArray.length; i++) {
        var row = dataArray[i];
        var tableRow = document.createElement('tr');
        for (var j = 0; j < row.length; j++) {
            table.appendChild(tableRow);
            var td = document.createElement('td');
            var tdText = document.createTextNode(row[j]);
            td.appendChild(tdText);
            tableRow.appendChild(td);
        }
    }
}

// Function for converting Registration Time Stamp and Birthdate strings to Date object 
function stringToDate(d) {
    // 17/05/2021 16:30:50
    // 17/05/2021
    var date = d.substr(0, 2);
    var month = d.substr(3, 2);
    var year = d.substr(6, 4);
    var result = year + "-" + month + "-" + date;
    if (d.length == 19) {   // for Registration Time Stamp
        var hour = d.substr(11, 2);
        var minute = d.substr(14, 2);
        var second = d.substr(17, 2);
        result += "T" + hour + ":" + minute + ":" + second;
    }
    return new Date(result);
}

// Event Listener for Calculate
document.getElementById("calculate").onclick = () => {

    // When calculate is pressed, Show Data button appears
    var showDataButton = document.getElementById("show-data-button");
    showDataButton.classList.toggle("visible");

    // Accessing the file uploaded in input
    var file = document.getElementById("file");
    readXlsxFile(file.files[0]).then(function (data) {

        // Removing the features row from main dataset
        dataColumns = data.shift();

        // Using only first 20 rows
        data = data.slice(0, 20);
        
        //Updating Category column for values 4 and 5 accoording to birthdate
        var dividingDate = new Date("1976-05-10T00:00:00");
        data.forEach((element, index) => {
            if (element[4] == 4 || element[4] == 5) {
                if (stringToDate(element[3]).getTime() < dividingDate.getTime()) {
                    data[index][4] = 4;
                }
                else {
                    data[index][4] = 5;
                }
            }
        });

        // Event Listener for Show Data button
        showDataButton.onclick = () => {
            showData(dataColumns, data);
        };

        // Copying the data to run operations on it
        var dataset = JSON.parse(JSON.stringify(data));

        // Updating Birthdate and Registration Time columns to Date object
        dataset.forEach((element, index) => {
            dataset[index][3] = stringToDate(element[3]);
            dataset[index][5] = stringToDate(element[5]);
        });

        // dataset.sort((a, b) => a[5] - b[5]);
        console.log(dataset);
    });
};