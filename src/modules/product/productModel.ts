import { Type, type Static } from '@sinclair/typebox';
import { AuditFields } from 'src/appModule.interfaces';

const I18N_PATTERN = '^[a-z]{2}([_])?([A-Za-z]{2})?$';

// Localized Strings/Arrays
// TODO: Refactor
const i18nKeyType = Type.Record(Type.String({ pattern: I18N_PATTERN }), Type.String(), {
  additionalProperties: false,
  minProperties: 1
});
const i18nArrayKeyType = Type.Record(
  Type.String({ pattern: I18N_PATTERN }),
  Type.Array(
    Type.Object({
      text: Type.String(),
      suggestTokenizer: Type.Optional(Type.Object({ type: Type.String() }))
    })
  ),
  {
    additionalProperties: false,
    minProperties: 1
  }
);

// PRODUCT TYPES
export const ProductType = {
  BASE: 'base',
  VARIANT: 'variant',
  COMPOSITE: 'composite'
} as const;

// ENTITY
export const ProductModelSchema = Type.Object(
  {
    id: Type.String(),
    name: i18nKeyType,
    description: Type.Optional(i18nKeyType),
    sku: Type.Optional(Type.String()), // Optional in the base product
    slug: Type.Optional(i18nKeyType), // Optional in the variants
    searchKeywords: Type.Optional(i18nArrayKeyType), // TODO: Refactor
    categories: Type.Array(Type.String(), { default: [] }),
    attributes: Type.Any({ default: {} }),
    type: Type.Enum(ProductType), // BASE, VARIANT, COMPOSITE...
    parent: Type.Optional(Type.String()), // If this is a variant, the parent product id
    taxCategory: Type.Optional(Type.String()), // TODO: implement taxes
    ...AuditFields
  },
  { additionalProperties: false }
);
export type ProductModel = Static<typeof ProductModelSchema>;
