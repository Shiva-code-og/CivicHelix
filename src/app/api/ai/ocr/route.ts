// ==============================================================================
// POST /api/ai/ocr
// Multimodal Vision OCR Engine for Indian Legal Deeds, Stamp Papers & Civic Notices
// Powered by Google Gemini Vision with intelligent fallback
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

export async function POST(req: NextRequest) {
  try {
    let base64Data = '';
    let mimeType = 'image/jpeg';
    let userProvidedKey = '';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      userProvidedKey = (formData.get('apiKey') as string) || '';

      if (!file) {
        return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
      }

      mimeType = file.type || 'image/jpeg';
      const arrayBuffer = await file.arrayBuffer();
      base64Data = Buffer.from(arrayBuffer).toString('base64');
    } else {
      const body = await req.json();
      if (!body.imageBase64) {
        return NextResponse.json({ error: 'Missing imageBase64 data' }, { status: 400 });
      }
      userProvidedKey = body.customApiKey || '';
      mimeType = body.mimeType || 'image/jpeg';
      // Strip data:image/...;base64, prefix if present
      base64Data = body.imageBase64.replace(/^data:[^;]+;base64,/, '');
    }

    const apiKey =
      userProvidedKey.trim() ||
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.GOOGLE_API_KEY?.trim();

    if (!apiKey || apiKey === 'your-gemini-api-key-from-google-ai-studio') {
      return NextResponse.json(
        {
          success: false,
          fallbackRequired: true,
          error: 'GEMINI_API_KEY is not configured in .env',
          message:
            'Please configure your GEMINI_API_KEY in .env or pass a temporary key to test live AI Vision extraction.',
        },
        { status: 200 }
      );
    }

    const prompt = `You are a world-class Optical Character Recognition (OCR) and document comprehension expert specializing in Indian legal documents, government deeds (Deed of Trust, Sale Deed, Gift Deed, Lease), Non-Judicial stamp papers of Indian states (West Bengal, Delhi, Maharashtra, etc.), Sub-Registrar endorsement stamps, and municipal civic notices.

Carefully inspect every section of this document image:
1. Extract the verbatim text with high precision. Ignore cosmetic guilloché security patterns, but accurately read text, serial stamps, Sub-Registrar seals, registration endorsements, names, dates, financial amounts, and property boundaries.
2. Structure the key legal & civic entities.

Respond STRICTLY with a valid JSON object in this exact schema (no additional markdown or conversational text):
{
  "documentType": "string (e.g. DEED OF TRUST, SALE DEED, MUNICIPAL NOTICE, AFFIDAVIT)",
  "stateOrAuthority": "string (e.g. West Bengal, Govt of NCT of Delhi, etc.)",
  "stampValue": "string (e.g. Rs. 500, Rs. 5000, or N/A)",
  "registrationNumbers": ["string array of stamp numbers, serial codes, e.g. 'IV 249', '6067', 'H 471460', 'I 4088/16']",
  "executionDate": "string (e.g. 11 July 2014, 17 May 2016)",
  "parties": [
    {
      "role": "string (e.g. Settlor / Founder / Purchaser / Seller / Authorized Representative)",
      "name": "string (full name and parentage/institution)",
      "address": "string (address, village, district, pin)"
    }
  ],
  "propertyOrArea": "string (e.g. 11.347 Decimals / 459.369 SQM / 4942.8 Sq. ft. / Mouza-Dafahat, J.L. No. 56)",
  "valuation": "string (e.g. Total Market Value Rs. 8,19,112/- or N/A)",
  "summary": "string (2-3 sentences concise factual summary of the deed / notice for civic administrative record)",
  "fullText": "string (complete, clean verbatim transcript of all readable printed and stamped text on the document in logical order)"
}`;

    // Try models in order: gemini-2.0-flash, then fallback to gemini-1.5-flash
    let lastError: any = null;

    for (const modelName of GEMINI_MODELS) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          lastError = new Error(`Gemini API [${modelName}] returned ${response.status}: ${errText}`);
          console.warn(`[OCR API] Gemini ${modelName} failed, attempting next model...`, errText);
          continue;
        }

        const jsonRes = await response.json();
        const candidate = jsonRes.candidates?.[0];
        const rawContent = candidate?.content?.parts?.[0]?.text;

        if (!rawContent) {
          throw new Error('No text content returned by Gemini Vision.');
        }

        // Parse extracted JSON
        let parsedData: any;
        try {
          const cleanedJson = rawContent
            .replace(/^```json\s*/, '')
            .replace(/^```\s*/, '')
            .replace(/```$/, '')
            .trim();
          parsedData = JSON.parse(cleanedJson);
        } catch (parseErr) {
          parsedData = {
            documentType: 'LEGAL_DOCUMENT',
            fullText: rawContent,
            summary: rawContent.slice(0, 200) + '...',
          };
        }

        return NextResponse.json({
          success: true,
          method: `gemini-vision (${modelName})`,
          data: parsedData,
        });
      } catch (err: any) {
        lastError = err;
      }
    }

    console.error('[OCR API] All Gemini models failed:', lastError);
    return NextResponse.json(
      {
        success: false,
        fallbackRequired: true,
        error: lastError?.message || 'Gemini Vision extraction failed.',
      },
      { status: 502 }
    );
  } catch (error: any) {
    console.error('[OCR API] Fatal error processing OCR request:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error during OCR processing.',
      },
      { status: 500 }
    );
  }
}
