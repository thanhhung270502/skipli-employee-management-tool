# Frontend Rules

Tech stack: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, TanStack Query, React Hook Form + Zod.

## Module Structure

Every feature lives under `src/modules/<module>/`:

```
src/modules/<module>/
├── index.ts            # public API: export hooks, layouts, pages, types ONLY
├── components/
│   ├── index.ts        # barrel (internal — NOT re-exported from root index)
│   └── *.tsx
├── constants/index.ts
├── hooks/
│   ├── index.ts
│   └── use-<name>.ts
├── layouts/index.tsx
├── pages/
│   ├── index.ts
│   └── <name>.page.tsx
├── types/index.ts
└── utils/index.ts
```

**Root `index.ts` rule**: export hooks/layouts/pages/types — **never** components.

## Domain Modules (SweetPixTiles)

| Module | Responsibility |
|--------|---------------|
| `catalog` | Product listing, filtering, search |
| `product` | Product detail, size/material selector |
| `editor` | Wall layout builder, photo upload |
| `cart` | Cart management, quantity updates |
| `checkout` | Order form, payment flow |
| `order` | Order history, order detail |
| `auth` | Login, register, forgot password |
| `account` | Profile, address book |
| `gallery-wall` | Gallery wall preview tool |

## Data Model Layer (`common/models/<domain>/`)

```
common/models/<domain>/
├── index.ts                  # barrel: export * from both files
├── <domain>-model.ts         # pure TypeScript types — zero runtime code
└── <domain>-api-model.ts     # APIDefinition constants
```

### `<domain>-model.ts` Rules

- Only `interface`, `type`, `enum` — zero runtime code
- Enum names: `E` prefix (e.g., `EProductStatus`, `EOrderState`)
- DB row types suffixed `Row` (snake_case fields)
- API-facing types suffixed `Object` (camelCase)
- Request/response: `<Action>Request` / `<Action>Response`
- Nullable fields: `T | null`, not `T | undefined`

```ts
// ✅ GOOD
export enum EOrderState { PENDING = "pending", COMPLETED = "completed" }
export interface ProductRow { id: string; name: string; price_cents: number }
export interface ProductObject { id: string; name: string; priceCents: number }
export interface AddToCartRequest { productId: string; quantity: number }
export interface AddToCartResponse { cart: CartObject }
```

### `<domain>-api-model.ts` Rules

- Constants: `SCREAMING_SNAKE_CASE` prefixed with `API_`
- Typed as `APIDefinition`
- `buildUrlPath` always a function

```ts
export const API_ADD_TO_CART: APIDefinition = {
  method: APIMethod.POST,
  baseUrl: APIBaseRoutes.CART,
  subUrl: "/add",
  requestBody: {} as AddToCartRequest,
  responseBody: {} as AddToCartResponse,
  buildUrlPath: () => `${APIBaseRoutes.CART}/add`,
};
```

## Shared Components — Always Prefer Over Native Elements

Check `src/shared/components/index.ts` before creating anything new.

| Need | Use | Never use |
|------|-----|-----------|
| Text / headings | `<Typography variant="..." />` | `<p>`, `<h1>`–`<h6>` |
| Clickable actions | `<Button variant="..." size="..." />` | `<button>` |
| Modal/overlay | `<Dialog>` + `<DialogContent>` | Custom modal |
| Text input | `<Input />` | `<input>` |
| Dropdown | `<Select />` | `<select>` |
| Badge | `<Badge />` | Custom badge spans |
| Skeleton loader | `<Skeleton />` | Custom shimmer divs |

**Button variants**: `primary`, `secondary`, `gray`, `outlined-primary`, `outlined-secondary`, `outlined-gray`, `text-primary`, `text-secondary`, `text-gray`

**Button sizes**: `xs`, `sm`, `md`, `lg`, `xl`

**Typography variants**: `display-xlarge`, `display-large`, `heading-lg`, `heading-md`, `heading-sm`, `body-xl`, `body-lg`, `body-md`, `body-sm`, `body-xs`

## Hooks (`hooks/use-<name>.ts`)

- Always start with `"use client"`
- Co-locate Zod schema + inferred type + hook in one file

```ts
"use client";

export const addToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().min(1).max(99),
});
export type AddToCartFormData = z.infer<typeof addToCartSchema>;

export const useAddToCartForm = () => {
  const methods = useForm<AddToCartFormData>({ resolver: zodResolver(addToCartSchema) });
  const onSubmit = methods.handleSubmit(async (data) => { /* call mutation */ });
  return { methods, onSubmit, isSubmitting: methods.formState.isSubmitting };
};
```

## Forms Pattern

```
Zod schema → z.infer type → useForm + zodResolver → FormProvider → RHFInput / RHFPassword / RHFCheckbox
```

## Mutations & Queries

- All mutations/queries live in `@/shared` (e.g., `useAddToCartMutation`, `useQueryProducts`)
- Module hooks consume them — never call `fetch` directly

## API Response Null Safety (CRITICAL)

```ts
// ✅ CORRECT
const response = await productApi.list()
setProducts(response?.products ?? [])

// ❌ WRONG — crashes if response is undefined
setProducts(response.products)
```

Catch blocks MUST reset state to safe defaults:

```ts
try {
  const response = await productApi.list()
  setProducts(response?.products ?? [])
} catch {
  setProducts([])  // reset, never leave stale
}
```

## File & Component Naming

| Item | Convention | Example |
|------|-----------|---------|
| Component files | `kebab-case.tsx` | `product-card.tsx` |
| Page files | `kebab-case.page.tsx` | `product-detail.page.tsx` |
| Hook files | `use-kebab-case.ts` | `use-add-to-cart.ts` |
| Component names | `PascalCase` | `ProductCard` |
| Page component names | `PascalCase` + `Page` suffix | `ProductDetailPage` |

## Build Check (CRITICAL)

Run `yarn build` before committing any `.tsx`/`.ts` changes. Catches unused imports, type errors, missing exports.

Every folder must have an `index.ts` using `export *`.
