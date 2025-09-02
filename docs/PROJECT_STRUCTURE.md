# Project Structure

```
retail-inventory-platform/
├── README.md                          # Main project documentation
├── .gitignore                         # Git ignore rules
├── docker-compose.yml                 # Docker services configuration
├── DEVELOPMENT.md                     # Development setup guide
│
├── archive/                           # Archived/disabled files
│   ├── disabled_entities/             # Old entity files
│   ├── disabled_repositories/         # Old repository files
│   └── disabled_services/             # Old service files
│
├── backend/                           # Backend services
│   ├── README.md                      # Backend documentation
│   ├── requirements.txt               # Python dependencies
│   ├── pom.xml                        # Maven configuration
│   ├── Dockerfile                     # ML API Docker image
│   ├── Dockerfile.spring              # Spring Boot Docker image
│   │
│   ├── api/                           # FastAPI endpoints
│   │   └── endpoints/
│   │       ├── auth.py                # Authentication endpoints
│   │       ├── forecasting.py         # ML forecasting endpoints
│   │       ├── inventory.py           # Inventory management
│   │       ├── purchase_orders.py     # Purchase order endpoints
│   │       └── suppliers.py           # Supplier management
│   │
│   ├── core/                          # Core business logic
│   │   ├── config.py                  # Application configuration
│   │   ├── forecasting/               # ML forecasting models
│   │   │   └── models.py              # Prophet forecasting implementation
│   │   └── optimization/              # Business optimization
│   │       └── reorder_engine.py      # Reorder point calculations
│   │
│   ├── models/                        # Data models
│   │   ├── database.py                # SQLAlchemy models
│   │   └── schemas.py                 # Pydantic schemas
│   │
│   ├── src/main/java/                 # Spring Boot application
│   │   └── com/retailinventory/
│   │       ├── RetailInventoryApplication.java  # Main application class
│   │       │
│   │       ├── domain/                # Domain layer
│   │       │   ├── entity/            # JPA entities
│   │       │   │   ├── BaseEntity.java
│   │       │   │   ├── Store.java
│   │       │   │   ├── Product.java
│   │       │   │   ├── Inventory.java
│   │       │   │   ├── Forecast.java
│   │       │   │   ├── PurchaseOrder.java
│   │       │   │   ├── Supplier.java
│   │       │   │   ├── User.java
│   │       │   │   ├── Role.java
│   │       │   │   ├── Permission.java
│   │       │   │   ├── LeadTime.java
│   │       │   │   ├── PurchaseOrderItem.java
│   │       │   │   ├── SalesTransaction.java
│   │       │   │   ├── WebhookEvent.java
│   │       │   │   └── AuditEvent.java
│   │       │   │
│   │       │   ├── repository/        # Data access layer
│   │       │   │   ├── StoreRepository.java
│   │       │   │   ├── ProductRepository.java
│   │       │   │   ├── InventoryRepository.java
│   │       │   │   ├── ForecastRepository.java
│   │       │   │   ├── PurchaseOrderRepository.java
│   │       │   │   ├── SupplierRepository.java
│   │       │   │   ├── UserRepository.java
│   │       │   │   ├── RoleRepository.java
│   │       │   │   ├── PermissionRepository.java
│   │       │   │   ├── LeadTimeRepository.java
│   │       │   │   ├── PurchaseOrderItemRepository.java
│   │       │   │   ├── SalesTransactionRepository.java
│   │       │   │   ├── WebhookEventRepository.java
│   │       │   │   └── AuditEventRepository.java
│   │       │   │
│   │       │   └── service/           # Business services
│   │       │       └── ReorderService.java
│   │       │
│   │       └── infrastructure/        # Infrastructure layer
│   │           ├── config/            # Configuration classes
│   │           │   ├── SecurityConfig.java
│   │           │   ├── WebClientConfig.java
│   │           │   ├── ObservabilityConfig.java
│   │           │   └── DevConfig.java
│   │           │
│   │           ├── controller/        # REST controllers
│   │           │   ├── AuthController.java
│   │           │   ├── ReorderController.java
│   │           │   ├── WebhookController.java
│   │           │   └── RealtimeController.java
│   │           │
│   │           ├── dto/               # Data transfer objects
│   │           │   ├── auth/          # Authentication DTOs
│   │           │   │   ├── AuthenticationRequest.java
│   │           │   │   ├── AuthenticationResponse.java
│   │           │   │   ├── RegisterRequest.java
│   │           │   │   ├── LoginRequest.java
│   │           │   │   ├── LoginResponse.java
│   │           │   │   └── RefreshTokenRequest.java
│   │           │   │
│   │           │   └── reorder/       # Reorder DTOs
│   │           │       └── ReorderSuggestion.java
│   │           │
│   │           ├── exception/         # Exception handling
│   │           │   ├── ResourceNotFoundException.java
│   │           │   └── ValidationException.java
│   │           │
│   │           ├── graphql/           # GraphQL resolvers
│   │           │   ├── QueryResolver.java
│   │           │   ├── MutationResolver.java
│   │           │   ├── DashboardKPIs.java
│   │           │   ├── ProductSales.java
│   │           │   ├── ForecastPoint.java
│   │           │   ├── InventoryUpdateInput.java
│   │           │   ├── InventoryAdjustmentInput.java
│   │           │   ├── PurchaseOrderCreateInput.java
│   │           │   ├── PurchaseOrderItemInput.java
│   │           │   └── ForecastGenerateInput.java
│   │           │
│   │           ├── security/          # Security components
│   │           │   ├── JwtService.java
│   │           │   └── JwtAuthenticationFilter.java
│   │           │
│   │           └── service/           # Infrastructure services
│   │               ├── MlApiService.java
│   │               ├── EmailService.java
│   │               ├── PdfService.java
│   │               ├── WebhookService.java
│   │               └── AuditService.java
│   │
│   └── src/main/resources/            # Spring Boot resources
│       ├── application.yml            # Main configuration
│       ├── application-dev.yml        # Development profile
│       └── graphql/
│           └── schema.graphqls        # GraphQL schema
│
├── frontend/                          # React frontend
│   ├── package.json                   # Node.js dependencies
│   ├── package-lock.json              # Dependency lock file
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── vite.config.ts                 # Vite build configuration
│   ├── index.html                     # HTML entry point
│   │
│   └── src/
│       ├── main.tsx                   # React entry point
│       ├── App.tsx                    # Main application component
│       ├── index.css                  # Global styles
│       │
│       ├── components/                # Reusable components
│       │   ├── Layout.tsx             # Main layout component
│       │   └── ui/                    # UI components
│       │       ├── DataTable.tsx
│       │       ├── EmptyState.tsx
│       │       ├── FiltersBar.tsx
│       │       ├── PageHeader.tsx
│       │       ├── SectionCard.tsx
│       │       └── StatCard.tsx
│       │
│       ├── pages/                     # Page components
│       │   ├── Dashboard.tsx
│       │   ├── Login.tsx
│       │   ├── Inventory.tsx
│       │   ├── Products.tsx
│       │   ├── Suppliers.tsx
│       │   ├── Stores.tsx
│       │   ├── PurchaseOrders.tsx
│       │   ├── Forecasting.tsx
│       │   ├── Profile.tsx
│       │   └── Settings.tsx
│       │
│       ├── services/                  # API services
│       │   └── api.ts                 # Axios configuration
│       │
│       ├── stores/                    # State management
│       │   └── authStore.ts           # Authentication store
│       │
│       ├── theme.ts                   # Theme configuration
│       └── utils/                     # Utility functions
│           └── helpers.ts
│
├── docs/                              # Documentation
│   ├── ARCHITECTURE.md                # System architecture
│   ├── DEVELOPMENT.md                 # Development guide
│   └── PROJECT_STRUCTURE.md           # This file
│
├── dbt_project.yml                    # dbt project configuration
├── profiles.yml                       # dbt profiles configuration
│
├── models/                            # dbt models
│   ├── sources.yml                    # Source definitions
│   ├── staging/                       # Staging models
│   │   ├── stg_sales_daily.sql
│   │   ├── stg_forecasts_daily.sql
│   │   └── stg_inventory_positions.sql
│   ├── marts/                         # Data marts
│   │   ├── dim_stores.sql
│   │   ├── dim_products.sql
│   │   └── fact_daily_sales.sql
│   ├── metrics/                       # Business metrics
│   │   ├── inventory_metrics.sql
│   │   └── forecast_accuracy.sql
│   └── tests/                         # Data quality tests
│       ├── test_sales_data_quality.sql
│       ├── test_forecast_data_quality.sql
│       └── test_inventory_data_quality.sql
│
├── prometheus/                        # Monitoring configuration
│   └── prometheus.yml                 # Prometheus configuration
│
└── grafana/                           # Dashboard configuration
    └── dashboards/
        └── retail-inventory-dashboard.json
```

## Key Directories

### Backend Services
- **`backend/api/`** - FastAPI endpoints for ML services
- **`backend/core/`** - Core business logic and ML models
- **`backend/models/`** - Data models and schemas
- **`backend/src/main/java/`** - Spring Boot application

### Frontend
- **`frontend/src/components/`** - Reusable UI components
- **`frontend/src/pages/`** - Page-level components
- **`frontend/src/services/`** - API integration
- **`frontend/src/stores/`** - State management

### Infrastructure
- **`docs/`** - Project documentation
- **`models/`** - dbt data transformation models
- **`prometheus/`** - Monitoring configuration
- **`grafana/`** - Dashboard definitions

### Archive
- **`archive/`** - Disabled or old files for reference

## File Naming Conventions

### Java Files
- **Entities**: PascalCase (e.g., `Product.java`)
- **Repositories**: PascalCase with "Repository" suffix
- **Services**: PascalCase with "Service" suffix
- **Controllers**: PascalCase with "Controller" suffix
- **DTOs**: PascalCase with descriptive suffix

### Python Files
- **Modules**: snake_case (e.g., `forecasting.py`)
- **Classes**: PascalCase (e.g., `ProphetForecaster`)
- **Functions**: snake_case (e.g., `generate_forecast`)

### Frontend Files
- **Components**: PascalCase (e.g., `Dashboard.tsx`)
- **Pages**: PascalCase (e.g., `Inventory.tsx`)
- **Utilities**: camelCase (e.g., `helpers.ts`)

### Configuration Files
- **YAML**: kebab-case (e.g., `application-dev.yml`)
- **JSON**: kebab-case (e.g., `retail-inventory-dashboard.json`)
- **SQL**: snake_case (e.g., `stg_sales_daily.sql`)
