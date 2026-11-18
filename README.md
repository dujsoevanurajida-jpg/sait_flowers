# Bloom — цветочная мастерская

Полноценное веб-приложение: фронтенд, бэкенд (API) и база данных.

```
Браузер (index.html + css + js)
        │  fetch /api/...
        ▼
Бэкенд: serverless-функции Vercel (папка api/)   ← валидация, расчёт суммы
        │  секретный ключ из переменных окружения
        ▼
PostgreSQL (Supabase): таблицы products, orders
```

## Структура
```
index.html            страница
css/style.css         стили (hover карточек, анимации)
js/tailwind.config.js цвета и шрифты Tailwind
js/app.js             фронтенд: каталог, корзина, отправка заказа
api/_db.js            подключение к БД
api/products.js       GET  /api/products — каталог
api/orders.js         POST /api/orders   — создание заказа
supabase.sql          таблицы и тестовые товары
package.json          зависимость @supabase/supabase-js
.env.example          шаблон переменных окружения
```

## 1. База данных
1. Создайте проект на https://supabase.com.
2. SQL Editor → New query → вставьте `supabase.sql` → Run.
3. Project Settings → API: скопируйте **Project URL** и ключ **service_role** (секретный).

Заказы сохраняются в таблице `orders` (Table Editor). Браузер к базе не обращается, таблицы закрыты через RLS.

## 2. Запуск на компьютере
```
npm install
npm i -g vercel
cp .env.example .env     # впишите свои значения
vercel dev
```
Сайт откроется на http://localhost:3000.

## 3. Хостинг на Vercel
1. Залейте папку в репозиторий GitHub (`.env` не загружать, он в `.gitignore`).
2. https://vercel.com/new → Import репозитория → Framework Preset: **Other** → в Environment Variables добавьте `SUPABASE_URL` и `SUPABASE_SERVICE_KEY` → Deploy.
3. Каждый `git push` обновляет сайт автоматически.

Папка `api/` работает на Vercel без настроек. Для Netlify функции пишутся иначе (папка `netlify/functions`), поэтому проект рассчитан на Vercel.
