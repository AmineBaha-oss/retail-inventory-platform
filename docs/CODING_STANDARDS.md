# Coding Standards

This document outlines the coding standards and best practices for the Retail Inventory Platform. All contributors must follow these guidelines to maintain code quality and consistency.

## 📋 Table of Contents

- [General Principles](#general-principles)
- [Java/Spring Boot Standards](#javaspring-boot-standards)
- [Python/FastAPI Standards](#pythonfastapi-standards)
- [TypeScript/React Standards](#typescriptreact-standards)
- [Database Standards](#database-standards)
- [API Design Standards](#api-design-standards)
- [Testing Standards](#testing-standards)
- [Documentation Standards](#documentation-standards)
- [Git Standards](#git-standards)

## 🎯 General Principles

### Code Quality

- **Readability**: Code should be self-documenting and easy to understand
- **Consistency**: Follow established patterns and conventions
- **Maintainability**: Write code that is easy to modify and extend
- **Performance**: Consider performance implications of code decisions
- **Security**: Implement security best practices throughout

### Naming Conventions

- **Descriptive Names**: Use clear, descriptive names for variables, functions, and classes
- **Avoid Abbreviations**: Use full words instead of abbreviations
- **Consistent Terminology**: Use the same terms throughout the codebase
- **Domain Language**: Use business domain terminology where appropriate

## ☕ Java/Spring Boot Standards

### Package Structure

```
com.retailinventory
├── domain/                    # Domain layer
│   ├── entity/               # JPA entities
│   ├── repository/           # Data access
│   └── service/              # Business services
├── infrastructure/           # Infrastructure layer
│   ├── config/              # Configuration
│   ├── controller/           # REST controllers
│   ├── dto/                 # Data transfer objects
│   ├── exception/           # Exception handling
│   ├── graphql/             # GraphQL resolvers
│   ├── security/            # Security components
│   └── service/             # Infrastructure services
└── application/             # Application layer
    ├── command/             # Command handlers
    ├── query/               # Query handlers
    └── service/             # Application services
```

### Class Naming

```java
// Entities
@Entity
public class Product {
    // ...
}

// Repositories
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // ...
}

// Services
@Service
public class ProductService {
    // ...
}

// Controllers
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    // ...
}

// DTOs
public class ProductDto {
    // ...
}

public class CreateProductRequest {
    // ...
}
```

### Method Naming

```java
// Service methods
public Product createProduct(CreateProductRequest request) {
    // ...
}

public List<Product> findProductsByCategory(String category) {
    // ...
}

public void updateProduct(Long id, UpdateProductRequest request) {
    // ...
}

public void deleteProduct(Long id) {
    // ...
}
```

### Code Style

```java
// Use meaningful variable names
public Product createProduct(CreateProductRequest request) {
    String productName = request.getName();
    BigDecimal unitCost = request.getUnitCost();

    // Use builder pattern for complex objects
    Product product = Product.builder()
        .name(productName)
        .sku(generateSku(productName))
        .unitCost(unitCost)
        .category(request.getCategory())
        .build();

    return productRepository.save(product);
}

// Use Optional for nullable returns
public Optional<Product> findProductById(Long id) {
    return productRepository.findById(id);
}

// Use streams for collections
public List<ProductDto> getProductsByCategory(String category) {
    return productRepository.findByCategory(category)
        .stream()
        .map(this::toDto)
        .collect(Collectors.toList());
}
```

### Exception Handling

```java
// Custom exceptions
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ProductNotFoundException extends RuntimeException {
    public ProductNotFoundException(Long id) {
        super("Product not found with id: " + id);
    }
}

// Exception handling in controllers
@ExceptionHandler(ProductNotFoundException.class)
public ResponseEntity<ErrorResponse> handleProductNotFound(ProductNotFoundException ex) {
    ErrorResponse error = ErrorResponse.builder()
        .message(ex.getMessage())
        .timestamp(LocalDateTime.now())
        .build();

    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
}
```

### Validation

```java
// Use Bean Validation annotations
public class CreateProductRequest {
    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 100, message = "Product name must be between 2 and 100 characters")
    private String name;

    @NotNull(message = "Unit cost is required")
    @DecimalMin(value = "0.01", message = "Unit cost must be greater than 0")
    private BigDecimal unitCost;

    @NotBlank(message = "Category is required")
    private String category;

    // getters and setters
}
```

## 🐍 Python/FastAPI Standards

### Package Structure

```
backend/
├── api/                     # API layer
│   └── endpoints/          # Route handlers
├── core/                   # Core business logic
│   ├── forecasting/       # ML forecasting
│   └── optimization/      # Business optimization
├── models/                 # Data models
│   ├── database.py        # SQLAlchemy models
│   └── schemas.py         # Pydantic schemas
├── services/              # Business services
└── utils/                 # Utility functions
```

### Function and Class Naming

```python
# Functions: snake_case
def generate_forecast(product_id: str, store_id: str, horizon_days: int) -> ForecastResult:
    """Generate forecast for a product at a specific store."""
    pass

# Classes: PascalCase
class ProphetForecaster:
    """Prophet-based forecasting model."""
    pass

# Constants: UPPER_SNAKE_CASE
MAX_FORECAST_HORIZON = 365
DEFAULT_CONFIDENCE_LEVEL = 0.95
```

### Type Hints

```python
from typing import List, Optional, Dict, Any
from decimal import Decimal

def calculate_reorder_point(
    current_inventory: int,
    daily_forecast: float,
    lead_time_days: int,
    service_level: float = 0.95
) -> ReorderPointResult:
    """Calculate reorder point based on forecast and lead time."""
    pass

# Use Pydantic for data validation
from pydantic import BaseModel, Field

class ForecastRequest(BaseModel):
    product_id: str = Field(..., description="Product identifier")
    store_id: str = Field(..., description="Store identifier")
    horizon_days: int = Field(30, ge=1, le=365, description="Forecast horizon in days")
    include_components: bool = Field(False, description="Include forecast components")
```

### Error Handling

```python
# Custom exceptions
class ForecastingError(Exception):
    """Base exception for forecasting operations."""
    pass

class InsufficientDataError(ForecastingError):
    """Raised when insufficient data for forecasting."""
    pass

# Exception handling
@app.exception_handler(ForecastingError)
async def forecasting_exception_handler(request: Request, exc: ForecastingError):
    return JSONResponse(
        status_code=400,
        content={"error": "Forecasting Error", "message": str(exc)}
    )
```

### Async/Await

```python
# Use async/await for I/O operations
async def get_forecast_data(product_id: str, store_id: str) -> List[SalesData]:
    """Fetch historical sales data for forecasting."""
    async with get_database_session() as session:
        result = await session.execute(
            select(SalesTransaction)
            .where(SalesTransaction.product_id == product_id)
            .where(SalesTransaction.store_id == store_id)
        )
        return result.scalars().all()

# Use dependency injection
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """Get current authenticated user."""
    pass
```

## ⚛️ TypeScript/React Standards

### File Structure

```
src/
├── components/             # Reusable components
│   ├── ui/                # Basic UI components
│   └── features/          # Feature-specific components
├── pages/                 # Page components
├── hooks/                 # Custom React hooks
├── services/              # API services
├── stores/                # State management
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

### Component Naming

```typescript
// Components: PascalCase
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
}) => {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>SKU: {product.sku}</p>
      <button onClick={() => onEdit(product.id)}>Edit</button>
    </div>
  );
};

// Hooks: camelCase with 'use' prefix
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { products, loading, fetchProducts };
};
```

### TypeScript Types

```typescript
// Use interfaces for object shapes
interface Product {
  id: string;
  name: string;
  sku: string;
  unitCost: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

// Use types for unions and primitives
type ProductStatus = "active" | "inactive" | "discontinued";
type SortDirection = "asc" | "desc";

// Use generics for reusable types
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// Use utility types
type ProductUpdate = Partial<Pick<Product, "name" | "unitCost" | "category">>;
```

### React Patterns

```typescript
// Use functional components with hooks
export const ProductList: React.FC = () => {
  const { products, loading, fetchProducts } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductSelect = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="product-list">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={handleProductSelect}
        />
      ))}
    </div>
  );
};
```

### State Management

```typescript
// Use Zustand for global state
interface AuthStore {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (credentials) => {
    try {
      const response = await authService.login(credentials);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
      });
    } catch (error) {
      throw new Error("Login failed");
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));
```

## 🗄️ Database Standards

### Table Naming

```sql
-- Use snake_case for table names
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Use descriptive column names
CREATE TABLE sales_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    store_id UUID NOT NULL REFERENCES stores(id),
    quantity_sold INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes

```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_sales_transactions_date ON sales_transactions(transaction_date);
CREATE INDEX idx_sales_transactions_product_store ON sales_transactions(product_id, store_id);

-- Composite indexes for complex queries
CREATE INDEX idx_sales_transactions_product_store_date
ON sales_transactions(product_id, store_id, transaction_date);
```

### Constraints

```sql
-- Use appropriate constraints
ALTER TABLE products
ADD CONSTRAINT chk_unit_cost_positive CHECK (unit_cost > 0);

ALTER TABLE sales_transactions
ADD CONSTRAINT chk_quantity_positive CHECK (quantity_sold > 0);

-- Foreign key constraints
ALTER TABLE sales_transactions
ADD CONSTRAINT fk_sales_product
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
```

## 🔌 API Design Standards

### REST API Design

```java
// Use consistent URL patterns
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    // GET /api/v1/products
    @GetMapping
    public ResponseEntity<List<ProductDto>> getProducts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String category
    ) {
        // ...
    }

    // GET /api/v1/products/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProduct(@PathVariable Long id) {
        // ...
    }

    // POST /api/v1/products
    @PostMapping
    public ResponseEntity<ProductDto> createProduct(@Valid @RequestBody CreateProductRequest request) {
        // ...
    }

    // PUT /api/v1/products/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> updateProduct(
        @PathVariable Long id,
        @Valid @RequestBody UpdateProductRequest request
    ) {
        // ...
    }

    // DELETE /api/v1/products/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        // ...
    }
}
```

### GraphQL Schema

```graphql
# Use descriptive types and fields
type Product {
  id: ID!
  name: String!
  sku: String!
  unitCost: Float!
  category: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Query {
  products(first: Int, after: String, category: String): ProductConnection!
  product(id: ID!): Product
}

type Mutation {
  createProduct(input: CreateProductInput!): Product!
  updateProduct(id: ID!, input: UpdateProductInput!): Product!
  deleteProduct(id: ID!): Boolean!
}

input CreateProductInput {
  name: String!
  sku: String!
  unitCost: Float!
  category: String!
}
```

### Response Format

```json
{
  "data": {
    "id": "123",
    "name": "Sample Product",
    "sku": "PROD-001",
    "unitCost": 25.99,
    "category": "Electronics"
  },
  "message": "Product created successfully",
  "success": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🧪 Testing Standards

### Unit Tests

```java
// Java unit tests
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void shouldCreateProductSuccessfully() {
        // Given
        CreateProductRequest request = CreateProductRequest.builder()
            .name("Test Product")
            .sku("TEST-001")
            .unitCost(BigDecimal.valueOf(10.00))
            .category("Test")
            .build();

        Product savedProduct = Product.builder()
            .id(1L)
            .name("Test Product")
            .sku("TEST-001")
            .unitCost(BigDecimal.valueOf(10.00))
            .category("Test")
            .build();

        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        // When
        Product result = productService.createProduct(request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Test Product");
        assertThat(result.getSku()).isEqualTo("TEST-001");
        verify(productRepository).save(any(Product.class));
    }
}
```

### Integration Tests

```python
# Python integration tests
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)

@pytest.fixture
def db_session():
    """Create test database session."""
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()

def test_create_product(client, db_session):
    """Test product creation endpoint."""
    product_data = {
        "name": "Test Product",
        "sku": "TEST-001",
        "unit_cost": 10.00,
        "category": "Test"
    }

    response = client.post("/api/v1/products", json=product_data)

    assert response.status_code == 201
    assert response.json()["name"] == "Test Product"
    assert response.json()["sku"] == "TEST-001"
```

### Frontend Tests

```typescript
// React component tests
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductCard } from "./ProductCard";

describe("ProductCard", () => {
  const mockProduct = {
    id: "1",
    name: "Test Product",
    sku: "TEST-001",
    unitCost: 10.0,
    category: "Test",
  };

  it("renders product information correctly", () => {
    render(<ProductCard product={mockProduct} onEdit={jest.fn()} />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("SKU: TEST-001")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", () => {
    const mockOnEdit = jest.fn();
    render(<ProductCard product={mockProduct} onEdit={mockOnEdit} />);

    fireEvent.click(screen.getByText("Edit"));

    expect(mockOnEdit).toHaveBeenCalledWith("1");
  });
});
```

## 📚 Documentation Standards

### Code Comments

```java
/**
 * Service for managing product operations.
 *
 * This service handles all product-related business logic including
 * creation, updates, deletion, and retrieval operations.
 *
 * @author Development Team
 * @since 1.0
 */
@Service
public class ProductService {

    /**
     * Creates a new product with the given details.
     *
     * @param request the product creation request containing product details
     * @return the created product
     * @throws ValidationException if the request data is invalid
     * @throws DuplicateSkuException if a product with the same SKU already exists
     */
    public Product createProduct(CreateProductRequest request) {
        // Implementation
    }
}
```

### API Documentation

````python
@app.post("/api/v1/forecasting/train", response_model=TrainingResult)
async def train_forecasting_model(
    request: TrainingRequest,
    current_user: User = Depends(get_current_user)
) -> TrainingResult:
    """
    Train a forecasting model for a specific product and store.

    This endpoint trains a Prophet-based forecasting model using historical
    sales data to predict future demand patterns.

    Args:
        request: Training request containing product ID, store ID, and sales data
        current_user: Currently authenticated user

    Returns:
        TrainingResult: Model training results including performance metrics

    Raises:
        InsufficientDataError: When there's not enough historical data
        ValidationError: When request data is invalid

    Example:
        ```json
        {
            "product_id": "PROD-001",
            "store_id": "STORE-001",
            "sales_data": [
                {"date": "2024-01-01", "quantity_sold": 10},
                {"date": "2024-01-02", "quantity_sold": 15}
            ]
        }
        ```
    """
    pass
````

## 🔄 Git Standards

### Commit Messages

```
feat: add product forecasting capabilities

- Implement Prophet-based forecasting model
- Add P50/P90 quantile predictions
- Include seasonality detection
- Add forecast accuracy metrics

Closes #123
```

### Branch Naming

```
feature/forecasting-engine
bugfix/inventory-calculation
hotfix/security-vulnerability
chore/update-dependencies
```

### Pull Request Template

```markdown
## Description

Brief description of changes made.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## 🎯 Code Review Guidelines

### Review Checklist

- [ ] Code follows established patterns
- [ ] Proper error handling implemented
- [ ] Tests are comprehensive and pass
- [ ] Documentation is updated
- [ ] Performance considerations addressed
- [ ] Security best practices followed
- [ ] No hardcoded values or secrets
- [ ] Proper logging implemented

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Peer Review**: At least one team member reviews the code
3. **Architecture Review**: Complex changes require architecture review
4. **Security Review**: Security-sensitive changes require security review
5. **Final Approval**: Maintainer approval before merge

---

**Remember**: These standards are living documents that evolve with the project. Always prioritize code quality, maintainability, and team collaboration over strict adherence to rules.
