export interface SampleDish {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  description: string;
}

export const SAMPLE_DISHES: SampleDish[] = [
  {
    id: "salmon-bowl",
    name: "Bowl de Salmón con Quinoa y Aguacate",
    category: "Pescados & Granos",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    description: "Salmón a la plancha, quinoa, aguacate, edamames, sésamo y vinagreta.",
  },
  {
    id: "chicken-salad",
    name: "Ensalada Mediterránea con Pollo y Queso Feta",
    category: "Aves & Ensaladas",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    description: "Pechuga a la plancha, hojas verdes, tomate cherry, pepino, aceitunas y feta.",
  },
  {
    id: "oatmeal-berries",
    name: "Porridge de Avena con Frutos Rojos y Chía",
    category: "Desayunos Saludables",
    imageUrl: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80",
    description: "Avena integral cocida en bebida de almendra, arándanos, nueces y semillas.",
  },
  {
    id: "steak-veggies",
    name: "Solomillo con Espárragos y Batata Asada",
    category: "Carnes Magras",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    description: "Corte magro a la brasa con espárragos trigueros y cubos de batata al horno.",
  },
];
