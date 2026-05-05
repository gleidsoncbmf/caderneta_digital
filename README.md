# 📒 Caderneta Digital

**Caderneta Digital** é uma aplicação web para organização de tarefas e projetos pessoais, construída com uma arquitetura moderna de microserviços usando Docker. Permite criar, editar, priorizar, fixar, delegar e compartilhar tarefas de forma intuitiva.

---

## 📑 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Acesso à Aplicação](#-acesso-à-aplicação)
- [Estrutura de Diretórios](#-estrutura-de-diretórios)
- [API — Endpoints](#-api--endpoints)
- [Modelo de Dados](#-modelo-de-dados)
- [Comandos Úteis](#-comandos-úteis)
- [Troubleshooting](#-troubleshooting)
- [Licença](#-licença)

---

## ✨ Funcionalidades

- **Autenticação** — Registro e login com token (Laravel Sanctum)
- **Projetos** — Crie projetos com nome e cor para agrupar tarefas
- **Tarefas** — CRUD completo com descrição, responsável, datas, status e prioridade
- **Fixar tarefas** — Pina tarefas importantes no topo da lista
- **Delegar tarefas** — Delegue tarefas para terceiros com link de compartilhamento
- **Compartilhar via WhatsApp** — Link de WhatsApp gerado automaticamente ao delegar
- **Reordenação drag-and-drop** — Reorganize tarefas com arrastar e soltar
- **Filtros avançados** — Filtre por status, data, responsável, projeto, busca textual
- **Link público de tarefa** — Compartilhe tarefas via token UUID sem precisar de login
- **Soft Deletes** — Exclusão lógica em tarefas e projetos

---

## 🛠 Tecnologias

| Camada       | Tecnologia                                     |
| ------------ | ---------------------------------------------- |
| **Frontend** | Next.js 14, React 18, TypeScript, TailwindCSS  |
| **Backend**  | Laravel 11, PHP 8.3, Laravel Sanctum           |
| **Banco**    | MySQL 8.0                                      |
| **Proxy**    | Nginx 1.25 (reverse proxy)                     |
| **Infra**    | Docker & Docker Compose                        |
| **Admin DB** | phpMyAdmin 5.2                                 |

### Bibliotecas Frontend Notáveis

| Pacote                    | Finalidade                          |
| ------------------------- | ----------------------------------- |
| `@dnd-kit/core`           | Drag-and-drop para reordenar tarefas |
| `axios`                   | Requisições HTTP para a API          |
| `date-fns`                | Formatação e cálculo de datas        |
| `react-hot-toast`         | Notificações toast                   |
| `react-calendar`          | Componente de calendário             |

---

## 🏗 Arquitetura

```
                        ┌──────────────┐
                        │   Browser    │
                        └──────┬───────┘
                               │ :80
                        ┌──────▼───────┐
                        │    Nginx     │
                        │  (proxy)     │
                        └──┬───────┬───┘
              /api, /sanctum│       │ /* (demais rotas)
                   ┌────────▼──┐ ┌──▼──────────┐
                   │  Backend  │ │  Frontend   │
                   │ PHP-FPM   │ │  Next.js    │
                   │ :9000     │ │  :3000      │
                   └─────┬─────┘ └─────────────┘
                         │
                   ┌─────▼─────┐
                   │  MySQL    │
                   │  :3306    │
                   └───────────┘
```

O **Nginx** atua como reverse proxy:
- Rotas `/api/*` e `/sanctum/*` → **Backend** (PHP-FPM via FastCGI)
- Todas as demais rotas → **Frontend** (Next.js dev server)

### Padrões de Projeto (Backend)

O backend segue princípios **SOLID** com a seguinte organização:

| Camada          | Responsabilidade                                     |
| --------------- | ---------------------------------------------------- |
| `Controllers`   | Recebem requests e devolvem responses                |
| `Requests`      | Validação de dados de entrada                        |
| `Resources`     | Transformação de dados para a resposta JSON          |
| `Services`      | Lógica de negócio                                    |
| `Repositories`  | Acesso a dados (queries)                             |
| `Interfaces`    | Contratos para inversão de dependência               |
| `DTOs`          | Data Transfer Objects para transporte de dados       |
| `Models`        | Eloquent models com relacionamentos e scopes         |

---

## 📋 Pré-requisitos

Antes de rodar o projeto, certifique-se de ter instalado:

- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Git**
- **Bash** (para executar o script de setup)

> **macOS/Linux**: Docker Desktop ou Docker Engine.
> **Windows**: Docker Desktop com WSL2 habilitado.

Verifique a instalação:

```bash
docker --version
docker-compose --version
```

---

## 🚀 Instalação e Execução

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd caderneta_gleidson
```

### 2. Configure o ambiente

```bash
cp .env.example .env
```

Edite o `.env` se precisar alterar portas ou credenciais (os valores padrão funcionam para desenvolvimento local).

### 3. Suba os containers

```bash
docker-compose up -d --build
```

**Pronto!** Não é necessário mais nenhum passo manual. O container do backend executa automaticamente na inicialização:

1. ✅ Aguarda o MySQL ficar disponível (loop inteligente)
2. ✅ Configura o `.env` do Laravel com as variáveis do `docker-compose`
3. ✅ Gera a `APP_KEY`
4. ✅ Roda as **migrations** (com fallback para `migrate:fresh` se necessário)
5. ✅ Roda os **seeders** (dados de demonstração)
6. ✅ Corrige permissões de `storage/` e `bootstrap/cache/`

> Toda essa automação está no arquivo `backend/docker-entrypoint.sh`.

### Alternativa: Script `setup.sh`

Existe também um script `setup.sh` que pode ser utilizado:

```bash
bash setup.sh
```

Porém ele **duplica** boa parte do que o entrypoint já faz automaticamente. O único benefício adicional é copiar o `.env` para você — algo que pode ser feito com um único comando manual.

**Recomendação**: Use `docker-compose up -d --build` diretamente.

### 📦 Sobre os Dockerfiles

Cada serviço possui seu próprio `Dockerfile` dentro da sua respectiva pasta:

```
backend/Dockerfile       → PHP 8.3-FPM + Composer + Laravel + Sanctum
frontend/Dockerfile      → Node 20 Alpine + Next.js dev server
```

Essa é a **convenção padrão** para projetos Docker multi-serviço. O `docker-compose.yml` referencia cada um com `context: ./backend` e `context: ./frontend`, garantindo que os comandos `COPY` dentro dos Dockerfiles resolvam caminhos relativos corretamente.

O `backend/Dockerfile` já faz o scaffold do Laravel e instala o Sanctum durante o **build**, enquanto o `docker-entrypoint.sh` cuida da configuração em **runtime** (migrations, seeders, etc.).

---

## 🔐 Variáveis de Ambiente

### Arquivo raiz `.env`

| Variável               | Padrão           | Descrição                          |
| ---------------------- | ---------------- | ---------------------------------- |
| `APP_PORT`             | `80`             | Porta HTTP da aplicação            |
| `PMA_PORT`             | `8181`           | Porta do phpMyAdmin                |
| `APP_ENV`              | `local`          | Ambiente da aplicação              |
| `DB_ROOT_PASSWORD`     | `rootpassword`   | Senha root do MySQL                |
| `DB_DATABASE`          | `cardeneta`      | Nome do banco de dados             |
| `DB_USERNAME`          | `cardeneta`      | Usuário do banco de dados          |
| `DB_PASSWORD`          | `secret`         | Senha do banco de dados            |
| `NEXT_PUBLIC_API_URL`  | `http://localhost/api` | URL da API para o frontend   |

### Arquivo `backend/.env.example`

Contém configurações adicionais do Laravel como `APP_KEY`, `APP_DEBUG`, `SANCTUM_STATEFUL_DOMAINS`, etc. O entrypoint do container configura automaticamente os valores de banco a partir do `docker-compose.yml`.

---

## 🌐 Acesso à Aplicação

| Serviço                | URL                          |
| ---------------------- | ---------------------------- |
| **Aplicação (Web)**    | http://localhost              |
| **phpMyAdmin**         | http://localhost:8181         |

### Credenciais de Demonstração

| Campo   | Valor                   |
| ------- | ----------------------- |
| Email   | `demo@cardeneta.com`    |
| Senha   | `password`              |

> O seeder também cria 3 usuários adicionais com dados fictícios via Factory.

---

## 📁 Estrutura de Diretórios

```
caderneta_gleidson/
├── .env                    # Variáveis de ambiente (raiz)
├── .env.example            # Template de variáveis de ambiente
├── docker-compose.yml      # Orquestração dos containers
├── setup.sh                # Script de setup automatizado
├── README.md               # Esta documentação
│
├── backend/                # API Laravel (PHP 8.3)
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   ├── .env.example
│   ├── composer.json
│   ├── app/
│   │   ├── DTOs/           # Data Transfer Objects
│   │   ├── Exceptions/     # Exceções customizadas
│   │   ├── Http/
│   │   │   ├── Controllers/   # AuthController, TaskController, ProjectController
│   │   │   ├── Requests/      # Form Requests (validação)
│   │   │   └── Resources/     # API Resources (transformação de dados)
│   │   ├── Interfaces/     # Contratos dos repositórios
│   │   ├── Models/         # User, Task, Project
│   │   ├── Providers/      # AppServiceProvider (binds de interfaces)
│   │   ├── Repositories/   # TaskRepository, ProjectRepository
│   │   └── Services/       # AuthService, TaskService, ProjectService
│   ├── database/
│   │   ├── migrations/     # Tabelas: projects, tasks
│   │   ├── seeders/        # UserSeeder, ProjectSeeder, TaskSeeder
│   │   └── factories/      # Model factories para testes
│   └── routes/
│       └── api.php         # Definição das rotas da API
│
├── frontend/               # Interface Next.js (TypeScript)
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── app/
│       │   ├── layout.tsx        # Layout raiz
│       │   ├── page.tsx          # Página inicial (redirect)
│       │   ├── globals.css       # Estilos globais
│       │   ├── login/            # Página de login
│       │   ├── register/         # Página de registro
│       │   ├── dashboard/        # Dashboard principal de tarefas
│       │   └── share/            # Visualização pública de tarefa compartilhada
│       ├── components/
│       │   ├── layout/           # Componentes de layout (Sidebar, Header, etc.)
│       │   ├── tasks/            # TaskCard, TaskList, TaskFilters, Modais
│       │   ├── projects/         # Componentes de projetos
│       │   └── ui/               # Componentes de UI reutilizáveis
│       ├── contexts/
│       │   └── AuthContext.tsx   # Contexto de autenticação (React Context)
│       ├── hooks/
│       │   ├── useTasks.ts      # Hook para gerenciamento de tarefas
│       │   └── useProjects.ts   # Hook para gerenciamento de projetos
│       ├── services/
│       │   ├── api.ts           # Instância Axios com interceptors
│       │   ├── authService.ts   # Chamadas de autenticação
│       │   ├── taskService.ts   # Chamadas CRUD de tarefas
│       │   └── projectService.ts # Chamadas CRUD de projetos
│       └── types/
│           ├── task.ts          # Interfaces TypeScript (Task, Project, Filters)
│           └── auth.ts          # Interfaces de autenticação
│
└── nginx/
    └── default.conf        # Configuração do Nginx (reverse proxy)
```

---

## 📡 API — Endpoints

Base URL: `http://localhost/api`

### Autenticação

| Método | Rota                | Descrição                  | Auth |
| ------ | ------------------- | -------------------------- | ---- |
| POST   | `/api/auth/register`| Registro de novo usuário   | ❌   |
| POST   | `/api/auth/login`   | Login (retorna token)      | ❌   |
| POST   | `/api/auth/logout`  | Logout (revoga token)      | ✅   |
| GET    | `/api/auth/me`      | Dados do usuário logado    | ✅   |

### Tarefas

| Método | Rota                       | Descrição                          | Auth |
| ------ | -------------------------- | ---------------------------------- | ---- |
| GET    | `/api/tasks`               | Listar tarefas (com filtros)       | ✅   |
| POST   | `/api/tasks`               | Criar tarefa                       | ✅   |
| GET    | `/api/tasks/{id}`          | Detalhes de uma tarefa             | ✅   |
| PUT    | `/api/tasks/{id}`          | Atualizar tarefa                   | ✅   |
| DELETE | `/api/tasks/{id}`          | Excluir tarefa (soft delete)       | ✅   |
| POST   | `/api/tasks/{id}/finalize` | Finalizar tarefa                   | ✅   |
| POST   | `/api/tasks/{id}/pin`      | Fixar/desafixar tarefa             | ✅   |
| POST   | `/api/tasks/{id}/delegate` | Delegar tarefa a alguém            | ✅   |
| POST   | `/api/tasks/reorder`       | Reordenar tarefas (drag-and-drop)  | ✅   |
| GET    | `/api/tasks/share/{token}` | Visualizar tarefa compartilhada    | ❌   |

#### Filtros disponíveis em `GET /api/tasks`

| Parâmetro      | Tipo     | Descrição                                     |
| -------------- | -------- | --------------------------------------------- |
| `search`       | string   | Busca textual na descrição                    |
| `filter`       | string   | `all`, `today`, `overdue`, `finalized`, `delegated` |
| `start_date`   | date     | Filtrar por data de início                    |
| `end_date`     | date     | Filtrar por data de término                   |
| `who`          | string   | Filtrar por responsável                       |
| `delegated_to` | string   | Filtrar por delegado                          |
| `project_id`   | integer  | Filtrar por projeto                           |

### Projetos

| Método | Rota                  | Descrição              | Auth |
| ------ | --------------------- | ---------------------- | ---- |
| GET    | `/api/projects`       | Listar projetos        | ✅   |
| POST   | `/api/projects`       | Criar projeto          | ✅   |
| PUT    | `/api/projects/{id}`  | Atualizar projeto      | ✅   |
| DELETE | `/api/projects/{id}`  | Excluir projeto        | ✅   |

### Autenticação via Token

Todas as rotas protegidas (✅) exigem o header:

```
Authorization: Bearer <token>
```

O token é obtido na resposta do endpoint de login.

---

## 🗄 Modelo de Dados

### Tabela `users`

Tabela padrão do Laravel (criada automaticamente).

### Tabela `projects`

| Coluna       | Tipo          | Descrição                    |
| ------------ | ------------- | ---------------------------- |
| `id`         | bigint (PK)   | Identificador                |
| `user_id`    | bigint (FK)   | Proprietário do projeto      |
| `name`       | varchar(100)  | Nome do projeto              |
| `color`      | varchar(7)    | Cor hex (padrão: `#6366f1`)  |
| `created_at` | timestamp     | Data de criação              |
| `updated_at` | timestamp     | Data de atualização          |
| `deleted_at` | timestamp     | Soft delete                  |

### Tabela `tasks`

| Coluna         | Tipo                              | Descrição                       |
| -------------- | --------------------------------- | ------------------------------- |
| `id`           | bigint (PK)                       | Identificador                   |
| `user_id`      | bigint (FK)                       | Proprietário da tarefa          |
| `project_id`   | bigint (FK, nullable)             | Projeto associado               |
| `description`  | text                              | Descrição da tarefa             |
| `who`          | varchar(255, nullable)            | Responsável                     |
| `start_date`   | date (nullable)                   | Data de início                  |
| `end_date`     | date (nullable)                   | Data de término                 |
| `status`       | enum: active, finalized, deleted  | Status da tarefa                |
| `priority`     | integer                           | Ordem de prioridade             |
| `is_pinned`    | boolean                           | Se a tarefa está fixada         |
| `delegated_to` | varchar(255, nullable)            | Nome da pessoa delegada         |
| `share_token`  | uuid (unique)                     | Token para compartilhamento     |
| `created_at`   | timestamp                         | Data de criação                 |
| `updated_at`   | timestamp                         | Data de atualização             |
| `deleted_at`   | timestamp                         | Soft delete                     |

---

## ⚙ Comandos Úteis

### Docker

```bash
# Iniciar todos os containers
docker-compose up -d

# Parar todos os containers
docker-compose down

# Rebuild completo (após mudanças em Dockerfile)
docker-compose up -d --build

# Ver logs de um container específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
docker-compose logs -f mysql

# Acessar shell do container backend
docker-compose exec backend bash

# Acessar shell do container frontend
docker-compose exec frontend sh
```

### Laravel (dentro do container backend)

```bash
# Rodar migrations
docker-compose exec backend php artisan migrate --force

# Resetar banco + seeders
docker-compose exec backend php artisan migrate:fresh --seed

# Rodar apenas seeders
docker-compose exec backend php artisan db:seed --force

# Limpar cache
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan route:clear

# Listar todas as rotas da API
docker-compose exec backend php artisan route:list

# Gerar nova APP_KEY
docker-compose exec backend php artisan key:generate --force
```

### Frontend (dentro do container frontend)

```bash
# Instalar dependências
docker-compose exec frontend npm install

# Verificar linting
docker-compose exec frontend npm run lint

# Build de produção
docker-compose exec frontend npm run build
```

---

## 🐛 Troubleshooting

### O MySQL não está pronto a tempo

O `docker-entrypoint.sh` já possui um loop que aguarda o MySQL ficar disponível. Se mesmo assim houver problemas:

```bash
# Verifique o status do container MySQL
docker-compose ps

# Veja os logs
docker-compose logs mysql

# Reinicie apenas o backend
docker-compose restart backend
```

### Erro de permissão no storage

```bash
docker-compose exec backend chmod -R 775 storage bootstrap/cache
docker-compose exec backend chown -R www-data:www-data storage bootstrap/cache
```

### Porta 80 já em uso

Altere a variável `APP_PORT` no `.env` da raiz:

```env
APP_PORT=8000
```

E acesse em `http://localhost:8000`.

### Porta 8181 (phpMyAdmin) já em uso

Altere a variável `PMA_PORT` no `.env` da raiz:

```env
PMA_PORT=8282
```

### Resetar tudo do zero

```bash
# Para os containers, remove volumes e rebuild
docker-compose down -v
bash setup.sh
```

> ⚠️ O flag `-v` **remove os volumes**, ou seja, todos os dados do banco serão perdidos.

---

## 📝 Licença

MIT