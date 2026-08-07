import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateInventoryTransactionData {
  inventoryTransaction_insert: InventoryTransaction_Key;
}

export interface CreateInventoryTransactionVariables {
  variantId: UUIDString;
  quantityChanged: number;
  transactionType: string;
}

export interface CreateProductData {
  product_insert: Product_Key;
}

export interface CreateProductVariables {
  name: string;
  category: string;
  brand: string;
}

export interface CreateProductVariantData {
  productVariant_insert: ProductVariant_Key;
}

export interface CreateProductVariantVariables {
  productId: UUIDString;
  flavor: string;
  nicotineStrength: string;
  sku: string;
  currentStock: number;
  reorderThreshold: number;
}

export interface CreatePurchaseOrderData {
  purchaseOrder_insert: PurchaseOrder_Key;
}

export interface CreatePurchaseOrderVariables {
  supplierId: UUIDString;
  status: string;
}

export interface CreateSupplierData {
  supplier_insert: Supplier_Key;
}

export interface CreateSupplierVariables {
  name: string;
  contactEmail: string;
}

export interface DeleteInventoryTransactionData {
  inventoryTransaction_delete?: InventoryTransaction_Key | null;
}

export interface DeleteInventoryTransactionVariables {
  id: UUIDString;
}

export interface DeleteProductData {
  product_delete?: Product_Key | null;
}

export interface DeleteProductVariables {
  id: UUIDString;
}

export interface DeleteProductVariantData {
  productVariant_delete?: ProductVariant_Key | null;
}

export interface DeleteProductVariantVariables {
  id: UUIDString;
}

export interface DeletePurchaseOrderData {
  purchaseOrder_delete?: PurchaseOrder_Key | null;
}

export interface DeletePurchaseOrderVariables {
  id: UUIDString;
}

export interface DeleteSupplierData {
  supplier_delete?: Supplier_Key | null;
}

export interface DeleteSupplierVariables {
  id: UUIDString;
}

export interface GetInventoryTransactionData {
  inventoryTransaction?: {
    quantityChanged: number;
    transactionType: string;
  };
}

export interface GetInventoryTransactionVariables {
  id: UUIDString;
}

export interface GetProductData {
  product?: {
    name: string;
    category: string;
    brand: string;
  };
}

export interface GetProductVariables {
  id: UUIDString;
}

export interface GetProductVariantData {
  productVariant?: {
    sku: string;
    flavor: string;
    nicotineStrength: string;
  };
}

export interface GetProductVariantVariables {
  id: UUIDString;
}

export interface GetPurchaseOrderData {
  purchaseOrder?: {
    status: string;
    totalCost?: number | null;
  };
}

export interface GetPurchaseOrderVariables {
  id: UUIDString;
}

export interface GetSupplierData {
  supplier?: {
    name: string;
    contactEmail: string;
  };
}

export interface GetSupplierVariables {
  id: UUIDString;
}

export interface InventoryTransaction_Key {
  id: UUIDString;
  __typename?: 'InventoryTransaction_Key';
}

export interface ListInventoryTransactionsData {
  inventoryTransactions: ({
    quantityChanged: number;
    transactionType: string;
  })[];
}

export interface ListProductVariantsData {
  productVariants: ({
    sku: string;
    flavor: string;
    nicotineStrength: string;
  })[];
}

export interface ListProductsData {
  products: ({
    name: string;
    category: string;
    brand: string;
  })[];
}

export interface ListPurchaseOrdersData {
  purchaseOrders: ({
    status: string;
    totalCost?: number | null;
  })[];
}

export interface ListSuppliersData {
  suppliers: ({
    name: string;
    contactEmail: string;
  })[];
}

export interface ProductVariant_Key {
  id: UUIDString;
  __typename?: 'ProductVariant_Key';
}

export interface Product_Key {
  id: UUIDString;
  __typename?: 'Product_Key';
}

export interface PurchaseOrder_Key {
  id: UUIDString;
  __typename?: 'PurchaseOrder_Key';
}

export interface Supplier_Key {
  id: UUIDString;
  __typename?: 'Supplier_Key';
}

export interface UpdateProductData {
  product_update?: Product_Key | null;
}

export interface UpdateProductVariables {
  id: UUIDString;
  name?: string | null;
}

export interface UpdateProductVariantData {
  productVariant_update?: ProductVariant_Key | null;
}

export interface UpdateProductVariantVariables {
  id: UUIDString;
  currentStock?: number | null;
}

export interface UpdatePurchaseOrderData {
  purchaseOrder_update?: PurchaseOrder_Key | null;
}

export interface UpdatePurchaseOrderVariables {
  id: UUIDString;
  status?: string | null;
}

export interface UpdateSupplierData {
  supplier_update?: Supplier_Key | null;
}

export interface UpdateSupplierVariables {
  id: UUIDString;
  website?: string | null;
}

interface CreateProductRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateProductVariables): MutationRef<CreateProductData, CreateProductVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateProductVariables): MutationRef<CreateProductData, CreateProductVariables>;
  operationName: string;
}
export const createProductRef: CreateProductRef;

export function createProduct(vars: CreateProductVariables): MutationPromise<CreateProductData, CreateProductVariables>;
export function createProduct(dc: DataConnect, vars: CreateProductVariables): MutationPromise<CreateProductData, CreateProductVariables>;

interface UpdateProductRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProductVariables): MutationRef<UpdateProductData, UpdateProductVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateProductVariables): MutationRef<UpdateProductData, UpdateProductVariables>;
  operationName: string;
}
export const updateProductRef: UpdateProductRef;

export function updateProduct(vars: UpdateProductVariables): MutationPromise<UpdateProductData, UpdateProductVariables>;
export function updateProduct(dc: DataConnect, vars: UpdateProductVariables): MutationPromise<UpdateProductData, UpdateProductVariables>;

interface DeleteProductRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteProductVariables): MutationRef<DeleteProductData, DeleteProductVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteProductVariables): MutationRef<DeleteProductData, DeleteProductVariables>;
  operationName: string;
}
export const deleteProductRef: DeleteProductRef;

export function deleteProduct(vars: DeleteProductVariables): MutationPromise<DeleteProductData, DeleteProductVariables>;
export function deleteProduct(dc: DataConnect, vars: DeleteProductVariables): MutationPromise<DeleteProductData, DeleteProductVariables>;

interface GetProductRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProductVariables): QueryRef<GetProductData, GetProductVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetProductVariables): QueryRef<GetProductData, GetProductVariables>;
  operationName: string;
}
export const getProductRef: GetProductRef;

export function getProduct(vars: GetProductVariables, options?: ExecuteQueryOptions): QueryPromise<GetProductData, GetProductVariables>;
export function getProduct(dc: DataConnect, vars: GetProductVariables, options?: ExecuteQueryOptions): QueryPromise<GetProductData, GetProductVariables>;

interface ListProductsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProductsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListProductsData, undefined>;
  operationName: string;
}
export const listProductsRef: ListProductsRef;

export function listProducts(options?: ExecuteQueryOptions): QueryPromise<ListProductsData, undefined>;
export function listProducts(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListProductsData, undefined>;

interface CreateProductVariantRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateProductVariantVariables): MutationRef<CreateProductVariantData, CreateProductVariantVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateProductVariantVariables): MutationRef<CreateProductVariantData, CreateProductVariantVariables>;
  operationName: string;
}
export const createProductVariantRef: CreateProductVariantRef;

export function createProductVariant(vars: CreateProductVariantVariables): MutationPromise<CreateProductVariantData, CreateProductVariantVariables>;
export function createProductVariant(dc: DataConnect, vars: CreateProductVariantVariables): MutationPromise<CreateProductVariantData, CreateProductVariantVariables>;

interface UpdateProductVariantRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProductVariantVariables): MutationRef<UpdateProductVariantData, UpdateProductVariantVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateProductVariantVariables): MutationRef<UpdateProductVariantData, UpdateProductVariantVariables>;
  operationName: string;
}
export const updateProductVariantRef: UpdateProductVariantRef;

export function updateProductVariant(vars: UpdateProductVariantVariables): MutationPromise<UpdateProductVariantData, UpdateProductVariantVariables>;
export function updateProductVariant(dc: DataConnect, vars: UpdateProductVariantVariables): MutationPromise<UpdateProductVariantData, UpdateProductVariantVariables>;

interface DeleteProductVariantRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteProductVariantVariables): MutationRef<DeleteProductVariantData, DeleteProductVariantVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteProductVariantVariables): MutationRef<DeleteProductVariantData, DeleteProductVariantVariables>;
  operationName: string;
}
export const deleteProductVariantRef: DeleteProductVariantRef;

export function deleteProductVariant(vars: DeleteProductVariantVariables): MutationPromise<DeleteProductVariantData, DeleteProductVariantVariables>;
export function deleteProductVariant(dc: DataConnect, vars: DeleteProductVariantVariables): MutationPromise<DeleteProductVariantData, DeleteProductVariantVariables>;

interface GetProductVariantRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProductVariantVariables): QueryRef<GetProductVariantData, GetProductVariantVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetProductVariantVariables): QueryRef<GetProductVariantData, GetProductVariantVariables>;
  operationName: string;
}
export const getProductVariantRef: GetProductVariantRef;

export function getProductVariant(vars: GetProductVariantVariables, options?: ExecuteQueryOptions): QueryPromise<GetProductVariantData, GetProductVariantVariables>;
export function getProductVariant(dc: DataConnect, vars: GetProductVariantVariables, options?: ExecuteQueryOptions): QueryPromise<GetProductVariantData, GetProductVariantVariables>;

interface ListProductVariantsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProductVariantsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListProductVariantsData, undefined>;
  operationName: string;
}
export const listProductVariantsRef: ListProductVariantsRef;

export function listProductVariants(options?: ExecuteQueryOptions): QueryPromise<ListProductVariantsData, undefined>;
export function listProductVariants(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListProductVariantsData, undefined>;

interface CreateSupplierRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSupplierVariables): MutationRef<CreateSupplierData, CreateSupplierVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateSupplierVariables): MutationRef<CreateSupplierData, CreateSupplierVariables>;
  operationName: string;
}
export const createSupplierRef: CreateSupplierRef;

export function createSupplier(vars: CreateSupplierVariables): MutationPromise<CreateSupplierData, CreateSupplierVariables>;
export function createSupplier(dc: DataConnect, vars: CreateSupplierVariables): MutationPromise<CreateSupplierData, CreateSupplierVariables>;

interface UpdateSupplierRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSupplierVariables): MutationRef<UpdateSupplierData, UpdateSupplierVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateSupplierVariables): MutationRef<UpdateSupplierData, UpdateSupplierVariables>;
  operationName: string;
}
export const updateSupplierRef: UpdateSupplierRef;

export function updateSupplier(vars: UpdateSupplierVariables): MutationPromise<UpdateSupplierData, UpdateSupplierVariables>;
export function updateSupplier(dc: DataConnect, vars: UpdateSupplierVariables): MutationPromise<UpdateSupplierData, UpdateSupplierVariables>;

interface DeleteSupplierRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteSupplierVariables): MutationRef<DeleteSupplierData, DeleteSupplierVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteSupplierVariables): MutationRef<DeleteSupplierData, DeleteSupplierVariables>;
  operationName: string;
}
export const deleteSupplierRef: DeleteSupplierRef;

export function deleteSupplier(vars: DeleteSupplierVariables): MutationPromise<DeleteSupplierData, DeleteSupplierVariables>;
export function deleteSupplier(dc: DataConnect, vars: DeleteSupplierVariables): MutationPromise<DeleteSupplierData, DeleteSupplierVariables>;

interface GetSupplierRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSupplierVariables): QueryRef<GetSupplierData, GetSupplierVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetSupplierVariables): QueryRef<GetSupplierData, GetSupplierVariables>;
  operationName: string;
}
export const getSupplierRef: GetSupplierRef;

export function getSupplier(vars: GetSupplierVariables, options?: ExecuteQueryOptions): QueryPromise<GetSupplierData, GetSupplierVariables>;
export function getSupplier(dc: DataConnect, vars: GetSupplierVariables, options?: ExecuteQueryOptions): QueryPromise<GetSupplierData, GetSupplierVariables>;

interface ListSuppliersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListSuppliersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListSuppliersData, undefined>;
  operationName: string;
}
export const listSuppliersRef: ListSuppliersRef;

export function listSuppliers(options?: ExecuteQueryOptions): QueryPromise<ListSuppliersData, undefined>;
export function listSuppliers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListSuppliersData, undefined>;

interface CreateInventoryTransactionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateInventoryTransactionVariables): MutationRef<CreateInventoryTransactionData, CreateInventoryTransactionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateInventoryTransactionVariables): MutationRef<CreateInventoryTransactionData, CreateInventoryTransactionVariables>;
  operationName: string;
}
export const createInventoryTransactionRef: CreateInventoryTransactionRef;

export function createInventoryTransaction(vars: CreateInventoryTransactionVariables): MutationPromise<CreateInventoryTransactionData, CreateInventoryTransactionVariables>;
export function createInventoryTransaction(dc: DataConnect, vars: CreateInventoryTransactionVariables): MutationPromise<CreateInventoryTransactionData, CreateInventoryTransactionVariables>;

interface DeleteInventoryTransactionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteInventoryTransactionVariables): MutationRef<DeleteInventoryTransactionData, DeleteInventoryTransactionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteInventoryTransactionVariables): MutationRef<DeleteInventoryTransactionData, DeleteInventoryTransactionVariables>;
  operationName: string;
}
export const deleteInventoryTransactionRef: DeleteInventoryTransactionRef;

export function deleteInventoryTransaction(vars: DeleteInventoryTransactionVariables): MutationPromise<DeleteInventoryTransactionData, DeleteInventoryTransactionVariables>;
export function deleteInventoryTransaction(dc: DataConnect, vars: DeleteInventoryTransactionVariables): MutationPromise<DeleteInventoryTransactionData, DeleteInventoryTransactionVariables>;

interface GetInventoryTransactionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetInventoryTransactionVariables): QueryRef<GetInventoryTransactionData, GetInventoryTransactionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetInventoryTransactionVariables): QueryRef<GetInventoryTransactionData, GetInventoryTransactionVariables>;
  operationName: string;
}
export const getInventoryTransactionRef: GetInventoryTransactionRef;

export function getInventoryTransaction(vars: GetInventoryTransactionVariables, options?: ExecuteQueryOptions): QueryPromise<GetInventoryTransactionData, GetInventoryTransactionVariables>;
export function getInventoryTransaction(dc: DataConnect, vars: GetInventoryTransactionVariables, options?: ExecuteQueryOptions): QueryPromise<GetInventoryTransactionData, GetInventoryTransactionVariables>;

interface ListInventoryTransactionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListInventoryTransactionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListInventoryTransactionsData, undefined>;
  operationName: string;
}
export const listInventoryTransactionsRef: ListInventoryTransactionsRef;

export function listInventoryTransactions(options?: ExecuteQueryOptions): QueryPromise<ListInventoryTransactionsData, undefined>;
export function listInventoryTransactions(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListInventoryTransactionsData, undefined>;

interface CreatePurchaseOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePurchaseOrderVariables): MutationRef<CreatePurchaseOrderData, CreatePurchaseOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePurchaseOrderVariables): MutationRef<CreatePurchaseOrderData, CreatePurchaseOrderVariables>;
  operationName: string;
}
export const createPurchaseOrderRef: CreatePurchaseOrderRef;

export function createPurchaseOrder(vars: CreatePurchaseOrderVariables): MutationPromise<CreatePurchaseOrderData, CreatePurchaseOrderVariables>;
export function createPurchaseOrder(dc: DataConnect, vars: CreatePurchaseOrderVariables): MutationPromise<CreatePurchaseOrderData, CreatePurchaseOrderVariables>;

interface UpdatePurchaseOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePurchaseOrderVariables): MutationRef<UpdatePurchaseOrderData, UpdatePurchaseOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdatePurchaseOrderVariables): MutationRef<UpdatePurchaseOrderData, UpdatePurchaseOrderVariables>;
  operationName: string;
}
export const updatePurchaseOrderRef: UpdatePurchaseOrderRef;

export function updatePurchaseOrder(vars: UpdatePurchaseOrderVariables): MutationPromise<UpdatePurchaseOrderData, UpdatePurchaseOrderVariables>;
export function updatePurchaseOrder(dc: DataConnect, vars: UpdatePurchaseOrderVariables): MutationPromise<UpdatePurchaseOrderData, UpdatePurchaseOrderVariables>;

interface DeletePurchaseOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeletePurchaseOrderVariables): MutationRef<DeletePurchaseOrderData, DeletePurchaseOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeletePurchaseOrderVariables): MutationRef<DeletePurchaseOrderData, DeletePurchaseOrderVariables>;
  operationName: string;
}
export const deletePurchaseOrderRef: DeletePurchaseOrderRef;

export function deletePurchaseOrder(vars: DeletePurchaseOrderVariables): MutationPromise<DeletePurchaseOrderData, DeletePurchaseOrderVariables>;
export function deletePurchaseOrder(dc: DataConnect, vars: DeletePurchaseOrderVariables): MutationPromise<DeletePurchaseOrderData, DeletePurchaseOrderVariables>;

interface GetPurchaseOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPurchaseOrderVariables): QueryRef<GetPurchaseOrderData, GetPurchaseOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetPurchaseOrderVariables): QueryRef<GetPurchaseOrderData, GetPurchaseOrderVariables>;
  operationName: string;
}
export const getPurchaseOrderRef: GetPurchaseOrderRef;

export function getPurchaseOrder(vars: GetPurchaseOrderVariables, options?: ExecuteQueryOptions): QueryPromise<GetPurchaseOrderData, GetPurchaseOrderVariables>;
export function getPurchaseOrder(dc: DataConnect, vars: GetPurchaseOrderVariables, options?: ExecuteQueryOptions): QueryPromise<GetPurchaseOrderData, GetPurchaseOrderVariables>;

interface ListPurchaseOrdersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPurchaseOrdersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPurchaseOrdersData, undefined>;
  operationName: string;
}
export const listPurchaseOrdersRef: ListPurchaseOrdersRef;

export function listPurchaseOrders(options?: ExecuteQueryOptions): QueryPromise<ListPurchaseOrdersData, undefined>;
export function listPurchaseOrders(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListPurchaseOrdersData, undefined>;

