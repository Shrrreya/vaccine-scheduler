// Get a column of the data as an array
const arrayColumn = (arr, n) => arr.map((x) => x[n]);

// Function for displaying the data as table
function showData(columnNames, dataArray) {
    let table = document.createElement('table');
    document.body.appendChild(table);

    // Row for Headings 
    let tableHeadRow = document.createElement('tr');
    table.appendChild(tableHeadRow);
    for (let i = 0; i < columnNames.length; i++) {
        let th = document.createElement('th'),
            thText = document.createTextNode(columnNames[i]);
        th.appendChild(thText);
        tableHeadRow.appendChild(th);
    }

    // Rows for all entries
    for (let i = 0; i < dataArray.length; i++) {
        let row = dataArray[i];
        let tableRow = document.createElement('tr');
        for (let j = 0; j < row.length; j++) {
            table.appendChild(tableRow);
            let td = document.createElement('td');
            let tdText = document.createTextNode(row[j]);
            td.appendChild(tdText);
            tableRow.appendChild(td);
        }
    }
}

// Function for converting Registration Time Stamp and Birthdate strings to Date object 
function stringToDate(d) {
    // 17/05/2021 16:30:50
    // 17/05/2021
    let date = d.substr(0, 2);
    let month = d.substr(3, 2);
    let year = d.substr(6, 4);
    let result = year + "-" + month + "-" + date;
    if (d.length == 19) {   // for Registration Time Stamp
        let hour = d.substr(11, 2);
        let minute = d.substr(14, 2);
        let second = d.substr(17, 2);
        result += "T" + hour + ":" + minute + ":" + second;
    }
    return new Date(result);
}

// Function for updating/correcting category column
function updateCatetgory(data, dividingDate) {
    let date = new Date(dividingDate);
    data.forEach((element, index) => {
        if (element[4] == 4 || element[4] == 5) {
            if (stringToDate(element[3]).getTime() < date.getTime()) {
                data[index][4] = 4;
            }
            else {
                data[index][4] = 5;
            }
        }
    });
}

// Function for updating birthdate and registration time to Date Object
function updateDateTime(dataset) {
    dataset.forEach((element, index) => {
        dataset[index][3] = stringToDate(element[3]);
        dataset[index][5] = stringToDate(element[5]);
    });
}

// Function for caluculating with FCFS algorithm
function fcfs(dataset, vaccinesPerDay) {

    // Sorting according to Registration Time
    dataset.sort((a, b) => a[5] - b[5]);
    console.log(dataset);
    let currentDate = new Date(dataset[0][5].getTime());
    currentDate.setHours(23, 59, 59);
    let buffer = [];
    let result = [];
    let vaccinetedPerDay = [];
    let vaccineSequence = [];
    let dayCount = 0;

    // Adding elements to buffer
    dataset.forEach((element, index) => {
        if (element[5].getTime() > currentDate.getTime()) {
            currentDate.setDate(currentDate.getDate() + 1);
            dayCount++;
            let today = buffer.splice(0, Math.min(vaccinesPerDay, buffer.length));
            vaccineSequence = vaccineSequence.concat(today);
            result = result.concat(Array(today.length).fill(dayCount));
            vaccinetedPerDay.push(today.length);
        }
        buffer.push(index);
    });

    // If the buffer has some elements
    while (buffer.length) {
        currentDate.setDate(currentDate.getDate() + 1);
        dayCount++;
        let today = buffer.splice(0, Math.min(vaccinesPerDay, buffer.length));
        vaccineSequence = vaccineSequence.concat(today);
        result = result.concat(Array(today.length).fill(dayCount));
        vaccinetedPerDay.push(today.length);
    }
    console.log(result);
    console.log(vaccineSequence);
    console.log(vaccinetedPerDay);
}

// Function for calculating with Priority (Category) algorithm
function priority(dataset, vaccinesPerDay) {

    // Sorting according to Registration Time
    dataset.sort((a, b) => a[5] - b[5]);
    console.log(dataset);
    let currentDate = new Date(dataset[0][5].getTime());
    currentDate.setHours(23, 59, 59);
    let buffer = [];
    let result = [];
    let vaccinetedPerDay = [];
    let vaccineSequence = [];
    let dayCount = 0;

    function priorityCompare(a, b) {
        if (dataset[a][4] < dataset[b][4]) {
            return -1;
        }
        else if (dataset[a][4] > dataset[b][4]) {
            return 1;
        }
        else {
            return dataset[a][5] - dataset[b][5];
        }
    }

    // Adding elements to buffer
    dataset.forEach((element, index) => {
        if (element[5].getTime() > currentDate.getTime()) {
            currentDate.setDate(currentDate.getDate() + 1);
            dayCount++;
            buffer.sort(priorityCompare);
            let today = buffer.splice(0, Math.min(vaccinesPerDay, buffer.length));
            vaccineSequence = vaccineSequence.concat(today);
            result = result.concat(Array(today.length).fill(dayCount));
            vaccinetedPerDay.push(today.length);
        }
        buffer.push(index);
    });

    // If the buffer has some elements
    while (buffer.length) {
        currentDate.setDate(currentDate.getDate() + 1);
        dayCount++;
        buffer.sort(priorityCompare);
        let today = buffer.splice(0, Math.min(vaccinesPerDay, buffer.length));
        vaccineSequence = vaccineSequence.concat(today);
        result = result.concat(Array(today.length).fill(dayCount));
        vaccinetedPerDay.push(today.length);
    }
    console.log(result);
    console.log(vaccineSequence);
    console.log(vaccinetedPerDay);
}

// Event Listener for Calculate
document.getElementById("calculate").onclick = () => {

    // When calculate is pressed, Show Data button appears
    let showDataButton = document.getElementById("show-data-button");
    showDataButton.classList.add("visible");

    // Accessing the file uploaded in input
    let file = document.getElementById("file");
    readXlsxFile(file.files[0]).then(function (data) {

        // Removing the features row from main dataset
        dataColumns = data.shift();

        // Using only first 20 rows
        data = data.slice(0, 20);

        //Updating Category column for values 4 and 5 accoording to birthdate
        updateCatetgory(data, "1976-05-10T00:00:00");

        // Event Listener for Show Data button
        showDataButton.onclick = () => {
            showData(dataColumns, data);
        };

        // Copying the data to run operations on it
        let dataset = JSON.parse(JSON.stringify(data));

        // Updating Birthdate and Registration Time columns to Date object
        updateDateTime(dataset);

        let vaccinesPerDay = 100;
        let algorithm = document.querySelector('input[name="algorithm"]:checked').value;
        if (algorithm == "fcfs") {
            fcfs(dataset, vaccinesPerDay);
        }
        else if (algorithm == "priority") {
            priority(dataset, vaccinesPerDay);
        }
    });
};