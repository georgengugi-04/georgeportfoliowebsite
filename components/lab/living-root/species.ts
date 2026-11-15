export type SpeciesId = "morpho" | "monarch" | "swallowtail";

export const SPECIES_INFO: Record<SpeciesId, { name: string; latin: string; blurb: string }> = {
  morpho: {
    name: "Blue-morpho-inspired",
    latin: "after Morpho, Central and South America",
    blurb:
      "The upper wings of real Morpho butterflies look blue because microscopic scales reflect light, not because of blue pigment. Fold the wings and the dull brown underside with eyespots is all a predator sees. This is an inspired form, not a field-guide model.",
  },
  monarch: {
    name: "Monarch-inspired",
    latin: "after Danaus plexippus",
    blurb:
      "Orange wings with black veins and a white-spotted margin are a warning to predators. North American monarchs migrate thousands of kilometres. This one borrows the pattern, not the exact markings.",
  },
  swallowtail: {
    name: "Swallowtail-inspired",
    latin: "after the family Papilionidae",
    blurb:
      "Swallowtails are known for the tail-like extensions on their hindwings, and they often keep their wings fluttering while they feed. Real species vary a great deal, so this is a generic yellow-and-black form.",
  },
};
