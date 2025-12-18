import { NextRequest, NextResponse } from "next/server";
import { getSuggestions, addSuggestion, voteSuggestion, deleteSuggestion } from "@/lib/redis";
import { Suggestion } from "@/types";

export const dynamic = 'force-dynamic';

// GET - Onerileri getir
export async function GET() {
  try {
    const suggestions = await getSuggestions();
    // Oy sayisina gore sirala
    suggestions.sort((a, b) => b.votes.length - a.votes.length);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("GET /api/oneriler error:", error);
    return NextResponse.json({ error: "Oneriler yuklenemedi" }, { status: 500 });
  }
}

// POST - Yeni oneri ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.text || !body.text.trim()) {
      return NextResponse.json({ error: "Oneri metni gerekli" }, { status: 400 });
    }

    if (!body.submittedBy || !body.submittedBy.trim()) {
      return NextResponse.json({ error: "Isim gerekli" }, { status: 400 });
    }

    if (!body.type || !["restaurant", "food"].includes(body.type)) {
      return NextResponse.json({ error: "Gecersiz oneri tipi" }, { status: 400 });
    }

    const suggestion: Suggestion = {
      id: crypto.randomUUID(),
      type: body.type,
      text: body.text.trim(),
      submittedBy: body.submittedBy.trim(),
      votes: [body.submittedBy.trim()], // Onereni otomatik oy verir
      createdAt: Date.now(),
    };

    const success = await addSuggestion(suggestion);

    if (success) {
      return NextResponse.json({ success: true, suggestion });
    } else {
      return NextResponse.json({ error: "Oneri eklenemedi" }, { status: 500 });
    }
  } catch (error) {
    console.error("POST /api/oneriler error:", error);
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
  }
}

// PUT - Oy ver/geri al
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.suggestionId) {
      return NextResponse.json({ error: "Oneri ID gerekli" }, { status: 400 });
    }

    if (!body.voterName || !body.voterName.trim()) {
      return NextResponse.json({ error: "Isim gerekli" }, { status: 400 });
    }

    const success = await voteSuggestion(body.suggestionId, body.voterName.trim());

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Oy verilemedi" }, { status: 500 });
    }
  } catch (error) {
    console.error("PUT /api/oneriler error:", error);
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
  }
}

// DELETE - Oneri sil
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Oneri ID gerekli" }, { status: 400 });
    }

    const success = await deleteSuggestion(id);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Oneri silinemedi" }, { status: 500 });
    }
  } catch (error) {
    console.error("DELETE /api/oneriler error:", error);
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
  }
}
