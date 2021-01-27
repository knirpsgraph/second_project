"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    var addUserForm = $('#add-user-form');
    var firstNameField = $('#add-first-name-input');
    var lastNameField = $('#add-last-name-input');
    var UsernameField = $('#input-username');
    var passwordField = $('#inputPassword');
    var rightsFIeld = $('#rights');
    // Read values from input fields
    var firstName = firstNameField.val().toString().trim();
    var lastName = lastNameField.val().toString().trim();
    var username = UsernameField.val().toString().trim();
    var password = passwordField.val().toString().trim();
    var rights = Number(rightsFIeld.val().toString().trim());
    // Check if all required fields are filled in
    if (firstName && lastName && username && password) {
        $.ajax("/user", {
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                username: username,
                firstName: firstName,
                lastName: lastName,
                password: password,
                rights: rights,
            }),
        }).then(function () {
            updateUserList();
            renderMessage('User ' + '"' + username + '"' + ' created');
            addUserForm.trigger('reset');
        }).catch(function (response) {
            renderMessage(response);
        });
    }
}
function login() {
    var usernameField = $('#usernmae');
    var passowrdField = $('#loginPassword');
    var loginForm = $('#login-form');
    var logoutForm = $('#logout-form');
    var notreg = $('#notreg');
    var username = usernameField.val().toString().trim();
    var password = passowrdField.val().toString().trim();
    if (username && password) {
        $.ajax("/login", {
            contentType: "application/json",
            method: "POST",
            data: JSON.stringify({
                username: username,
                password: password,
            }),
        }).then(function (response) {
            if (response.Rights === undefined) {
                loginForm.fadeOut();
                logoutForm.fadeIn();
                notreg.fadeOut();
                console.log('User is logged in');
                renderLoginMessage('Hey, ' + username + '!');
                showCompleteNavbar();
                setTimeout(function () {
                    location.reload();
                }, 2000);
            }
            else {
                showCompleteNavbar();
                loginForm.fadeOut();
                logoutForm.fadeIn();
                notreg.fadeOut();
                console.log('User is logged in');
                renderLoginMessage('Hey, ' + username + '!');
                showCompleteNavbar();
                setTimeout(function () {
                    location.reload();
                }, 2000);
            }
        }).catch(function () {
            console.log('user isn logged in');
            renderLoginMessage('Wrong Username or Password. Please Check');
        });
    }
    else {
        console.log('Not all mandatory fields are filled in');
    }
}
function logout() {
    var loginForm = $('#login-form');
    var logoutForm = $('#logout-form');
    $.ajax('/logout', {
        method: 'POST',
        contentType: 'application/json'
    }).then(function () {
        logoutForm.fadeOut();
        renderLoginMessage("Goodbye !");
        setTimeout(function () {
            location.reload();
        }, 3000);
    }).catch(function () {
        console.log('logout not working');
    });
}
function checkLogin() {
    var logoutForm = $('#logout-form');
    var loginForm = $('#login-form');
    var notReg = $('#notreg');
    $.ajax('/login', {
        method: 'GET',
        contentType: 'application/x-www-form-urlencoded',
    }).then(function (response) {
        logoutForm.fadeIn();
        loginForm.fadeOut();
        notReg.fadeOut();
        renderMessage('Moin!');
        actualUser();
        updateUserList();
        renderUserList(response.user);
    }).catch(function (response) {
        console.log(response + 'Not');
    });
}
/*****************************************************************************
 * Render functions                                                          *
 *****************************************************************************/
function renderMessage(message) {
    // Define JQuery HTML Objects
    var messageWindow = $('#res_Message');
    // Create new alert
    var newAlert = $("\n        <div class=\"alert alert-warning alert-dismissible fade show\" role=\"alert\">\n            " + message + "\n            <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n                <span aria-hidden=\"true\">&times;</span>\n            </button>\n        </div>\n    ");
    // Add message to DOM
    messageWindow.append(newAlert);
    // Auto-remove message after 5 seconds (5000ms)
    setTimeout(function () {
        newAlert.fadeOut('close');
    }, 5000);
}
function actualUser() {
    var userWindow = $('#Loginmessages');
    $.ajax('/user/actUsername', {
        method: 'GET',
        contentType: 'application/json'
    }).then(function (response) {
        var newAlert = $("<div class=\"alert\" <h4 class=textarea style=\"text-align: center\">Du bist angemeldet als: " + response + "</h4></div>\n        ");
        userWindow.append(newAlert);
    }).catch(function () {
        var newAlert = $("<div class=\"alert\" <h4 class=textarea style=\"text-align: center\">Unbekannter!</h4></div>\n        ");
        userWindow.append(newAlert);
    });
}
function renderLoginMessage(message) {
    // Define JQuery HTML Objects
    var messageWindow = $('#Loginmessages');
    // Create new alert
    var newAlert = $("\n        <div class=\"alert alert-warning alert-dismissible fade show\" role=\"alert\">\n            " + message + "\n            <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n                <span aria-hidden=\"true\">&times;</span>\n            </button>\n        </div>\n    ");
    // Add message to DOM
    messageWindow.append(newAlert);
    // Auto-remove message after 5 seconds (5000ms)
    setTimeout(function () {
        newAlert.fadeOut('close');
    }, 5000);
}
function updateUserList() {
    $.ajax("/users", {
        type: 'GET',
        contentType: "json",
        success: function (response) {
            renderUserList(response.userList);
        },
        error: function (response) {
            renderMessage(response.responseJSON);
        }
    });
}
function renderUserList(userList) {
    //Jquery html object
    var userListBody = $('#user-table-body');
    //Empty old userList
    userListBody.empty();
    //If a User is created, create a row and add it to the User table
    for (var _i = 0, userList_1 = userList; _i < userList_1.length; _i++) {
        var user = userList_1[_i];
        //Create User
        var newUser = $("\n        <tr>\n            <td>" + user.username + "</td>\n            <td>" + user.user_firstName + "</td>\n            <td>" + user.user_secondName + "</td>\n            <td>" + user.rights + "</td>\n            <td>\n               <button id=\"editBtn\" class=\"btn btn-info btn-sm edit-user-btn mr-4\" data-user-id=\"" + user.username + "\">\n                    <i class=\"fas fa-pencil-alt animated rotateIn\" aria-hidden=\"true\"></i>\n                </button>\n                <button id=\"deleteBtn\" class=\"btn btn-info btn-sm delete-user-btn mr-4\" data-user-id=\"" + user.username + "\">\n                    <i class=\"fas fa-trash animated rotateIn\" aria-hidden=\"true\"></i>\n                </button>\n            </td>\n        </tr>           \n      ");
        //add new User to the Userlist Table
        userListBody.append(newUser);
    }
}
function editUser(event) {
    event.preventDefault();
    //Define JQuery Objects
    var usernameHiddenInput = $('#edit-username-input');
    var editModal = $('#edit-user-modal');
    var editUserForm = $('#edit-user-form');
    var editFirstName = $('#edit-first-name-input');
    var editSecondName = $('#edit-last-name-input');
    var editPassword = $('#edit-user_password');
    var editNewPassword = $('#edit-new-user_password');
    var username = usernameHiddenInput.val().toString().trim();
    var firstName = String(editFirstName.val()).trim();
    var secondName = String(editSecondName.val()).trim();
    var password = String(editPassword.val()).trim();
    var newPassword = String(editNewPassword.val()).trim();
    if (firstName && secondName && newPassword) {
        $.ajax({
            url: "/user/" + username,
            type: 'PUT',
            dataType: "json",
            data: JSON.stringify({
                firstName: firstName,
                secondName: secondName,
                newPassword: newPassword,
            }),
            contentType: 'application/json',
            success: function () {
                updateUserList();
                editUserForm.trigger('reset');
                editModal.modal('hide');
                renderMessage('User ' + username + ' is updated');
            },
            error: function (response) {
                renderMessage(response.responseJSON + 'Userlist is not updated');
            }
        });
        editModal.modal('toggle');
    }
    else {
        $('#edit-new-user_password').css({
            border: "3px solid red",
        });
        setTimeout(function () {
            $('#edit-new-user_password').css({
                border: "1px solid #ced4da",
            });
        }, 2000);
    }
}
function openEditUserModal(event) {
    var username = $(event.currentTarget).data('user-id');
    var hiddenUsername = $('#edit-username-input');
    var editUserModal = $('#edit-user-modal');
    var editUserFirstName = $('#edit-first-name-input');
    var editUserSecondName = $('#edit-last-name-input');
    var editPassword = $('#edit-user_password');
    $.ajax({
        url: '/user/' + username,
        type: 'Get',
        dataType: "json",
        success: function (response) {
            hiddenUsername.val(response.username);
            editUserFirstName.val(response.user_firstName);
            editUserSecondName.val(response.user_secondName);
        }
    }).then(function () {
        editUserModal.modal('show');
    }).catch(function (jqXHR) {
        renderMessage('Something went wrong ' + jqXHR.responseText);
    });
}
function deleteUser(event) {
    //Get id of the user from btn attribute user-id
    var username = $(event.currentTarget).data('user-id');
    //Ajax req logging out user
    $.ajax({
        url: '/user/' + username,
        type: 'Delete',
        dataType: 'json',
        success: function () {
            //update user lsit
            updateUserList();
            renderMessage('User deleted:' + ' ' + username);
        },
        error: function () {
            renderMessage('User ' + username + ' is not deleted');
        },
    });
}
function sortUserId(event) {
    event.preventDefault();
    var tbody = $('#user-table-body');
    //@ts-ignore
    tbody.find('tr').sort(function (x, y) {
        if ($('#id_order').val() == 'abc') {
            return $('td:first', x).text().localeCompare($('td:first', y).text());
        }
        else {
            return $('td:first', y).text().localeCompare($('td:first', x).text());
        }
    }).appendTo(tbody);
    var sort = $('#id_order').val();
    if (sort == 'abc') {
        document.getElementById("id_order")["value"] = "cba";
    }
    if (sort == "cba") {
        document.getElementById("id_order")["value"] = "abc";
    }
}
function sortUserFirst() {
    var tbody = $('user-table-body');
    // @ts-ignore
    tbody.find('tr').sort(function (x, y) {
        if ($('#first_order').val() == 'abc') {
            return $('td:first-child', x).text().localeCompare($('td:first-child', y).text());
        }
        else {
            return $('td:first-child', y).text().localeCompare($('td:first-child', x).text());
        }
    }).appendTo(tbody);
    var sort = $('#first_order').val();
    if (sort == "abc") {
        document.getElementById("first_order")["value"] = "cba";
    }
    if (sort == "cba") {
        document.getElementById("first_order")["value"] = "abc";
    }
}
function sortUserLast() {
    var tbody = $('user-table-body');
    // @ts-ignore
    tbody.find('tr').sort(function (x, y) {
        if ($('#second_order').val() == 'abc') {
            return $('td:third', x).text().localeCompare($('td:third', y).text());
        }
        else {
            return $('td:third', y).text().localeCompare($('td:third', x).text());
        }
    }).appendTo(tbody);
    var sort = $('#second_order').val();
    if (sort == "abc") {
        document.getElementById('second_order')["value"] = "cba";
    }
    if (sort == "cba") {
        document.getElementById("second_order")["value"] = "abc";
    }
}
function deleteAllUser() {
    $.ajax('/delAll', {
        method: 'Delete',
        dataType: "application/json",
    }).then(function () {
        updateUserList();
        renderMessage('All User deleted');
    });
}
function showCompleteNavbar() {
    var navbarMamb = JQuery = $('#userman');
}
/*****************************************************************************
 * Main Callback: Wait for DOM to be fully loaded                            *
 *****************************************************************************/
$(function () {
    $("#nav-placeholder").load("Navbar.html");
    // Define JQuery HTML objects
    var addUserForm = $('#add-user-form');
    var editUserForm = $('#edit-user-form');
    var loginUser = $('#loginUser');
    var logoutButton = $('#logout-button');
    var userTableBody = $('#user-table-body');
    var sortUserFirstNames = $('#sortUserFirst');
    var sortUserLastName = $('#sortUserLast');
    var sortUserName = $('#sortUserName');
    var deleteBtn = $('#deleteAllUser');
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
