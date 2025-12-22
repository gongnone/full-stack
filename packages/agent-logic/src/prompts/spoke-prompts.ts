export const SPOKE_GENERATION_PROMPTS = {
  common: `You are a world-class content creator AI. Your task is to generate a social media post based on the provided Pillar, Psychological Angle, and Platform.

  **Pillar:** {pillar_name}
  **Psychological Angle:** {psychological_angle}
  **Platform:** {platform}
  
  **Instructions:**
  - Embody the specified psychological angle in your writing.
  - Adhere to the platform's constraints (character limits, tone, format).
  - Generate only the content for the post, nothing else.`,

  twitter: `
  **Platform Constraints:**
  - **Max Characters:** 280
  - **Tone:** Punchy, concise, and engaging. Use hashtags and a strong hook.
  
  **Content Request:**
  Generate a Twitter post.`,

  linkedin: `
  **Platform Constraints:**
  - **Max Characters:** 3000
  - **Tone:** Professional, authoritative, and insightful. Use professional language and a clear call to action.
  
  **Content Request:**
  Generate a LinkedIn post.`,

  tiktok: `
  **Platform Constraints:**
  - **Format:** A short video script (approx. 60 seconds, ~150 words).
  - **Tone:** Conversational, energetic, and entertaining. Use clear visual cues.
  
  **Content Request:**
  Generate a TikTok video script. Include scene descriptions and audio cues.`,

  instagram: `
  **Platform Constraints:**
  - **Max Characters:** 2200
  - **Tone:** Visual, personal, and engaging. Use emojis and a friendly tone.
  
  **Content Request:**
  Generate an Instagram caption.`,

  newsletter: `
  **Platform Constraints:**
  - **Max Words:** 500
  - **Tone:** Value-dense, educational, and trustworthy. Provide actionable insights.
  
  **Content Request:**
  Generate a short newsletter snippet.`,

  thread: `
  **Platform Constraints:**
  - **Format:** A sequence of 5-7 posts.
  - **Tone:** Storytelling, sequential, and engaging. Each post should build on the last.
  
  **Content Request:**
  Generate a Twitter/X thread. Output as a JSON array of strings.`,

  carousel: `
  **Platform Constraints:**
  - **Format:** A sequence of 5-8 slides.
  - **Tone:** Educational, visual, and easy to digest. Each slide should have a clear title and a short description.
  
  **Content Request:**
  Generate content for a carousel. Output as a JSON array of objects, each with a "title" and "description" property.`,

  healing: `
  **REWRITE INSTRUCTIONS:**
  You previously generated content that FAILED quality assurance.
  You must REWRITE it following the instructions below.

  **ORIGINAL CONTENT:**
  """
  {original_content}
  """

  **CRITIC FEEDBACK:**
  {feedback}

  **SPECIFIC VIOLATIONS TO FIX:**
  {violations}

  Rewrite the content to maximize hook strength while ensuring strict voice alignment and platform compliance.
  Address the feedback and fix all violations while maintaining the core message and psychological angle.
  `,

  variation: `
  **REWRITE INSTRUCTIONS:**
  You are generating a VARIATION of a high-performing content piece.
  Your goal is to maintain the core message and value proposition while providing a fresh perspective or hook.

  **SEED CONTENT:**
  """
  {seed_content}
  """

  **GOAL:**
  {variation_goal}

  **INSTRUCTIONS:**
  - Maintain the same platform constraints and tone.
  - If "Vary Psychological Angle" is requested, try a different angle (e.g., if the seed is 'How-To', try 'Contrarian' or 'Story-based') while keeping the message identical.
  - Ensure the output is high-impact and ready for scroll-stopping engagement.
  `,
};
