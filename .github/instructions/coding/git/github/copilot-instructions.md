# Github CLI commands (for AI Agents)

### ГРУППА 1: ЯДРО АГЕНТА (Pull Requests и код-ревью)

Главный рабочий стояк любого кодящего агента:

- `gh pr list`: получение списка PR с фильтрацией (`--state`, `--label`, `--limit`, `--json`).
- `gh pr view`: детальный инспект PR (описание, метаданные, комментарии, ветки).
- `gh pr diff`: сырой unified diff изменений для анализа изменений без выкачивания репозитория.
- `gh pr create`: оформление нового пулл реквеста в headless режиме (`--title`, `--body`, `--base`, `--head`).
- `gh pr checkout`: переключение локального git дерева на ветку указанного PR.
- `gh pr review`: отправка вердикта по коду (`--approve`, `--comment`, `--request-changes`).
- `gh pr checks`: проверка статусов тестов и линтеров, висящих на PR.
- `gh pr merge`: слияние PR (`--auto`, `--squash`, `--merge`, `--rebase`, `--delete-branch`).
- `gh pr comment`: отправка текстового комментария в тред PR.
- `gh pr close` / `gh pr reopen`: закрытие без слияния или повторное открытие.
- `gh pr edit`: модификация заголовка, описания, базовой ветки или ревьюеров.
- `gh pr ready`: перевод PR из статуса draft в статус готовности к ревью.
- `gh pr status`: сводка по PR, релевантным текущему пользователю или ветке.

### ГРУППА 2: СПЕЦИАЛЬНЫЕ КОМАНДЫ ДЛЯ ИИ АГЕНТОВ (Preview)

Новейшие фичи GitHub CLI, добавленные напрямую под кодовых агентов:

- `gh agent-task`: управление задачами для фоновых агентов:
  - `gh agent-task create`: запуск автономной задачи для агента.
  - `gh agent-task list`: просмотр текущих агентских сессий.
  - `gh agent-task view`: получение логов и состояния сессии агента (`--follow`, `--log`, `--json`).
- `gh skill`: дистрибуция навыков и тулов для ИИ агентов:
  - `gh skill install`: установка навыка для кодинг агента.
  - `gh skill list`: список активных навыков.
  - `gh skill preview`: предпросмотр возможностей навыка.
  - `gh skill publish`: публикация кастомного навыка.
  - `gh skill search`: поиск готовых навыков в реестре.
  - `gh skill update`: обновление установленного скилла.
- `gh copilot`: работа с GitHub Copilot через консоль (объяснение кода, генерация шелл команд).

### ГРУППА 3: ДИАГНОСТИКА CI/CD (GitHub Actions)

Инструменты поиска засоров в пайплайнах:

- `gh run list`: мониторинг запусков пайплайнов (`--json databaseId,status,conclusion`).
- `gh run view`: детальный осмотр прогона. Флаг `--log-failed` отдает агенту только сбойный стектрейс.
- `gh run watch`: ожидание завершения работы джоба.
- `gh run rerun`: повторный пуск упавших проверок (`--failed`).
- `gh run cancel`: отмена зависшего пайплайна.
- `gh run delete`: удаление артефактов и логов прогона.
- `gh run download`: скачивание артефактов сборки на диск.
- `gh workflow list` / `gh workflow view`: инвентаризация yml файлов воркфлоу.
- `gh workflow run`: ручной триггер workflow_dispatch события.
- `gh workflow enable` / `gh workflow disable`: включение и выключение сценариев.
- `gh cache list` / `gh cache delete`: аудит и зачистка кеша Actions.

### ГРУППА 4: УПРАВЛЕНИЕ ЗАДАЧАМИ (Issues)

- `gh issue list`: выборка тикетов (`--json number,title,labels,body`).
- `gh issue view`: чтение конкретной задачи и треда дискуссии.
- `gh issue create`: заведение тикета агентом (`--title`, `--body`, `--label`).
- `gh issue comment`: комментарий в задачу.
- `gh issue close` / `gh issue reopen`: закрытие и открытие тикета.
- `gh issue edit`: смена ассайни, майлстоунов или лейблов.
- `gh issue delete`: удаление тикета.
- `gh issue pin` / `gh issue unpin`: закрепление важного бага в шапке репозитория.
- `gh issue status`: текущий статус тикетов пользователя.
- `gh issue transfer`: перенос задачи в другой репозиторий.

### ГРУППА 5: РАБОТА С РЕПОЗИТОРИЕМ И КОДОМ

- `gh repo clone`: выкачивание исходников.
- `gh repo view`: метаданные проекта, проверка README и параметров ветвления.
- `gh repo create`: создание нового репозитория.
- `gh repo fork`: форк для работы в изолированном пространстве.
- `gh repo sync`: подтягивание апстрим изменений в локальный форк.
- `gh repo edit`: конфигурирование настроек репозитория.
- `gh repo list`: инспекция списка проектов организации или пользователя.
- `gh repo delete` / `gh repo archive` / `gh repo unarchive`: управление жизненным циклом.
- `gh repo deploy-key`: ключи деплоя.
- `gh repo rename` / `gh repo set-default`: служебные операции с именем и главной веткой.

### ГРУППА 6: ПОИСК (Search)

- `gh search code`: поиск кусков кода и паттернов по всему GitHub.
- `gh search commits`: поиск коммитов по сообщениям и хешам.
- `gh search issues` / `gh search prs`: поиск тикетов и PR по фильтрам.
- `gh search repos`: глобальный поиск репозиториев.

### ГРУППА 7: ПРЯМОЙ ДОСТУП И СЛУЖЕБНЫЕ УТИЛИТЫ

- `gh api`: низкоуровневый пробой любого эндпоинта GitHub REST/GraphQL с поддержкой пейджинга и jq.
- `gh auth login` / `gh auth logout` / `gh auth status` / `gh auth refresh` / `gh auth token` / `gh auth switch` / `gh auth setup-git`: управление ключами и авторизацией.
- `gh secret list` / `gh secret set` / `gh secret delete`: управление секретами для Actions и Codespaces.
- `gh variable list` / `gh variable set` / `gh variable get` / `gh variable delete`: переменные окружения в репозитории.
- `gh ruleset list` / `gh ruleset view` / `gh ruleset check`: проверка branch protection rules и ограничений.
- `gh release list` / `gh release create` / `gh release view` / `gh release download` / `gh release delete`: релизы и бинарные ассеты.
- `gh label list` / `gh label create` / `gh label clone`: теги и лейблы репозитория.
- `gh gist create` / `gh gist list` / `gh gist view` / `gh gist delete`: публикация сниппетов и логов.
- `gh codespace (code, cp, create, delete, edit, list, logs, ports, rebuild, ssh, stop, view)`: управление облачными средами разработки.
- `gh project`: манипуляции с проектными досками GitHub Projects.
- `gh discussion`: форумные ветки Discussions.
- `gh org`: администрирование организаций.
- `gh attestation`: проверка цепочки поставки софта и криптографических подписей.
- `gh config`: глобальная настройка CLI (`editor`, `git_protocol`, `prompt`).
- `gh alias`: алиасы для сложных длинных пайплайнов.
- `gh extension`: установка плагинов комьюнити для расширения утилиты.
- `gh ssh-key` / `gh gpg-key`: ключи доступа к профилю.
- `gh browse`: открытие сущностей в браузере.
- `gh completion`: генерация шелл скриптов автодополнения.
- `gh status`: общая сводка по событиям пользователя.

- **Causal Chain:** Агент стартует без терминала, использует авторизацию из переменной окружения `GH_TOKEN`, запрашивает статус задач или PR через команду с флагом `--json`, выполняет правку, пушит патч через `gh pr create` и валидирует результат в CI через `gh run view --log-failed`.
