export const clothingColors = [
  { name: "Red", backgroundColor: "#FFA5A5", borderColor: "#FF0000" },
  { name: "Pink", backgroundColor: "#FFB4DD", borderColor: "#FF59B4" },
  { name: "Orange", backgroundColor: "#FFC37F", borderColor: "#FB6704" },
  { name: "Yellow", backgroundColor: "#FFEF75", borderColor: "#FFD000" },
  { name: "Green", backgroundColor: "#BDFFC9", borderColor: "#03C75A" },
  { name: "Blue", backgroundColor: "#A3C5FF", borderColor: "#417AFF" },
  { name: "Navy", backgroundColor: "#003791", borderColor: "#003791" },
  { name: "Purple", backgroundColor: "#E4B6FF", borderColor: "#A100FF" },
  { name: "White", backgroundColor: "#FFFFFF", borderColor: "#6B7280" },
  { name: "Beige", backgroundColor: "#F3D3B8", borderColor: "#B78F6D" },
  { name: "Gray", backgroundColor: "#D5D5D5", borderColor: "#626877" },
  { name: "Brown", backgroundColor: "#D5B08F", borderColor: "#977557" },
  { name: "Black", backgroundColor: "#000000", borderColor: "#000000" },
];

export const clothingCategories = [
  "T-shirt",
  "Shirt",
  "Knit",
  "Hoodie",
  "Vest",
  "Cardigan",
  "Pants",
  "Shorts",
  "Skirt",
  "Dress",
  "Jacket",
  "Coat",
  "Padding",
];

export const clothingCategoryGroups = [
  { title: "Tops", categories: ["T-shirt", "Shirt", "Blouse", "Knit", "Hoodie", "Vest"] },
  { title: "Outwears", categories: ["Cardigan", "Jacket", "Coat", "Padding"] },
  { title: "Bottoms", categories: ["Skirt", "Pants", "Shorts"] },
  { title: "Dresses", categories: ["Dress"] },
];

export function splitIntoChipRows<T>(items: T[], columnCount = 4) {
  return Array.from({ length: Math.ceil(items.length / columnCount) }, (_, rowIndex) =>
    items.slice(rowIndex * columnCount, (rowIndex + 1) * columnCount),
  );
}

export const clothingCategoryRows = [
  clothingCategories.slice(0, 3),
  clothingCategories.slice(3, 6),
  clothingCategories.slice(6, 10),
  clothingCategories.slice(10, 13),
];
