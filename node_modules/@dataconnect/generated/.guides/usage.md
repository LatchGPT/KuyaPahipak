# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createProduct, updateProduct, deleteProduct, getProduct, listProducts, createProductVariant, updateProductVariant, deleteProductVariant, getProductVariant, listProductVariants } from '@dataconnect/generated';


// Operation CreateProduct:  For variables, look at type CreateProductVars in ../index.d.ts
const { data } = await CreateProduct(dataConnect, createProductVars);

// Operation UpdateProduct:  For variables, look at type UpdateProductVars in ../index.d.ts
const { data } = await UpdateProduct(dataConnect, updateProductVars);

// Operation DeleteProduct:  For variables, look at type DeleteProductVars in ../index.d.ts
const { data } = await DeleteProduct(dataConnect, deleteProductVars);

// Operation GetProduct:  For variables, look at type GetProductVars in ../index.d.ts
const { data } = await GetProduct(dataConnect, getProductVars);

// Operation ListProducts: 
const { data } = await ListProducts(dataConnect);

// Operation CreateProductVariant:  For variables, look at type CreateProductVariantVars in ../index.d.ts
const { data } = await CreateProductVariant(dataConnect, createProductVariantVars);

// Operation UpdateProductVariant:  For variables, look at type UpdateProductVariantVars in ../index.d.ts
const { data } = await UpdateProductVariant(dataConnect, updateProductVariantVars);

// Operation DeleteProductVariant:  For variables, look at type DeleteProductVariantVars in ../index.d.ts
const { data } = await DeleteProductVariant(dataConnect, deleteProductVariantVars);

// Operation GetProductVariant:  For variables, look at type GetProductVariantVars in ../index.d.ts
const { data } = await GetProductVariant(dataConnect, getProductVariantVars);

// Operation ListProductVariants: 
const { data } = await ListProductVariants(dataConnect);


```