Embedding Pipeline (n8n + Kafka + Ollama + Postgres) - kafka+postgresql.json

Этот workflow в n8n реализует конвейер обработки текстовых сообщений:
он получает сообщения из Kafka, нормализует текст, создает векторные представления (embeddings) с помощью Ollama, и сохраняет результаты в Postgres для последующего поиска и анализа.

🚀 Архитектура
	1.	Kafka Trigger
Подписывается на топик documents и получает новые сообщения.
	2.	Preprocess
Извлекает полезный payload сообщения и формирует объект { id, text }.
	•	id — генерируется автоматически, если нет в исходных данных.
	•	text — текстовое содержимое сообщения.
	3.	normalizedText
	•	Приводит текст к нижнему регистру.
	•	Удаляет спецсимволы.
	•	Убирает стоп-слова (русские).
	•	Сжимает пробелы.
➝ Результат сохраняется в normalizedText.
	4.	Ollama Embed1
Отправляет нормализованный текст в Ollama API (nomic-embed-text:latest) и получает векторное представление (embedding).
	5.	Format Embedding1
Формирует объект для записи в БД:

{
  "id": "...",
  "text": "...",
  "embedding_vec": [ ... ]
}


	6.	Postgres Insert1
Записывает данные в таблицу documents (поля: id, text, embedding_vec).

📊 Стек технологий
	•	n8n — оркестрация процессов.
	•	Kafka — очередь сообщений.
	•	Ollama — генерация векторных представлений (embeddings).
	•	Postgres — хранение текста и эмбеддингов.

⚙️ Настройка
	1.	Поднять сервисы:
	•	Kafka
	•	Postgres
	•	Ollama API (с моделью nomic-embed-text:latest)
	2.	Настроить креды в n8n:
	•	Kafka account
	•	Postgres account
	3.	Импортировать workflow и запустить.

📂 Использование

После запуска:
	•	Каждое новое сообщение из Kafka топика documents будет обработано.
	•	В Postgres таблице documents появятся:
	•	id — уникальный идентификатор.
	•	text — оригинальный текст.
	•	embedding_vec — векторное представление текста.

