# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetProduct*](#getproduct)
  - [*ListProducts*](#listproducts)
  - [*GetProductVariant*](#getproductvariant)
  - [*ListProductVariants*](#listproductvariants)
  - [*GetSupplier*](#getsupplier)
  - [*ListSuppliers*](#listsuppliers)
  - [*GetInventoryTransaction*](#getinventorytransaction)
  - [*ListInventoryTransactions*](#listinventorytransactions)
  - [*GetPurchaseOrder*](#getpurchaseorder)
  - [*ListPurchaseOrders*](#listpurchaseorders)
- [**Mutations**](#mutations)
  - [*CreateProduct*](#createproduct)
  - [*UpdateProduct*](#updateproduct)
  - [*DeleteProduct*](#deleteproduct)
  - [*CreateProductVariant*](#createproductvariant)
  - [*UpdateProductVariant*](#updateproductvariant)
  - [*DeleteProductVariant*](#deleteproductvariant)
  - [*CreateSupplier*](#createsupplier)
  - [*UpdateSupplier*](#updatesupplier)
  - [*DeleteSupplier*](#deletesupplier)
  - [*CreateInventoryTransaction*](#createinventorytransaction)
  - [*DeleteInventoryTransaction*](#deleteinventorytransaction)
  - [*CreatePurchaseOrder*](#createpurchaseorder)
  - [*UpdatePurchaseOrder*](#updatepurchaseorder)
  - [*DeletePurchaseOrder*](#deletepurchaseorder)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetProduct
You can execute the `GetProduct` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getProduct(vars: GetProductVariables, options?: ExecuteQueryOptions): QueryPromise<GetProductData, GetProductVariables>;

interface GetProductRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProductVariables): QueryRef<GetProductData, GetProductVariables>;
}
export const getProductRef: GetProductRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getProduct(dc: DataConnect, vars: GetProductVariables, options?: ExecuteQueryOptions): QueryPromise<GetProductData, GetProductVariables>;

interface GetProductRef {
  ...
  (dc: DataConnect, vars: GetProductVariables): QueryRef<GetProductData, GetProductVariables>;
}
export const getProductRef: GetProductRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getProductRef:
```typescript
const name = getProductRef.operationName;
console.log(name);
```

### Variables
The `GetProduct` query requires an argument of type `GetProductVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetProductVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetProduct` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetProductData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetProductData {
  product?: {
    name: string;
    category: string;
    brand: string;
  };
}
```
### Using `GetProduct`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getProduct, GetProductVariables } from '@dataconnect/generated';

// The `GetProduct` query requires an argument of type `GetProductVariables`:
const getProductVars: GetProductVariables = {
  id: ..., 
};

// Call the `getProduct()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getProduct(getProductVars);
// Variables can be defined inline as well.
const { data } = await getProduct({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getProduct(dataConnect, getProductVars);

console.log(data.product);

// Or, you can use the `Promise` API.
getProduct(getProductVars).then((response) => {
  const data = response.data;
  console.log(data.product);
});
```

### Using `GetProduct`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getProductRef, GetProductVariables } from '@dataconnect/generated';

// The `GetProduct` query requires an argument of type `GetProductVariables`:
const getProductVars: GetProductVariables = {
  id: ..., 
};

// Call the `getProductRef()` function to get a reference to the query.
const ref = getProductRef(getProductVars);
// Variables can be defined inline as well.
const ref = getProductRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getProductRef(dataConnect, getProductVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.product);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.product);
});
```

## ListProducts
You can execute the `ListProducts` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listProducts(options?: ExecuteQueryOptions): QueryPromise<ListProductsData, undefined>;

interface ListProductsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProductsData, undefined>;
}
export const listProductsRef: ListProductsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listProducts(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListProductsData, undefined>;

interface ListProductsRef {
  ...
  (dc: DataConnect): QueryRef<ListProductsData, undefined>;
}
export const listProductsRef: ListProductsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listProductsRef:
```typescript
const name = listProductsRef.operationName;
console.log(name);
```

### Variables
The `ListProducts` query has no variables.
### Return Type
Recall that executing the `ListProducts` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListProductsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListProductsData {
  products: ({
    name: string;
    category: string;
    brand: string;
  })[];
}
```
### Using `ListProducts`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listProducts } from '@dataconnect/generated';


// Call the `listProducts()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listProducts();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listProducts(dataConnect);

console.log(data.products);

// Or, you can use the `Promise` API.
listProducts().then((response) => {
  const data = response.data;
  console.log(data.products);
});
```

### Using `ListProducts`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listProductsRef } from '@dataconnect/generated';


// Call the `listProductsRef()` function to get a reference to the query.
const ref = listProductsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listProductsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.products);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.products);
});
```

## GetProductVariant
You can execute the `GetProductVariant` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getProductVariant(vars: GetProductVariantVariables, options?: ExecuteQueryOptions): QueryPromise<GetProductVariantData, GetProductVariantVariables>;

interface GetProductVariantRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProductVariantVariables): QueryRef<GetProductVariantData, GetProductVariantVariables>;
}
export const getProductVariantRef: GetProductVariantRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getProductVariant(dc: DataConnect, vars: GetProductVariantVariables, options?: ExecuteQueryOptions): QueryPromise<GetProductVariantData, GetProductVariantVariables>;

interface GetProductVariantRef {
  ...
  (dc: DataConnect, vars: GetProductVariantVariables): QueryRef<GetProductVariantData, GetProductVariantVariables>;
}
export const getProductVariantRef: GetProductVariantRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getProductVariantRef:
```typescript
const name = getProductVariantRef.operationName;
console.log(name);
```

### Variables
The `GetProductVariant` query requires an argument of type `GetProductVariantVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetProductVariantVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetProductVariant` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetProductVariantData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetProductVariantData {
  productVariant?: {
    sku: string;
    flavor: string;
    nicotineStrength: string;
  };
}
```
### Using `GetProductVariant`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getProductVariant, GetProductVariantVariables } from '@dataconnect/generated';

// The `GetProductVariant` query requires an argument of type `GetProductVariantVariables`:
const getProductVariantVars: GetProductVariantVariables = {
  id: ..., 
};

// Call the `getProductVariant()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getProductVariant(getProductVariantVars);
// Variables can be defined inline as well.
const { data } = await getProductVariant({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getProductVariant(dataConnect, getProductVariantVars);

console.log(data.productVariant);

// Or, you can use the `Promise` API.
getProductVariant(getProductVariantVars).then((response) => {
  const data = response.data;
  console.log(data.productVariant);
});
```

### Using `GetProductVariant`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getProductVariantRef, GetProductVariantVariables } from '@dataconnect/generated';

// The `GetProductVariant` query requires an argument of type `GetProductVariantVariables`:
const getProductVariantVars: GetProductVariantVariables = {
  id: ..., 
};

// Call the `getProductVariantRef()` function to get a reference to the query.
const ref = getProductVariantRef(getProductVariantVars);
// Variables can be defined inline as well.
const ref = getProductVariantRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getProductVariantRef(dataConnect, getProductVariantVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.productVariant);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.productVariant);
});
```

## ListProductVariants
You can execute the `ListProductVariants` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listProductVariants(options?: ExecuteQueryOptions): QueryPromise<ListProductVariantsData, undefined>;

interface ListProductVariantsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProductVariantsData, undefined>;
}
export const listProductVariantsRef: ListProductVariantsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listProductVariants(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListProductVariantsData, undefined>;

interface ListProductVariantsRef {
  ...
  (dc: DataConnect): QueryRef<ListProductVariantsData, undefined>;
}
export const listProductVariantsRef: ListProductVariantsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listProductVariantsRef:
```typescript
const name = listProductVariantsRef.operationName;
console.log(name);
```

### Variables
The `ListProductVariants` query has no variables.
### Return Type
Recall that executing the `ListProductVariants` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListProductVariantsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListProductVariantsData {
  productVariants: ({
    sku: string;
    flavor: string;
    nicotineStrength: string;
  })[];
}
```
### Using `ListProductVariants`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listProductVariants } from '@dataconnect/generated';


// Call the `listProductVariants()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listProductVariants();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listProductVariants(dataConnect);

console.log(data.productVariants);

// Or, you can use the `Promise` API.
listProductVariants().then((response) => {
  const data = response.data;
  console.log(data.productVariants);
});
```

### Using `ListProductVariants`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listProductVariantsRef } from '@dataconnect/generated';


// Call the `listProductVariantsRef()` function to get a reference to the query.
const ref = listProductVariantsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listProductVariantsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.productVariants);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.productVariants);
});
```

## GetSupplier
You can execute the `GetSupplier` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getSupplier(vars: GetSupplierVariables, options?: ExecuteQueryOptions): QueryPromise<GetSupplierData, GetSupplierVariables>;

interface GetSupplierRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSupplierVariables): QueryRef<GetSupplierData, GetSupplierVariables>;
}
export const getSupplierRef: GetSupplierRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getSupplier(dc: DataConnect, vars: GetSupplierVariables, options?: ExecuteQueryOptions): QueryPromise<GetSupplierData, GetSupplierVariables>;

interface GetSupplierRef {
  ...
  (dc: DataConnect, vars: GetSupplierVariables): QueryRef<GetSupplierData, GetSupplierVariables>;
}
export const getSupplierRef: GetSupplierRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getSupplierRef:
```typescript
const name = getSupplierRef.operationName;
console.log(name);
```

### Variables
The `GetSupplier` query requires an argument of type `GetSupplierVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetSupplierVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetSupplier` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetSupplierData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetSupplierData {
  supplier?: {
    name: string;
    contactEmail: string;
  };
}
```
### Using `GetSupplier`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getSupplier, GetSupplierVariables } from '@dataconnect/generated';

// The `GetSupplier` query requires an argument of type `GetSupplierVariables`:
const getSupplierVars: GetSupplierVariables = {
  id: ..., 
};

// Call the `getSupplier()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getSupplier(getSupplierVars);
// Variables can be defined inline as well.
const { data } = await getSupplier({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getSupplier(dataConnect, getSupplierVars);

console.log(data.supplier);

// Or, you can use the `Promise` API.
getSupplier(getSupplierVars).then((response) => {
  const data = response.data;
  console.log(data.supplier);
});
```

### Using `GetSupplier`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getSupplierRef, GetSupplierVariables } from '@dataconnect/generated';

// The `GetSupplier` query requires an argument of type `GetSupplierVariables`:
const getSupplierVars: GetSupplierVariables = {
  id: ..., 
};

// Call the `getSupplierRef()` function to get a reference to the query.
const ref = getSupplierRef(getSupplierVars);
// Variables can be defined inline as well.
const ref = getSupplierRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getSupplierRef(dataConnect, getSupplierVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.supplier);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.supplier);
});
```

## ListSuppliers
You can execute the `ListSuppliers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listSuppliers(options?: ExecuteQueryOptions): QueryPromise<ListSuppliersData, undefined>;

interface ListSuppliersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListSuppliersData, undefined>;
}
export const listSuppliersRef: ListSuppliersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listSuppliers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListSuppliersData, undefined>;

interface ListSuppliersRef {
  ...
  (dc: DataConnect): QueryRef<ListSuppliersData, undefined>;
}
export const listSuppliersRef: ListSuppliersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listSuppliersRef:
```typescript
const name = listSuppliersRef.operationName;
console.log(name);
```

### Variables
The `ListSuppliers` query has no variables.
### Return Type
Recall that executing the `ListSuppliers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListSuppliersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListSuppliersData {
  suppliers: ({
    name: string;
    contactEmail: string;
  })[];
}
```
### Using `ListSuppliers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listSuppliers } from '@dataconnect/generated';


// Call the `listSuppliers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listSuppliers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listSuppliers(dataConnect);

console.log(data.suppliers);

// Or, you can use the `Promise` API.
listSuppliers().then((response) => {
  const data = response.data;
  console.log(data.suppliers);
});
```

### Using `ListSuppliers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listSuppliersRef } from '@dataconnect/generated';


// Call the `listSuppliersRef()` function to get a reference to the query.
const ref = listSuppliersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listSuppliersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.suppliers);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.suppliers);
});
```

## GetInventoryTransaction
You can execute the `GetInventoryTransaction` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getInventoryTransaction(vars: GetInventoryTransactionVariables, options?: ExecuteQueryOptions): QueryPromise<GetInventoryTransactionData, GetInventoryTransactionVariables>;

interface GetInventoryTransactionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetInventoryTransactionVariables): QueryRef<GetInventoryTransactionData, GetInventoryTransactionVariables>;
}
export const getInventoryTransactionRef: GetInventoryTransactionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getInventoryTransaction(dc: DataConnect, vars: GetInventoryTransactionVariables, options?: ExecuteQueryOptions): QueryPromise<GetInventoryTransactionData, GetInventoryTransactionVariables>;

interface GetInventoryTransactionRef {
  ...
  (dc: DataConnect, vars: GetInventoryTransactionVariables): QueryRef<GetInventoryTransactionData, GetInventoryTransactionVariables>;
}
export const getInventoryTransactionRef: GetInventoryTransactionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getInventoryTransactionRef:
```typescript
const name = getInventoryTransactionRef.operationName;
console.log(name);
```

### Variables
The `GetInventoryTransaction` query requires an argument of type `GetInventoryTransactionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetInventoryTransactionVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetInventoryTransaction` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetInventoryTransactionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetInventoryTransactionData {
  inventoryTransaction?: {
    quantityChanged: number;
    transactionType: string;
  };
}
```
### Using `GetInventoryTransaction`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getInventoryTransaction, GetInventoryTransactionVariables } from '@dataconnect/generated';

// The `GetInventoryTransaction` query requires an argument of type `GetInventoryTransactionVariables`:
const getInventoryTransactionVars: GetInventoryTransactionVariables = {
  id: ..., 
};

// Call the `getInventoryTransaction()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getInventoryTransaction(getInventoryTransactionVars);
// Variables can be defined inline as well.
const { data } = await getInventoryTransaction({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getInventoryTransaction(dataConnect, getInventoryTransactionVars);

console.log(data.inventoryTransaction);

// Or, you can use the `Promise` API.
getInventoryTransaction(getInventoryTransactionVars).then((response) => {
  const data = response.data;
  console.log(data.inventoryTransaction);
});
```

### Using `GetInventoryTransaction`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getInventoryTransactionRef, GetInventoryTransactionVariables } from '@dataconnect/generated';

// The `GetInventoryTransaction` query requires an argument of type `GetInventoryTransactionVariables`:
const getInventoryTransactionVars: GetInventoryTransactionVariables = {
  id: ..., 
};

// Call the `getInventoryTransactionRef()` function to get a reference to the query.
const ref = getInventoryTransactionRef(getInventoryTransactionVars);
// Variables can be defined inline as well.
const ref = getInventoryTransactionRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getInventoryTransactionRef(dataConnect, getInventoryTransactionVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.inventoryTransaction);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.inventoryTransaction);
});
```

## ListInventoryTransactions
You can execute the `ListInventoryTransactions` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listInventoryTransactions(options?: ExecuteQueryOptions): QueryPromise<ListInventoryTransactionsData, undefined>;

interface ListInventoryTransactionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListInventoryTransactionsData, undefined>;
}
export const listInventoryTransactionsRef: ListInventoryTransactionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listInventoryTransactions(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListInventoryTransactionsData, undefined>;

interface ListInventoryTransactionsRef {
  ...
  (dc: DataConnect): QueryRef<ListInventoryTransactionsData, undefined>;
}
export const listInventoryTransactionsRef: ListInventoryTransactionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listInventoryTransactionsRef:
```typescript
const name = listInventoryTransactionsRef.operationName;
console.log(name);
```

### Variables
The `ListInventoryTransactions` query has no variables.
### Return Type
Recall that executing the `ListInventoryTransactions` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListInventoryTransactionsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListInventoryTransactionsData {
  inventoryTransactions: ({
    quantityChanged: number;
    transactionType: string;
  })[];
}
```
### Using `ListInventoryTransactions`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listInventoryTransactions } from '@dataconnect/generated';


// Call the `listInventoryTransactions()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listInventoryTransactions();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listInventoryTransactions(dataConnect);

console.log(data.inventoryTransactions);

// Or, you can use the `Promise` API.
listInventoryTransactions().then((response) => {
  const data = response.data;
  console.log(data.inventoryTransactions);
});
```

### Using `ListInventoryTransactions`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listInventoryTransactionsRef } from '@dataconnect/generated';


// Call the `listInventoryTransactionsRef()` function to get a reference to the query.
const ref = listInventoryTransactionsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listInventoryTransactionsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.inventoryTransactions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.inventoryTransactions);
});
```

## GetPurchaseOrder
You can execute the `GetPurchaseOrder` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getPurchaseOrder(vars: GetPurchaseOrderVariables, options?: ExecuteQueryOptions): QueryPromise<GetPurchaseOrderData, GetPurchaseOrderVariables>;

interface GetPurchaseOrderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPurchaseOrderVariables): QueryRef<GetPurchaseOrderData, GetPurchaseOrderVariables>;
}
export const getPurchaseOrderRef: GetPurchaseOrderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPurchaseOrder(dc: DataConnect, vars: GetPurchaseOrderVariables, options?: ExecuteQueryOptions): QueryPromise<GetPurchaseOrderData, GetPurchaseOrderVariables>;

interface GetPurchaseOrderRef {
  ...
  (dc: DataConnect, vars: GetPurchaseOrderVariables): QueryRef<GetPurchaseOrderData, GetPurchaseOrderVariables>;
}
export const getPurchaseOrderRef: GetPurchaseOrderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPurchaseOrderRef:
```typescript
const name = getPurchaseOrderRef.operationName;
console.log(name);
```

### Variables
The `GetPurchaseOrder` query requires an argument of type `GetPurchaseOrderVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetPurchaseOrderVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetPurchaseOrder` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPurchaseOrderData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetPurchaseOrderData {
  purchaseOrder?: {
    status: string;
    totalCost?: number | null;
  };
}
```
### Using `GetPurchaseOrder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPurchaseOrder, GetPurchaseOrderVariables } from '@dataconnect/generated';

// The `GetPurchaseOrder` query requires an argument of type `GetPurchaseOrderVariables`:
const getPurchaseOrderVars: GetPurchaseOrderVariables = {
  id: ..., 
};

// Call the `getPurchaseOrder()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPurchaseOrder(getPurchaseOrderVars);
// Variables can be defined inline as well.
const { data } = await getPurchaseOrder({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPurchaseOrder(dataConnect, getPurchaseOrderVars);

console.log(data.purchaseOrder);

// Or, you can use the `Promise` API.
getPurchaseOrder(getPurchaseOrderVars).then((response) => {
  const data = response.data;
  console.log(data.purchaseOrder);
});
```

### Using `GetPurchaseOrder`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPurchaseOrderRef, GetPurchaseOrderVariables } from '@dataconnect/generated';

// The `GetPurchaseOrder` query requires an argument of type `GetPurchaseOrderVariables`:
const getPurchaseOrderVars: GetPurchaseOrderVariables = {
  id: ..., 
};

// Call the `getPurchaseOrderRef()` function to get a reference to the query.
const ref = getPurchaseOrderRef(getPurchaseOrderVars);
// Variables can be defined inline as well.
const ref = getPurchaseOrderRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPurchaseOrderRef(dataConnect, getPurchaseOrderVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.purchaseOrder);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.purchaseOrder);
});
```

## ListPurchaseOrders
You can execute the `ListPurchaseOrders` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPurchaseOrders(options?: ExecuteQueryOptions): QueryPromise<ListPurchaseOrdersData, undefined>;

interface ListPurchaseOrdersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPurchaseOrdersData, undefined>;
}
export const listPurchaseOrdersRef: ListPurchaseOrdersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPurchaseOrders(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListPurchaseOrdersData, undefined>;

interface ListPurchaseOrdersRef {
  ...
  (dc: DataConnect): QueryRef<ListPurchaseOrdersData, undefined>;
}
export const listPurchaseOrdersRef: ListPurchaseOrdersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPurchaseOrdersRef:
```typescript
const name = listPurchaseOrdersRef.operationName;
console.log(name);
```

### Variables
The `ListPurchaseOrders` query has no variables.
### Return Type
Recall that executing the `ListPurchaseOrders` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPurchaseOrdersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListPurchaseOrdersData {
  purchaseOrders: ({
    status: string;
    totalCost?: number | null;
  })[];
}
```
### Using `ListPurchaseOrders`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPurchaseOrders } from '@dataconnect/generated';


// Call the `listPurchaseOrders()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPurchaseOrders();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPurchaseOrders(dataConnect);

console.log(data.purchaseOrders);

// Or, you can use the `Promise` API.
listPurchaseOrders().then((response) => {
  const data = response.data;
  console.log(data.purchaseOrders);
});
```

### Using `ListPurchaseOrders`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPurchaseOrdersRef } from '@dataconnect/generated';


// Call the `listPurchaseOrdersRef()` function to get a reference to the query.
const ref = listPurchaseOrdersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPurchaseOrdersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.purchaseOrders);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.purchaseOrders);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateProduct
You can execute the `CreateProduct` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createProduct(vars: CreateProductVariables): MutationPromise<CreateProductData, CreateProductVariables>;

interface CreateProductRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateProductVariables): MutationRef<CreateProductData, CreateProductVariables>;
}
export const createProductRef: CreateProductRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createProduct(dc: DataConnect, vars: CreateProductVariables): MutationPromise<CreateProductData, CreateProductVariables>;

interface CreateProductRef {
  ...
  (dc: DataConnect, vars: CreateProductVariables): MutationRef<CreateProductData, CreateProductVariables>;
}
export const createProductRef: CreateProductRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createProductRef:
```typescript
const name = createProductRef.operationName;
console.log(name);
```

### Variables
The `CreateProduct` mutation requires an argument of type `CreateProductVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateProductVariables {
  name: string;
  category: string;
  brand: string;
}
```
### Return Type
Recall that executing the `CreateProduct` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateProductData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateProductData {
  product_insert: Product_Key;
}
```
### Using `CreateProduct`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createProduct, CreateProductVariables } from '@dataconnect/generated';

// The `CreateProduct` mutation requires an argument of type `CreateProductVariables`:
const createProductVars: CreateProductVariables = {
  name: ..., 
  category: ..., 
  brand: ..., 
};

// Call the `createProduct()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createProduct(createProductVars);
// Variables can be defined inline as well.
const { data } = await createProduct({ name: ..., category: ..., brand: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createProduct(dataConnect, createProductVars);

console.log(data.product_insert);

// Or, you can use the `Promise` API.
createProduct(createProductVars).then((response) => {
  const data = response.data;
  console.log(data.product_insert);
});
```

### Using `CreateProduct`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createProductRef, CreateProductVariables } from '@dataconnect/generated';

// The `CreateProduct` mutation requires an argument of type `CreateProductVariables`:
const createProductVars: CreateProductVariables = {
  name: ..., 
  category: ..., 
  brand: ..., 
};

// Call the `createProductRef()` function to get a reference to the mutation.
const ref = createProductRef(createProductVars);
// Variables can be defined inline as well.
const ref = createProductRef({ name: ..., category: ..., brand: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createProductRef(dataConnect, createProductVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.product_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.product_insert);
});
```

## UpdateProduct
You can execute the `UpdateProduct` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateProduct(vars: UpdateProductVariables): MutationPromise<UpdateProductData, UpdateProductVariables>;

interface UpdateProductRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProductVariables): MutationRef<UpdateProductData, UpdateProductVariables>;
}
export const updateProductRef: UpdateProductRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateProduct(dc: DataConnect, vars: UpdateProductVariables): MutationPromise<UpdateProductData, UpdateProductVariables>;

interface UpdateProductRef {
  ...
  (dc: DataConnect, vars: UpdateProductVariables): MutationRef<UpdateProductData, UpdateProductVariables>;
}
export const updateProductRef: UpdateProductRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateProductRef:
```typescript
const name = updateProductRef.operationName;
console.log(name);
```

### Variables
The `UpdateProduct` mutation requires an argument of type `UpdateProductVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateProductVariables {
  id: UUIDString;
  name?: string | null;
}
```
### Return Type
Recall that executing the `UpdateProduct` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateProductData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateProductData {
  product_update?: Product_Key | null;
}
```
### Using `UpdateProduct`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateProduct, UpdateProductVariables } from '@dataconnect/generated';

// The `UpdateProduct` mutation requires an argument of type `UpdateProductVariables`:
const updateProductVars: UpdateProductVariables = {
  id: ..., 
  name: ..., // optional
};

// Call the `updateProduct()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateProduct(updateProductVars);
// Variables can be defined inline as well.
const { data } = await updateProduct({ id: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateProduct(dataConnect, updateProductVars);

console.log(data.product_update);

// Or, you can use the `Promise` API.
updateProduct(updateProductVars).then((response) => {
  const data = response.data;
  console.log(data.product_update);
});
```

### Using `UpdateProduct`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateProductRef, UpdateProductVariables } from '@dataconnect/generated';

// The `UpdateProduct` mutation requires an argument of type `UpdateProductVariables`:
const updateProductVars: UpdateProductVariables = {
  id: ..., 
  name: ..., // optional
};

// Call the `updateProductRef()` function to get a reference to the mutation.
const ref = updateProductRef(updateProductVars);
// Variables can be defined inline as well.
const ref = updateProductRef({ id: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateProductRef(dataConnect, updateProductVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.product_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.product_update);
});
```

## DeleteProduct
You can execute the `DeleteProduct` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteProduct(vars: DeleteProductVariables): MutationPromise<DeleteProductData, DeleteProductVariables>;

interface DeleteProductRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteProductVariables): MutationRef<DeleteProductData, DeleteProductVariables>;
}
export const deleteProductRef: DeleteProductRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteProduct(dc: DataConnect, vars: DeleteProductVariables): MutationPromise<DeleteProductData, DeleteProductVariables>;

interface DeleteProductRef {
  ...
  (dc: DataConnect, vars: DeleteProductVariables): MutationRef<DeleteProductData, DeleteProductVariables>;
}
export const deleteProductRef: DeleteProductRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteProductRef:
```typescript
const name = deleteProductRef.operationName;
console.log(name);
```

### Variables
The `DeleteProduct` mutation requires an argument of type `DeleteProductVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteProductVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteProduct` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteProductData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteProductData {
  product_delete?: Product_Key | null;
}
```
### Using `DeleteProduct`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteProduct, DeleteProductVariables } from '@dataconnect/generated';

// The `DeleteProduct` mutation requires an argument of type `DeleteProductVariables`:
const deleteProductVars: DeleteProductVariables = {
  id: ..., 
};

// Call the `deleteProduct()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteProduct(deleteProductVars);
// Variables can be defined inline as well.
const { data } = await deleteProduct({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteProduct(dataConnect, deleteProductVars);

console.log(data.product_delete);

// Or, you can use the `Promise` API.
deleteProduct(deleteProductVars).then((response) => {
  const data = response.data;
  console.log(data.product_delete);
});
```

### Using `DeleteProduct`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteProductRef, DeleteProductVariables } from '@dataconnect/generated';

// The `DeleteProduct` mutation requires an argument of type `DeleteProductVariables`:
const deleteProductVars: DeleteProductVariables = {
  id: ..., 
};

// Call the `deleteProductRef()` function to get a reference to the mutation.
const ref = deleteProductRef(deleteProductVars);
// Variables can be defined inline as well.
const ref = deleteProductRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteProductRef(dataConnect, deleteProductVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.product_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.product_delete);
});
```

## CreateProductVariant
You can execute the `CreateProductVariant` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createProductVariant(vars: CreateProductVariantVariables): MutationPromise<CreateProductVariantData, CreateProductVariantVariables>;

interface CreateProductVariantRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateProductVariantVariables): MutationRef<CreateProductVariantData, CreateProductVariantVariables>;
}
export const createProductVariantRef: CreateProductVariantRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createProductVariant(dc: DataConnect, vars: CreateProductVariantVariables): MutationPromise<CreateProductVariantData, CreateProductVariantVariables>;

interface CreateProductVariantRef {
  ...
  (dc: DataConnect, vars: CreateProductVariantVariables): MutationRef<CreateProductVariantData, CreateProductVariantVariables>;
}
export const createProductVariantRef: CreateProductVariantRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createProductVariantRef:
```typescript
const name = createProductVariantRef.operationName;
console.log(name);
```

### Variables
The `CreateProductVariant` mutation requires an argument of type `CreateProductVariantVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateProductVariantVariables {
  productId: UUIDString;
  flavor: string;
  nicotineStrength: string;
  sku: string;
  currentStock: number;
  reorderThreshold: number;
}
```
### Return Type
Recall that executing the `CreateProductVariant` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateProductVariantData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateProductVariantData {
  productVariant_insert: ProductVariant_Key;
}
```
### Using `CreateProductVariant`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createProductVariant, CreateProductVariantVariables } from '@dataconnect/generated';

// The `CreateProductVariant` mutation requires an argument of type `CreateProductVariantVariables`:
const createProductVariantVars: CreateProductVariantVariables = {
  productId: ..., 
  flavor: ..., 
  nicotineStrength: ..., 
  sku: ..., 
  currentStock: ..., 
  reorderThreshold: ..., 
};

// Call the `createProductVariant()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createProductVariant(createProductVariantVars);
// Variables can be defined inline as well.
const { data } = await createProductVariant({ productId: ..., flavor: ..., nicotineStrength: ..., sku: ..., currentStock: ..., reorderThreshold: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createProductVariant(dataConnect, createProductVariantVars);

console.log(data.productVariant_insert);

// Or, you can use the `Promise` API.
createProductVariant(createProductVariantVars).then((response) => {
  const data = response.data;
  console.log(data.productVariant_insert);
});
```

### Using `CreateProductVariant`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createProductVariantRef, CreateProductVariantVariables } from '@dataconnect/generated';

// The `CreateProductVariant` mutation requires an argument of type `CreateProductVariantVariables`:
const createProductVariantVars: CreateProductVariantVariables = {
  productId: ..., 
  flavor: ..., 
  nicotineStrength: ..., 
  sku: ..., 
  currentStock: ..., 
  reorderThreshold: ..., 
};

// Call the `createProductVariantRef()` function to get a reference to the mutation.
const ref = createProductVariantRef(createProductVariantVars);
// Variables can be defined inline as well.
const ref = createProductVariantRef({ productId: ..., flavor: ..., nicotineStrength: ..., sku: ..., currentStock: ..., reorderThreshold: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createProductVariantRef(dataConnect, createProductVariantVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.productVariant_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.productVariant_insert);
});
```

## UpdateProductVariant
You can execute the `UpdateProductVariant` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateProductVariant(vars: UpdateProductVariantVariables): MutationPromise<UpdateProductVariantData, UpdateProductVariantVariables>;

interface UpdateProductVariantRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProductVariantVariables): MutationRef<UpdateProductVariantData, UpdateProductVariantVariables>;
}
export const updateProductVariantRef: UpdateProductVariantRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateProductVariant(dc: DataConnect, vars: UpdateProductVariantVariables): MutationPromise<UpdateProductVariantData, UpdateProductVariantVariables>;

interface UpdateProductVariantRef {
  ...
  (dc: DataConnect, vars: UpdateProductVariantVariables): MutationRef<UpdateProductVariantData, UpdateProductVariantVariables>;
}
export const updateProductVariantRef: UpdateProductVariantRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateProductVariantRef:
```typescript
const name = updateProductVariantRef.operationName;
console.log(name);
```

### Variables
The `UpdateProductVariant` mutation requires an argument of type `UpdateProductVariantVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateProductVariantVariables {
  id: UUIDString;
  currentStock?: number | null;
}
```
### Return Type
Recall that executing the `UpdateProductVariant` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateProductVariantData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateProductVariantData {
  productVariant_update?: ProductVariant_Key | null;
}
```
### Using `UpdateProductVariant`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateProductVariant, UpdateProductVariantVariables } from '@dataconnect/generated';

// The `UpdateProductVariant` mutation requires an argument of type `UpdateProductVariantVariables`:
const updateProductVariantVars: UpdateProductVariantVariables = {
  id: ..., 
  currentStock: ..., // optional
};

// Call the `updateProductVariant()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateProductVariant(updateProductVariantVars);
// Variables can be defined inline as well.
const { data } = await updateProductVariant({ id: ..., currentStock: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateProductVariant(dataConnect, updateProductVariantVars);

console.log(data.productVariant_update);

// Or, you can use the `Promise` API.
updateProductVariant(updateProductVariantVars).then((response) => {
  const data = response.data;
  console.log(data.productVariant_update);
});
```

### Using `UpdateProductVariant`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateProductVariantRef, UpdateProductVariantVariables } from '@dataconnect/generated';

// The `UpdateProductVariant` mutation requires an argument of type `UpdateProductVariantVariables`:
const updateProductVariantVars: UpdateProductVariantVariables = {
  id: ..., 
  currentStock: ..., // optional
};

// Call the `updateProductVariantRef()` function to get a reference to the mutation.
const ref = updateProductVariantRef(updateProductVariantVars);
// Variables can be defined inline as well.
const ref = updateProductVariantRef({ id: ..., currentStock: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateProductVariantRef(dataConnect, updateProductVariantVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.productVariant_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.productVariant_update);
});
```

## DeleteProductVariant
You can execute the `DeleteProductVariant` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteProductVariant(vars: DeleteProductVariantVariables): MutationPromise<DeleteProductVariantData, DeleteProductVariantVariables>;

interface DeleteProductVariantRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteProductVariantVariables): MutationRef<DeleteProductVariantData, DeleteProductVariantVariables>;
}
export const deleteProductVariantRef: DeleteProductVariantRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteProductVariant(dc: DataConnect, vars: DeleteProductVariantVariables): MutationPromise<DeleteProductVariantData, DeleteProductVariantVariables>;

interface DeleteProductVariantRef {
  ...
  (dc: DataConnect, vars: DeleteProductVariantVariables): MutationRef<DeleteProductVariantData, DeleteProductVariantVariables>;
}
export const deleteProductVariantRef: DeleteProductVariantRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteProductVariantRef:
```typescript
const name = deleteProductVariantRef.operationName;
console.log(name);
```

### Variables
The `DeleteProductVariant` mutation requires an argument of type `DeleteProductVariantVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteProductVariantVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteProductVariant` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteProductVariantData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteProductVariantData {
  productVariant_delete?: ProductVariant_Key | null;
}
```
### Using `DeleteProductVariant`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteProductVariant, DeleteProductVariantVariables } from '@dataconnect/generated';

// The `DeleteProductVariant` mutation requires an argument of type `DeleteProductVariantVariables`:
const deleteProductVariantVars: DeleteProductVariantVariables = {
  id: ..., 
};

// Call the `deleteProductVariant()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteProductVariant(deleteProductVariantVars);
// Variables can be defined inline as well.
const { data } = await deleteProductVariant({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteProductVariant(dataConnect, deleteProductVariantVars);

console.log(data.productVariant_delete);

// Or, you can use the `Promise` API.
deleteProductVariant(deleteProductVariantVars).then((response) => {
  const data = response.data;
  console.log(data.productVariant_delete);
});
```

### Using `DeleteProductVariant`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteProductVariantRef, DeleteProductVariantVariables } from '@dataconnect/generated';

// The `DeleteProductVariant` mutation requires an argument of type `DeleteProductVariantVariables`:
const deleteProductVariantVars: DeleteProductVariantVariables = {
  id: ..., 
};

// Call the `deleteProductVariantRef()` function to get a reference to the mutation.
const ref = deleteProductVariantRef(deleteProductVariantVars);
// Variables can be defined inline as well.
const ref = deleteProductVariantRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteProductVariantRef(dataConnect, deleteProductVariantVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.productVariant_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.productVariant_delete);
});
```

## CreateSupplier
You can execute the `CreateSupplier` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createSupplier(vars: CreateSupplierVariables): MutationPromise<CreateSupplierData, CreateSupplierVariables>;

interface CreateSupplierRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSupplierVariables): MutationRef<CreateSupplierData, CreateSupplierVariables>;
}
export const createSupplierRef: CreateSupplierRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createSupplier(dc: DataConnect, vars: CreateSupplierVariables): MutationPromise<CreateSupplierData, CreateSupplierVariables>;

interface CreateSupplierRef {
  ...
  (dc: DataConnect, vars: CreateSupplierVariables): MutationRef<CreateSupplierData, CreateSupplierVariables>;
}
export const createSupplierRef: CreateSupplierRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createSupplierRef:
```typescript
const name = createSupplierRef.operationName;
console.log(name);
```

### Variables
The `CreateSupplier` mutation requires an argument of type `CreateSupplierVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateSupplierVariables {
  name: string;
  contactEmail: string;
}
```
### Return Type
Recall that executing the `CreateSupplier` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateSupplierData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateSupplierData {
  supplier_insert: Supplier_Key;
}
```
### Using `CreateSupplier`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createSupplier, CreateSupplierVariables } from '@dataconnect/generated';

// The `CreateSupplier` mutation requires an argument of type `CreateSupplierVariables`:
const createSupplierVars: CreateSupplierVariables = {
  name: ..., 
  contactEmail: ..., 
};

// Call the `createSupplier()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createSupplier(createSupplierVars);
// Variables can be defined inline as well.
const { data } = await createSupplier({ name: ..., contactEmail: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createSupplier(dataConnect, createSupplierVars);

console.log(data.supplier_insert);

// Or, you can use the `Promise` API.
createSupplier(createSupplierVars).then((response) => {
  const data = response.data;
  console.log(data.supplier_insert);
});
```

### Using `CreateSupplier`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createSupplierRef, CreateSupplierVariables } from '@dataconnect/generated';

// The `CreateSupplier` mutation requires an argument of type `CreateSupplierVariables`:
const createSupplierVars: CreateSupplierVariables = {
  name: ..., 
  contactEmail: ..., 
};

// Call the `createSupplierRef()` function to get a reference to the mutation.
const ref = createSupplierRef(createSupplierVars);
// Variables can be defined inline as well.
const ref = createSupplierRef({ name: ..., contactEmail: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createSupplierRef(dataConnect, createSupplierVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.supplier_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.supplier_insert);
});
```

## UpdateSupplier
You can execute the `UpdateSupplier` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateSupplier(vars: UpdateSupplierVariables): MutationPromise<UpdateSupplierData, UpdateSupplierVariables>;

interface UpdateSupplierRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSupplierVariables): MutationRef<UpdateSupplierData, UpdateSupplierVariables>;
}
export const updateSupplierRef: UpdateSupplierRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateSupplier(dc: DataConnect, vars: UpdateSupplierVariables): MutationPromise<UpdateSupplierData, UpdateSupplierVariables>;

interface UpdateSupplierRef {
  ...
  (dc: DataConnect, vars: UpdateSupplierVariables): MutationRef<UpdateSupplierData, UpdateSupplierVariables>;
}
export const updateSupplierRef: UpdateSupplierRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateSupplierRef:
```typescript
const name = updateSupplierRef.operationName;
console.log(name);
```

### Variables
The `UpdateSupplier` mutation requires an argument of type `UpdateSupplierVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateSupplierVariables {
  id: UUIDString;
  website?: string | null;
}
```
### Return Type
Recall that executing the `UpdateSupplier` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateSupplierData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateSupplierData {
  supplier_update?: Supplier_Key | null;
}
```
### Using `UpdateSupplier`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateSupplier, UpdateSupplierVariables } from '@dataconnect/generated';

// The `UpdateSupplier` mutation requires an argument of type `UpdateSupplierVariables`:
const updateSupplierVars: UpdateSupplierVariables = {
  id: ..., 
  website: ..., // optional
};

// Call the `updateSupplier()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateSupplier(updateSupplierVars);
// Variables can be defined inline as well.
const { data } = await updateSupplier({ id: ..., website: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateSupplier(dataConnect, updateSupplierVars);

console.log(data.supplier_update);

// Or, you can use the `Promise` API.
updateSupplier(updateSupplierVars).then((response) => {
  const data = response.data;
  console.log(data.supplier_update);
});
```

### Using `UpdateSupplier`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateSupplierRef, UpdateSupplierVariables } from '@dataconnect/generated';

// The `UpdateSupplier` mutation requires an argument of type `UpdateSupplierVariables`:
const updateSupplierVars: UpdateSupplierVariables = {
  id: ..., 
  website: ..., // optional
};

// Call the `updateSupplierRef()` function to get a reference to the mutation.
const ref = updateSupplierRef(updateSupplierVars);
// Variables can be defined inline as well.
const ref = updateSupplierRef({ id: ..., website: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateSupplierRef(dataConnect, updateSupplierVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.supplier_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.supplier_update);
});
```

## DeleteSupplier
You can execute the `DeleteSupplier` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteSupplier(vars: DeleteSupplierVariables): MutationPromise<DeleteSupplierData, DeleteSupplierVariables>;

interface DeleteSupplierRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteSupplierVariables): MutationRef<DeleteSupplierData, DeleteSupplierVariables>;
}
export const deleteSupplierRef: DeleteSupplierRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteSupplier(dc: DataConnect, vars: DeleteSupplierVariables): MutationPromise<DeleteSupplierData, DeleteSupplierVariables>;

interface DeleteSupplierRef {
  ...
  (dc: DataConnect, vars: DeleteSupplierVariables): MutationRef<DeleteSupplierData, DeleteSupplierVariables>;
}
export const deleteSupplierRef: DeleteSupplierRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteSupplierRef:
```typescript
const name = deleteSupplierRef.operationName;
console.log(name);
```

### Variables
The `DeleteSupplier` mutation requires an argument of type `DeleteSupplierVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteSupplierVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteSupplier` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteSupplierData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteSupplierData {
  supplier_delete?: Supplier_Key | null;
}
```
### Using `DeleteSupplier`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteSupplier, DeleteSupplierVariables } from '@dataconnect/generated';

// The `DeleteSupplier` mutation requires an argument of type `DeleteSupplierVariables`:
const deleteSupplierVars: DeleteSupplierVariables = {
  id: ..., 
};

// Call the `deleteSupplier()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteSupplier(deleteSupplierVars);
// Variables can be defined inline as well.
const { data } = await deleteSupplier({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteSupplier(dataConnect, deleteSupplierVars);

console.log(data.supplier_delete);

// Or, you can use the `Promise` API.
deleteSupplier(deleteSupplierVars).then((response) => {
  const data = response.data;
  console.log(data.supplier_delete);
});
```

### Using `DeleteSupplier`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteSupplierRef, DeleteSupplierVariables } from '@dataconnect/generated';

// The `DeleteSupplier` mutation requires an argument of type `DeleteSupplierVariables`:
const deleteSupplierVars: DeleteSupplierVariables = {
  id: ..., 
};

// Call the `deleteSupplierRef()` function to get a reference to the mutation.
const ref = deleteSupplierRef(deleteSupplierVars);
// Variables can be defined inline as well.
const ref = deleteSupplierRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteSupplierRef(dataConnect, deleteSupplierVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.supplier_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.supplier_delete);
});
```

## CreateInventoryTransaction
You can execute the `CreateInventoryTransaction` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createInventoryTransaction(vars: CreateInventoryTransactionVariables): MutationPromise<CreateInventoryTransactionData, CreateInventoryTransactionVariables>;

interface CreateInventoryTransactionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateInventoryTransactionVariables): MutationRef<CreateInventoryTransactionData, CreateInventoryTransactionVariables>;
}
export const createInventoryTransactionRef: CreateInventoryTransactionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createInventoryTransaction(dc: DataConnect, vars: CreateInventoryTransactionVariables): MutationPromise<CreateInventoryTransactionData, CreateInventoryTransactionVariables>;

interface CreateInventoryTransactionRef {
  ...
  (dc: DataConnect, vars: CreateInventoryTransactionVariables): MutationRef<CreateInventoryTransactionData, CreateInventoryTransactionVariables>;
}
export const createInventoryTransactionRef: CreateInventoryTransactionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createInventoryTransactionRef:
```typescript
const name = createInventoryTransactionRef.operationName;
console.log(name);
```

### Variables
The `CreateInventoryTransaction` mutation requires an argument of type `CreateInventoryTransactionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateInventoryTransactionVariables {
  variantId: UUIDString;
  quantityChanged: number;
  transactionType: string;
}
```
### Return Type
Recall that executing the `CreateInventoryTransaction` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateInventoryTransactionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateInventoryTransactionData {
  inventoryTransaction_insert: InventoryTransaction_Key;
}
```
### Using `CreateInventoryTransaction`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createInventoryTransaction, CreateInventoryTransactionVariables } from '@dataconnect/generated';

// The `CreateInventoryTransaction` mutation requires an argument of type `CreateInventoryTransactionVariables`:
const createInventoryTransactionVars: CreateInventoryTransactionVariables = {
  variantId: ..., 
  quantityChanged: ..., 
  transactionType: ..., 
};

// Call the `createInventoryTransaction()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createInventoryTransaction(createInventoryTransactionVars);
// Variables can be defined inline as well.
const { data } = await createInventoryTransaction({ variantId: ..., quantityChanged: ..., transactionType: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createInventoryTransaction(dataConnect, createInventoryTransactionVars);

console.log(data.inventoryTransaction_insert);

// Or, you can use the `Promise` API.
createInventoryTransaction(createInventoryTransactionVars).then((response) => {
  const data = response.data;
  console.log(data.inventoryTransaction_insert);
});
```

### Using `CreateInventoryTransaction`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createInventoryTransactionRef, CreateInventoryTransactionVariables } from '@dataconnect/generated';

// The `CreateInventoryTransaction` mutation requires an argument of type `CreateInventoryTransactionVariables`:
const createInventoryTransactionVars: CreateInventoryTransactionVariables = {
  variantId: ..., 
  quantityChanged: ..., 
  transactionType: ..., 
};

// Call the `createInventoryTransactionRef()` function to get a reference to the mutation.
const ref = createInventoryTransactionRef(createInventoryTransactionVars);
// Variables can be defined inline as well.
const ref = createInventoryTransactionRef({ variantId: ..., quantityChanged: ..., transactionType: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createInventoryTransactionRef(dataConnect, createInventoryTransactionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.inventoryTransaction_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.inventoryTransaction_insert);
});
```

## DeleteInventoryTransaction
You can execute the `DeleteInventoryTransaction` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteInventoryTransaction(vars: DeleteInventoryTransactionVariables): MutationPromise<DeleteInventoryTransactionData, DeleteInventoryTransactionVariables>;

interface DeleteInventoryTransactionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteInventoryTransactionVariables): MutationRef<DeleteInventoryTransactionData, DeleteInventoryTransactionVariables>;
}
export const deleteInventoryTransactionRef: DeleteInventoryTransactionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteInventoryTransaction(dc: DataConnect, vars: DeleteInventoryTransactionVariables): MutationPromise<DeleteInventoryTransactionData, DeleteInventoryTransactionVariables>;

interface DeleteInventoryTransactionRef {
  ...
  (dc: DataConnect, vars: DeleteInventoryTransactionVariables): MutationRef<DeleteInventoryTransactionData, DeleteInventoryTransactionVariables>;
}
export const deleteInventoryTransactionRef: DeleteInventoryTransactionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteInventoryTransactionRef:
```typescript
const name = deleteInventoryTransactionRef.operationName;
console.log(name);
```

### Variables
The `DeleteInventoryTransaction` mutation requires an argument of type `DeleteInventoryTransactionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteInventoryTransactionVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteInventoryTransaction` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteInventoryTransactionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteInventoryTransactionData {
  inventoryTransaction_delete?: InventoryTransaction_Key | null;
}
```
### Using `DeleteInventoryTransaction`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteInventoryTransaction, DeleteInventoryTransactionVariables } from '@dataconnect/generated';

// The `DeleteInventoryTransaction` mutation requires an argument of type `DeleteInventoryTransactionVariables`:
const deleteInventoryTransactionVars: DeleteInventoryTransactionVariables = {
  id: ..., 
};

// Call the `deleteInventoryTransaction()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteInventoryTransaction(deleteInventoryTransactionVars);
// Variables can be defined inline as well.
const { data } = await deleteInventoryTransaction({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteInventoryTransaction(dataConnect, deleteInventoryTransactionVars);

console.log(data.inventoryTransaction_delete);

// Or, you can use the `Promise` API.
deleteInventoryTransaction(deleteInventoryTransactionVars).then((response) => {
  const data = response.data;
  console.log(data.inventoryTransaction_delete);
});
```

### Using `DeleteInventoryTransaction`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteInventoryTransactionRef, DeleteInventoryTransactionVariables } from '@dataconnect/generated';

// The `DeleteInventoryTransaction` mutation requires an argument of type `DeleteInventoryTransactionVariables`:
const deleteInventoryTransactionVars: DeleteInventoryTransactionVariables = {
  id: ..., 
};

// Call the `deleteInventoryTransactionRef()` function to get a reference to the mutation.
const ref = deleteInventoryTransactionRef(deleteInventoryTransactionVars);
// Variables can be defined inline as well.
const ref = deleteInventoryTransactionRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteInventoryTransactionRef(dataConnect, deleteInventoryTransactionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.inventoryTransaction_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.inventoryTransaction_delete);
});
```

## CreatePurchaseOrder
You can execute the `CreatePurchaseOrder` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createPurchaseOrder(vars: CreatePurchaseOrderVariables): MutationPromise<CreatePurchaseOrderData, CreatePurchaseOrderVariables>;

interface CreatePurchaseOrderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePurchaseOrderVariables): MutationRef<CreatePurchaseOrderData, CreatePurchaseOrderVariables>;
}
export const createPurchaseOrderRef: CreatePurchaseOrderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPurchaseOrder(dc: DataConnect, vars: CreatePurchaseOrderVariables): MutationPromise<CreatePurchaseOrderData, CreatePurchaseOrderVariables>;

interface CreatePurchaseOrderRef {
  ...
  (dc: DataConnect, vars: CreatePurchaseOrderVariables): MutationRef<CreatePurchaseOrderData, CreatePurchaseOrderVariables>;
}
export const createPurchaseOrderRef: CreatePurchaseOrderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPurchaseOrderRef:
```typescript
const name = createPurchaseOrderRef.operationName;
console.log(name);
```

### Variables
The `CreatePurchaseOrder` mutation requires an argument of type `CreatePurchaseOrderVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreatePurchaseOrderVariables {
  supplierId: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `CreatePurchaseOrder` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePurchaseOrderData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePurchaseOrderData {
  purchaseOrder_insert: PurchaseOrder_Key;
}
```
### Using `CreatePurchaseOrder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPurchaseOrder, CreatePurchaseOrderVariables } from '@dataconnect/generated';

// The `CreatePurchaseOrder` mutation requires an argument of type `CreatePurchaseOrderVariables`:
const createPurchaseOrderVars: CreatePurchaseOrderVariables = {
  supplierId: ..., 
  status: ..., 
};

// Call the `createPurchaseOrder()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPurchaseOrder(createPurchaseOrderVars);
// Variables can be defined inline as well.
const { data } = await createPurchaseOrder({ supplierId: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPurchaseOrder(dataConnect, createPurchaseOrderVars);

console.log(data.purchaseOrder_insert);

// Or, you can use the `Promise` API.
createPurchaseOrder(createPurchaseOrderVars).then((response) => {
  const data = response.data;
  console.log(data.purchaseOrder_insert);
});
```

### Using `CreatePurchaseOrder`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPurchaseOrderRef, CreatePurchaseOrderVariables } from '@dataconnect/generated';

// The `CreatePurchaseOrder` mutation requires an argument of type `CreatePurchaseOrderVariables`:
const createPurchaseOrderVars: CreatePurchaseOrderVariables = {
  supplierId: ..., 
  status: ..., 
};

// Call the `createPurchaseOrderRef()` function to get a reference to the mutation.
const ref = createPurchaseOrderRef(createPurchaseOrderVars);
// Variables can be defined inline as well.
const ref = createPurchaseOrderRef({ supplierId: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPurchaseOrderRef(dataConnect, createPurchaseOrderVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.purchaseOrder_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.purchaseOrder_insert);
});
```

## UpdatePurchaseOrder
You can execute the `UpdatePurchaseOrder` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updatePurchaseOrder(vars: UpdatePurchaseOrderVariables): MutationPromise<UpdatePurchaseOrderData, UpdatePurchaseOrderVariables>;

interface UpdatePurchaseOrderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePurchaseOrderVariables): MutationRef<UpdatePurchaseOrderData, UpdatePurchaseOrderVariables>;
}
export const updatePurchaseOrderRef: UpdatePurchaseOrderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updatePurchaseOrder(dc: DataConnect, vars: UpdatePurchaseOrderVariables): MutationPromise<UpdatePurchaseOrderData, UpdatePurchaseOrderVariables>;

interface UpdatePurchaseOrderRef {
  ...
  (dc: DataConnect, vars: UpdatePurchaseOrderVariables): MutationRef<UpdatePurchaseOrderData, UpdatePurchaseOrderVariables>;
}
export const updatePurchaseOrderRef: UpdatePurchaseOrderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updatePurchaseOrderRef:
```typescript
const name = updatePurchaseOrderRef.operationName;
console.log(name);
```

### Variables
The `UpdatePurchaseOrder` mutation requires an argument of type `UpdatePurchaseOrderVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdatePurchaseOrderVariables {
  id: UUIDString;
  status?: string | null;
}
```
### Return Type
Recall that executing the `UpdatePurchaseOrder` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdatePurchaseOrderData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdatePurchaseOrderData {
  purchaseOrder_update?: PurchaseOrder_Key | null;
}
```
### Using `UpdatePurchaseOrder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updatePurchaseOrder, UpdatePurchaseOrderVariables } from '@dataconnect/generated';

// The `UpdatePurchaseOrder` mutation requires an argument of type `UpdatePurchaseOrderVariables`:
const updatePurchaseOrderVars: UpdatePurchaseOrderVariables = {
  id: ..., 
  status: ..., // optional
};

// Call the `updatePurchaseOrder()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updatePurchaseOrder(updatePurchaseOrderVars);
// Variables can be defined inline as well.
const { data } = await updatePurchaseOrder({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updatePurchaseOrder(dataConnect, updatePurchaseOrderVars);

console.log(data.purchaseOrder_update);

// Or, you can use the `Promise` API.
updatePurchaseOrder(updatePurchaseOrderVars).then((response) => {
  const data = response.data;
  console.log(data.purchaseOrder_update);
});
```

### Using `UpdatePurchaseOrder`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updatePurchaseOrderRef, UpdatePurchaseOrderVariables } from '@dataconnect/generated';

// The `UpdatePurchaseOrder` mutation requires an argument of type `UpdatePurchaseOrderVariables`:
const updatePurchaseOrderVars: UpdatePurchaseOrderVariables = {
  id: ..., 
  status: ..., // optional
};

// Call the `updatePurchaseOrderRef()` function to get a reference to the mutation.
const ref = updatePurchaseOrderRef(updatePurchaseOrderVars);
// Variables can be defined inline as well.
const ref = updatePurchaseOrderRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updatePurchaseOrderRef(dataConnect, updatePurchaseOrderVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.purchaseOrder_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.purchaseOrder_update);
});
```

## DeletePurchaseOrder
You can execute the `DeletePurchaseOrder` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deletePurchaseOrder(vars: DeletePurchaseOrderVariables): MutationPromise<DeletePurchaseOrderData, DeletePurchaseOrderVariables>;

interface DeletePurchaseOrderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeletePurchaseOrderVariables): MutationRef<DeletePurchaseOrderData, DeletePurchaseOrderVariables>;
}
export const deletePurchaseOrderRef: DeletePurchaseOrderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deletePurchaseOrder(dc: DataConnect, vars: DeletePurchaseOrderVariables): MutationPromise<DeletePurchaseOrderData, DeletePurchaseOrderVariables>;

interface DeletePurchaseOrderRef {
  ...
  (dc: DataConnect, vars: DeletePurchaseOrderVariables): MutationRef<DeletePurchaseOrderData, DeletePurchaseOrderVariables>;
}
export const deletePurchaseOrderRef: DeletePurchaseOrderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deletePurchaseOrderRef:
```typescript
const name = deletePurchaseOrderRef.operationName;
console.log(name);
```

### Variables
The `DeletePurchaseOrder` mutation requires an argument of type `DeletePurchaseOrderVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeletePurchaseOrderVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeletePurchaseOrder` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeletePurchaseOrderData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeletePurchaseOrderData {
  purchaseOrder_delete?: PurchaseOrder_Key | null;
}
```
### Using `DeletePurchaseOrder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deletePurchaseOrder, DeletePurchaseOrderVariables } from '@dataconnect/generated';

// The `DeletePurchaseOrder` mutation requires an argument of type `DeletePurchaseOrderVariables`:
const deletePurchaseOrderVars: DeletePurchaseOrderVariables = {
  id: ..., 
};

// Call the `deletePurchaseOrder()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deletePurchaseOrder(deletePurchaseOrderVars);
// Variables can be defined inline as well.
const { data } = await deletePurchaseOrder({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deletePurchaseOrder(dataConnect, deletePurchaseOrderVars);

console.log(data.purchaseOrder_delete);

// Or, you can use the `Promise` API.
deletePurchaseOrder(deletePurchaseOrderVars).then((response) => {
  const data = response.data;
  console.log(data.purchaseOrder_delete);
});
```

### Using `DeletePurchaseOrder`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deletePurchaseOrderRef, DeletePurchaseOrderVariables } from '@dataconnect/generated';

// The `DeletePurchaseOrder` mutation requires an argument of type `DeletePurchaseOrderVariables`:
const deletePurchaseOrderVars: DeletePurchaseOrderVariables = {
  id: ..., 
};

// Call the `deletePurchaseOrderRef()` function to get a reference to the mutation.
const ref = deletePurchaseOrderRef(deletePurchaseOrderVars);
// Variables can be defined inline as well.
const ref = deletePurchaseOrderRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deletePurchaseOrderRef(dataConnect, deletePurchaseOrderVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.purchaseOrder_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.purchaseOrder_delete);
});
```

