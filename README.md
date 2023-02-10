# Web-Socket-Chat
Web-чат для локальной сети на основе WebSocket. Используется привязка никнейма к ip-адресу, для чего следует отредактировать файл users.json в корне каталога.

Для запуска сервера требуется node js.

## Установка и запуск
1. Скачать\
```git clone https://github.com/vitalysokoloff/Web-Socket-Chat.git```\
Или скачать архив по ссылке:\
[Web Socket Chat v 0.0.2](https://github.com/vitalysokoloff/Web-Socket-Chat/releases/download/preAplha/Web-Socket-Chat-0-0-2.zip) - устаревшая версия
2. Перейти в каталог\
```cd pathToDirectory\Web-Socket-Chat```
3. Установка node-модулей\
```npm install```
4. Запустить сервер\
```node .``` или ```node app.js```

## Настройка
Настройка осуществляется путём редактирования файл config.json
```
{
    "pagePort": 80,                                     // Порт веб-сервера
    "chatPort": 8080,                                   // Порт WebSocketServer'а
    "pageHost": "127.0.0.1",                            // Адрес веб-сервера
    "chatHost": "127.0.0.1",                            // Адрес WebSocketServer'а
    "serverName": "Server",                             // Имя сервера 
    "chatName": "chat",                                 // Имя чата
    "channels":{                                        // Каналы
        "main": {
            "wl": ["127.0.0.1", "127.0.0.2"]            // Белый список, те пользователи, которым разрешено зайти на канал
        },
        "test": {
            "wl": ["127.0.0.1"]                         // Белый список, те пользователи, которым разрешено зайти на канал
        }
    },
    "background": "#abcfb2"
}
```
## Добавление и редактирование пользователей
Настройки пользователей находятся в файле users.json
```
{
    {
    "127.0.0.1": {                  // Адрес пользователя в сети 
        "name": "Admin",            // Имя пользователя