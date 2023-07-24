
// КАТАЛОГИ ТОВАРОВ:
//*** Загрузка данных о товарах и рендеринг карточки товара:

// Показать/скрыть Лоадер:
const loader = document.getElementById('loader');
function showLoader() {
    loader.style.display = 'block';
}
function hideLoader() {
    loader.style.display = 'none';
}

//src для изображение товара по умолчанию:
const defaultTovImg = 'https://cdn.rigla.ru/media/catalog/product/placeholder/default/small_image.jpg';
const pagesArr = [
    { title: 'Главная', fetchURL: '/tov' },
    { title: 'Медтехника', fetchURL: '/tech' },
    { title: 'Детям', fetchURL: '/child' },
];
const loadingPage = pagesArr.find(page => page.title === document.title);
const loadingFetchURL = loadingPage ? loadingPage.fetchURL : null;


showLoader();
//получаем Товары из БД, отрисовываем Каталог товаров:
fetch(loadingFetchURL)
    .then(res => res.json())
    .then(data => {
        console.log('Товары Аптеки:', data);
        let tovar = document.getElementById('productcont');

        for (let i = 0; i < data.length; i++) {
            // Если data[i]['Икнока'] является массивом байтов (BLOB):
            let imageData = data[i]['Икнока'];
            const uint8Array = new Uint8Array(imageData.data);
            const blob = new Blob([uint8Array], { type: 'image/jpeg' });
            const imageUrl = URL.createObjectURL(blob);

            tovar.innerHTML += `
            <div class="product">
                <img src="${data[i]['Икнока'] && data[i]['Икнока'].data.length > 0 ? imageUrl : defaultTovImg}" alt="">
                <h6 class="productname">${data[i]['Название товара']}</h6>
                <p class="proiz">Производитель: ${data[i]['Производитель']}</p>
                <p class="price">${data[i]['Цена']}p.</p>
                <button class="addtocart">В корзину</button>
            </div>
            `
        };
        hideLoader();
        handleInCart();
    })
    .catch(error => {
        console.log('Ошибка получения данных из БД:', error);
    })

// обработчик кнопки 'В корзину':
function handleInCart() {
    var btns = document.getElementsByClassName('addtocart');
    for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener('click', function () {
            console.log('Добавлено в Корзину');
            addToCart(this);
        });
    }
}

// функция для кнопки 'В корзину':
function addToCart(elem) {
    var sibs = [];
    var getprice;
    var getproductName;
    var cart = [];
    var stringCart;
    //зацикливает одноуровневые элементы для информации о продукте рядом с кнопкой добавления
    while (elem = elem.previousSibling) {
        if (elem.nodeType === 3) continue; // text node
        if (elem.className === "price") {
            getprice = elem.innerText;
        }
        if (elem.className === "productname") {
            getproductName = elem.innerText;
        }
        sibs.push(elem);
    }
    //создаем объект продукта    
    var product = {
        productname: getproductName,
        price: getprice
    };
    //преобразование данных о продукте в JSON для хранения
    var stringProduct = JSON.stringify(product);
    //*отправляем данные о продукте в хранилище сеансов */
    if (!sessionStorage.getItem('cart')) {
        //добавляем JSON-объект продукта в массив корзины
        cart.push(stringProduct);
        //корзина в JSON
        stringCart = JSON.stringify(cart);
        //создаем элемент корзины для хранения сессий
        sessionStorage.setItem('cart', stringCart);
        showAlertAdded(getproductName);
    }
    else {
        // получаем существующие данные корзины из хранилища и конвертируем обратно в массив
        cart = JSON.parse(sessionStorage.getItem('cart'));
        //добавляем JSON-объект нового продукта
        cart.push(stringProduct);
        //возврат обратно в JSON
        stringCart = JSON.stringify(cart);
        //перезаписываем данные корзины в sessionstorage
        sessionStorage.setItem('cart', stringCart);
        showAlertAdded(getproductName);
    }
}

// выводим сообщение о добавлении товара в корзину:
function showAlertAdded(pname) {
    var message = pname + " добавлен в корзину";
    var alerts = document.getElementById("alerts");
    alerts.innerHTML = message;
    alerts.classList.remove('hidden');
    alerts.classList.add("message");
    setTimeout(function () {
        alerts.classList.add('hidden');
    }, 1000);
}

