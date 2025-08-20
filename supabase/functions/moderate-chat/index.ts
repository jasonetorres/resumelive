import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Basic profanity filter - can be enhanced with more sophisticated filtering
const badWords = [
  'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard', 'crap', 
  'hell', 'piss', 'dick', 'cock', 'pussy', 'tits', 'ass', 'whore', 
  'slut', 'fag', 'nigger', 'retard', 'idiot', 'stupid', 'hate',
  // Add more words as needed
];

function moderateContent(message: string): { filtered: string; wasModerated: boolean } {
  let filtered = message;
  let wasModerated = false;
  
  // Convert to lowercase for matching, but preserve original case in replacement
  const lowerMessage = message.toLowerCase();
  
  badWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(lowerMessage)) {
      filtered = filtered.replace(regex, '*'.repeat(word.length));
      wasModerated = true;
    }
  });
  
  return { filtered, wasModerated };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { target_person, message, first_name } = await req.json();

    if (!target_person || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Moderate the content
    const { filtered, wasModerated } = moderateContent(message);
    
    // Block messages that are mostly profanity (more than 50% filtered)
    const profanityRatio = (message.length - filtered.replace(/\*/g, '').length) / message.length;
    if (profanityRatio > 0.5) {
      return new Response(
        JSON.stringify({ 
          error: 'Message blocked due to inappropriate content',
          blocked: true 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert the moderated message
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        target_person,
        message: filtered,
        first_name: first_name || 'Anonymous'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save message' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log moderation actions
    if (wasModerated) {
      console.log(`Message moderated - Original: "${message}" | Filtered: "${filtered}"`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        moderated: wasModerated 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in moderate-chat function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});