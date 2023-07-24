//  ---КОРЗИНА---//

/* если Модальное окно Корзины открыто - получаем список товаров корзины из Session Storage и обновляем содержимое Корзины */
window.addEventListener("hashchange", function () {
    if (window.location.hash === "#openModal") {
        console.log('корзина открыта');
        updateCartTotal()
    }
});
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.hash === "#openModal") {
        console.log('корзина открыта');
        updateCartTotal()
    }
});

/* прослушиватели событий кнопок: */
// кнопки 'Очистить  корзину':
document.getElementById("emptycart").addEventListener('click', emptyCart);
// кнопки 'Заказать':
document.getElementById("checkout").addEventListener('click', createOrder);

// фун-я обновления содержимого Корзины: //
function updateCartTotal() {
    let totalPrice = 0;
    let price = 0;
    let items = 0;
    let productname = "";
    let carttable = "";

    if (sessionStorage.getItem('cart')) {
        console.log('корзина не пуста');
        showEmptyCart(false); // убираем Пустую корзину
        let cart = JSON.parse(sessionStorage.getItem('cart'));  // товары корзины из Session Storage
        let cartData = [];  // массив для отрисовки корзины
        items = cart.length;// кол-во товаров в корзине

        for (let i = 0; i < items; i++) {
            let tovar = JSON.parse(cart[i]); //конвертируем каждый продукт JSON в массиве обратно в объект
            price = parseFloat(tovar.price.split('p.')); //получить значение свойства цены
            productname = tovar.productname;

            let newProduct = {
                name: productname,
                price: price,
                qty: 1,
                sum: price,
            }

            if (cartData.length > 0) {
                let productExists = false;
                for (let j = 0; j < cartData.length; j++) {
                    if (cartData[j].name === newProduct.name) {
                        cartData[j].sum += newProduct.sum;
                        cartData[j].qty += 1;
                        productExists = true;
                        break;
                    }
                }
                if (!productExists) {
                    cartData.push(newProduct)
                }
            } else {
                cartData.push(newProduct) //добавляем объект товара в массив
            }
            //добавляем цену к итогу
            totalPrice += price;
        }
        cartData.forEach((item) => {
            carttable += "<tr><td>" + item.name + "</td><td>" + item.qty + "</td><td>" + item.price + "p.</td></tr>"
        });
    }
    //обновить итог на сайте HTML
    document.getElementById("total").innerHTML = totalPrice.toFixed(2);
    //добавляем сумму с учетом скидки:
    document.getElementById('totalWithSale').innerHTML = totalPrice > 1500 ? (totalPrice * 0.95).toFixed(2) : totalPrice.toFixed(2);

    //вставляем сохраненные товары в корзину
    document.getElementById("carttable").innerHTML = carttable;
    //обновляем товары в корзине на сайте HTML
    document.getElementById("itemsquantity").innerHTML = items;
}


/* Пользователь вручную очищает корзину */
function emptyCart() {
    showEmptyCart(true);
    //удалить объект хранения сеанса корзины и обновить итоги корзины
    if (sessionStorage.getItem('cart')) {
        sessionStorage.removeItem('cart');
        updateCartTotal();
    }
}

// функция при нажатии 'Заказать' товары в корзине:
function createOrder() {
    let orderSumElement = document.getElementById('totalWithSale');
    let orderSum = parseFloat(orderSumElement.innerHTML);
    let userID = (localStorage.getItem('userID')) ? localStorage.getItem('userID') : 0;
    let order = {
        sum: orderSum,
        iduser: userID,
        status: 'В обработке',
    }
    if (!userID || userID === '0' || orderSum === '0') { // если не авторизован/ не Клиент/ корзина пуста
        showCartAlert(false);
    } else {
        sendOrder(order); // отправляем Заказ в БД
    }
    console.log(order);
}

//функция показать Пустую корзину/добавить структуру Корзины:
function showEmptyCart(cartIsEmpty) {
    let cartTable = document.getElementById('cart-content-full');
    let cartTitle = document.querySelector('.cart-title');

    cartTitle.textContent = cartIsEmpty ? 'В корзине пока ничего нет...' : 'Корзина';
    cartTable.classList.toggle('display-none', cartIsEmpty);
}

// Сообщение в Корзине о формировании заказа:
function showCartAlert(success) {
    var alerts = document.getElementById("cart_alerts");
    alerts.innerHTML = success ? 'Заказ сформирован...' : 'Авторизуйтесь как Клиент в Личном кабинете...';
    alerts.classList.remove('hidden');
    alerts.classList.add("message");
    setTimeout(function () {
        alerts.classList.add('hidden');
    }, 4000);
}

// функция отправки Заказа в БД:
function sendOrder(order) {
    const querySrt = Object.entries(order)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    fetch(`/addorder?${querySrt}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Ошибка при отправке запроса')
            }
            return (res.json());
        })
        .then(data => {
            console.log('Ответ сервера:', data);
            showCartAlert(true); // Выводим сообщение в корзине - Заказ сформирован
            setTimeout(emptyCart, 3000); // очищаем Корзину через 3 сек
        })
        .catch(error => {
            console.log('Ошибка добавления в БД таблицу Заказы:', error);
        })

}


