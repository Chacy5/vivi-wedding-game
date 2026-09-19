# Запуск на Netlify и Twitch

1. В Netlify нажми **Add new project → Import an existing project → GitHub** и выбери этот репозиторий. Команда сборки уже лежит в `netlify.toml`; publish directory оставь пустым.
2. После первого деплоя скопируй адрес сайта. В Netlify → **Site configuration → Environment variables** добавь `VIVI_PLAYER_KEY`, `HINA_PLAYER_KEY` и при желании `DONATIONALERTS_ACCESS_TOKEN`.
3. Для Twitch создай приложение в Twitch Developer Console. В его OAuth Redirect URLs добавь `https://ТВОЙ-САЙТ.netlify.app/api/twitch/callback`. В Netlify добавь `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `TWITCH_EVENTSUB_SECRET` (случайная длинная строка), `TWITCH_SETUP_KEY` (отдельный секрет для одноразовой ссылки) и `TWITCH_REDIRECT_URI` с этим же адресом callback.
4. Открой `https://ТВОЙ-САЙТ.netlify.app/api/twitch/connect?key=ТВОЙ_TWITCH_SETUP_KEY`, войди именно в канал Виви и разреши доступ. После этого чат может голосовать командами.

## Команды чата

- `!голос 1` … `!голос 4` — выбрать вариант на текущем экране; повторная команда меняет голос.
- `!виви`, `!хина`, `!оба`, `!никто` — быстрые варианты в играх «кто из вас».
- `!суд 1` … `!суд 4` — вердикт в Семейном суде.
- `!свадьба` — отметиться в раунде; последнее сообщение видно ведущей в состоянии игры.

Пока вы тестируете в обычном чате Виви, команды работают так же. Во время Twitch Shared Chat EventSub читает сообщения, пришедшие в подключённый канал; у одного зрителя остаётся один голос на раунд.

## Ссылки для эфира

- Виви: `/player?room=VIVI-HINA&player=vivi&key=...`
- Хиночка: `/player?room=VIVI-HINA&player=hina&key=...`
- Чат: `/audience?room=VIVI-HINA`
- OBS: `/screen?room=VIVI-HINA`

Не публикуй ссылки с личными ключами на стриме. Для OBS включи Browser Source на `/screen`.
