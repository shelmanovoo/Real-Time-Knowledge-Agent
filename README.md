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

🤖 RAG Query Pipeline (n8n + Postgres + Ollama) - Real-Time Knowledge Agent.json

Этот workflow в n8n реализует RAG (Retrieval-Augmented Generation):
он принимает запрос через Webhook, ищет релевантные документы по векторному поиску в Postgres, а затем формирует финальный ответ с помощью LLM (Ollama).

🚀 Архитектура
	1.	Webhook (/rag_query)
Принимает входящий POST-запрос с JSON:

{ "query": "..." }


	2.	Generate Embedding
Отправляет запрос в Ollama (nomic-embed-text:latest), получает вектор для пользовательского вопроса.
	3.	Build SQL
Формирует SQL-запрос для поиска ближайших эмбеддингов в таблице documents (использует оператор <=> для поиска по вектору).
	4.	Postgres Vector Search
Выполняет SQL и возвращает топ-5 наиболее похожих документов.
	5.	Format Results
Объединяет найденные документы в одну текстовую строку.
	6.	Merge
Объединяет результаты поиска и исходный запрос пользователя.
	7.	Code
Формирует строку в формате:

Текст: <найденные документы>
Вопрос: <запрос пользователя>


	8.	AI Agent (Ollama Chat Model + Memory)
Передаёт в Ollama-модель (lakomoor/vikhr-llama-3.2-1b-instruct:q3_k_m) текст и вопрос.
Подключается Simple Memory для контекстных диалогов.
Генерирует финальный ответ на основе документов и запроса.

📊 Стек технологий
	•	n8n — оркестрация процессов.
	•	Postgres + pgvector — хранение эмбеддингов и поиск ближайших соседей.
	•	Ollama — генерация эмбеддингов и LLM-ответов.

⚙️ Настройка
	1.	Установить Postgres с расширением pgvector и создать таблицу documents.

CREATE EXTENSION vector;
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  text TEXT,
  embedding_vec vector(768)
);


	2.	Поднять Ollama API и загрузить модели:
	•	nomic-embed-text:latest
	•	lakomoor/vikhr-llama-3.2-1b-instruct:q3_k_m
	3.	Настроить креды в n8n:
	•	Postgres account
	•	Ollama account
	4.	Импортировать workflow в n8n.

📂 Использование

Отправь запрос в Webhook:

curl -X POST http://<n8n_host>/webhook/rag_query \
  -H "Content-Type: application/json" \
  -d '{"query": "Что написано в документе про Kafka?"}'

Workflow вернёт:
	•	поиск релевантных документов в Postgres
	•	финальный ответ LLM с контекстом


