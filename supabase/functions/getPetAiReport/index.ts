import { ChatAnthropic } from "@langchain/anthropic";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

// ⭐️⭐️⭐️ JSON 예시의 중괄호를 모두 이중 중괄호로 변경하여 LangChain의 파싱 오류를 해결합니다. ⭐️⭐️⭐️
const SYSTEM_PROMPT = `
You are an expert AI pet healthcare manager. Your role is to analyze pet health data and provide personalized advice for the owner.
You MUST respond ONLY in the following JSON format. Do not include any other text, explanations, or markdown formatting outside of the JSON object.
All text values inside the JSON object MUST be written in Korean.

\`\`\`json
{{
  "health_summary": "A 2-3 sentence summary of the pet's health status based on its age, breed, and medical records, highlighting key points for the owner.",
  "breed_risk_analysis": "An analysis of diseases the pet's breed is generally susceptible to, with 1-2 daily prevention tips.",
  "record_risk_analysis": "Based on past medical records, an analysis of potential future health risks or recurrences. If there are no records, respond with '관련 기록 없음'.",
  "supplement_recommendation": [
    {{ "ingredient": "추천 영양제 성분 (예: 글루코사민, 오메가-3)", "reason": "해당 성분을 추천하는 이유 (간략하게)." }},
    {{ "ingredient": "두 번째 추천 영양제 성분", "reason": "추천 이유" }}
  ],
  "disclaimer": "이 내용은 전문적인 수의학적 진단을 대체할 수 없으며, 정확한 진단은 반드시 동물병원과 상담하세요."
}}
\`\`\`
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let pet_id;

  try {
    const requestBody = await req.json();
    pet_id = requestBody.record?.pet_id;
    const user_id = requestBody.record?.user_id;

    if (!pet_id || !user_id) {
      throw new Error(
        `Pet ID or User ID not found in webhook payload. Payload received: ${JSON.stringify(requestBody)}`
      );
    }

    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("PETHERO_SERVICE_ROLE_KEY")!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: petData, error: petError } = await supabaseAdmin
      .from("pets")
      .select("*, animal_breeds(breed_name)")
      .eq("id", pet_id)
      .single();

    if (petError) throw new Error(`Pet not found: ${petError.message}`);
    if (petData.user_id !== user_id) throw new Error("Ownership verification failed.");

    const { data: healthHistory } = await supabaseAdmin
      .from("health_records")
      .select("diagnosis_date, disease_categories(name)")
      .eq("pet_id", pet_id);

    const { data: breedRisks } = await supabaseAdmin
      .from("breed_disease_map")
      .select("disease_categories(name)")
      .eq("breed_id", petData.breed_id);

    const contextPacket = {
      petInfo: {
        name: petData.name,
        age: petData.birthday === "모름" ? null : new Date().getFullYear() - new Date(petData.birthday).getFullYear(),
        animal_type: petData.category,
        breed_name: petData.animal_breeds?.breed_name || "믹스",
      },
      health_history: healthHistory?.map((r) => ({ date: r.diagnosis_date, disease: r.disease_categories.name })) || [],
      breed_risks: breedRisks?.map((r) => r.disease_categories.name) || [],
    };

    const llm = new ChatAnthropic({
      apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
      modelName: "claude-3-haiku-20240307",
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
  } catch (error) {
    console.error("Function Error:", error.message);
    if (pet_id) {
      const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("PETHERO_SERVICE_ROLE_KEY")!, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      await supabaseAdmin
        .from("pet_ai_reports")
        .upsert({ pet_id, status: "failed", error_message: error.message }, { onConflict: "pet_id" });
    }
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
