const fs = require('fs');
let code = fs.readFileSync('Front_end/src/app/features/admin/admin.component.ts', 'utf8');

code = code.replace(
  'import { ConfirmDialogComponent }',
  'import { CategoryService } from "../../core/services/category.service";\nimport { ConfirmDialogComponent }'
);

code = code.replace(
  'productQuery = \'\';',
  'categories: any[] = [];\n  productSearchParams: any = { pageIndex: 1, pageSize: 100, keyword: "", minPrice: null, maxPrice: null, categoryId: "", sortBy: "", sortDirection: "" };\n  productQuery = "";'
d);

code = code.replace(
  'private productService: ProductService',
  'private productService: ProductService,\n    private categoryService: CategoryService'
);

code = code.replace(
  'this.loadUsers();',
  'this.loadUsers();\n        this.loadCategories();'
);

code = code.replace(
  'setTab(tab: TabKey): void y',
  'loadCategories() {\n    this.categoryService.getCategories().subscribe({\n      next: (res) => {\n        this.categories = res.result && Array.isArray(res.result.content) ? res.result.content : (Array.isArray(res.result) ? res.result : []);\n      },\n      error: (err) => console.error("Load categories failed", err)\n    });\n  }\n\n  setTab(tab: TabKey): void {'
);

code = code.replace(
  'resetUserForm(): void {\n    this.editingUserCode = \'\';\n    this.userForm = {\n      username: \"\",\n      password: \"\",\n      name: \"\",\n      email: \"\",\n      phone: \"\",\n      status: \"ACTIVE\",\n    };\n  }',
  'resetUserForm(): void {\n    this.editingUserCode = "";\n    this.userForm = {\n      username: "",\n      password: "",\n      name: "",\n      email: "",\n      phone: "",\n      status: "ACTIVE",\n    };\n  }\n\n  applyProductFilters(): void {\n    this.productSearchParams.pageIndex = 1;\n    this.loadProducts();\n  }\n\n  clearProductFilters(): void {\n    this.productSearchParams = { pageIndex: 1, pageSize: 100, keyword: "", minPrice: null, maxPrice: null, categoryId: "", sortBy: "", sortDirection: "" };\n    this.loadProducts();\n  }'
p);

const newLoadProducts = "  loadProducts(): void {\n    this.isProductsLoading = true;\n    this.productError = '';\n    const queryParams: any = { pageIndex: this.productSearchParams.pageIndex, pageSize: this.productSearchParams.pageSize };\n    if (this.productSearchParams.keyword) queryParams.keyword = this.productSearchParams.keyword;\n    if (this.productSearchParams.minPrice) queryParams.minPrice = this.productSearchParams.minPrice;\n    if (this.productSearchParams.maxPrice) queryParams.maxPrice = this.productSearchParams.maxPrice;\n    if (this.productSearchParams.categoryId) queryParams.categoryId = this.productSearchParams.categoryId;\n    if (this.productSearchParams.sortBy) {\n      queryParams.sortBy = this.productSearchParams.sortBy;\n      if (this.productSearchParams.sortDirection) queryParams.sortDirection = this.productSearchParams.sortDirection;\n    }\n    this.productService.getProducts(queryParams).pipe(finalize(() => { this.isProductsLoading = false; })).subscribe({\n        next: (res) => {\n          const content = res?.result?.content;\n          this.products = Array.isArray(content) ? content.filter((product) => product.deleted === false) : [];\n        },\n        error: (err) => {\n          const status = err?.status || 'unknown';\n          const message = err?.error?.message || 'Không tải được danh sách sản phẩm.';\n          this.productError = '[' + status + '] ' + message;\n          this.products = [];\n        },\n    });\n  }";

code = code.replace(/loadProducts\\(): void \\{[\\s\\S]*?\\}\\s*(?=saveProduct\\(): void)/, newLoadProducts + '\n\n  ');

fs.writeFileSync('Front_end/src/app/features/admin/admin.component.ts', code, 'utf8');