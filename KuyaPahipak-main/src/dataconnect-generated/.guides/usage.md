# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateProduct, useUpdateProduct, useDeleteProduct, useGetProduct, useListProducts, useCreateProductVariant, useUpdateProductVariant, useDeleteProductVariant, useGetProductVariant, useListProductVariants } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateProduct(createProductVars);

const { data, isPending, isSuccess, isError, error } = useUpdateProduct(updateProductVars);

const { data, isPending, isSuccess, isError, error } = useDeleteProduct(deleteProductVars);

const { data, isPending, isSuccess, isError, error } = useGetProduct(getProductVars);

const { data, isPending, isSuccess, isError, error } = useListProducts();

const { data, isPending, isSuccess, isError, error } = useCreateProductVariant(createProductVariantVars);

const { data, isPending, isSuccess, isError, error } = useUpdateProductVariant(updateProductVariantVars);

const { data, isPending, isSuccess, isError, error } = useDeleteProductVariant(deleteProductVariantVars);

const { data, isPending, isSuccess, isError, error } = useGetProductVariant(getProductVariantVars);

const { data, isPending, isSuccess, isError, error } = useListProductVariants();

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



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