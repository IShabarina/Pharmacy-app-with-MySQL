// - минус зависимость от регистра
// - минус поиска слова Корзина...только по Названию и производителю

// функция поиска по каталогу:
document.querySelector('#elastic').addEventListener('input', function () {
    let val = this.value.toUpperCase().trim();
    let elasticItems = document.querySelectorAll('.productcont div')

    if (val !== '') {
        elasticItems.forEach(function (elem) {
            let productname = elem.querySelector('.productname').textContent.toUpperCase();
            let proiz = elem.querySelector('.proiz').textContent.toUpperCase();

            if (productname.includes(val) || proiz.includes(val)) {
                elem.classList.remove('hide');
            }
            else {
                elem.classList.add('hide');
            }
        })
    }
    else {
        elasticItems.forEach(function (elem) {
            elem.classList.remove('hide');
        });
    }
});



