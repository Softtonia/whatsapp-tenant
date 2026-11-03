import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  sku: z.string().min(2, "SKU identifier is required"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  currency: z.string().default("INR"),
  description: z.string().min(5, "Product description must be at least 5 characters"),
  category: z.string().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
  stock_quantity: z.coerce.number().int().min(0, "Stock cannot be negative").default(0),
  image_url: z.string().url("Must be a valid image URL").optional().or(z.literal("")),
});

export type ProductFormData = z.infer<typeof productSchema>;

