package com.springboot.MyTodoList.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class LLMClient {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // API Configuration
    @Value("${gemini.api.key}")
    private String apiKey;

    private static final String MODEL = "gemini-2.0-flash-exp"; // Using Gemini 2.0 Flash experimental
    private static final String GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL
            + ":generateContent?key=";

    public TaskAnalysisResponse analyzeTask(String title, String description, Integer estimatedHours,
            Integer priority) {
        try {
            String geminiApiUrl = GEMINI_API_BASE_URL + apiKey;
            // 1. Construct the Prompt
            String priorityText = getPriorityText(priority);
            String promptText = String.format(
                    "Analiza esta tarea del backlog:\n\n" +
                            "**Tarea:** %s\n" +
                            "**Descripción:** %s\n" +
                            "**Horas estimadas:** %s\n" +
                            "**Prioridad:** %s\n\n" +
                            "Por favor proporciona un análisis estructurado con:\n" +
                            "1. Story points sugeridos (1, 2, 3, 5, u 8)\n" +
                            "2. Evaluación de calidad de la tarea (0-100)\n" +
                            "3. Nivel de complejidad (simple, moderada, o compleja)\n" +
                            "4. 3 recomendaciones específicas para mejorar esta tarea",
                    title,
                    description != null ? description : "Sin descripción",
                    estimatedHours != null ? estimatedHours : "No especificadas",
                    priorityText);

            // 2. Build the Request Payload
            GeminiRequest geminiRequest = new GeminiRequest();

            // Content
            GeminiContent content = new GeminiContent();
            GeminiPart part = new GeminiPart();
            part.setText(promptText);
            content.setParts(Collections.singletonList(part));
            geminiRequest.setContents(Collections.singletonList(content));

            // Generation Config (JSON Schema enforcement)
            GeminiGenerationConfig config = new GeminiGenerationConfig();
            config.setResponseMimeType("application/json");

            // Define Schema
            Map<String, Object> schema = Map.of(
                    "type", "OBJECT",
                    "properties", Map.of(
                            "story_points", Map.of("type", "INTEGER"),
                            "quality_score", Map.of("type", "INTEGER"),
                            "complexity", Map.of("type", "STRING"),
                            "recommendations", Map.of(
                                    "type", "ARRAY",
                                    "items", Map.of("type", "STRING"))),
                    "required", List.of("story_points", "quality_score", "complexity", "recommendations"));
            config.setResponseSchema(schema);
            geminiRequest.setGenerationConfig(config);

            // 3. Send Request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<GeminiRequest> entity = new HttpEntity<>(geminiRequest, headers);

            GeminiResponse response = restTemplate.postForObject(geminiApiUrl, entity, GeminiResponse.class);

            // 4. Parse Response
            if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                String jsonText = response.getCandidates().get(0).getContent().getParts().get(0).getText();
                AnalysisData analysisData = objectMapper.readValue(jsonText, AnalysisData.class);

                TaskAnalysisResponse result = new TaskAnalysisResponse();
                result.setAnalysis(analysisData);
                return result;
            } else {
                throw new RuntimeException("No valid response from Gemini API");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return createErrorResponse(e.getMessage());
        }
    }

    private String getPriorityText(Integer priority) {
        if (priority == null)
            return "Baja";
        switch (priority) {
            case 1:
                return "Media";
            case 2:
                return "Alta";
            default:
                return "Baja";
        }
    }

    private TaskAnalysisResponse createErrorResponse(String errorMessage) {
        TaskAnalysisResponse errorResponse = new TaskAnalysisResponse();
        AnalysisData errorData = new AnalysisData();
        errorData.setComplexity("Error");
        errorData.setRecommendations(Collections.singletonList("Error al analizar la tarea: " + errorMessage));
        // Set default values to avoid null pointer exceptions in frontend if it expects
        // numbers
        errorData.setStoryPoints(0);
        errorData.setQualityScore(0);
        errorResponse.setAnalysis(errorData);
        return errorResponse;
    }

    // --- DTOs for Gemini API ---

    @Data
    public static class GeminiRequest {
        private List<GeminiContent> contents;
        private GeminiGenerationConfig generationConfig;
    }

    @Data
    public static class GeminiContent {
        private List<GeminiPart> parts;
    }

    @Data
    public static class GeminiPart {
        private String text;
    }

    @Data
    public static class GeminiGenerationConfig {
        private String responseMimeType;
        private Map<String, Object> responseSchema;
    }

    @Data
    public static class GeminiResponse {
        private List<GeminiCandidate> candidates;
    }

    @Data
    public static class GeminiCandidate {
        private GeminiContent content;
    }

    // --- Application DTOs ---

    @Data
    public static class TaskAnalysisResponse {
        private AnalysisData analysis;
    }

    @Data
    public static class AnalysisData {
        @JsonProperty("story_points")
        private Integer storyPoints;

        @JsonProperty("quality_score")
        private Integer qualityScore;

        private String complexity;

        private List<String> recommendations;
    }
}

// Test