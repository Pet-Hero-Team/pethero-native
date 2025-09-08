import { ChatAnthropic } from "@langchain/anthropic";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

const SYSTEM_PROMPT = `
You are a friendly, empathetic, and professional AI veterinarian assistant. Your role is to analyze a pet's health data and provide a personalized, practical, and actionable health report for the owner.

You MUST respond ONLY in the following JSON format. Do not include any other text, explanations, or markdown formatting outside of the JSON object.
All text values inside the JSON object MUST be written in Korean.

Today's date is: ${new Date().toISOString().split("T")[0]}

\`\`\`json
{{
  "health_summary": "Analyze all the information and provide a 2-3 sentence summary of the pet's overall health status.",
  "breed_risk_analysis": "Based on the breed_name, provide a brief analysis of common hereditary diseases with 1-2 practical prevention tips.",
  "detailed_analysis_and_tips": [
    {{ 
      "topic": "A key health issue identified from the health_history (e.g., '슬개골 탈구 관리')", 
      "analysis": "A brief analysis based on the specific 'opinion' and 'disease' from the health record.",
      "tip": "A very specific and actionable care tip. For '슬개골 탈구가 진행중입니다', you MUST advise something like: '슬개골 탈구 진행 소견이 있었네요. 미끄러운 바닥에 매트를 깔아주고, 침대나 소파에 계단을 놓아주어 관절 부담을 줄이는 것이 매우 중요합니다.'"
    }}
  ],
  "checkup_recommendation": "Find the most recent health record with the disease '정기검진/접종'. Calculate the months passed since that record's 'date' compared to today's date. Provide a specific recommendation including the last visit date. For example, if the last checkup was on '2025-01-08' and today is '2025-09-08', respond: '마지막 건강검진(2025년 1월 8일)으로부터 8개월이 지났습니다. 6개월~1년 주기의 정기 검진을 위해 동물병원 방문을 추천드립니다.' If there's no checkup record, respond: '정기적인 건강 상태 확인을 위해 동물병원에서 건강검진을 받아보시는 것을 추천합니다.'",
  "supplement_recommendation": [
    {{ "ingredient": "Recommended supplement ingredient based on analysis (e.g., Glucosamine)", "reason": "A brief reason for recommending it." }}
  ],
  "disclaimer": "이 내용은 전문적인 수의학적 진단을 대체할 수 없으며, 정확한 진단은 반드시 동물병원과 상담하세요."
}}
\`\`\`
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { record } = await req.json();
  const pet_id = record?.pet_id;
  const user_id = record?.user_id;

  try {
    if (!pet_id || !user_id) {
      throw new Error(`Pet ID or User ID not found in webhook payload.`);
    }

    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("PETHERO_SERVICE_ROLE_KEY")!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: petData, error: petError } = await supabaseAdmin
      .from("pets")
      .select("*, animal_breeds(breed_name)")
      .eq("id", pet_id)
      .single();
    if (petError) throw new Error(`Pet not found: ${petError.message}`);
    if (petData.user_id !== user_id) throw new Error("Ownership verification failed.");

    const { data: healthHistory, error: recordsError } = await supabaseAdmin
      .from("health_records")
      .select("diagnosis_date, doctor_opinion, disease_categories(name)")
      .eq("pet_id", pet_id);
    if (recordsError) throw new Error(`Health records fetch failed: ${recordsError.message}`);

    const { data: breedRisks, error: breedRisksError } = await supabaseAdmin
      .from("breed_disease_map")
      .select("disease_categories(name)")
      .eq("breed_id", petData.breed_id);
    if (breedRisksError) throw new Error(`Breed risks fetch failed: ${breedRisksError.message}`);

    const contextPacket = {
      petInfo: {
        name: petData.name,
        age: petData.birthday === "모름" ? null : new Date().getFullYear() - new Date(petData.birthday).getFullYear(),
        animal_type: petData.category,
        breed_name: petData.animal_breeds?.breed_name || "믹스",
      },
      health_history:
        healthHistory?.map((r) => ({
          date: r.diagnosis_date,
          disease: r.disease_categories.name,
          opinion: r.doctor_opinion,
        })) || [],
      breed_risks: breedRisks?.map((r) => r.disease_categories.name) || [],
    };

    const llm = new ChatAnthropic({
      apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
      // ⭐️⭐️⭐️ 공식 문서에 나온 최신 Haiku 모델 이름으로 변경 ⭐️⭐️⭐️
      modelName: "claude-3-5-haiku-20241022",
      temperature: 0.3,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_PROMPT],
      [
        "user",
        "Please generate a health report based on the following pet information:\n\n[Pet Information]\n{context}",
      ],
    ]);

    const outputParser = new JsonOutputParser();
    const chain = prompt.pipe(llm).pipe(outputParser);
    const aiResponse = await chain.invoke({ context: JSON.stringify(contextPacket, null, 2) });

    const { error: upsertError } = await supabaseAdmin.from("pet_ai_reports").upsert(
      {
        pet_id: pet_id,
        report_data: aiResponse,
        status: "completed",
        last_updated_at: new Date().toISOString(),
      },
      { onConflict: "pet_id" }
    );
    if (upsertError) throw new Error(`Failed to save AI report: ${upsertError.message}`);

    return new Response(JSON.stringify({ message: "Success" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Function Error:", error.message);
    if (pet_id) {
      const supabaseAdminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("PETHERO_SERVICE_ROLE_KEY")!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      await supabaseAdminClient
        .from("pet_ai_reports")
        .upsert({ pet_id, status: "failed", error_message: error.message }, { onConflict: "pet_id" });
    }
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
