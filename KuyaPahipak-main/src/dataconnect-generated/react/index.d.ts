import { CreateProductData, CreateProductVariables, UpdateProductData, UpdateProductVariables, DeleteProductData, DeleteProductVariables, GetProductData, GetProductVariables, ListProductsData, CreateProductVariantData, CreateProductVariantVariables, UpdateProductVariantData, UpdateProductVariantVariables, DeleteProductVariantData, DeleteProductVariantVariables, GetProductVariantData, GetProductVariantVariables, ListProductVariantsData, CreateSupplierData, CreateSupplierVariables, UpdateSupplierData, UpdateSupplierVariables, DeleteSupplierData, DeleteSupplierVariables, GetSupplierData, GetSupplierVariables, ListSuppliersData, CreateInventoryTransactionData, CreateInventoryTransactionVariables, DeleteInventoryTransactionData, DeleteInventoryTransactionVariables, GetInventoryTransactionData, GetInventoryTransactionVariables, ListInventoryTransactionsData, CreatePurchaseOrderData, CreatePurchaseOrderVariables, UpdatePurchaseOrderData, UpdatePurchaseOrderVariables, DeletePurchaseOrderData, DeletePurchaseOrderVariables, GetPurchaseOrderData, GetPurchaseOrderVariables, ListPurchaseOrdersData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateProduct(options?: useDataConnectMutationOptions<CreateProductData, FirebaseError, CreateProductVariables>): UseDataConnectMutationResult<CreateProductData, CreateProductVariables>;
export function useCreateProduct(dc: DataConnect, options?: useDataConnectMutationOptions<CreateProductData, FirebaseError, CreateProductVariables>): UseDataConnectMutationResult<CreateProductData, CreateProductVariables>;

export function useUpdateProduct(options?: useDataConnectMutationOptions<UpdateProductData, FirebaseError, UpdateProductVariables>): UseDataConnectMutationResult<UpdateProductData, UpdateProductVariables>;
export function useUpdateProduct(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateProductData, FirebaseError, UpdateProductVariables>): UseDataConnectMutationResult<UpdateProductData, UpdateProductVariables>;

export function useDeleteProduct(options?: useDataConnectMutationOptions<DeleteProductData, FirebaseError, DeleteProductVariables>): UseDataConnectMutationResult<DeleteProductData, DeleteProductVariables>;
export function useDeleteProduct(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteProductData, FirebaseError, DeleteProductVariables>): UseDataConnectMutationResult<DeleteProductData, DeleteProductVariables>;

export function useGetProduct(vars: GetProductVariables, options?: useDataConnectQueryOptions<GetProductData>): UseDataConnectQueryResult<GetProductData, GetProductVariables>;
export function useGetProduct(dc: DataConnect, vars: GetProductVariables, options?: useDataConnectQueryOptions<GetProductData>): UseDataConnectQueryResult<GetProductData, GetProductVariables>;

export function useListProducts(options?: useDataConnectQueryOptions<ListProductsData>): UseDataConnectQueryResult<ListProductsData, undefined>;
export function useListProducts(dc: DataConnect, options?: useDataConnectQueryOptions<ListProductsData>): UseDataConnectQueryResult<ListProductsData, undefined>;

export function useCreateProductVariant(options?: useDataConnectMutationOptions<CreateProductVariantData, FirebaseError, CreateProductVariantVariables>): UseDataConnectMutationResult<CreateProductVariantData, CreateProductVariantVariables>;
export function useCreateProductVariant(dc: DataConnect, options?: useDataConnectMutationOptions<CreateProductVariantData, FirebaseError, CreateProductVariantVariables>): UseDataConnectMutationResult<CreateProductVariantData, CreateProductVariantVariables>;

export function useUpdateProductVariant(options?: useDataConnectMutationOptions<UpdateProductVariantData, FirebaseError, UpdateProductVariantVariables>): UseDataConnectMutationResult<UpdateProductVariantData, UpdateProductVariantVariables>;
export function useUpdateProductVariant(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateProductVariantData, FirebaseError, UpdateProductVariantVariables>): UseDataConnectMutationResult<UpdateProductVariantData, UpdateProductVariantVariables>;

export function useDeleteProductVariant(options?: useDataConnectMutationOptions<DeleteProductVariantData, FirebaseError, DeleteProductVariantVariables>): UseDataConnectMutationResult<DeleteProductVariantData, DeleteProductVariantVariables>;
export function useDeleteProductVariant(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteProductVariantData, FirebaseError, DeleteProductVariantVariables>): UseDataConnectMutationResult<DeleteProductVariantData, DeleteProductVariantVariables>;

export function useGetProductVariant(vars: GetProductVariantVariables, options?: useDataConnectQueryOptions<GetProductVariantData>): UseDataConnectQueryResult<GetProductVariantData, GetProductVariantVariables>;
export function useGetProductVariant(dc: DataConnect, vars: GetProductVariantVariables, options?: useDataConnectQueryOptions<GetProductVariantData>): UseDataConnectQueryResult<GetProductVariantData, GetProductVariantVariables>;

export function useListProductVariants(options?: useDataConnectQueryOptions<ListProductVariantsData>): UseDataConnectQueryResult<ListProductVariantsData, undefined>;
export function useListProductVariants(dc: DataConnect, options?: useDataConnectQueryOptions<ListProductVariantsData>): UseDataConnectQueryResult<ListProductVariantsData, undefined>;

export function useCreateSupplier(options?: useDataConnectMutationOptions<CreateSupplierData, FirebaseError, CreateSupplierVariables>): UseDataConnectMutationResult<CreateSupplierData, CreateSupplierVariables>;
export function useCreateSupplier(dc: DataConnect, options?: useDataConnectMutationOptions<CreateSupplierData, FirebaseError, CreateSupplierVariables>): UseDataConnectMutationResult<CreateSupplierData, CreateSupplierVariables>;

export function useUpdateSupplier(options?: useDataConnectMutationOptions<UpdateSupplierData, FirebaseError, UpdateSupplierVariables>): UseDataConnectMutationResult<UpdateSupplierData, UpdateSupplierVariables>;
export function useUpdateSupplier(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateSupplierData, FirebaseError, UpdateSupplierVariables>): UseDataConnectMutationResult<UpdateSupplierData, UpdateSupplierVariables>;

export function useDeleteSupplier(options?: useDataConnectMutationOptions<DeleteSupplierData, FirebaseError, DeleteSupplierVariables>): UseDataConnectMutationResult<DeleteSupplierData, DeleteSupplierVariables>;
export function useDeleteSupplier(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteSupplierData, FirebaseError, DeleteSupplierVariables>): UseDataConnectMutationResult<DeleteSupplierData, DeleteSupplierVariables>;

export function useGetSupplier(vars: GetSupplierVariables, options?: useDataConnectQueryOptions<GetSupplierData>): UseDataConnectQueryResult<GetSupplierData, GetSupplierVariables>;
export function useGetSupplier(dc: DataConnect, vars: GetSupplierVariables, options?: useDataConnectQueryOptions<GetSupplierData>): UseDataConnectQueryResult<GetSupplierData, GetSupplierVariables>;

export function useListSuppliers(options?: useDataConnectQueryOptions<ListSuppliersData>): UseDataConnectQueryResult<ListSuppliersData, undefined>;
export function useListSuppliers(dc: DataConnect, options?: useDataConnectQueryOptions<ListSuppliersData>): UseDataConnectQueryResult<ListSuppliersData, undefined>;

export function useCreateInventoryTransaction(options?: useDataConnectMutationOptions<CreateInventoryTransactionData, FirebaseError, CreateInventoryTransactionVariables>): UseDataConnectMutationResult<CreateInventoryTransactionData, CreateInventoryTransactionVariables>;
export function useCreateInventoryTransaction(dc: DataConnect, options?: useDataConnectMutationOptions<CreateInventoryTransactionData, FirebaseError, CreateInventoryTransactionVariables>): UseDataConnectMutationResult<CreateInventoryTransactionData, CreateInventoryTransactionVariables>;

export function useDeleteInventoryTransaction(options?: useDataConnectMutationOptions<DeleteInventoryTransactionData, FirebaseError, DeleteInventoryTransactionVariables>): UseDataConnectMutationResult<DeleteInventoryTransactionData, DeleteInventoryTransactionVariables>;
export function useDeleteInventoryTransaction(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteInventoryTransactionData, FirebaseError, DeleteInventoryTransactionVariables>): UseDataConnectMutationResult<DeleteInventoryTransactionData, DeleteInventoryTransactionVariables>;

export function useGetInventoryTransaction(vars: GetInventoryTransactionVariables, options?: useDataConnectQueryOptions<GetInventoryTransactionData>): UseDataConnectQueryResult<GetInventoryTransactionData, GetInventoryTransactionVariables>;
export function useGetInventoryTransaction(dc: DataConnect, vars: GetInventoryTransactionVariables, options?: useDataConnectQueryOptions<GetInventoryTransactionData>): UseDataConnectQueryResult<GetInventoryTransactionData, GetInventoryTransactionVariables>;

export function useListInventoryTransactions(options?: useDataConnectQueryOptions<ListInventoryTransactionsData>): UseDataConnectQueryResult<ListInventoryTransactionsData, undefined>;
export function useListInventoryTransactions(dc: DataConnect, options?: useDataConnectQueryOptions<ListInventoryTransactionsData>): UseDataConnectQueryResult<ListInventoryTransactionsData, undefined>;

export function useCreatePurchaseOrder(options?: useDataConnectMutationOptions<CreatePurchaseOrderData, FirebaseError, CreatePurchaseOrderVariables>): UseDataConnectMutationResult<CreatePurchaseOrderData, CreatePurchaseOrderVariables>;
export function useCreatePurchaseOrder(dc: DataConnect, options?: useDataConnectMutationOptions<CreatePurchaseOrderData, FirebaseError, CreatePurchaseOrderVariables>): UseDataConnectMutationResult<CreatePurchaseOrderData, CreatePurchaseOrderVariables>;

export function useUpdatePurchaseOrder(options?: useDataConnectMutationOptions<UpdatePurchaseOrderData, FirebaseError, UpdatePurchaseOrderVariables>): UseDataConnectMutationResult<UpdatePurchaseOrderData, UpdatePurchaseOrderVariables>;
export function useUpdatePurchaseOrder(dc: DataConnect, options?: useDataConnectMutationOptions<UpdatePurchaseOrderData, FirebaseError, UpdatePurchaseOrderVariables>): UseDataConnectMutationResult<UpdatePurchaseOrderData, UpdatePurchaseOrderVariables>;

export function useDeletePurchaseOrder(options?: useDataConnectMutationOptions<DeletePurchaseOrderData, FirebaseError, DeletePurchaseOrderVariables>): UseDataConnectMutationResult<DeletePurchaseOrderData, DeletePurchaseOrderVariables>;
export function useDeletePurchaseOrder(dc: DataConnect, options?: useDataConnectMutationOptions<DeletePurchaseOrderData, FirebaseError, DeletePurchaseOrderVariables>): UseDataConnectMutationResult<DeletePurchaseOrderData, DeletePurchaseOrderVariables>;

export function useGetPurchaseOrder(vars: GetPurchaseOrderVariables, options?: useDataConnectQueryOptions<GetPurchaseOrderData>): UseDataConnectQueryResult<GetPurchaseOrderData, GetPurchaseOrderVariables>;
export function useGetPurchaseOrder(dc: DataConnect, vars: GetPurchaseOrderVariables, options?: useDataConnectQueryOptions<GetPurchaseOrderData>): UseDataConnectQueryResult<GetPurchaseOrderData, GetPurchaseOrderVariables>;

export function useListPurchaseOrders(options?: useDataConnectQueryOptions<ListPurchaseOrdersData>): UseDataConnectQueryResult<ListPurchaseOrdersData, undefined>;
export function useListPurchaseOrders(dc: DataConnect, options?: useDataConnectQueryOptions<ListPurchaseOrdersData>): UseDataConnectQueryResult<ListPurchaseOrdersData, undefined>;
