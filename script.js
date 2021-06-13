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

// Function to find Days Span of dataset

function findDaysSpan(d1, d2) {
    let date1 = new Date(d1.getTime());
    let date2 = new Date(d2.getTime());
    date1.setHours(0, 0, 0);
    date2.setHours(0, 0, 0);
    return (date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24) + 1;
}

// Function to calculate schedule
function calculateSchedule(dataset, vaccinesPerDay, algorithm = 'fcfs') {

    // Sorting according to Registration Time
    // dataset.sort((a, b) => a[5] - b[5]);
    let currentDate = new Date(dataset[0][5].getTime());
    currentDate.setHours(0, 0, 0);
    currentDate.setDate(currentDate.getDate() + 1);
    let buffer = [];
    let dayOfVaccine = [];
    let vaccinetedPerDay = [];
    let vaccineSequence = [];
    let daysFromRegistration = [];
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

        if (element[5].getTime() >= currentDate.getTime()) {

            dayCount++;
            if (algorithm == "priority") {
                buffer.sort(priorityCompare);
            }
            let filteredBuffer = buffer.filter(bufferElement =>
                dataset[bufferElement][5].getTime() < currentDate.getTime());
            let today = filteredBuffer.splice(0, Math.min(vaccinesPerDay, filteredBuffer.length));
            buffer = buffer.filter(x => !today.includes(x));
            vaccineSequence = vaccineSequence.concat(today);
            dayOfVaccine = dayOfVaccine.concat(Array(today.length).fill(dayCount));
            vaccinetedPerDay.push(today.length);

            today.forEach(element => {
                daysFromRegistration.push(findDaysSpan(dataset[element][5], currentDate));
                daysFromRegistration[daysFromRegistration.length - 1]--;
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        buffer.push(index);
    });

    // If the buffer has some elements
    while (buffer.length) {

        dayCount++;
        if (algorithm == "priority") {
            buffer.sort(priorityCompare);
        }
        let filteredBuffer = buffer.filter(bufferElement =>
            dataset[bufferElement][5].getTime() < currentDate.getTime());
        let today = filteredBuffer.splice(0, Math.min(vaccinesPerDay, filteredBuffer.length));
        buffer = buffer.filter(x => !today.includes(x));
        vaccineSequence = vaccineSequence.concat(today);
        dayOfVaccine = dayOfVaccine.concat(Array(today.length).fill(dayCount));
        vaccinetedPerDay.push(today.length);

        today.forEach(element => {
            daysFromRegistration.push(findDaysSpan(dataset[element][5], currentDate));
            daysFromRegistration[daysFromRegistration.length - 1]--;
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
        dayOfVaccine,
        vaccineSequence,
        vaccinetedPerDay,
        daysFromRegistration
    };
}

//Function to get Vaccines Per Day Data
function getVaccineSchedulerData(dataset, datasetDaysSpan) {
    let vaccineSchedulerData = [[], []];
    let algorithms = ['fcfs', 'priority'];
    for (let vaccinesPerDay = 1; ; vaccinesPerDay += 1) {
        algorithms.forEach((algorithm, index) => {
            let scheduleResult = calculateSchedule(dataset, vaccinesPerDay, algorithm);
            vaccineSchedulerData[index].push(scheduleResult);
        });
        if (vaccineSchedulerData[0][vaccinesPerDay - 1].vaccinetedPerDay.length == datasetDaysSpan) {
            break;
        }
    }
    return vaccineSchedulerData;
}

// Vaccine Day Chart
function vaccineDayChart(vaccinesPerDayData, vaccinesPerDayLabelData) {
    let vaccinesPerDayChartCanvas = document.createElement('canvas');
    vaccinesPerDayChartCanvas.id = "vaccines-day-chart";
    let vaccinesPerDayChartDiv = document.createElement('div');
    vaccinesPerDayChartDiv.id = "vaccines-day-chart-div";
    vaccinesPerDayChartDiv.appendChild(vaccinesPerDayChartCanvas);
    document.body.appendChild(vaccinesPerDayChartDiv);

    new Chart(document.getElementById('vaccines-day-chart'), {
        type: 'line',
        data: {
            labels: vaccinesPerDayLabelData,
            datasets: [
                {
                    label: "Max Number Of Days",
                    borderColor: '#DC3912',
                    data: vaccinesPerDayData
                }
            ]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: ['Vaccines Per Day', 'Maximum Number of Days of Vaccination']
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Vaccines Per Day'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: ['Maximum Number of Days of Vaccination', 'Logairthmic Scale']
                    },
                    type: 'logarithmic'
                }
            }

        }
    });
}

// Event Listener for Calculate
document.getElementById("calculate").onclick = () => {

    // When calculate is pressed, Show Data button appears
    let showDataButton = document.getElementById("show-data-button");
    showDataButton.classList.remove("visible");

    // Accessing the file uploaded in input
    let file = document.getElementById("file");
    readXlsxFile(file.files[0]).then(function (data) {

        // Removing the features row from main dataset
        dataColumns = data.shift();

        // data = data.slice(0, 20);
        //Updating Category column for values 4 and 5 accoording to birthdate
        updateCatetgory(data, "1976-05-10T00:00:00");

        // Event Listener for Show Data button
        showDataButton.onclick = () => {
            showData(dataColumns, data.slice(0, 20));
        };

        // Copying the data to run operations on it
        let dataset = JSON.parse(JSON.stringify(data));

        // Updating Birthdate and Registration Time columns to Date object
        updateDateTime(dataset);

        dataset.sort((a, b) => a[5] - b[5]);

        console.log(dataset);
        let datasetDaysSpan = findDaysSpan(dataset[0][5], dataset[dataset.length - 1][5]);

        // let currentAlgorithm = document.querySelector('input[name="algorithm"]:checked').value;

        let vaccineSchedulerData = getVaccineSchedulerData(dataset, datasetDaysSpan);

        let vaccinesPerDayData = [];
        vaccineSchedulerData[0].forEach(element => {
            vaccinesPerDayData.push(element.vaccinetedPerDay.length);
        });
        let vaccinesPerDayLabelData = Array.from(Array(vaccineSchedulerData[0].length + 1).keys()).slice(1,);

        vaccineDayChart(vaccinesPerDayData, vaccinesPerDayLabelData);

        console.log(vaccineSchedulerData);
        let scoreChartData = [[], []];

        vaccineSchedulerData.forEach((algorithmData, algorithmIndex) => {
            algorithmData.forEach(datapoint => {
                let currentScore = 0;
                datapoint.vaccineSequence.forEach((element, index) => {
                    currentScore += (5 * (dataset.length - datapoint.daysFromRegistration[index]) + (6 - dataset[element][4])) ** 2;
                });
                scoreChartData[algorithmIndex].push(currentScore ** 0.5);
            });
        });
        console.log(scoreChartData);

        let scoreChartCanvas = document.createElement('canvas');
        scoreChartCanvas.id = "score-chart";
        let scoreChartDiv = document.createElement('div');
        scoreChartDiv.id = "score-chart-div";
        scoreChartDiv.appendChild(scoreChartCanvas);
        document.body.appendChild(scoreChartDiv);

        new Chart(document.getElementById('score-chart'), {
            type: 'line',
            data: {
                labels: vaccinesPerDayLabelData,
                datasets: [
                    // {
                    //     label: "FCFS",
                    //     borderColor: '#109618',
                    //     data: scoreChartData[0].map(x=>0)
                    // },
                    // {
                    //     label: "Priority",
                    //     borderColor: '#990099',
                    //     data: scoreChartData[1].map((x,i)=>scoreChartData[1][i]-scoreChartData[0][i])
                    // }
                    {
                        label: "FCFS",
                        borderColor: '#109618',
                        data: scoreChartData[0],
                        yAxisID: 'y'
                    },
                    {
                        label: "Priority",
                        borderColor: '#990099',
                        data: scoreChartData[1],
                        yAxisID: 'y'
                    },
                    {
                        label: "Difference (Priority - FCFS)",
                        borderColor: '#FF9900',
                        data: scoreChartData[1].map((x, i) => (x - scoreChartData[0][i])),
                        yAxisID: 'y1'
                    }

                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: ['Scoring Algorithms', 'FCFS vs Priority']
                    }
                },
                stacked: true,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Vaccines Per Day'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: ['Score']
                        },
                        position: 'left'
                        // type: 'logarithmic'
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        display: true,
                        title: {
                            display: true,
                            text: ['Score Difference']
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                    }

                }
            }
        });
    });
};