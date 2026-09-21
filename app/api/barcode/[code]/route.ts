import { NextRequest, NextResponse } from "next/server";
import { fetchProductFromOpenFoodFacts } from "@/lib/open-food-facts";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    if (!code) {
      return NextResponse.json(
        { error: "Código de barras no especificado" },
        { status: 400 }
      );
    }

    const product = await fetchProductFromOpenFoodFacts(code);
    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado en el registro internacional" },
        { status: 404 }
      );
    }

    return NextResponse.json(product, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error: any) {
    console.error("Error en /api/barcode/[code]:", error);
    return NextResponse.json(
      { error: "Error interno consultando código de barras" },
      { status: 500 }
    );
  }
}
