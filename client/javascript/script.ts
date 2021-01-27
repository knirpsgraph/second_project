
import jqXHR = JQuery.jqXHR;
import {User} from "../../server/model/User";
import {Rights} from "../../server/model/Rights";

//import {json, response} from "express";

// let userList array of class User
// let userList: User[] = [];


/*

class Product {
    public name: string;
    public number: number;
    public inventory: number;
    public description: string;

    constructor (name: string, number: number, inventory: number, description: string) {
        this.name = name;
        this.number = number;
        this.inventory = inventory;
        this.description = description;
    }
}

let productList: Product [] = [];
*/


function addUser(event) {
    // Prevent the default behaviour of the browser (reloading the page)
    event.preventDefault();

    // Define JQuery HTML objects
    const addUserForm: JQuery = $('#add-user-form');
    const firstNameField: JQuery = $('#add-first-name-input');
    const lastNameField: JQuery = $('#add-last-name-input');
    const UsernameField: JQuery = $('#input-username');
    const passwordField: JQuery = $('#inputPassword');
    const rightsFIeld: JQuery = $('#rights');

    // Read values from input fields
    const firstName: string = firstNameField.val().toString().trim();
    const lastName: string = lastNameField.val().toString().trim();
    const username: string = UsernameField.val().toString().trim();
    const password: string = passwordField.val().toString().trim();
    const rights: number = Number(rightsFIeld.val().toString().trim())

    // Check if all required fields are filled in
    if (firstName && lastName && username && password) {
        $.ajax("/user",{
            method: "POST",
            contentType:"application/json",
            data: JSON.stringify({
                username: username,
                firstName: firstName,
                lastName: lastName,
                password: password,
                rights: rights,
            }),
        }).then(() => {
            updateUserList();
            renderMessage('User ' + '"' + username + '"' + ' created');
            addUserForm.trigger('reset');

        }).catch((response) => {
            renderMessage(response);
        })
    }
}

function login() {

    const usernameField: JQuery = $('#usernmae');
    const passowrdField: JQuery = $('#loginPassword');

    const loginForm: JQuery = $('#login-form');
    const logoutForm: JQuery = $('#logout-form');
    const notreg: JQuery =$('#notreg');

    const username: string = usernameField.val().toString().trim();
    const password: string = passowrdField.val().toString().trim();


    if (username && password) {
        $.ajax("/login", {
            contentType:"application/json",
            method: "POST",
            data: JSON.stringify({
                username:username,
                password:password,
            }),

        }).then((response) => {
            if (response.Rights === undefined) {
                loginForm.fadeOut();
                logoutForm.fadeIn();
                notreg.fadeOut();
                console.log('User is logged in')
                renderLoginMessage('Hey, ' + username + '!');
                showCompleteNavbar();
                setTimeout(function() {
                    location.reload()
                },2000);
            } else {
                showCompleteNavbar();
                loginForm.fadeOut();
                logoutForm.fadeIn();
                notreg.fadeOut();
                console.log('User is logged in')
                renderLoginMessage('Hey, ' + username + '!');
                showCompleteNavbar();
                setTimeout(function() {
                    location.reload()
                },2000);
            }

        }).catch(() => {
            console.log('user isn logged in');
            renderLoginMessage('Wrong Username or Password. Please Check');
        })
    } else {
        console.log('Not all mandatory fields are filled in')
    }
}

function logout() {
    const loginForm: JQuery = $('#login-form');
    const logoutForm: JQuery = $('#logout-form');

    $.ajax('/logout', {
        method: 'POST',
        contentType: 'application/json'
    }).then(() => {
        logoutForm.fadeOut();
        renderLoginMessage(`Goodbye !`);
        setTimeout(function () {
            location.reload();
        },3000);
    }).catch(() => {
        console.log('logout not working')
    });
}

function checkLogin() {
    const logoutForm: JQuery = $('#logout-form');
    const loginForm: JQuery = $('#login-form');
    const notReg: JQuery = $('#notreg');

    $.ajax('/login', {
        method: 'GET',
        contentType: 'application/x-www-form-urlencoded',
    }).then((response) => {
        logoutForm.fadeIn();
        loginForm.fadeOut();
        notReg.fadeOut();
        renderMessage('Moin!');
        actualUser();
        updateUserList()
        renderUserList(response.user);
    }).catch((response:jqXHR) => {
        console.log(response+ 'Not');
    })
}
/*****************************************************************************
 * Render functions                                                          *
 *****************************************************************************/
function renderMessage(message: string) {
    // Define JQuery HTML Objects
    const messageWindow: JQuery = $('#res_Message');

    // Create new alert
    const newAlert: JQuery = $(`
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `);


    // Add message to DOM
    messageWindow.append(newAlert);



    // Auto-remove message after 5 seconds (5000ms)
    setTimeout(() => {
        newAlert.fadeOut('close');
    }, 5000);
}

function actualUser() {
            const userWindow: JQuery = $('#Loginmessages');

            $.ajax('/user/actUsername', {
                method: 'GET',
                contentType: 'application/json'
            }).then((response) => {
                const newAlert: JQuery = $(`<div class="alert" <h4 class=textarea style="text-align: center">Du bist angemeldet als: ${response}</h4></div>
        `);
                userWindow.append(newAlert)
            }).catch(() => {
                const newAlert: JQuery = $(`<div class="alert" <h4 class=textarea style="text-align: center">Unbekannter!</h4></div>
        `);
                userWindow.append(newAlert)
            })
}

function renderLoginMessage(message: string) {
    // Define JQuery HTML Objects
    const messageWindow: JQuery = $('#Loginmessages');

    // Create new alert
    const newAlert: JQuery = $(`
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `);

    // Add message to DOM
    messageWindow.append(newAlert);

    // Auto-remove message after 5 seconds (5000ms)
    setTimeout(() => {
        newAlert.fadeOut('close');
    }, 5000);
}

function updateUserList() {
    $.ajax("/users", {
        type: 'GET',
        contentType: "json",
        success: (response) => {
            renderUserList(response.userList);
        },
        error: (response) => {
            renderMessage(response.responseJSON)
        }
    })
}

function renderUserList(userList: User[]) {
    //Jquery html object
    let userListBody: JQuery = $('#user-table-body');

    //Empty old userList
    userListBody.empty();
    //If a User is created, create a row and add it to the User table
    for (let user of userList) {
        //Create User
        let newUser: JQuery = $(`
        <tr>
            <td>${user.username}</td>
            <td>${user.user_firstName}</td>
            <td>${user.user_secondName}</td>
            <td>${user.rights}</td>
            <td>
               <button id="editBtn" class="btn btn-info btn-sm edit-user-btn mr-4" data-user-id="${user.username}">
                    <i class="fas fa-pencil-alt animated rotateIn" aria-hidden="true"></i>
                </button>
                <button id="deleteBtn" class="btn btn-info btn-sm delete-user-btn mr-4" data-user-id="${user.username}">
                    <i class="fas fa-trash animated rotateIn" aria-hidden="true"></i>
                </button>
            </td>
        </tr>           
      `);
        //add new User to the Userlist Table
        userListBody.append(newUser);
    }
}

function editUser (event) {
    event.preventDefault();

    //Define JQuery Objects
    let usernameHiddenInput: JQuery = $('#edit-username-input');
    let editModal: JQuery = $('#edit-user-modal');
    let editUserForm: JQuery = $('#edit-user-form');
    let editFirstName: JQuery = $('#edit-first-name-input');
    let editSecondName: JQuery = $('#edit-last-name-input');
    let editPassword: JQuery = $('#edit-user_password');
    let editNewPassword: JQuery = $('#edit-new-user_password')

    let username: any = usernameHiddenInput.val().toString().trim();
    let firstName: string = String(editFirstName.val()).trim();
    let secondName: string = String(editSecondName.val()).trim();
    let password: string = String(editPassword.val()).trim();
    let newPassword: string = String(editNewPassword.val()).trim();

    if (firstName && secondName && newPassword) {
        $.ajax({
            url: "/user/" + username,
            type:'PUT',
            dataType: "json",
            data: JSON.stringify({
                firstName,
                secondName,
                newPassword,
            }),
            contentType: 'application/json',
            success: () => {
                updateUserList();
                editUserForm.trigger('reset');
                editModal.modal('hide');
                renderMessage('User ' + username + ' is updated')
            },
            error: (response) => {
                renderMessage(response.responseJSON + 'Userlist is not updated');
        }
        })
        editModal.modal('toggle');
    }else {
        $('#edit-new-user_password').css({
            border: "3px solid red",
        });
        setTimeout (() => {
        $('#edit-new-user_password').css({
            border: "1px solid #ced4da",
        }
    )
    },2000)
    }
}

function openEditUserModal (event) {

    let username: any = $(event.currentTarget).data('user-id');
    let hiddenUsername: JQuery = $('#edit-username-input');
    let editUserModal: JQuery = $('#edit-user-modal');
    let editUserFirstName: JQuery = $('#edit-first-name-input');
    let editUserSecondName: JQuery = $('#edit-last-name-input');
    let editPassword: JQuery = $('#edit-user_password');
    $.ajax({
        url: '/user/' + username,
        type: 'Get',
        dataType: "json",
        success: (response) => {
            hiddenUsername.val(response.username);
            editUserFirstName.val(response.user_firstName);
            editUserSecondName.val(response.user_secondName);
        }
        }).then(() => {
            editUserModal.modal('show');
        }).catch((jqXHR: JQueryXHR) => {
        renderMessage('Something went wrong ' + jqXHR.responseText)
    });
}

function deleteUser(event) {
    //Get id of the user from btn attribute user-id
    let username: any = $(event.currentTarget).data('user-id');

    //Ajax req logging out user
    $.ajax({
        url: '/user/' + username,
        type: 'Delete',
        dataType: 'json',
        success: () => {
            //update user lsit
            updateUserList();
            renderMessage('User deleted:' + ' ' + username)
        },
        error: () => {
            renderMessage('User ' + username + ' is not deleted')
        },
    });
}

function sortUserId (event) {
    event.preventDefault();
    let tbody: JQuery = $('#user-table-body');
    //@ts-ignore
    tbody.find('tr').sort(function(x, y) {
        if ($('#id_order').val()=='abc') {
            return $('td:first', x).text().localeCompare($('td:first', y).text());
        } else {
            return $('td:first', y).text().localeCompare($('td:first', x).text());
        }
    }).appendTo(tbody);

    let sort = $('#id_order').val();
    if(sort== 'abc') {
        document.getElementById("id_order") ["value"] ="cba"
    } if (sort=="cba") {
        document.getElementById("id_order") ["value"] = "abc";
    }
}

function sortUserFirst () {

    let tbody: JQuery = $('user-table-body');
    // @ts-ignore
    tbody.find('tr').sort(function (x, y) {
        if ($('#first_order').val()=='abc'){
            return $('td:first-child', x).text().localeCompare($('td:first-child', y).text());
        } else {
            return $('td:first-child', y).text().localeCompare($('td:first-child', x).text());
        }
    }).appendTo(tbody);

    let sort = $('#first_order').val();
    if(sort == "abc") {
        document.getElementById("first_order")["value"] = "cba";
    } if (sort=="cba"){
        document.getElementById("first_order")["value"] ="abc";
    }
}

function sortUserLast () {
    let tbody: JQuery = $('user-table-body');
    // @ts-ignore

    tbody.find('tr').sort(function(x,y) {
        if($('#second_order').val() == 'abc') {
            return $('td:third', x).text().localeCompare($('td:third', y).text());
        } else {
            return $('td:third',y).text().localeCompare($('td:third', x).text());
        }
    }).appendTo(tbody);

    let sort = $('#second_order').val();
    if(sort == "abc") {
        document.getElementById('second_order') ["value"] = "cba";
    } if (sort == "cba") {
        document.getElementById("second_order") ["value"] ="abc";
    }
}

function deleteAllUser () {
    $.ajax('/delAll', {
        method: 'Delete',
        dataType: "application/json",
    }).then(() => {
        updateUserList();
        renderMessage('All User deleted');
    })
}

function showCompleteNavbar() {
    const navbarMamb= JQuery = $('#userman');

    

    }
}



/*****************************************************************************
 * Main Callback: Wait for DOM to be fully loaded                            *
 *****************************************************************************/
$(() => {

    $("#nav-placeholder").load("Navbar.html");

    // Define JQuery HTML objects
    const addUserForm: JQuery = $('#add-user-form');
    const editUserForm: JQuery = $('#edit-user-form');
    const loginUser: JQuery = $('#loginUser');
    const logoutButton: JQuery = $('#logout-button');
    const userTableBody: JQuery = $('#user-table-body');
    const sortUserFirstNames: JQuery = $('#sortUserFirst');
    const sortUserLastName: JQuery = $('#sortUserLast');
    const sortUserName: JQuery = $('#sortUserName');
    const deleteBtn: JQuery = $('#deleteAllUser');

    checkLogin();

    // Register listeners
    addUserForm.on('submit', addUser);
    editUserForm.on('click', '#editSaveBtn', editUser);
    loginUser.on('click', login);
    logoutButton.on('click', logout);
    userTableBody.on('load', updateUserList);
    userTableBody.on('click', '#editBtn', openEditUserModal);
    userTableBody.on('click', '#deleteBtn', deleteUser);
    sortUserFirstNames.on('click', sortUserFirst);
    sortUserLastName.on('click', sortUserLast);
    sortUserName.on('click', sortUserId);
    deleteBtn.on('click', deleteAllUser);


    //Animated Effects


});