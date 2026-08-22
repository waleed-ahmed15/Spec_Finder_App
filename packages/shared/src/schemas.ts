import { z } from 'zod';

export const MoistureClass = z.enum(['none', 'H2', 'H3']);
export const Application = z.enum(['interior_wall', 'ceiling', 'floor', 'facade']);
export const EdgeProfile = z.enum(['tapered', 'square', 'recessed', 'none']);
export const FacePaper = z.enum(['ivory', 'pink', 'green', 'grey', 'none']);
export const ProductCategory = z.enum([
  'gypsum_board',
  'cement_board',
  'insulation',
  'ceiling_tile',
  'profile',
  'filler',
  'accessory',
]);
export const DocumentType = z.enum(['TDS', 'SDS', 'DoP', 'EPD', 'CAD', 'BIM']);
export const SortOption = z.enum(['relevance', 'name_asc', 'name_desc', 'fire_desc', 'rw_desc']);
export const MatchStatus = z.enum(['meets', 'exceeds', 'missing']);

export const VariantSchema = z.object({
  materialNumber: z.string(),
  widthMm: z.number().int(),
  lengthMm: z.number().int(),
  thicknessMm: z.number(),
  weightKg: z.number(),
  weightPerSqmKg: z.number(),
  piecesPerPallet: z.number().int().nullable(),
  coverageSqm: z.number(),
});

export const DocumentSchema = z.object({
  type: DocumentType,
  title: z.string(),
  fileType: z.literal('PDF'),
  sizeKb: z.number(),
  pages: z.number().int().nullable(),
  updatedAt: z.string(),
  url: z.string(),
});

export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  category: ProductCategory,
  family: z.string(),
  facePaper: FacePaper,
  applications: z.array(Application).min(1),
  areaOfApplication: z.enum(['interior', 'exterior', 'both']),

  performance: z.object({
    fireResistanceMin: z.number().int().nullable(),
    reactionToFireClass: z.string().nullable(),
    soundReductionRw: z.number().int().nullable(),
    moistureClass: MoistureClass,
    impactResistanceClass: z.string().nullable(),
    thermalConductivity: z.number().nullable(),
    maxHeightM: z.number().nullable(),
  }),

  standards: z.array(z.string()),
  sustainability: z.object({
    recycledContentPct: z.number().nullable(),
    hasEpd: z.boolean(),
  }),
  edgeProfile: EdgeProfile,
  variants: z.array(VariantSchema).min(1),
  documents: z.array(DocumentSchema),
  imageUrl: z.string(),
});

export const MatchCriterionSchema = z.object({
  key: z.string(),
  label: z.string(),
  required: z.union([z.number(), z.string()]),
  actual: z.union([z.number(), z.string(), z.null()]),
  status: MatchStatus,
  unit: z.string(),
});

export const ProductMatchSchema = z.object({
  score: z.number(),
  criteria: z.array(MatchCriterionSchema),
});

export const ProductListItemSchema = z.object({
  product: ProductSchema,
  match: ProductMatchSchema,
});

export const ProductsQuerySchema = z.object({
  q: z.string().optional(),
  application: z.array(Application).optional(),
  fireMin: z.coerce.number().int().min(0).max(120).optional(),
  rwMin: z.coerce.number().int().min(30).max(65).optional(),
  moisture: MoistureClass.optional(),
  thicknessMax: z.coerce.number().positive().optional(),
  category: z.array(ProductCategory).optional(),
  sort: SortOption.default('relevance'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
});

export const ProductsResponseSchema = z.object({
  items: z.array(ProductListItemSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
  appliedFilters: z.record(z.string(), z.unknown()),
});

export const FacetsResponseSchema = z.object({
  categories: z.array(z.object({ value: ProductCategory, count: z.number().int() })),
  applications: z.array(z.object({ value: Application, count: z.number().int() })),
  fireResistance: z.array(z.object({ value: z.number().int(), count: z.number().int() })),
  moistureClasses: z.array(z.object({ value: MoistureClass, count: z.number().int() })),
});

export type MoistureClass = z.infer<typeof MoistureClass>;
export type Application = z.infer<typeof Application>;
export type EdgeProfile = z.infer<typeof EdgeProfile>;
export type FacePaper = z.infer<typeof FacePaper>;
export type ProductCategory = z.infer<typeof ProductCategory>;
export type DocumentType = z.infer<typeof DocumentType>;
export type SortOption = z.infer<typeof SortOption>;
export type MatchStatus = z.infer<typeof MatchStatus>;
export type Variant = z.infer<typeof VariantSchema>;
export type Document = z.infer<typeof DocumentSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type MatchCriterion = z.infer<typeof MatchCriterionSchema>;
export type ProductMatch = z.infer<typeof ProductMatchSchema>;
export type ProductListItem = z.infer<typeof ProductListItemSchema>;
export type ProductsQuery = z.infer<typeof ProductsQuerySchema>;
export type ProductsResponse = z.infer<typeof ProductsResponseSchema>;
export type FacetsResponse = z.infer<typeof FacetsResponseSchema>;

export const ProductsArraySchema = z.array(ProductSchema);
