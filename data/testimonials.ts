export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  project: string; // project slug, links to its case study
  placeholder?: boolean; // placeholders render only in development, never on the live site
};

// Add real, permitted quotes here. The Testimonials section hides itself when nothing is publishable.
// The two entries below are PLACEHOLDERS so the layout can be checked locally: they are never shown in production.
export const testimonials: Testimonial[] = [
  {
    quote: "[PLACEHOLDER QUOTE — replace with a real, permitted quote about working on this project.]",
    name: "[Name]",
    role: "[Role, organisation]",
    project: "greentrack",
    placeholder: true,
  },
  {
    quote: "[PLACEHOLDER QUOTE — replace with a real, permitted quote.]",
    name: "[Name]",
    role: "[Role, organisation]",
    project: "beeftrace",
    placeholder: true,
  },
];

export const publishableTestimonials = () =>
  testimonials.filter((t) => !t.placeholder || process.env.NODE_ENV !== "production");
