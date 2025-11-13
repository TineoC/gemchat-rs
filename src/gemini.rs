use anyhow::{Context, Result};
use gemini_rust::{Client, Content, Part, Request};
use tracing::{debug, error, info};

/// Gemini AI client for handling chat requests
pub struct GeminiClient {
    client: Client,
}

impl GeminiClient {
    /// Create a new Gemini client with the provided API key
    pub fn new(api_key: String) -> Result<Self> {
        let client = Client::new(api_key);
        info!("Gemini client initialized successfully");
        Ok(Self { client })
    }

    /// Generate a response to a user's question about cybersecurity
    pub async fn chat(&self, user_message: &str) -> Result<String> {
        debug!("Processing chat request: {}", user_message);

        // System instruction for cybersecurity education context
        let system_instruction = Content::text(
            "You are a helpful cybersecurity tutor assistant for university students. \
            Your role is to explain cybersecurity concepts, terminologies, and attack types \
            in a clear, educational manner suitable for classroom learning. \
            Keep explanations concise but informative. \
            Use examples when helpful. \
            If asked about something unrelated to cybersecurity, politely redirect the conversation \
            back to cybersecurity topics. \
            Always prioritize educational value and ethical understanding."
        );

        // User's message
        let user_content = Content::text(user_message);

        // Build the request
        let request = Request::new(user_content)
            .with_system_instruction(system_instruction);

        // Call Gemini API
        match self.client.generate_content(request).await {
            Ok(response) => {
                // Extract the text from the response
                let text = response
                    .text()
                    .context("Failed to extract text from Gemini response")?;
                
                info!("Successfully generated response");
                debug!("Response: {}", text);
                
                Ok(text)
            }
            Err(e) => {
                error!("Gemini API error: {}", e);
                Err(anyhow::anyhow!("Failed to generate response: {}", e))
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore] // Requires API key
    async fn test_gemini_client() {
        let api_key = std::env::var("GEMINI_API_KEY").expect("GEMINI_API_KEY not set");
        let client = GeminiClient::new(api_key).unwrap();
        let response = client.chat("What is SQL injection?").await.unwrap();
        assert!(!response.is_empty());
    }
}

