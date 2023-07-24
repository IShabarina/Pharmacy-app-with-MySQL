// ПРОФИЛЬ:

const accountName = document.querySelector('.account-name');
const accountRole = document.querySelector('.account-role');
const userSignInForm = document.getElementById('form_auth');
const newUserFrom = document.getElementById('form_log');

// если Клиент/Пользователь сохранен в LocalStorage показываем Личный кабинет:
if (localStorage.getItem('username')) {
    showProfile(localStorage.getItem('username'), true, localStorage.getItem('userRole'),);
    showLogInBlocks(false); //скрываем блоки регистрации/входа
    showOrders(true);
    if (localStorage.getItem('userRole') === 'Администратор') {
        showAdminBlock(true); //для Админа показываем Форму добавления товара
    }
}

//обрабатываем нажатие кнопки 'Авторизоваться':
userSignInForm && userSignInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let usernameInput = document.getElementById("user-name");
    let passwordInput = document.getElementById("user-password");
    let userLogin = usernameInput.value.trim();
    let userPassword = passwordInput.value.trim();

    let usersPromise = fetchData('/users');
    let clientsPromise = fetchData('/clients');

    let access = false;
    let accessLevel = 'Не указан';

    Promise.all([usersPromise, clientsPromise]) //запрос в БД на Пользователей/Клиентов
        .then(results => {
            var usersData = results[0];
            var clientsData = results[1];

            console.log('Данные пользователей:', usersData);
            console.log('Данные клиентов:', clientsData);

            if (!access) {
                usersData.forEach(user => {
                    if (userLogin === user['Имя пользователя'] &&
                        userPassword === user['Пароль']) {
                        access = true; // Пользователь найден
                        accessLevel = user['Роль'];
                        console.log('доступ разрешен');
                    }
                });
            }

            if (!access) {
                clientsData.forEach(client => {
                    if (userLogin === client['Имя_клиента'] &&
                        userPassword === client['Пароль']) {
                        access = true; // Клиент найден
                        accessLevel = client['Роль'] ? client['Роль'] : 'Клиент';
                        console.log('доступ разрешен');
                    }
                });
            };
            showProfile(userLogin, access, accessLevel); //отображаем Личный кабинет с логином:
            saveClientId(userLogin, accessLevel);
            showOrders(access);
            if (accessLevel === 'Администратор') {
                showAdminBlock(true);
            }
            userSignInForm.reset();
        })
        .catch(error => {
            console.log('Ошибка при получении данных из БД:', error);
        });
})


//обрабатываем нажатие кнопки 'Зарегистрироваться':
newUserFrom && newUserFrom.addEventListener('submit', (e) => {
    e.preventDefault();
    let { elements } = newUserFrom;
    let clientData = {};
    Array.from(elements).forEach((element) => {
        const { name, value } = element;
        clientData[element.name] = element.value;
    })
    let newClient = {
        surname: clientData.surname,
        name: clientData.name,
        middlename: clientData.middlename,
        bithdate: `${clientData.year}-${formattedDate(clientData.month)}-${formattedDate(clientData.day)}`,
        password: clientData.password,
        login: createLogin(clientData.surname, clientData.name, clientData.middlename),
    }
    console.log(newClient);
    sendNewClient(newClient); // сохраняем в БД нового Клиента
})

// функция добавления Клиента в БД:
function sendNewClient(client) {
    const querySrt = Object.entries(client)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
    console.log(querySrt);

    fetch(`/addclient?${querySrt}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Ошибка при отправке запроса добавления Клиента')
            }
            return (res.json());
        })
        .then(data => {
            console.log('Ответ сервера:', data);
            showProfile(client.login, true, 'Клиент'); //отображаем Личный кабинет с логином:
            saveClientId(client.login, 'Клиент');
            newUserFrom.reset();
        })
        .catch(error => {
            console.log('Ошибка добавления в БД таблицу Клиенты:', error);
        })
}



// фун-я показать/скрыть форму Добавления товаров(для Админа):
function showAdminBlock(show) {
    const profileAdminBlock = document.getElementById('profile_admin');
    if (profileAdminBlock) {
        show ? profileAdminBlock.classList.remove('display-none') : profileAdminBlock.classList.add('display-none');
    } else return;
}

// фун-я показать/скрыть формы Регистрации/Авторизации:
function showLogInBlocks(show) {
    const profileLogBlock = document.querySelector('.profile_log');
    const profileAuthBlock = document.querySelector('.profile_auth');

    if (profileLogBlock) {
        if (show) {
            profileLogBlock.classList.remove('display-none')
            profileAuthBlock.classList.remove('display-none')
        } else {
            profileLogBlock.classList.add('display-none');
            profileAuthBlock.classList.add('display-none')
        }
    } else return;
}

// фун-я показать/скрыть  блок Заказы клиента:
function showOrders(show) {
    const ordersBlock = document.querySelector('.profile_orders');
    if (ordersBlock && show) {
        ordersBlock.classList.remove('display-none');
        getOrders();
    } else {
        const orderList = document.getElementById('orders-handle');
        if (orderList) {
            orderList.innerHTML = '';
            ordersBlock.classList.add('display-none');
        }
    }
}


// фун-я загрузки Заказов из БД:
function getOrders() {
    fetch(`/orders`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Ошибка при загрузке Заказов')
            }
            return (res.json());
        })
        .then(data => {
            const idClient = localStorage.getItem('userID');
            if (data.length < 1) return;
            if (parseInt(idClient) === 0) { //если userID='0'- это Админ, рендерим все заказы
                createOrdersItems(data);
            } else { // если не Админ рендерим только заказы с УИД_клиента:
                let filtredOrdersByClientID = data.filter(order => parseInt(order.УИД_клиента) === parseInt(idClient));
                console.log(filtredOrdersByClientID);
                if (filtredOrdersByClientID.length > 0) {
                    createOrdersItems(filtredOrdersByClientID);
                }
            }
        })
        .catch(error => {
            console.log('Ошибка при получении Заказов из БД:', error);
        })
}

// функция отображения списка Заказов в Профиле:
function createOrdersItems(ordersArray) {
    if (ordersArray.length < 1) return;
    let orderspull = '';
    document.getElementById('orders-empty').classList.add('display-none');
    const orderList = document.getElementById('orders-handle');
    ordersArray.forEach(order => {
        orderspull +=
            '<li class="order-item"><p>' +
            order.УИД_клиента +
            '</p><p>' +
            order.УИД_заказа +
            '</p><p>' +
            order.Стоимость +
            '</p><p>' +
            order.Статус +
            '</p></li>'
    })
    orderList.innerHTML = orderspull;
}

//очищаем список Заказов в Личном кабинете
function deleteOrdersItems() {
    const orderList = document.getElementById('orders-handle');
    orderList.innerHTML = '';
}

//отображение авторизованного Пользователя/Клиента или ошибки авторизации:
function showProfile(login, access, accessLevel) {
    if (access) {
        accountName.innerHTML = `${login}`
        // accountRole.innerHTML = `(${accessLevel})`;
        document.querySelector('.user_logout_btn').classList.remove('hidden');
        //сохраняем имя Пользователя/Клиента в localStorage:
        localStorage.setItem('username', login);
        localStorage.setItem('userRole', accessLevel);
        //обработчик нажатия кнопки 'Выйти': 
        document.querySelector('.user_logout_btn').addEventListener('click', exitLogin);
        showLogInBlocks(false); // скрываем формы регистрации/авторизации
    } else {
        accountName.innerHTML = 'Пользователь не найден!';
    }
}

//функция нажатия кнопки 'Выйти': 
function exitLogin() {
    showAdminBlock(false);
    showLogInBlocks(true);
    showOrders(false);
    document.querySelector('.user_logout_btn').classList.add('hidden');
    // удаляем Пользователя/Клиента из localStorage:
    localStorage.clear('userName');
    localStorage.clear('userRole');
    localStorage.clear('userID');
    accountName.innerHTML = `Личный кабинет`
    accountRole.innerHTML = ``;
}

// функция получения УИД Клиента по Имени Клиента:
function saveClientId(clientLogin, clientRole) {
    console.log(clientRole);
    if (clientRole === "Администратор") {
        localStorage.setItem('userID', "0");
    } else {

        let clientLoginObj = {
            client: clientLogin,
        }
        const querySrt = Object.entries(clientLoginObj)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');

        return fetch(`/getclientid?${querySrt}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Ошибка при запросе УИД_Клиента в таблице Клиенты')
                }
                return (res.json());
            })
            .then(data => {
                console.log('УИД_Клиента:', data.results[0].УИД_клиента);
                let userID = data.results[0].УИД_клиента;
                localStorage.setItem('userID', userID);
            })
            .catch(error => {
                console.log('Ошибка при запросе УИД_Клиента в таблице Клиенты:', error);
            })
    }

}

// доп функции:

// дату -> в двухсимвольную дату:
function formattedDate(dataStr) {
    let formattedData = dataStr.length === 1 ? `0${dataStr}` : dataStr;
    return formattedData;
}

// создание логина:
function createLogin(surname, name, middlename) {
    let login = surname + name.charAt(0).toUpperCase() + middlename.charAt(0).toUpperCase();
    return login;
}

// общая фун-я fetch:
function fetchData(url) {
    return fetch(url)
        .then(res => res.json())
        .catch(error => {
            console.log('Ошибка получения данных из БД:', error);
        });
}

// функция валидации:
// function formValidated() {

// }

// // показать сообщение ошибки валидации формы:
// function showHideErrorValidation() {

// }