import React, { useRef, useState } from "react";
import "./App.css";

const categories = {
  mental_health: ["anxious","anxiety","depressed","depression","sad","hopeless","overwhelmed","mental","panic","cry","crying","worthless","suicide","self harm"],
  academic_stress: ["grades","exam","test","homework","school","failing","college","gpa","teacher","class","study","stressed","stress","sleep"],
  bullying: ["bullied","bullying","harassed","harassment","picked on","threatened","excluded","made fun"],
  food_insecurity: ["hungry","food","eating","lunch","afford","money","poor"],
  family_issues: ["parents","family","home","mom","dad","divorce","fighting","abuse"],
  social_isolation: ["lonely","alone","no friends","isolated","left out","no one"],
  grief: ["died","death","lost","grief","grieving","passed away","miss them"],
  general: [],
};

const messages = {
  mental_health: "What you're feeling is real, and it makes sense that you're struggling right now. You don't have to carry this alone — support is closer than it might seem. Taking the step to reach out, even here, takes courage. Please know there are people who want to help.",
  academic_stress: "School pressure can feel absolutely crushing, especially when it piles up all at once. It's okay to feel overwhelmed — that doesn't mean you're failing. You're doing more than you realize, and there are resources that can help lighten the load. Take a breath — one step at a time.",
  bullying: "No one deserves to be treated the way you're describing, full stop. What's happening to you is not okay, and it's not your fault. You deserve to feel safe at school and beyond. There are people who will take this seriously and help.",
  food_insecurity: "Worrying about food is an incredibly heavy burden to carry, especially while trying to focus on everything else. You're not alone in this, and there's no shame in needing support. Help is available, and you deserve access to it.",
  family_issues: "Family problems can make every other part of life feel harder to handle. Whatever is happening at home, your feelings about it are valid. You don't have to navigate this by yourself — support exists for exactly these situations.",
  social_isolation: "Feeling alone is one of the hardest things to sit with, and it can make everything feel heavier. Your need for connection is real and valid. There are people out there who want to know you — and resources that can help bridge that gap.",
  grief: "Losing someone is one of the most painful experiences there is, and grief doesn't follow a schedule. Whatever you're feeling right now — sadness, numbness, anger — it's all part of it. Please be gentle with yourself, and know that support is available when you're ready.",
  general: "Whatever you're going through, you don't have to face it alone. Reaching out is always the right move. Below are some resources that might help.",
};

const resourcesByCategory = {
  mental_health: [
    { name: "Crisis Text Line", description: "Free 24/7 mental health support via text.", contact: "Text HOME to 741741", type: "national" },
    { name: "988 Suicide & Crisis Lifeline", description: "Call or text for immediate crisis support.", contact: "Call or text 988", type: "national" },
  ],
  academic_stress: [
    { name: "Khan Academy", description: "Free tutoring and practice for any subject.", contact: "khanacademy.org", type: "national" },
    { name: "Crisis Text Line", description: "Free support if stress is becoming overwhelming.", contact: "Text HOME to 741741", type: "national" },
    { name: "School Counselor", description: "Can help with academic planning and stress.", contact: "Visit your front office", type: "school" },
    { name: "Peer Tutoring Program", description: "Ask if your school offers peer tutoring.", contact: "Ask your teacher or counselor", type: "school" },
  ],
  bullying: [
    { name: "StopBullying.gov", description: "Resources and guidance for students facing bullying.", contact: "stopbullying.gov", type: "national" },
    { name: "Crisis Text Line", description: "Free 24/7 support if bullying is affecting your mental health.", contact: "Text HOME to 741741", type: "national" },
    { name: "School Counselor", description: "Can help address bullying situations at your school.", contact: "Visit your front office", type: "school" },
    { name: "School Administration", description: "Report bullying directly to a trusted administrator.", contact: "Visit your front office", type: "school" },
  ],
  food_insecurity: [
    { name: "Feeding America", description: "Find local food banks and resources near you.", contact: "feedingamerica.org", type: "national" },
    { name: "211 Helpline", description: "Find local food, housing, and social services.", contact: "Call or text 211", type: "national" },
    { name: "School Lunch Program", description: "Free and reduced lunch may be available at your school.", contact: "Ask your school's front office", type: "school" },
  ],
  family_issues: [
    { name: "Crisis Text Line", description: "Free 24/7 support for any crisis including family issues.", contact: "Text HOME to 741741", type: "national" },
    { name: "Childhelp National Child Abuse Hotline", description: "Support for abuse or unsafe home situations.", contact: "1-800-422-4453", type: "national" },
  ],
  social_isolation: [
    { name: "Crisis Text Line", description: "Free 24/7 support when loneliness feels overwhelming.", contact: "Text HOME to 741741", type: "national" },
    { name: "Teen Line", description: "Talk to a teen volunteer who gets it.", contact: "Text TEEN to 839863", type: "national" },
    { name: "School Clubs & Activities", description: "Ask about joining a club or extracurricular to find your people.", contact: "Ask your counselor or front office", type: "school" },
  ],
  grief: [
    { name: "Crisis Text Line", description: "Free 24/7 grief and crisis support via text.", contact: "Text HOME to 741741", type: "national" },
    { name: "GriefShare", description: "Support groups for people dealing with loss.", contact: "griefshare.org", type: "national" },
  ],
  general: [
    { name: "Crisis Text Line", description: "Free 24/7 support for any struggle.", contact: "Text HOME to 741741", type: "national" },
    { name: "988 Suicide & Crisis Lifeline", description: "Call or text for immediate support.", contact: "Call or text 988", type: "national" },
  ],
};

function renderContact(contact) {
  const raw = String(contact || "");
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const isHttpUrl = /^https?:\/\//i.test(trimmed);
  const isWwwUrl = /^www\./i.test(trimmed);
  if (isHttpUrl || isWwwUrl) {
    const href = isWwwUrl ? "https://" + trimmed : trimmed;
    return (<a className="resource-contact-link" href={href} target="_blank" rel="noopener noreferrer">{raw}</a>);
  }

  const digitsOnly = trimmed.replace(/\D/g, "");
  if (digitsOnly.length >= 10) {
    const telHref = "tel:" + trimmed.replace(/[^\d+]/g, "");
    return (<a className="resource-contact-link" href={telHref}>{raw}</a>);
  }

  const numberMatches = trimmed.match(/\d+/g);
  const lastNumber = numberMatches?.[numberMatches.length - 1];
  if (lastNumber && lastNumber.length <= 6 && digitsOnly.length <= 6) {
    const start = trimmed.lastIndexOf(lastNumber);
    const before = trimmed.slice(0, start);
    const after = trimmed.slice(start + lastNumber.length);
    return (<>{before}<a className="resource-contact-link" href={`sms:${lastNumber}`}>{lastNumber}</a>{after}</>);
  }

  if (!/\s/.test(trimmed) && /\./.test(trimmed)) {
    const domainLike = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed);
    if (domainLike) {
      return (<a className="resource-contact-link" href={"https://" + trimmed} target="_blank" rel="noopener noreferrer">{raw}</a>);
    }
  }

  return raw;
}

function safeParseJSONObject(text) {
  if (typeof text !== "string") return { ok: false, error: "content_not_string", parsed: null };
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "");
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  const candidate = firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
    ? cleaned.slice(firstBrace, lastBrace + 1) : cleaned;
  try {
    return { ok: true, parsed: JSON.parse(candidate), error: null };
  } catch (err) {
    const candidateClean = candidate.replace(/,\s*([}\]])/g, "$1");
    try {
      return { ok: true, parsed: JSON.parse(candidateClean), error: null };
    } catch {
      return { ok: false, error: err?.message || "json_parse_error", parsed: null };
    }
  }
}

function getResponse(input) {
  const lower = input.toLowerCase();
  let matchedCategory = "general";
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => lower.includes(keyword.toLowerCase()))) {
      matchedCategory = category;
      break;
    }
  }
  return { message: messages[matchedCategory], category: matchedCategory, resources: resourcesByCategory[matchedCategory] };
}

const systemPrompt = `
You are ClearPath, a supportive guide for high school students.
When a student shares what they're struggling with, respond with ONLY a valid JSON object in this exact format, no preamble, no markdown:

{
  "message": "A warm, empathetic 3-4 sentence response that validates their feelings without being dramatic or clinical.",
  "resources": [
    {
      "name": "Resource Name",
      "description": "One sentence about what this is.",
      "contact": "phone number or website",
      "type": "national"
    }
  ]
}

Rules:
- Include exactly 2 national resources most relevant to the student's specific situation.
- Only include school resources (School Counselor, School Social Worker, Peer Tutoring, School Administration) if the issue is DIRECTLY school-related — like academic stress, bullying by classmates, or problems with teachers. Do NOT include school resources for gambling, grief, family issues, mental health, food insecurity, or anything not happening at school.
- Available national resources (use these exact names/contacts):
  - Crisis Text Line — Text HOME to 741741
  - 988 Suicide & Crisis Lifeline — Call or text 988
  - StopBullying.gov — stopbullying.gov
  - Khan Academy — khanacademy.org
  - Feeding America — feedingamerica.org
  - 211 Helpline — Call or text 211
  - Childhelp National Child Abuse Hotline — 1-800-422-4453
  - Teen Line — Text TEEN to 839863
  - GriefShare — griefshare.org
  - National Problem Gambling Helpline — 1-800-522-4700
  - SAMHSA National Helpline — 1-800-662-4357
- Output ONLY the JSON object. Nothing else.
`.trim();

const followUpSystemPrompt = `
You are ClearPath, a supportive mental health guide for high school students.
The student has already shared their situation and received initial guidance. They are now asking follow-up questions.
Respond warmly and conversationally. Validate their feelings and offer practical next steps.
Do NOT return JSON. Just respond in plain conversational text, 2-4 sentences max.
`.trim();

function App() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [initialUserInput, setInitialUserInput] = useState("");
  const [initialAssistantMessage, setInitialAssistantMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakStatus, setSpeakStatus] = useState("idle");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [inputShake, setInputShake] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const ttsRequestIdRef = useRef(0);

  const groqKey = process.env.REACT_APP_GROQ_KEY;
  const elevenVoiceId = process.env.REACT_APP_ELEVENLABS_VOICE_ID;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!input.trim()) {
      setError("Tell us what's going on first.");
      setInputShake(true);
      setTimeout(() => setInputShake(false), 400);
      return;
    }
    setIsLoading(true);
    setResponse(null);
    let groqRawContent = null;
    try {
      const groqKeyValue = process.env.REACT_APP_GROQ_KEY;
      if (!groqKeyValue) throw new Error("Missing REACT_APP_GROQ_KEY");
      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + groqKeyValue, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: input }],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });
      if (!groqResponse.ok) {
        const errText = await groqResponse.text().catch(() => "");
        throw new Error(`Groq request failed: ${errText || groqResponse.status}`);
      }
      const data = await groqResponse.json();
      const content = data?.choices?.[0]?.message?.content;
      groqRawContent = content;
      const parseResult = safeParseJSONObject(content);
      if (!parseResult.ok) throw new Error(`Invalid JSON from model: ${parseResult.error}`);
      const parsed = parseResult.parsed;
      if (!parsed || typeof parsed.message !== "string" || !Array.isArray(parsed.resources)) throw new Error("Malformed JSON from model");
      setResponse({ message: parsed.message, resources: parsed.resources });
      setInitialUserInput(input);
      setInitialAssistantMessage(parsed.message);
      setChatMessages([]);
      setChatInput("");
    } catch (err) {
      console.error("Groq main failed; falling back to keywords", { error: err?.message, groqContentPreview: typeof groqRawContent === "string" ? groqRawContent.slice(0, 600) : "" });
      const fallback = getResponse(input);
      setResponse({ message: fallback.message, resources: fallback.resources });
      setInitialUserInput(input);
      setInitialAssistantMessage(fallback.message);
      setChatMessages([]);
      setChatInput("");
    } finally {
      setIsLoading(false);
    }
  };

  const stopAudio = () => {
    ttsRequestIdRef.current += 1;
    try { if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; } } catch {}
    audioRef.current = null;
    if (audioUrlRef.current) { URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = null; }
    setSpeakStatus("idle");
    setIsSpeaking(false);
  };

  const handleReadAloud = async () => {
    if (!response?.message || !elevenVoiceId) {
      setToast("Voice unavailable — try again");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    try {
      stopAudio();
      const requestId = ++ttsRequestIdRef.current;
      setIsSpeaking(true);
      setSpeakStatus("loading");
      const res = await fetch(`/api/elevenlabs/text-to-speech/${elevenVoiceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: response.message, model_id: "eleven_flash_v2_5", voice_settings: { stability: 0.75, similarity_boost: 0.75 } }),
      });
      if (!res.ok) throw new Error("ElevenLabs request failed");
      const blob = await res.blob();
      if (requestId !== ttsRequestIdRef.current) return;
      const url = URL.createObjectURL(blob);
      if (requestId !== ttsRequestIdRef.current) { URL.revokeObjectURL(url); return; }
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = url;
      setSpeakStatus("playing");
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        if (requestId !== ttsRequestIdRef.current) return;
        setSpeakStatus("idle"); setIsSpeaking(false);
        if (audioUrlRef.current) { URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = null; }
        audioRef.current = null;
      };
      audio.onerror = () => {
        if (requestId !== ttsRequestIdRef.current) return;
        setSpeakStatus("idle"); setIsSpeaking(false);
        if (audioUrlRef.current) { URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = null; }
        audioRef.current = null;
        setToast("Voice unavailable — try again");
        setTimeout(() => setToast(""), 3000);
      };
      await audio.play();
    } catch {
      if (audioUrlRef.current) { URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = null; }
      audioRef.current = null;
      setSpeakStatus("idle"); setIsSpeaking(false);
      setToast("Voice unavailable — try again");
      setTimeout(() => setToast(""), 3000);
    }
  };

  const renderSpeakLabel = () => {
    if (speakStatus === "loading") return "Loading...";
    if (speakStatus === "playing") return "Playing";
    return "Read Aloud";
  };

  const handleFollowupSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    if (!groqKey) {
      setToast("AI unavailable — try again");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    const userText = chatInput.trim();
    setChatInput("");
    setIsChatLoading(true);
    const nextHistory = [...chatMessages, { role: "user", text: userText }];
    setChatMessages(nextHistory);

    try {
      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + groqKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: followUpSystemPrompt + `\n\nOriginal student situation: ${initialUserInput}\nYour previous guidance: ${initialAssistantMessage}`,
            },
            ...nextHistory.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text })),
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!groqResponse.ok) {
        const errText = await groqResponse.text().catch(() => "");
        throw new Error(`Groq follow-up failed: ${errText || groqResponse.status}`);
      }

      const data = await groqResponse.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content || typeof content !== "string") throw new Error("Empty response from Groq");

      // Try JSON first, fall back to plain text — both are valid now
      const parseResult = safeParseJSONObject(content);
      const replyText = parseResult.ok && parseResult.parsed?.message
        ? parseResult.parsed.message
        : content.trim();

      setChatMessages((prev) => [...prev, { role: "assistant", text: replyText }]);
    } catch (err) {
      console.error("Groq follow-up failed", { error: err?.message });
      setChatMessages((prev) => [...prev, { role: "assistant", text: "I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="app-shell">
        <header className="app-header">
          <div className="app-title">ClearPath</div>
          <p className="app-tagline">Find your way to support.</p>
        </header>

        <main>
          <section className="input-section">
            <form onSubmit={handleSubmit}>
              <label htmlFor="story" className="input-label">What's going on? You can be honest here.</label>
              <textarea id="story" value={input} onChange={(e) => setInput(e.target.value)}
                className={`input-textarea ${inputShake ? "input-textarea--shake" : ""}`}
                placeholder="What's going on? You can be honest here." rows={6} />
              {error && <div className="input-error">{error}</div>}
              <button type="submit" className={`primary-button ${isLoading ? "primary-button--loading" : ""}`} disabled={isLoading}>
                {isLoading ? (<span className="button-loading"><span className="button-spinner" />Finding support...</span>) : "Find Support"}
              </button>
            </form>
          </section>

          {response && (
            <section className="response-section">
              <div className="response-card">
                <p className="response-message">{response.message}</p>
                <div className="response-actions">
                  <button type="button" className={`secondary-button ${isSpeaking ? "secondary-button--loading" : ""}`} onClick={handleReadAloud} disabled={isSpeaking}>
                    {isSpeaking && <span className="button-spinner button-spinner--small" />}
                    {renderSpeakLabel()}
                  </button>
                  <button type="button" className="stop-button" onClick={stopAudio} disabled={speakStatus === "idle"} aria-label="Stop audio">Stop</button>
                </div>
              </div>

              <div className="resources-grid">
                {response.resources.map((resource, index) => (
                  <article key={`${resource.name}-${index}`} className="resource-card" style={{ animationDelay: `${index * 80}ms` }}>
                    <div className="resource-card-header">
                      <h3 className="resource-name">{resource.name}</h3>
                      <span className={`resource-badge resource-badge--${resource.type === "school" ? "school" : "national"}`}>
                        {resource.type === "school" ? "School" : "National"}
                      </span>
                    </div>
                    <p className="resource-description">{resource.description}</p>
                    <p className="resource-contact">{renderContact(resource.contact)}</p>
                  </article>
                ))}
              </div>

              <section className="followup-section">
                <h3 className="followup-title">Follow-up</h3>
                <div className="chat-messages" role="log" aria-live="polite">
                  {chatMessages.length === 0 ? (
                    <div className="chat-empty">Ask a follow-up question or clarify what's going on. I'll try to help you find the next step.</div>
                  ) : (
                    chatMessages.map((m, idx) => (
                      <div key={`${m.role}-${idx}`} className={`chat-bubble chat-bubble--${m.role}`}>{m.text}</div>
                    ))
                  )}
                  {isChatLoading && <div className="chat-bubble chat-bubble--assistant">Thinking...</div>}
                </div>
                <form className="chat-form" onSubmit={handleFollowupSubmit}>
                  <textarea className="chat-textarea" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your follow-up question here..." rows={3} />
                  <div className="chat-actions">
                    <button type="submit" className="primary-button chat-send" disabled={isChatLoading || !chatInput.trim()}>
                      {isChatLoading ? "Sending..." : "Send"}
                    </button>
                  </div>
                </form>
              </section>
            </section>
          )}
        </main>

        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}

export default App;