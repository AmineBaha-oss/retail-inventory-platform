# Testing Guide

This comprehensive guide covers all testing strategies and implementations for the Retail Inventory Platform, ensuring code quality and system reliability.

## 📋 Table of Contents

- [Testing Strategy](#testing-strategy)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)
- [Test Automation](#test-automation)
- [CI/CD Integration](#cicd-integration)

## 🎯 Testing Strategy

### Testing Pyramid

```
        /\
       /  \
      / E2E \     ← End-to-End Tests (10%)
     /______\
    /        \
   /Integration\ ← Integration Tests (20%)
  /____________\
 /              \
/   Unit Tests   \ ← Unit Tests (70%)
/________________\
```

### Testing Levels

#### 1. Unit Tests (70%)

- **Purpose**: Test individual components in isolation
- **Scope**: Functions, methods, classes
- **Speed**: Fast execution (< 1ms per test)
- **Coverage**: 80%+ code coverage required

#### 2. Integration Tests (20%)

- **Purpose**: Test component interactions
- **Scope**: API endpoints, database operations
- **Speed**: Medium execution (< 100ms per test)
- **Coverage**: Critical business logic paths

#### 3. End-to-End Tests (10%)

- **Purpose**: Test complete user workflows
- **Scope**: Full application scenarios
- **Speed**: Slow execution (< 5s per test)
- **Coverage**: Critical user journeys

### Testing Principles

#### Quality Standards

- **Reliability**: Tests must be deterministic
- **Maintainability**: Tests should be easy to update
- **Readability**: Tests should be self-documenting
- **Performance**: Tests should run quickly
- **Coverage**: Comprehensive test coverage

#### Best Practices

- **AAA Pattern**: Arrange, Act, Assert
- **Single Responsibility**: One test per scenario
- **Descriptive Names**: Clear test descriptions
- **Independent Tests**: No test dependencies
- **Fast Feedback**: Quick test execution

## ☕ Backend Testing

### Java/Spring Boot Testing

#### Unit Tests

##### Service Layer Testing

```java
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ValidationService validationService;

    @InjectMocks
    private ProductService productService;

    @Test
    @DisplayName("Should create product successfully")
    void shouldCreateProductSuccessfully() {
        // Arrange
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

        when(validationService.validateProduct(request)).thenReturn(true);
        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        // Act
        Product result = productService.createProduct(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Test Product");
        assertThat(result.getSku()).isEqualTo("TEST-001");
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Should throw exception when product already exists")
    void shouldThrowExceptionWhenProductAlreadyExists() {
        // Arrange
        CreateProductRequest request = CreateProductRequest.builder()
            .name("Test Product")
            .sku("TEST-001")
            .unitCost(BigDecimal.valueOf(10.00))
            .category("Test")
            .build();

        when(productRepository.existsBySku("TEST-001")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> productService.createProduct(request))
            .isInstanceOf(DuplicateSkuException.class)
            .hasMessage("Product with SKU TEST-001 already exists");
    }
}
```

##### Repository Layer Testing

```java
@DataJpaTest
class ProductRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ProductRepository productRepository;

    @Test
    @DisplayName("Should find products by category")
    void shouldFindProductsByCategory() {
        // Arrange
        Product product1 = Product.builder()
            .name("Product 1")
            .sku("SKU-001")
            .category("Electronics")
            .unitCost(BigDecimal.valueOf(10.00))
            .build();

        Product product2 = Product.builder()
            .name("Product 2")
            .sku("SKU-002")
            .category("Electronics")
            .unitCost(BigDecimal.valueOf(20.00))
            .build();

        entityManager.persistAndFlush(product1);
        entityManager.persistAndFlush(product2);

        // Act
        List<Product> result = productRepository.findByCategory("Electronics");

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result).extracting(Product::getCategory)
            .containsOnly("Electronics");
    }
}
```

##### Controller Layer Testing

```java
@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @Test
    @DisplayName("Should create product successfully")
    void shouldCreateProductSuccessfully() throws Exception {
        // Arrange
        CreateProductRequest request = CreateProductRequest.builder()
            .name("Test Product")
            .sku("TEST-001")
            .unitCost(BigDecimal.valueOf(10.00))
            .category("Test")
            .build();

        Product createdProduct = Product.builder()
            .id(1L)
            .name("Test Product")
            .sku("TEST-001")
            .unitCost(BigDecimal.valueOf(10.00))
            .category("Test")
            .build();

        when(productService.createProduct(any(CreateProductRequest.class)))
            .thenReturn(createdProduct);

        // Act & Assert
        mockMvc.perform(post("/api/v1/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Test Product"))
            .andExpect(jsonPath("$.sku").value("TEST-001"))
            .andExpect(jsonPath("$.unitCost").value(10.00))
            .andExpect(jsonPath("$.category").value("Test"));
    }
}
```

#### Integration Tests

##### API Integration Tests

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class ProductApiIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ProductRepository productRepository;

    @Test
    @DisplayName("Should create and retrieve product")
    void shouldCreateAndRetrieveProduct() {
        // Arrange
        CreateProductRequest request = CreateProductRequest.builder()
            .name("Test Product")
            .sku("TEST-001")
            .unitCost(BigDecimal.valueOf(10.00))
            .category("Test")
            .build();

        // Act
        ResponseEntity<ProductDto> response = restTemplate.postForEntity(
            "/api/v1/products", request, ProductDto.class);

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().getName()).isEqualTo("Test Product");

        // Verify in database
        List<Product> products = productRepository.findAll();
        assertThat(products).hasSize(1);
        assertThat(products.get(0).getName()).isEqualTo("Test Product");
    }
}
```

### Python/FastAPI Testing

#### Unit Tests

##### Service Layer Testing

```python
import pytest
from unittest.mock import Mock, patch
from decimal import Decimal
from core.forecasting.models import ProphetForecaster
from core.optimization.reorder_engine import ReorderPointEngine

class TestProphetForecaster:

    @pytest.fixture
    def forecaster(self):
        return ProphetForecaster()

    @pytest.fixture
    def sample_data(self):
        return [
            {"date": "2024-01-01", "quantity_sold": 10},
            {"date": "2024-01-02", "quantity_sold": 15},
            {"date": "2024-01-03", "quantity_sold": 12},
        ]

    def test_train_model_success(self, forecaster, sample_data):
        """Test successful model training."""
        # Arrange
        product_id = "PROD-001"
        store_id = "STORE-001"

        # Act
        result = forecaster.train(sample_data, product_id, store_id)

        # Assert
        assert result is not None
        assert result["product_id"] == product_id
        assert result["store_id"] == store_id
        assert "performance_metrics" in result
        assert "mae" in result["performance_metrics"]

    def test_train_model_insufficient_data(self, forecaster):
        """Test training with insufficient data."""
        # Arrange
        insufficient_data = [{"date": "2024-01-01", "quantity_sold": 10}]

        # Act & Assert
        with pytest.raises(InsufficientDataError):
            forecaster.train(insufficient_data, "PROD-001", "STORE-001")

    def test_generate_forecast_success(self, forecaster, sample_data):
        """Test successful forecast generation."""
        # Arrange
        product_id = "PROD-001"
        store_id = "STORE-001"
        horizon_days = 30

        # Train model first
        forecaster.train(sample_data, product_id, store_id)

        # Act
        forecast = forecaster.forecast(product_id, horizon_days, store_id)

        # Assert
        assert forecast is not None
        assert "p50_forecast" in forecast
        assert "p90_forecast" in forecast
        assert len(forecast["p50_forecast"]) == horizon_days
```

##### API Endpoint Testing

```python
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

class TestForecastingEndpoints:

    @pytest.fixture
    def client(self):
        return TestClient(app)

    @pytest.fixture
    def training_request(self):
        return {
            "product_id": "PROD-001",
            "store_id": "STORE-001",
            "sales_data": [
                {"date": "2024-01-01", "quantity_sold": 10},
                {"date": "2024-01-02", "quantity_sold": 15}
            ]
        }

    def test_train_model_endpoint(self, client, training_request):
        """Test model training endpoint."""
        # Act
        response = client.post("/api/v1/forecasting/train", json=training_request)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["product_id"] == "PROD-001"
        assert data["store_id"] == "STORE-001"
        assert "performance_metrics" in data

    def test_generate_forecast_endpoint(self, client):
        """Test forecast generation endpoint."""
        # Arrange
        forecast_request = {
            "product_id": "PROD-001",
            "store_id": "STORE-001",
            "horizon_days": 30
        }

        # Act
        response = client.post("/api/v1/forecasting/generate", json=forecast_request)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "p50_forecast" in data
        assert "p90_forecast" in data
```

## ⚛️ Frontend Testing

### React/TypeScript Testing

#### Component Testing

##### Unit Tests

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProductCard } from "./ProductCard";
import { Product } from "../types/Product";

describe("ProductCard", () => {
  const mockProduct: Product = {
    id: "1",
    name: "Test Product",
    sku: "TEST-001",
    unitCost: 10.0,
    category: "Test",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders product information correctly", () => {
    render(
      <ProductCard
        product={mockProduct}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("SKU: TEST-001")).toBeInTheDocument();
    expect(screen.getByText("$10.00")).toBeInTheDocument();
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", () => {
    render(
      <ProductCard
        product={mockProduct}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText("Edit"));

    expect(mockOnEdit).toHaveBeenCalledWith("1");
  });

  it("calls onDelete when delete button is clicked", async () => {
    render(
      <ProductCard
        product={mockProduct}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText("Delete"));

    // Confirm deletion
    fireEvent.click(screen.getByText("Confirm"));

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith("1");
    });
  });
});
```

##### Integration Tests

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProductList } from "./ProductList";
import { ProductService } from "../services/ProductService";

// Mock the service
jest.mock("../services/ProductService");
const mockProductService = ProductService as jest.Mocked<typeof ProductService>;

describe("ProductList Integration", () => {
  const mockProducts = [
    {
      id: "1",
      name: "Product 1",
      sku: "SKU-001",
      unitCost: 10.0,
      category: "Electronics",
    },
    {
      id: "2",
      name: "Product 2",
      sku: "SKU-002",
      unitCost: 20.0,
      category: "Clothing",
    },
  ];

  beforeEach(() => {
    mockProductService.getProducts.mockResolvedValue(mockProducts);
  });

  it("loads and displays products", async () => {
    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 2")).toBeInTheDocument();
    });
  });

  it("filters products by category", async () => {
    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    // Select Electronics category filter
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "Electronics" },
    });

    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.queryByText("Product 2")).not.toBeInTheDocument();
    });
  });
});
```

#### Hook Testing

```typescript
import { renderHook, act } from "@testing-library/react";
import { useProducts } from "../hooks/useProducts";
import { ProductService } from "../services/ProductService";

jest.mock("../services/ProductService");
const mockProductService = ProductService as jest.Mocked<typeof ProductService>;

describe("useProducts Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch products on mount", async () => {
    const mockProducts = [{ id: "1", name: "Product 1", sku: "SKU-001" }];

    mockProductService.getProducts.mockResolvedValue(mockProducts);

    const { result } = renderHook(() => useProducts());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.products).toEqual(mockProducts);
    expect(mockProductService.getProducts).toHaveBeenCalledTimes(1);
  });

  it("should handle fetch errors", async () => {
    const error = new Error("Failed to fetch products");
    mockProductService.getProducts.mockRejectedValue(error);

    const { result } = renderHook(() => useProducts());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(error);
    expect(result.current.products).toEqual([]);
  });
});
```

## 🔗 Integration Testing

### API Integration Tests

#### End-to-End API Tests

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.database import Base, get_db
from main import app

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)

class TestProductAPI:

    def test_create_product_success(self, client):
        """Test successful product creation."""
        product_data = {
            "name": "Test Product",
            "sku": "TEST-001",
            "unit_cost": 10.00,
            "category": "Test"
        }

        response = client.post("/api/v1/products", json=product_data)

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Product"
        assert data["sku"] == "TEST-001"
        assert data["unit_cost"] == 10.00
        assert data["category"] == "Test"

    def test_get_products_success(self, client):
        """Test successful product retrieval."""
        # Create a product first
        product_data = {
            "name": "Test Product",
            "sku": "TEST-001",
            "unit_cost": 10.00,
            "category": "Test"
        }
        client.post("/api/v1/products", json=product_data)

        # Get products
        response = client.get("/api/v1/products")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Test Product"

    def test_update_product_success(self, client):
        """Test successful product update."""
        # Create a product first
        product_data = {
            "name": "Test Product",
            "sku": "TEST-001",
            "unit_cost": 10.00,
            "category": "Test"
        }
        create_response = client.post("/api/v1/products", json=product_data)
        product_id = create_response.json()["id"]

        # Update product
        update_data = {
            "name": "Updated Product",
            "unit_cost": 15.00
        }
        response = client.put(f"/api/v1/products/{product_id}", json=update_data)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Product"
        assert data["unit_cost"] == 15.00
```

### Database Integration Tests

#### Database Operations Testing

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.database import Base, Product, Store, Inventory

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

class TestDatabaseOperations:

    def test_create_product(self, db_session):
        """Test product creation in database."""
        product = Product(
            name="Test Product",
            sku="TEST-001",
            unit_cost=10.00,
            category="Test"
        )

        db_session.add(product)
        db_session.commit()

        # Verify product was created
        created_product = db_session.query(Product).filter_by(sku="TEST-001").first()
        assert created_product is not None
        assert created_product.name == "Test Product"
        assert created_product.unit_cost == 10.00

    def test_create_store(self, db_session):
        """Test store creation in database."""
        store = Store(
            name="Test Store",
            address="123 Test St",
            city="Test City",
            state="TS",
            zip_code="12345",
            store_type="Retail"
        )

        db_session.add(store)
        db_session.commit()

        # Verify store was created
        created_store = db_session.query(Store).filter_by(name="Test Store").first()
        assert created_store is not None
        assert created_store.address == "123 Test St"

    def test_create_inventory(self, db_session):
        """Test inventory creation in database."""
        # Create product and store first
        product = Product(
            name="Test Product",
            sku="TEST-001",
            unit_cost=10.00,
            category="Test"
        )

        store = Store(
            name="Test Store",
            address="123 Test St",
            city="Test City",
            state="TS",
            zip_code="12345",
            store_type="Retail"
        )

        db_session.add(product)
        db_session.add(store)
        db_session.commit()

        # Create inventory
        inventory = Inventory(
            product_id=product.id,
            store_id=store.id,
            current_stock=100,
            reorder_point=50,
            reorder_quantity=200
        )

        db_session.add(inventory)
        db_session.commit()

        # Verify inventory was created
        created_inventory = db_session.query(Inventory).filter_by(
            product_id=product.id,
            store_id=store.id
        ).first()
        assert created_inventory is not None
        assert created_inventory.current_stock == 100
```

## 🎭 End-to-End Testing

### Playwright E2E Tests

#### Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: "docker-compose up -d",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

#### E2E Test Examples

```typescript
import { test, expect } from "@playwright/test";

test.describe("Product Management", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page
    await page.goto("/products");
  });

  test("should create a new product", async ({ page }) => {
    // Click add product button
    await page.click('button[data-testid="add-product"]');

    // Fill in product form
    await page.fill('input[name="name"]', "Test Product");
    await page.fill('input[name="sku"]', "TEST-001");
    await page.fill('input[name="unitCost"]', "10.00");
    await page.selectOption('select[name="category"]', "Electronics");

    // Submit form
    await page.click('button[type="submit"]');

    // Verify product was created
    await expect(page.locator("text=Test Product")).toBeVisible();
    await expect(page.locator("text=TEST-001")).toBeVisible();
  });

  test("should edit an existing product", async ({ page }) => {
    // Click edit button for first product
    await page.click('button[data-testid="edit-product-0"]');

    // Update product name
    await page.fill('input[name="name"]', "Updated Product");

    // Submit form
    await page.click('button[type="submit"]');

    // Verify product was updated
    await expect(page.locator("text=Updated Product")).toBeVisible();
  });

  test("should delete a product", async ({ page }) => {
    // Click delete button for first product
    await page.click('button[data-testid="delete-product-0"]');

    // Confirm deletion
    await page.click('button[data-testid="confirm-delete"]');

    // Verify product was deleted
    await expect(page.locator("text=Test Product")).not.toBeVisible();
  });
});

test.describe("Inventory Management", () => {
  test("should view inventory levels", async ({ page }) => {
    await page.goto("/inventory");

    // Verify inventory table is visible
    await expect(
      page.locator('table[data-testid="inventory-table"]')
    ).toBeVisible();

    // Verify inventory data is displayed
    await expect(page.locator("text=Current Stock")).toBeVisible();
    await expect(page.locator("text=Reorder Point")).toBeVisible();
  });

  test("should adjust inventory levels", async ({ page }) => {
    await page.goto("/inventory");

    // Click adjust button for first item
    await page.click('button[data-testid="adjust-inventory-0"]');

    // Enter adjustment amount
    await page.fill('input[name="adjustment"]', "10");
    await page.selectOption('select[name="reason"]', "Stock Count");

    // Submit adjustment
    await page.click('button[type="submit"]');

    // Verify adjustment was applied
    await expect(
      page.locator("text=Inventory adjusted successfully")
    ).toBeVisible();
  });
});

test.describe("Forecasting", () => {
  test("should generate forecasts", async ({ page }) => {
    await page.goto("/forecasting");

    // Select product and store
    await page.selectOption('select[name="product"]', "PROD-001");
    await page.selectOption('select[name="store"]', "STORE-001");

    // Set forecast parameters
    await page.fill('input[name="horizonDays"]', "30");
    await page.check('input[name="includeComponents"]');

    // Generate forecast
    await page.click('button[data-testid="generate-forecast"]');

    // Verify forecast was generated
    await expect(page.locator("text=Forecast Generated")).toBeVisible();
    await expect(
      page.locator('canvas[data-testid="forecast-chart"]')
    ).toBeVisible();
  });
});
```

## ⚡ Performance Testing

### Load Testing with Artillery

#### Artillery Configuration

```yaml
# artillery-config.yml
config:
  target: "http://localhost:8080"
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 20
  defaults:
    headers:
      Content-Type: "application/json"
      Authorization: "Bearer {{ token }}"

scenarios:
  - name: "Product API Load Test"
    weight: 100
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "test@example.com"
            password: "password"
          capture:
            - json: "$.token"
              as: "token"
      - get:
          url: "/api/v1/products"
      - post:
          url: "/api/v1/products"
          json:
            name: "Load Test Product {{ $randomString() }}"
            sku: "LOAD-{{ $randomString() }}"
            unitCost: { { $randomInt(1, 100) } }
            category: "Load Test"
```

#### Performance Test Execution

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run artillery-config.yml

# Run with specific configuration
artillery run --config artillery-config.yml --output report.json

# Generate HTML report
artillery report report.json
```

### Stress Testing

#### Stress Test Configuration

```yaml
# stress-test.yml
config:
  target: "http://localhost:8080"
  phases:
    - duration: 300
      arrivalRate: 50
  defaults:
    headers:
      Content-Type: "application/json"

scenarios:
  - name: "High Load Test"
    weight: 100
    flow:
      - get:
          url: "/api/v1/products"
      - post:
          url: "/api/v1/products"
          json:
            name: "Stress Test Product {{ $randomString() }}"
            sku: "STRESS-{{ $randomString() }}"
            unitCost: { { $randomInt(1, 100) } }
            category: "Stress Test"
```

## 🔒 Security Testing

### Security Test Suite

#### Authentication Testing

```typescript
import { test, expect } from "@playwright/test";

test.describe("Security Tests", () => {
  test("should require authentication for protected routes", async ({
    page,
  }) => {
    // Try to access protected route without authentication
    await page.goto("/products");

    // Should redirect to login page
    await expect(page).toHaveURL("/login");
  });

  test("should prevent SQL injection", async ({ page }) => {
    await page.goto("/login");

    // Attempt SQL injection in login form
    await page.fill('input[name="email"]', "admin'; DROP TABLE users; --");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');

    // Should show error message, not crash
    await expect(page.locator("text=Invalid credentials")).toBeVisible();
  });

  test("should prevent XSS attacks", async ({ page }) => {
    await page.goto("/products");

    // Try to inject script in product name
    await page.click('button[data-testid="add-product"]');
    await page.fill('input[name="name"]', '<script>alert("XSS")</script>');
    await page.fill('input[name="sku"]', "XSS-001");
    await page.fill('input[name="unitCost"]', "10.00");
    await page.selectOption('select[name="category"]', "Test");
    await page.click('button[type="submit"]');

    // Script should be escaped, not executed
    await expect(
      page.locator('text=<script>alert("XSS")</script>')
    ).toBeVisible();
  });
});
```

#### API Security Testing

```python
import pytest
from fastapi.testclient import TestClient

class TestSecurity:

    def test_unauthorized_access(self, client):
        """Test that unauthorized access is blocked."""
        response = client.get("/api/v1/products")
        assert response.status_code == 401

    def test_sql_injection_protection(self, client):
        """Test SQL injection protection."""
        malicious_input = "'; DROP TABLE products; --"

        response = client.post("/api/v1/products", json={
            "name": malicious_input,
            "sku": "TEST-001",
            "unit_cost": 10.00,
            "category": "Test"
        })

        # Should not crash the application
        assert response.status_code in [400, 401, 422]

    def test_rate_limiting(self, client):
        """Test rate limiting functionality."""
        # Make multiple requests quickly
        for i in range(100):
            response = client.get("/api/v1/products")
            if response.status_code == 429:
                break

        # Should eventually hit rate limit
        assert response.status_code == 429
```

## 🤖 Test Automation

### CI/CD Integration

#### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Set up JDK 21
        uses: actions/setup-java@v3
        with:
          java-version: "21"
          distribution: "temurin"

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.9"

      - name: Cache Maven dependencies
        uses: actions/cache@v3
        with:
          path: ~/.m2
          key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
          restore-keys: ${{ runner.os }}-m2

      - name: Install Python dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: Install Node.js dependencies
        run: |
          cd frontend
          npm ci

      - name: Run backend tests
        run: |
          cd backend
          ./mvnw test

      - name: Run ML API tests
        run: |
          cd backend
          pytest tests/ -v

      - name: Run frontend tests
        run: |
          cd frontend
          npm test -- --coverage

      - name: Run E2E tests
        run: |
          cd frontend
          npx playwright test

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/target/site/jacoco/jacoco.xml,./frontend/coverage/lcov.info
```

### Test Reporting

#### Coverage Reports

```bash
# Backend coverage
cd backend
./mvnw jacoco:report

# Frontend coverage
cd frontend
npm run test:coverage

# ML API coverage
cd backend
pytest --cov=core --cov-report=html
```

#### Test Reports

```bash
# Generate test reports
npm run test:report

# Generate E2E reports
npx playwright show-report

# Generate performance reports
artillery report performance-test.json
```

## 📊 Test Metrics

### Key Metrics

#### Coverage Metrics

- **Line Coverage**: Percentage of lines executed
- **Branch Coverage**: Percentage of branches executed
- **Function Coverage**: Percentage of functions executed
- **Statement Coverage**: Percentage of statements executed

#### Quality Metrics

- **Test Pass Rate**: Percentage of tests passing
- **Test Execution Time**: Time to run all tests
- **Flaky Test Rate**: Percentage of flaky tests
- **Test Maintenance Cost**: Time spent maintaining tests

#### Performance Metrics

- **Test Execution Speed**: Tests per second
- **Memory Usage**: Memory consumed during testing
- **Resource Utilization**: CPU and I/O usage
- **Test Stability**: Consistency of test results

### Monitoring and Alerting

#### Test Monitoring

```yaml
# test-monitoring.yml
alerts:
  - name: "Test Failure Rate High"
    condition: "test_failure_rate > 0.1"
    severity: "warning"

  - name: "Test Execution Time High"
    condition: "test_execution_time > 300"
    severity: "warning"

  - name: "Coverage Below Threshold"
    condition: "coverage < 0.8"
    severity: "critical"
```

#### Dashboard Metrics

- **Test Results**: Pass/fail rates over time
- **Coverage Trends**: Coverage changes over time
- **Performance Trends**: Test execution time trends
- **Quality Trends**: Code quality metrics

---

**Remember**: Testing is an ongoing process. Continuously improve your test suite, monitor test metrics, and maintain high quality standards throughout the development lifecycle.
