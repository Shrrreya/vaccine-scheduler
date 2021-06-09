const arrayColumn = (arr, n) => arr.map((x) => x[n]);

function sortFunction(a, b, n) {
    if (a[n] === b[n]) {
        return 0;
    }
    else {
        return (a[n] < b[n]) ? -1 : 1;
    }
}

function showData(columnNames, dataArray) {
    var table = document.createElement('table');
    document.body.appendChild(table);
    var tableHeadRow = document.createElement('tr');
    table.appendChild(tableHeadRow);
    for (var i = 0; i < columnNames.length; i++) {
        var th = document.createElement('th'),
            columns = document.createTextNode(columnNames[i]);
        th.appendChild(columns);
        tableHeadRow.appendChild(th);
    }
    for (var i = 0; i < dataArray.length; i++) {
        var row = dataArray[i];
        var tableRow = document.createElement('tr');
        for (var j = 0; j < row.length; j++) {
            table.appendChild(tableRow);
            var th2 = document.createElement('td');
            var date2 = document.createTextNode(row[j]);
            th2.appendChild(date2);
            tableRow.appendChild(th2);
        }
    }
}
document.getElementById("calculate").onclick = () => {
    var showDataButton=document.getElementById("show-data-button");
    showDataButton.classList.toggle("visible");
    var file = document.getElementById("file");
    readXlsxFile(file.files[0]).then(function (data) {
        dataColumns = data.shift();
        showDataButton.onclick = () => {
            showData(dataColumns, data);
        };
    });
};