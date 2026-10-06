import Handlebars from "handlebars";
import userTemplate from './templates/user.hbs';

let API_URL = 'https://6aaed44e606bd915d11112ce.mockapi.io/';
let userList = document.querySelector('#usersList');
let userForm = document.querySelector('#userForm');
let closeModalBtn = document.querySelector('[data-close-modal]');
let page = 1;
let totalPages;
let prevBtn = document.querySelector('.prev-btn');
let nextBtn = document.querySelector('.next-btn');

fetch(API_URL + '/users')
    .then(response => {
        response.json()
    })
    .then(data => {
        totalPages = Math.ceil(data.length / 5)
    });

function renderUsers(users) {
    userList.innerHTML = '';
    users.forEach(x => {
        let html = userTemplate(x);
        userList.insertAdjacentHTML('afterbegin', html)
    })
}

function getAllUsers() {
    fetch(`${API_URL}/users?limit=5&page=${page}`)
        .then(response => {
            if (response.ok) {
                return response.json()
            } else {
                throw new Error('response is not ok, status: ' + response.status);
            }
        })
        .then(users => renderUsers(users))
}

getAllUsers();

function createUser(data) {
    fetch(API_URL + '/users', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response.ok) {
                return response.json()
            } else {
                throw new Error('response is not ok, status: ' + response.status);
            }
        })
        .then(() => {
            userForm.reset();
            getAllUsers();
        })
}

userForm.addEventListener('submit', submitUserForm)

function submitUserForm() {
    let data = new FormData(userForm);
    let formData = Object.fromEntries(data);
    createUser(formData);
}

function deleteUser(id) {
    fetch(API_URL + '/users/' + id, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                return response.json()
            } else {
                throw new Error('response is not ok, status: ' + response.status);
            }
        })
        .then(() => {
            getAllUsers();
        })
}

function makeObj(obj, key, value) {
    obj[key] = value;
}

function openModal(user) {
    let modalForm = document.querySelector('.modal > form');
    let backdrop = document.querySelector('.backdrop');
    backdrop.classList.remove('is-hidden');
    document.body.style.overflow = 'hidden';
    let inputs = document.querySelectorAll('.modal > form > div > input');
    let item = user.parentNode.parentNode;
    let itemObj = {
        name: item.querySelector('.user-card__name').textContent,
        email: item.querySelector('.user-card__email').textContent,
        age: item.querySelector('.user-card__age').textContent.replace('Age:', '')
    }
    inputs.forEach(x => {
        x.value = itemObj[x.id].trim();
    });
    modalForm.addEventListener('submit', (event) => {
        event.preventDefault()
        let edited = {
            id: item.id,
        }
        inputs.forEach(x => {
            makeObj(edited, x.getAttribute('name'), x.value)
        })
        if (!inputs.forEach(x => x.placeholder.trim() == '')) {
            fetch(API_URL + '/users/' + edited.id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: edited.name,
                    email: edited.email,
                    age: edited.age,
                })
            })
                .then(response => {
                    if (response.ok) {
                        return response.json()
                    } else {
                        throw new Error('response is not ok, status: ' + response.status);
                    }
                })
                .then(() => {
                    closeModal();
                    getAllUsers();
                })
        }
    })
}


function closeModal() {
    let backdrop = document.querySelector('.backdrop');
    backdrop.classList.add('is-hidden');
    document.body.style.overflow = '';
}

closeModalBtn.addEventListener('click', closeModal)

userList.addEventListener('click', (event) => {
    let target = event.target;
    if (target.classList.contains('delete-user')) {
        deleteUser(target.dataset.id)
    } else if (target.classList.contains('edit-user')) {
        openModal(target);
    }
    else {
        return
    }
})

prevBtn.addEventListener('click', () => {
    if (page == 1) {
        getAllUsers()
    } else {
        page--;
        getAllUsers()
    }
})

nextBtn.addEventListener('click', () => {
    if (page == totalPages) {
        getAllUsers()
    } else {
        page++;
        getAllUsers()
    }
    console.log(totalPages, page)
    console.log(typeof (totalPages))
})