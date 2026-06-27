import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.enum(["on", "true", "1", "yes"]).optional().transform((v) => v !== undefined),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const specificationsSchema = z
  .object({
    compatibility: z.string().trim().optional(),
    material: z.string().trim().optional(),
    color: z.string().trim().optional(),
    chargingSpeed: z.string().trim().optional(),
    cableLength: z.string().trim().optional(),
    warranty: z.string().trim().optional(),
    features: z.array(z.string()).optional(),
  })
  .optional();

export const productSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters"),
  slug: z.string().trim().min(2).optional(),
  description: z.string().trim().optional(),
  categoryId: z.number().int().positive().optional().nullable(),
  brand: z.string().trim().optional(),
  price: z.number().min(0, "Price must be 0 or more"),
  salePrice: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0).default(0),
  rating: z.number().min(0).max(5).default(4.5),
  reviewCount: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  enabled: z.boolean().default(true),
  specifications: specificationsSchema,
  images: z.array(z.string()).default([]),
});
export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  slug: z.string().trim().min(2).optional(),
  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Name is required"),
  email: z.string().email("Valid email is required").or(z.literal("")).optional(),
  phone: z.string().trim().min(6, "Valid phone is required"),
  address: z.string().trim().min(5, "Address is required"),
  city: z.string().trim().optional(),
  paymentMethod: z.enum(["cod", "bank", "whatsapp"]).default("cod"),
  note: z.string().trim().optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
