// the database shall be queried only when user data has changed in the DB.
// This will be made true after edit and delete as we dont want to query the DB
// unless there is any change in user data - not Implemented so far
var anyChangesMadeToDB = false;

// this meals is an array that will store the meals fetched from the DB
// and will be updated only when above flag(anyChangesMadeToDB) is true,
var meals;

// this list of meals will store the meal objects for the current filter type
var mealsOnThisDate = []; // to be renamed to filteredMealsList
var currentDisplayPanel;
// this variable will hold the value of user's daily calorie intake limit
var dailyCalLimit;

//Below flags are used for edit purposes
var usesFilteredMeals = false;
var useOriginalMealsList = true;

// Uncovers the add meal form for the users
const showAddMealForm = () => {
    currentDisplayPanel = document.getElementById('mealList');
    if (currentDisplayPanel.style.display == 'block') {
        currentDisplayPanel.style.display = 'none';
    }

    let userCalorieLimitDisplay = document.getElementById('limitDiv');
    userCalorieLimitDisplay.style.display = 'none';

    // if not destroyed, it takes the last list and appends the same content 
    // to the previous display panel(unnecessarily populates the mealList with redundant meals)
    console.log('length of mealList before deleting in showAddMealForm: ', mealList.children.length);
    destroyAllChildrenOfMealListDisplay();
    console.log('length of mealList after deleting in showAddMealForm: ', mealList.children.length);

    document.getElementById('filterButtons').style.display = 'none';
    document.getElementById('addMealForm').style.display = 'block';
}

// comparator function to sort food based on consumption date(latest consumed food first - Descending order)
const comparatorForDate = (a, b) => {
    let d1 = new Date(a.datetime);
    let d2 = new Date(b.datetime);
    if (d1.getTime() > d2.getTime()) {
        return -1;
    } else if (d1.getTime() == d2.getTime()) {
        return 0;
    } else {
        return 1;
    }
}

// comparator function to sort meals based on calorie in ascending order
const comparatorForCalorieAsc = (a, b) => {
    // console.log(`${typeof(a.calorie)}, ${typeof(b.calorie)}`);
    // console.log(`${a.calorie}, ${b.calorie}`);

    if (parseInt(a.calorie, 10) > parseInt(b.calorie, 10)) {
        return 1;
    } else if (parseInt(a.calorie, 10) == parseInt(b.calorie, 10)) {
        return 0;
    } else {
        return -1;
    }
}

// comparator function to sort meals based on calorie in descending order
const comparatorForCalorieDesc = (a, b) => {
    if (parseInt(a.calorie, 10) > parseInt(b.calorie, 10)) {
        return -1;
    } else if (parseInt(a.calorie, 10) == parseInt(b.calorie, 10)) {
        return 0;
    } else {
        return 1;
    }
}


// this function should be called only when the DB has been populated with a new meal
const getUpdatedConsumptionStatus = async (flag) => {
    if (flag) {
        console.log('called getUpdatedConsumptionStatus after adding food!');
        let response = await fetch('http://localhost:3000/users/list', {
            method: "GET"
        });
        let data = await response.json();
        meals = data.userdata.meals;
    }

    let todaysConsumption = 0;
    let date = new Date();
    for (let i = 0; i < meals.length; i++) {
        let dateValue = new Date(meals[i].datetime);
        if (dateValue.getDate() == date.getDate() &&
            dateValue.getMonth() + 1 == date.getMonth() + 1 &&
            dateValue.getFullYear() == date.getFullYear()) {
            todaysConsumption += parseInt(meals[i].calorie);
        }
    }
    // Alert the user as soon as calorie limit is violated
    if (todaysConsumption > dailyCalLimit) {
        alert('calorie limit voilated!');
    }

}

// Exposes the meal display panel to the users for viewing, editing and deleting
const createMealDispalyPanel = (mealsList, mealListPanel) => {
    // if (mealListPanel.style.display == 'block') {
    //     alert('already in display');
    //     mealListPanel.style.display = 'none';
    //     console.log('destroying last panel from createMealDispalyPanel');
    //     destroyAllChildrenOfMealListDisplay();
    // }

    if (mealListPanel.style.display != 'block') {
        let hr = document.createElement('hr');
        let br = document.createElement('br');

        if (!mealsList.length) {
            // if the user has no meal added, display the no meal text
            mealListPanel.style.display = 'none';
            alert('No meals found for the selected Date!');
            // document.getElementById('emptyMealsList').style.display = 'block';
        } else {
            // mealsList.sort(comparatorForDate);

            // Dynamically created HTML Structure for meal display panel
            // <div id="div[i]">
            // 	<div id="contentDiv">
            // 		<input type="date" id="date">
            // 		<input type="text" id="foodname">
            // 		<input type="number" id="calorie">
            // 	</div>
            // 	<div id="buttonDiv">
            // 		<input type="submit" id="edit">
            // 		<input type="submit" id="delete">
            // 		<input type="submit" id="cancel">
            // 	</div>
            // </div>

            for (let i = 0; i < mealsList.length; i++) {
                let divItem = document.createElement('div');
                let index = i + 1;
                let className = 'editOrDeleteFoodForm' + index;
                divItem.classList.add(className);

                let contentDiv = document.createElement('div');
                contentDiv.classList.add('contentDiv');

                let buttonDiv = document.createElement('div');
                buttonDiv.classList.add('buttonDiv');

                let contentPara = document.createElement('p');

                // create input type elements
                let datetime = document.createElement('input');
                datetime.setAttribute('type', 'datetime');
                datetime.classList.add('datetime', 'inline-child');

                let foodname = document.createElement('input');
                foodname.setAttribute('type', 'text');
                foodname.classList.add('foodname', 'inline-child');

                let calorie = document.createElement('input');
                calorie.setAttribute('type', 'number');
                calorie.classList.add('calorie', 'inline-child');

                let editButton = document.createElement('input');
                editButton.setAttribute('type', 'submit');
                editButton.setAttribute('value', 'save');
                editButton.classList.add('form-button');

                let deleteButton = document.createElement('input');
                deleteButton.setAttribute('type', 'submit');
                deleteButton.setAttribute('value', 'delete');
                deleteButton.classList.add('form-button');

                let cancelButton = document.createElement('input');
                cancelButton.setAttribute('type', 'submit');
                cancelButton.setAttribute('value', 'cancel');
                cancelButton.classList.add('form-button');

                let date = new Date(mealsList[i].datetime);

                datetime.value = date.getFullYear().toString() + '-' +
                    (date.getMonth() + 1).toString().padStart(2, 0) + '-' +
                    date.getDate().toString().padStart(2, 0);

                foodname.value = mealsList[i].food_name;
                calorie.value = mealsList[i].calorie;

                // append elements to contentDiv
                contentDiv.appendChild(datetime);
                contentDiv.appendChild(foodname);
                contentDiv.appendChild(calorie);

                // append buttons to buttonDiv
                buttonDiv.appendChild(editButton);
                buttonDiv.appendChild(deleteButton);
                buttonDiv.appendChild(cancelButton);

                divItem.appendChild(contentDiv);
                divItem.appendChild(buttonDiv);

                mealListPanel.appendChild(divItem);
            }

            // set the default date of filter date type to todays date
            // let today = new Date();
            // document.getElementById('filterDate').defaultValue = today.getFullYear().toString() + '-' +
            //     (today.getMonth() + 1).toString().padStart(2, 0) + '-' +
            //     today.getDate().toString().padStart(2, 0);

            // commented now
            // expose the filter buttons
            // document.getElementById('filterButtons').style.display = 'inline-block';

            // expose the mealListPanel
            mealListPanel.style.display = 'block';
        }

    }
}

// This function destroys all the children of an HTML element
const destroyAllChildrenOfMealListDisplay = () => {
    console.log('length of mealList before deleting:', currentDisplayPanel.children.length);
    while (currentDisplayPanel.firstChild) {
        currentDisplayPanel.removeChild(currentDisplayPanel.lastChild);
    }
    console.log('length of mealList after deleting:', currentDisplayPanel.children.length);
}

// Function to filter foods by date
const filterByDate = async () => {
    usesFilteredMeals = true;
    useOriginalMealsList = false;

    let dateValue = new Date(document.getElementById('filterDate').value);
    currentDisplayPanel = document.getElementById('mealList');
    currentDisplayPanel.style.display = 'none';


    let response = await fetch('http://localhost:3000/users/list', {
        method: "GET"
    });
    let data = await response.json();
    meals = data.userdata.meals;

    mealsOnThisDate = [];
    for (let i = 0; i < meals.length; i++) {
        let date = new Date(meals[i].datetime);
        if (dateValue.getDate() == date.getDate() &&
            dateValue.getMonth() + 1 == date.getMonth() + 1 &&
            dateValue.getFullYear() == date.getFullYear()) {
            mealsOnThisDate.push(meals[i]);
        }
    }

    // If the users food list is empty on a particular date
    if (mealsOnThisDate.length == 0) {
        alert('no meals found for the selected Date!');
    } else {
        // destroy the existing meal display panel and recreate a new one
        destroyAllChildrenOfMealListDisplay();
        createMealDispalyPanel(mealsOnThisDate, currentDisplayPanel);
    }
}

// Function to filter the meals on the current display panel - needs work
const sortDisplayPanel = () => {
    console.log('sortDisplayPanel called!');
    usesFilteredMeals = true;
    useOriginalMealsList = false;

    let sortingParam = document.getElementById('sortBy').value;
    let sortOrder = document.getElementById('sortOrder').value;
    currentDisplayPanel = document.getElementById('mealList');
    currentDisplayPanel.style.display = 'none';

    if (mealsOnThisDate.length > 0) {
        console.log('length valid');
        destroyAllChildrenOfMealListDisplay();
        // console.log(`sorting param:  ${sortingParam} and sortOrd: ${sortOrder}`);
        console.log('mealsOnThisDate before sorting: ', mealsOnThisDate);
        if (sortingParam == 'Calorie') {
            if (sortOrder == 'Ascending') {
                console.log('entered Ascending cond');
                mealsOnThisDate.sort(comparatorForCalorieAsc);
                console.log('mealsOnThisDate after sorting in Ascending order: ', mealsOnThisDate);
                createMealDispalyPanel(mealsOnThisDate, currentDisplayPanel);
            } else {
                // console.log('entered Descending cond');
                mealsOnThisDate.sort(comparatorForCalorieDesc);
                // console.log('mealsOnThisDate after sorting in Descending order: ', mealsOnThisDate);
                createMealDispalyPanel(mealsOnThisDate, currentDisplayPanel);
            }
        } else {
            // console.log('entered for timestamp');
            mealsOnThisDate.sort(comparatorForDate);
            createMealDispalyPanel(mealsOnThisDate, currentDisplayPanel);
        }
    } else {
        console.log('no meals to sort');
    }
}

const getMealsList = async () => {
    // alert('clicked on getMealsList');
    // hide the add-meal form before displaying the meals list for editing or deleting
    var addMealForm = document.getElementById('addMealForm');
    if (addMealForm.style.display == 'block') {
        addMealForm.style.display = 'none';
    }
    currentDisplayPanel = document.getElementById('mealList');
    // if (currentDisplayPanel.style.display == 'block') {
    //     // alert('already in display');
    //     destroyAllChildrenOfMealListDisplay();
    // }

    try {
        // this list api will fetch all the user data from the DB
        let response = await fetch('http://localhost:3000/users/list', {
            method: "GET"
        });
        let data = await response.json();

        let dailyLimit = document.getElementById('daily-limit');
        dailyLimit.value = data.userdata.calories_per_day;
        dailyLimit.style.display = 'inline-block';

        dailyCalLimit = data.userdata.calories_per_day;
        meals = data.userdata.meals;

        usesFilteredMeals = true;
        useOriginalMealsList = false;

        // this will show the daily limit of the user on the nav bar's center
        document.getElementById('limitDiv').style.display = 'block';

        if (meals.length == 0) {
            currentDisplayPanel.style.display = 'none';
            alert('no meals found for the selected Date!');
        } else {
            // console.log('before soting: ', meals);
            // meals.sort(comparatorForDate);
            // console.log('after soting: ', meals);


            // added now
            let today = new Date();
            document.getElementById('filterDate').defaultValue = today.getFullYear().toString() + '-' +
                (today.getMonth() + 1).toString().padStart(2, 0) + '-' +
                today.getDate().toString().padStart(2, 0);

            // added now
            document.getElementById('filterButtons').style.display = 'inline-block';

            // added now
            // let todaysMeals = [];
            mealsOnThisDate = [];
            for (let i = 0; i < meals.length; i++) {
                let dateValue = new Date(meals[i].datetime);
                if (dateValue.getDate() == today.getDate() &&
                    dateValue.getMonth() + 1 == today.getMonth() + 1 &&
                    dateValue.getFullYear() == today.getFullYear()) {
                    mealsOnThisDate.push(meals[i]);
                }
            }
            // console.log('meals on this date: ', mealsOnThisDate);
            // console.log('length of currentDisplayPanel: ', currentDisplayPanel.children.length);
            mealsOnThisDate.sort(comparatorForDate);
            createMealDispalyPanel(mealsOnThisDate, currentDisplayPanel);

            // this function is to alert the user if max calorie intake exceeds
            // The flag is to inform the function whether to make the list API call or not
            // console.log('calling getUpdatedConsumptionStatus from getMealsList');
            getUpdatedConsumptionStatus(false);

        }
    } catch (err) {
        console.log('err', err);
    }
}

const hideMealIfDateChange = (data, classname) => {
    let dateValue = new Date(document.getElementById('filterDate').value);

    let date = new Date(data.datetime);
    if (dateValue.getDate() == date.getDate() ||
        dateValue.getMonth() + 1 == date.getMonth() + 1 ||
        dateValue.getFullYear() == date.getFullYear()) {
        let item = document.querySelector('.' + classname);
        item.style.display = 'none';
    }
}

// This function handled the edit meal request
const handleEditMeal = async (newData, index) => {
    // console.log('sending edit for: ', data);
    if (usesFilteredMeals) {
        var editDataToBeSent = {
            new: newData,
            old: mealsOnThisDate[index]
        }
    } else {
        var editDataToBeSent = {
            new: newData,
            old: meals[index]
        }
    }

    await fetch('http://localhost:3000/users/edit', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
        },
        body: JSON.stringify(editDataToBeSent)
    });
}

// This function handles the delete meal request
const handleDeleteMeal = async (data) => {
    // console.log('calling delete for: ', data);
    let resp = await fetch('http://localhost:3000/users/delete', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
}

// This function detects the edit/delete request and calls the appropriate function
// for the same
const handleEditOrDeleteMeal = (event) => {
    event.preventDefault(); // to prevent propagation
    let content = event.target.parentElement.parentElement.firstChild.children;

    // alert(event.target.value);
    // console.log(content);

    if (event.target.value == 'save') {
        // build the data object
        let data = {
            datetime: content[0].value,
            foodname: content[1].value,
            calorie: content[2].value
        }

        let classname = event.target.parentElement.parentElement.className;
        hideMealIfDateChange(data, classname);
        console.log('classname: ', classname);
        let index = parseInt(classname[classname.length - 1], 10) - 1;

        // console.log('edit req for data:', data);
        // console.log('classnae and index of the data: ', classname, index);

        // This method will handle the entire editing
        handleEditMeal(data, index);
    } else if (event.target.value == 'delete') {
        event.target.parentElement.parentElement.style.display = 'none';
        // form the data object
        let data = {
            datetime: content[0].value,
            foodname: content[1].value,
            calorie: content[2].value
        }
        // function to handle delete operation
        handleDeleteMeal(data);
    }
}