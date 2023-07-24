// добавление товара в БД/ Каталог сайта:

const adminForm = document.getElementById('form_admin');

adminForm && adminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    createNewTov();
})

function createNewTov() {
    let { elements } = adminForm;
    let tovData = {};
    Array.from(elements).forEach((element) => {
        tovData[element.name] = element.value;
    })
    console.log(tovData);

    let newTov = {
        category: tovData.category,
        title: tovData.title,
        price: tovData.price,
        company: tovData.company,
        qty: tovData.qty,
        weight: tovData.weight,
        icon: tovData.icon,
    }
    console.log(newTov);
    updateBDApteka(newTov);
}

function updateBDApteka(tovObj) {
    const querySrt = Object.entries(tovObj)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
    console.log(querySrt);

    fetch(`/addtov?${querySrt}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Ошибка при отправке запроса добавление Товара')
            }
            return (res.json());
        })
        .then(data => {
            console.log('Ответ сервера:', data);
            //уведомление о Добавлении товара добавить
            adminForm.reset();
        })
        .catch(error => {
            console.log('Ошибка добавления товара в БД ', error);
        })

}