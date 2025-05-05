# Enrichment System

## Environment Configuration

### Required Environment Files

Create these files based on the provided `.env.example`:

1. **Development Environment** (`.env.development`)
2. **Test Environment** (`.env.test`)

### File Setup Instructions

1. Create the files in your project root:

```bash
cp .env.example .env.development
cp .env.example .env.test
```

2. Configure each file appropriately:

#### `.env.development` (Local Development)

```ini
# Application Settings
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/driva?schema=public"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# RabbitMQ Configuration
RABBITMQ_URL="amqp://guest:guest@localhost:5672"

# External API Configuration
EXTERNAL_API_BASE_URL="http://localhost:3001"
```

#### `.env.test` (Test Environment)

```ini
# Application Settings
PORT=3001
NODE_ENV=test

# Database Configuration - Use a separate test database!
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/driva-test?schema=public"

# Redis Configuration
REDIS_URL="redis://localhost:6380"

# RabbitMQ Configuration
RABBITMQ_URL="amqp://guest:guest@localhost:5673"

# External API Configuration
EXTERNAL_API_BASE_URL="http://localhost:3002"
```

## Local Setup

### Prerequisites

- Docker and Docker Compose installed
- Node.js 20+
- Yarn

### Step-by-Step

1. **Clone the repository**

   ```bash
   git clone [your-repository]
   cd [project-folder]
   ```

2. **Start containers**

   ```bash
   docker-compose up -d
   ```

3. **Install dependencies**

   ```bash
   yarn install
   ```

4. **Set up the database (Dev)**

   ```bash
   yarn prisma:generate:dev
   yarn prisma:migrate:dev
   yarn prisma:seed:dev
   ```

5. **Start the server**
   ```bash
   yarn start:dev
   ```

The server will be available at `http://localhost:3000`

## Architectural Decisions

### Project Structure

- **Clean Architecture** with clear separation between:
  - Domain (business rules)
  - Application (use cases)
  - Infrastructure (concrete implementations)

### Core Technologies

- **NestJS** - Node.js Backend framework
- **Prisma** - ORM for database access
- **PostgreSQL** - Relational database
- **RabbitMQ** - For async processing
- **Jest** - For unit and integration tests

![Architecture](./docs/images/architecture.png)

### Implemented Patterns

- Repository Pattern for data access
- Command Pattern
- Dependency Injection
- SOLID

## 🧪 Running Tests

### Unit Tests

```bash
yarn test:unit
```

### Integration Tests

```bash
yarn test:int
```

### Tests with Coverage

```bash
yarn test:coverage
```

### Run tests in watch mode

```bash
yarn test:unit:watch  # For unit tests
yarn test:int:watch   # For integration tests
```

### Set up test environment

```bash
yarn prisma:generate:test
yarn prisma:migrate:test
yarn prisma:seed:test
```

## Potential Improvements

With more time, we could implement:

### **Authentication & Authorization**

- JWT-based authentication
- Role-based access control

### **Enhanced Error Handling**

- Transaction rollback for failed operations
- Circuit breakers for external service calls
- Retry mechanisms with exponential backoff

### **Observability**

- Logging with correlation IDs
- Metrics collection (Prometheus)
- Distributed tracing

### **Deployment & CI/CD**

- CI/ CD
- GitHub Actions pipeline

### **Internationalization**

- Internationalization (i18n) of error messages
