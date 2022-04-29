const getUsersList = async () => {
    // alert('clicked!');
    var userDisplayPanel = document.getElementById('userListPanel');
    // elem.style.display = 'block';

    let response = await fetch('http://localhost:9000/admin/list', {
        method: "GET"
    });
    let data = await response.json();

    // let res = await fetch('http://localhost:3000/admin/list', {
    //     method: 'GET'
    // });

    // let userList = await res.json();
    // console.log('users data received:', data.users);
    createDisplayPanel(data.users, userDisplayPanel);
}

const createDisplayPanel = (usersList, displayPanel) => {
    // console.log('usersList: ', usersList);
    // for (let i = 0; i < usersList.length; i++) {
    //     console.log(usersList[i]);
    // }
    for (let i = 0; i < usersList.length; i++) {
        let divElem = document.createElement('div');
        let userNamePara = document.createElement('p');

        userNamePara.innerHTML = usersList[i];
        divElem.appendChild(userNamePara);
        displayPanel.appendChild(divElem);
    }
    // console.log(displayPanel.children.length);
    displayPanel.style.display = 'block';
}