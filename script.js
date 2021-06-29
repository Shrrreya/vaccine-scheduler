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
    // let result = year + "-" + month + "-" + date;
    let result = `${year}-${month}-${date}`;
    if (d.length == 19) {   // for Registration Time Stamp
        let hour = d.substr(11, 2);
        let minute = d.substr(14, 2);
        let second = d.substr(17, 2);
        // result += "T" + hour + ":" + minute + ":" + second;
        result += `T${hour}:${minute}:${second}`;
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
            responsive: true,
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

// Score Chart
function scoreChart(scoreChartData, scoreLabelData) {

    let scoreChartCanvas = document.createElement('canvas');
    scoreChartCanvas.id = "score-chart";
    let scoreChartDiv = document.createElement('div');
    scoreChartDiv.id = "score-chart-div";
    scoreChartDiv.appendChild(scoreChartCanvas);
    document.body.appendChild(scoreChartDiv);

    new Chart(document.getElementById('score-chart'), {
        type: 'line',
        data: {
            labels: scoreLabelData,
            datasets: [
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
            responsive: true,
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
}

//Category Chart
function categoryChart(categoryChartData, categoryLabelData, numberOfVaccinesPerDay) {
    let categoryChartCanvas = document.createElement('canvas');
    categoryChartCanvas.id = "category-chart";
    let categoryChartDiv = document.createElement('div');
    categoryChartDiv.id = "category-chart-div";
    categoryChartDiv.appendChild(categoryChartCanvas);
    document.body.appendChild(categoryChartDiv);

    new Chart(document.getElementById('category-chart'), {
        type: 'bar',
        data: {
            labels: categoryLabelData,
            datasets: [
                {
                    label: "FCFS - Category 1",
                    backgroundColor: '#0C0636',
                    data: categoryChartData[0][0],
                    stack: 'FCFS'
                },
                {
                    label: "FCFS - Category 2",
                    backgroundColor: '#095169',
                    data: categoryChartData[0][1],
                    stack: 'FCFS'
                },
                {
                    label: "FCFS - Category 3",
                    backgroundColor: '#059B9A',
                    data: categoryChartData[0][2],
                    stack: 'FCFS'
                },
                {
                    label: "FCFS - Category 4",
                    backgroundColor: '#53BA83',
                    data: categoryChartData[0][3],
                    stack: 'FCFS'
                },
                {
                    label: "FCFS - Category 5",
                    backgroundColor: '#9FD86B',
                    data: categoryChartData[0][4],
                    stack: 'FCFS'
                },
                {
                    label: "Priority - Category 1",
                    backgroundColor: '#402929',
                    data: categoryChartData[1][0],
                    stack: 'Priority'
                },
                {
                    label: "Priority - Category 2",
                    backgroundColor: '#B80000',
                    data: categoryChartData[1][1],
                    stack: 'Priority'
                },
                {
                    label: "Priority - Category 3",
                    backgroundColor: '#FF4000',
                    data: categoryChartData[1][2],
                    stack: 'Priority'
                },
                {
                    label: "Priority - Category 4",
                    backgroundColor: '#FFA700',
                    data: categoryChartData[1][3],
                    stack: 'Priority'
                },
                {
                    label: "Priority - Category 5",
                    backgroundColor: '#F8F9AC',
                    data: categoryChartData[1][4],
                    stack: 'Priority'
                },
            ]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: ['Vaccines To a Category', 'Comparision of algorithms to which category vaccine given', `Vaccines Per Day : ${numberOfVaccinesPerDay}`]
                }
            },
            stacked: true,
            responsive: true,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: ['Algorithm', 'Day Number']
                    },
                    stacked: true
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: ['Number of Vaccines to a particular category']
                    },
                    stacked: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Doughtnut Category Chart
function doughnutCategoryChart(doughnutCategoryChartData) {
    let doughnutCategoryChartCanvas = document.createElement('canvas');
    doughnutCategoryChartCanvas.id = "doughnut-category-chart";
    let doughnutCategoryChartDiv = document.createElement('div');
    doughnutCategoryChartDiv.id = "doughnut-category-chart-div";
    doughnutCategoryChartDiv.appendChild(doughnutCategoryChartCanvas);
    document.body.appendChild(doughnutCategoryChartDiv);

    new Chart(document.getElementById('doughnut-category-chart'), {
        type: 'doughnut',
        data: {
            labels: ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'],
            datasets: [
                {
                    label: "Category Data",
                    data: doughnutCategoryChartData,
                    backgroundColor: ['#370617', '#9d0208', '#dc2f02', '#f48c06', '#ffba08']
                }
            ]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: ['Category Distribution']
                }
            },
            responsive: true,
        }
    });
}

// Get Schedule Date
function getSpecificSchedule(aadharNumber, currentAlgorithm, numberOfVaccinesPerDay, dataset, vaccineSchedulerData) {
    algorithmMap = {
        'fcfs': 0,
        'priority': 1
    }
    console.log(dataset);
    let currentElementIndex = dataset.findIndex(x => x[1] == aadharNumber);
    let aadharResult = document.createElement('p');
    if (currentElementIndex == -1) {
        aadharResult.innerText = "Enter Valid Aadhar Number.";
    }
    else {
        let dayAfterStart = (vaccineSchedulerData[algorithmMap[currentAlgorithm]][numberOfVaccinesPerDay].dayOfVaccine[
            vaccineSchedulerData[algorithmMap[currentAlgorithm]][numberOfVaccinesPerDay].vaccineSequence.findIndex(x => x == currentElementIndex)]);
        console.log(dayAfterStart);
        let resultDate = new Date(dataset[0][5]);
        resultDate.setHours(0, 0, 0);
        resultDate.setDate(resultDate.getDate() + dayAfterStart);
        aadharResult.innerHTML = `${dataset[currentElementIndex][0]} : 
        Your Vaccination Date is : ${resultDate.getDate()}/${resultDate.getMonth()}/${resultDate.getFullYear()}`;
    }
    document.body.appendChild(aadharResult);
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

        let vaccineSchedulerData = getVaccineSchedulerData(dataset, datasetDaysSpan);
        console.log(vaccineSchedulerData);

        // Vaccine Per Day Chart

        let vaccinesPerDayData = [];
        vaccineSchedulerData[0].forEach(element => {
            vaccinesPerDayData.push(element.vaccinetedPerDay.length);
        });
        let vaccinesPerDayLabelData = Array.from(Array(vaccineSchedulerData[0].length + 1).keys()).slice(1,);

        vaccineDayChart(vaccinesPerDayData, vaccinesPerDayLabelData);

        //Score Chart

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
        let scoreLabelData = Array.from(Array(vaccineSchedulerData[0].length + 1).keys()).slice(1,);

        scoreChart(scoreChartData, scoreLabelData);

        // Category Chart

        let numberOfVaccinesPerDay = Number(document.getElementById('vaccines-per-day').value);
        if (numberOfVaccinesPerDay > vaccineSchedulerData[0].length) {
            numberOfVaccinesPerDay = vaccineSchedulerData[0].length;
        }

        let categoryChartData = [];
        let algorithms = ['fcfs', 'priority'];
        algorithms.forEach((algorithm, algorithmIndex) => {
            let currentElement = vaccineSchedulerData[algorithmIndex][numberOfVaccinesPerDay - 1];
            let algorithmCategoryChartData = [];
            for (let i = 0; i < 5; i++) {
                algorithmCategoryChartData.push(new Array(currentElement.vaccinetedPerDay.length).fill(0));
            }
            for (let i = 1; i <= currentElement.vaccinetedPerDay.length; i++) {
                let currentDayIndexes = currentElement.vaccineSequence.filter((x, ind) => currentElement.dayOfVaccine[ind] == i);
                currentDayIndexes.forEach(element => {
                    algorithmCategoryChartData[dataset[element][4] - 1][i - 1]++;
                });
            }
            categoryChartData.push(algorithmCategoryChartData);
        });
        console.log(categoryChartData);
        let categoryLabelData = Array.from(Array(categoryChartData[0][0].length + 1).keys()).slice(1,);

        categoryChart(categoryChartData, categoryLabelData, numberOfVaccinesPerDay);

        // Doughnut Chart 
        let doughnutCategoryChartData = new Array(5).fill(0);
        dataset.forEach(element => {
            doughnutCategoryChartData[element[4] - 1]++;
        });
        console.log(doughnutCategoryChartData);
        doughnutCategoryChart(doughnutCategoryChartData);

        // Aadhar Number Result
        let aadharNumberInputLabel = document.createElement('label');
        aadharNumberInputLabel.for = 'aadhar-number';
        aadharNumberInputLabel.innerHTML = '<strong>Enter Your Aadhar Number : </strong>';
        document.body.appendChild(aadharNumberInputLabel);

        let aadharNumberInput = document.createElement("input");
        aadharNumberInput.id = 'aadhar-number';
        aadharNumberInput.name = 'aadhar-number';
        aadharNumberInput.type = 'number';
        aadharNumberInput.min = 200000000000;
        aadharNumberInput.max = 999999999999;
        aadharNumberInput.value = dataset[0][1];
        document.body.appendChild(aadharNumberInput);

        let aadharNumberSubmit = document.createElement('button');
        aadharNumberSubmit.innerText = "Get Date";
        aadharNumberSubmit.id = "aadhar-number-button";
        document.body.appendChild(aadharNumberSubmit);

        document.getElementById('aadhar-number-button').onclick = () => {
            let aadharNumber = Number(document.getElementById('aadhar-number').value);
            let currentAlgorithm = document.querySelector('input[name="algorithm"]:checked').value;
            getSpecificSchedule(aadharNumber, currentAlgorithm, numberOfVaccinesPerDay, dataset, vaccineSchedulerData);
        };
    });
};