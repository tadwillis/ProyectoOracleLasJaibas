package com.springboot.MyTodoList.service;

import java.io.IOException;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class DeepSeekService {

    private static final Logger logger = LoggerFactory.getLogger(DeepSeekService.class);

    private final CloseableHttpClient httpClient;
    private final HttpPost httpPost;
    private final ObjectMapper objectMapper;

    public DeepSeekService(CloseableHttpClient httpClient, HttpPost httpPost) {
        this.httpClient = httpClient;
        this.httpPost = httpPost;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Genera texto usando DeepSeek con un prompt simple (método legacy)
     */
    public String generateText(String prompt) throws IOException, org.apache.hc.core5.http.ParseException {
        return generateTextWithContext(null, prompt);
    }

    /**
     * Genera texto usando DeepSeek con system prompt y contexto
     */
    public String generateTextWithContext(String systemPrompt, String userMessage) throws IOException, org.apache.hc.core5.http.ParseException {
        String requestBody = buildRequestBody(systemPrompt, userMessage);

        try {
            httpPost.setEntity(new StringEntity(requestBody, java.nio.charset.StandardCharsets.UTF_8));
            CloseableHttpResponse response = httpClient.execute(httpPost);
            String responseBody = EntityUtils.toString(response.getEntity());

            return extractMessageContent(responseBody);
        } catch (IOException e) {
            logger.error("Error al llamar a DeepSeek API: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Construye el cuerpo de la solicitud JSON para DeepSeek
     */
    private String buildRequestBody(String systemPrompt, String userMessage) {
        StringBuilder messagesJson = new StringBuilder();
        messagesJson.append("[");

        // Agregar system prompt si existe
        if (systemPrompt != null && !systemPrompt.isEmpty()) {
            messagesJson.append(String.format(
                "{\"role\": \"system\", \"content\": %s},",
                escapeJsonString(systemPrompt)
            ));
        }

        // Agregar mensaje del usuario
        messagesJson.append(String.format(
            "{\"role\": \"user\", \"content\": %s}",
            escapeJsonString(userMessage)
        ));

        messagesJson.append("]");

        return String.format(
            "{\"model\": \"deepseek-chat\", \"messages\": %s, \"temperature\": 0.7, \"max_tokens\": 1000}",
            messagesJson.toString()
        );
    }

    /**
     * Escapa una cadena para ser usada en JSON
     */
    private String escapeJsonString(String input) {
        if (input == null) return "\"\"";

        try {
            return objectMapper.writeValueAsString(input);
        } catch (Exception e) {
            // Fallback manual
            return "\"" + input
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t")
                + "\"";
        }
    }

    /**
     * Extrae el contenido del mensaje de la respuesta de DeepSeek
     */
    private String extractMessageContent(String responseBody) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseBody);

            // Verificar si hay error en la respuesta
            if (rootNode.has("error")) {
                String errorMessage = rootNode.get("error").has("message")
                    ? rootNode.get("error").get("message").asText()
                    : "Error desconocido de DeepSeek";
                logger.error("Error de DeepSeek API: {}", errorMessage);
                return "Lo siento, hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.";
            }

            // Extraer el contenido del mensaje
            JsonNode choicesNode = rootNode.get("choices");
            if (choicesNode != null && choicesNode.isArray() && choicesNode.size() > 0) {
                JsonNode firstChoice = choicesNode.get(0);
                JsonNode messageNode = firstChoice.get("message");
                if (messageNode != null && messageNode.has("content")) {
                    return messageNode.get("content").asText();
                }
            }

            logger.warn("Respuesta inesperada de DeepSeek: {}", responseBody);
            return "No pude obtener una respuesta válida. Por favor, intenta de nuevo.";

        } catch (Exception e) {
            logger.error("Error al parsear respuesta de DeepSeek: {}", e.getMessage());
            return "Error al procesar la respuesta. Por favor, intenta de nuevo.";
        }
    }
}