# GitHub Repository Searcher

Это веб-приложение, которое позволяет искать репозитории на GitHub по имени пользователя и отображать информацию о найденных репозиториях.  Используется [GitHub Repositories API](https://github.com/fugr-ru/frontend-javascript-test-2#:~:text=GitHub%20Repositories%20API) для получения данных.


## Функциональность

*   **Поиск репозиториев:** Позволяет ввести имя пользователя GitHub и найти его репозитории.
*   **Отображение информации:** Отображает карточки с информацией о каждом репозитории:
    *   Название репозитория
    *   Описание (если доступно)
    *   Ссылка на репозиторий
    *   Количество звёзд (stars)
    *   Дата последнего обновления
*   **Индикатор загрузки:** Показывает индикатор загрузки во время ожидания ответа от GitHub API.
*   **Пагинация:** Реализована бесконечная прокрутка с шагом 20 репозиториев на страницу. Новые данные загружаются при прокрутке страницы вниз.
*   **Обработка ошибок:** Отображает понятные сообщения об ошибках, если пользователь вводит некорректное имя пользователя или при возникновении проблем с API.
*   **Оптимизация запросов:**  Реализована логика, предотвращающая избыточные запросы к API при вводе текста (Debounce).
*   **Docker контейнер:**  Приложение можно запустить из Docker контейнера.

## Технологии

*   **Frontend:** [React, Redux Toolkit]
*   **HTTP Client:** [Axios]
*   **Docker:**  Используется для контейнеризации приложения.

## Установка и запуск

1.  **Клонируйте репозиторий:**

    ```bash
    git clone https://github.com/Pert002/Repository-Searcher.git
    cd Repository-Searcher
    ```

2.  **Соберите Docker образ:**

    ```bash
    docker build -t Future .
    ```

3.  **Запустите Docker контейнер:**

    ```bash
    docker run -p 3000:80 Future
    ```

## Конфигурация Docker


```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]